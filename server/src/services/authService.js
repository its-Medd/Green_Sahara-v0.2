const bcrypt = require("bcryptjs");
const { OAuth2Client } = require("google-auth-library");
const prisma = require("../config/db");
const env = require("../config/env");
const ApiError = require("../utils/apiError");
const { signToken } = require("../utils/token");

const googleClient = new OAuth2Client(env.googleClientId);

const ensureRole = (role, { allowAdmin = false } = {}) => {
  const upper = String(role || "").toUpperCase();
  const allowed = allowAdmin ? ["PROVIDER", "FARMER", "ADMIN"] : ["PROVIDER", "FARMER"];
  if (!allowed.includes(upper)) throw new ApiError(400, "Rôle invalide");
  return upper;
};

const buildRedirectPath = (role) => {
  if (role === "ADMIN") return "/admin/dashboard";
  if (role === "FARMER") return "/farmer/dashboard";
  return "/provider/dashboard";
};

const sanitizeUser = (user) => ({
  id: user.id,
  fullName: user.fullName,
  email: user.email,
  role: user.role,
  preferredLanguage: user.preferredLanguage,
  avatarUrl: user.avatarUrl,
  isVerified: user.isVerified,
  isAdmin: user.role === "ADMIN" || user.email?.toLowerCase() === env.adminEmail.toLowerCase(),
  redirectPath: buildRedirectPath(user.role)
});

async function createRoleProfile(userId, role, payload = {}) {
  if (role === "FARMER") {
    await prisma.farmerProfile.create({
      data: {
        userId,
        farmName: payload.farmName || `Ferme de ${payload.fullName || "Green Sahara"}`,
        region: payload.region || "Non renseignée",
        city: payload.city || "Non renseignée",
        surfaceHectares: payload.surfaceHectares ? Number(payload.surfaceHectares) : null,
        climate: payload.climate || "Tempéré",
        mainCrops: payload.mainCrops || null,
        equipment: payload.equipment || null
      }
    });
    return;
  }

  if (role === "PROVIDER") {
    await prisma.providerProfile.create({
      data: {
        userId,
        establishmentName: payload.establishmentName || payload.fullName || "Nouvel Établissement",
        city: payload.city || "Non renseignée",
        address: payload.address || null,
        contactPhone: payload.contactPhone || null,
        wasteType: payload.wasteType || "Déchets organiques mixtes",
        logoUrl: payload.logoUrl || null
      }
    });
  }
}

async function register(payload) {
  const role = ensureRole(payload.role);
  const email = String(payload.email || "").toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new ApiError(409, "Cet email existe déjà");

  const passwordHash = await bcrypt.hash(payload.password, 10);
  const user = await prisma.user.create({
    data: {
      fullName: payload.fullName,
      email,
      passwordHash,
      role,
      preferredLanguage: payload.preferredLanguage || "fr"
    }
  });

  await createRoleProfile(user.id, role, payload);
  const token = signToken({ userId: user.id, role: user.role });

  return { token, user: sanitizeUser(user) };
}

async function login(payload) {
  const email = String(payload.email || "").toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) throw new ApiError(401, "Email ou mot de passe invalide");

  const valid = await bcrypt.compare(payload.password, user.passwordHash);
  if (!valid) throw new ApiError(401, "Email ou mot de passe invalide");

  const token = signToken({ userId: user.id, role: user.role });
  return { token, user: sanitizeUser(user) };
}

async function loginWithGoogleToken({ idToken, role, preferredLanguage }) {
  if (!idToken) throw new ApiError(400, "Google token requis");
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: env.googleClientId
  });
  const payload = ticket.getPayload();
  const email = String(payload.email || "").toLowerCase();

  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const safeRole = ensureRole(role || "FARMER");
    user = await prisma.user.create({
      data: {
        fullName: payload.name || "Google User",
        email,
        googleId: payload.sub,
        avatarUrl: payload.picture || null,
        role: safeRole,
        preferredLanguage: preferredLanguage || "fr",
        isVerified: true
      }
    });
    await createRoleProfile(user.id, safeRole, {
      fullName: user.fullName,
      city: payload.locale || null
    });
  } else if (!user.googleId) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        googleId: payload.sub,
        avatarUrl: user.avatarUrl || payload.picture || null
      }
    });
  }

  const token = signToken({ userId: user.id, role: user.role });
  return { token, user: sanitizeUser(user) };
}

async function getMe(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new ApiError(404, "Utilisateur non trouvé");
  return sanitizeUser(user);
}

async function loginAdmin({ email, password }) {
  const normalizedEmail = String(email || "").toLowerCase();
  if (
    normalizedEmail !== env.adminEmail.toLowerCase() ||
    String(password || "") !== env.adminPassword
  ) {
    throw new ApiError(401, "Identifiants admin invalides");
  }

  let user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        fullName: "Green Sahara Admin",
        email: normalizedEmail,
        role: "ADMIN",
        preferredLanguage: "fr",
        isVerified: true,
        passwordHash: await bcrypt.hash(password, 10)
      }
    });
  } else if (user.role !== "ADMIN") {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { role: "ADMIN", isVerified: true }
    });
  }

  const token = signToken({ userId: user.id, role: user.role });
  return { token, user: sanitizeUser(user) };
}

module.exports = {
  register,
  login,
  loginAdmin,
  loginWithGoogleToken,
  getMe,
  sanitizeUser,
  buildRedirectPath
};

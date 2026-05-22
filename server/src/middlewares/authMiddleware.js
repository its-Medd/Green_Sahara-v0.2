const prisma = require("../config/db");
const ApiError = require("../utils/apiError");
const { verifyToken } = require("../utils/token");

async function authMiddleware(req, res, next) {
  try {
    const bearer = req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : null;
    const token = bearer || req.cookies.token;

    if (!token) throw new ApiError(401, "Accès non autorisé");

    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        farmerProfile: true,
        providerProfile: true
      }
    });

    if (!user) throw new ApiError(401, "Utilisateur introuvable");

    req.user = user;
    return next();
  } catch (error) {
    return next(new ApiError(401, "Session expirée ou invalide"));
  }
}

module.exports = authMiddleware;


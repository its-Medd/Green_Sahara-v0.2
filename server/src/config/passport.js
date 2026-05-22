const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const prisma = require("./db");
const env = require("./env");

const ensureRole = (value) => (value === "PROVIDER" || value === "FARMER" ? value : "FARMER");
const isGoogleConfigured = Boolean(env.googleClientId && env.googleClientSecret);

if (isGoogleConfigured) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.googleClientId,
        clientSecret: env.googleClientSecret,
        callbackURL: env.googleCallbackUrl
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile?.emails?.[0]?.value?.toLowerCase();
          if (!email) return done(new Error("Google account email is missing"));

          let user = await prisma.user.findUnique({ where: { email } });
          if (!user) {
            user = await prisma.user.create({
              data: {
                fullName: profile.displayName || "Google User",
                email,
                googleId: profile.id,
                role: ensureRole(profile?._json?.role),
                preferredLanguage: "fr",
                avatarUrl: profile?.photos?.[0]?.value || null
              }
            });
            if (user.role === "FARMER") {
              await prisma.farmerProfile.create({
                data: { userId: user.id, farmName: `Ferme ${user.fullName}`, region: "Gharb" }
              });
            } else {
              await prisma.providerProfile.create({
                data: {
                  userId: user.id,
                  establishmentName: user.fullName,
                  city: "Marrakech"
                }
              });
            }
          } else if (!user.googleId) {
            user = await prisma.user.update({
              where: { id: user.id },
              data: { googleId: profile.id, avatarUrl: user.avatarUrl || profile?.photos?.[0]?.value || null }
            });
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
}

module.exports = {
  passport,
  isGoogleConfigured
};

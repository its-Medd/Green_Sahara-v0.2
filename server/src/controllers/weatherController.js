const asyncHandler = require("../utils/asyncHandler");
const prisma = require("../config/db");
const { getFarmWeatherByProfile } = require("../services/weatherService");

const getFarmWeather = asyncHandler(async (req, res) => {
  const profileId = Number(req.params.id);
  const language = req.user?.preferredLanguage || req.query.language || "fr";
  const profile = await prisma.farmerProfile.findUnique({ where: { id: profileId } });

  if (!profile) {
    return res.status(404).json({ success: false, message: "Profil ferme introuvable" });
  }

  const weather = await getFarmWeatherByProfile(profile, language);
  res.json({ success: true, data: weather });
});

module.exports = {
  getFarmWeather
};

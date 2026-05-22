const prisma = require("../config/db");

function resolveSeasonCode(date = new Date()) {
  const month = date.getMonth() + 1;
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  if (month >= 9 && month <= 11) return "autumn";
  return "winter";
}

function localizedSeason(code, language = "fr") {
  const labels = {
    spring: { fr: "Printemps", ar: "الربيع" },
    summer: { fr: "Été", ar: "الصيف" },
    autumn: { fr: "Automne", ar: "الخريف" },
    winter: { fr: "Hiver", ar: "الشتاء" }
  };
  return labels[code]?.[language] || labels[code]?.fr || code;
}

function localizedCondition(code, language = "fr") {
  const labels = {
    sunny: { fr: "Ensoleillé", ar: "مشمس" },
    warm: { fr: "Doux", ar: "معتدل" },
    windy: { fr: "Venteux", ar: "عاصف" },
    dry: { fr: "Sec", ar: "جاف" }
  };
  return labels[code]?.[language] || labels[code]?.fr || code;
}

function buildMockWeather(profile = {}) {
  const seasonCode = resolveSeasonCode();
  const climate = String(profile.climate || "").toLowerCase();
  const city = String(profile.city || profile.region || "").toLowerCase();

  let temperature = 24;
  let humidity = 46;
  let rainChance = 18;
  let windSpeed = 11;
  let conditionCode = "warm";

  if (seasonCode === "summer") {
    temperature = 32;
    humidity = 28;
    rainChance = 8;
    windSpeed = 13;
    conditionCode = "dry";
  } else if (seasonCode === "spring") {
    temperature = 24;
    humidity = 48;
    rainChance = 24;
    windSpeed = 10;
    conditionCode = "sunny";
  } else if (seasonCode === "autumn") {
    temperature = 21;
    humidity = 53;
    rainChance = 19;
    windSpeed = 12;
    conditionCode = "windy";
  } else {
    temperature = 17;
    humidity = 61;
    rainChance = 32;
    windSpeed = 14;
    conditionCode = "windy";
  }

  if (climate.includes("aride") || city.includes("marrakech") || city.includes("agadir")) {
    temperature += 2;
    humidity -= 6;
    rainChance = Math.max(5, rainChance - 5);
    conditionCode = "dry";
  }

  return {
    seasonCode,
    conditionCode,
    temperature,
    humidity,
    rainChance,
    windSpeed
  };
}

async function getFarmWeatherByProfile(profile, language = "fr") {
  if (!profile?.id) {
    return null;
  }

  const recent = await prisma.weatherSnapshot.findFirst({
    where: { farmerProfileId: profile.id },
    orderBy: { recordedAt: "desc" }
  });

  const maxAgeMs = 6 * 60 * 60 * 1000;
  if (recent && Date.now() - new Date(recent.recordedAt).getTime() < maxAgeMs) {
    const seasonCode = resolveSeasonCode(new Date(recent.recordedAt));
    return {
      seasonCode,
      seasonLabel: localizedSeason(seasonCode, language),
      conditionCode: recent.condition,
      conditionLabel: localizedCondition(recent.condition, language),
      temperature: recent.temperature,
      humidity: recent.humidity,
      rainChance: recent.rainChance,
      windSpeed: recent.windSpeed,
      recordedAt: recent.recordedAt
    };
  }

  const mock = buildMockWeather(profile);
  const created = await prisma.weatherSnapshot.create({
    data: {
      farmerProfileId: profile.id,
      condition: mock.conditionCode,
      temperature: mock.temperature,
      humidity: mock.humidity,
      windSpeed: mock.windSpeed,
      rainChance: mock.rainChance
    }
  });

  return {
    seasonCode: mock.seasonCode,
    seasonLabel: localizedSeason(mock.seasonCode, language),
    conditionCode: mock.conditionCode,
    conditionLabel: localizedCondition(mock.conditionCode, language),
    temperature: created.temperature,
    humidity: created.humidity,
    rainChance: created.rainChance,
    windSpeed: created.windSpeed,
    recordedAt: created.recordedAt
  };
}

module.exports = {
  resolveSeasonCode,
  localizedSeason,
  getFarmWeatherByProfile
};

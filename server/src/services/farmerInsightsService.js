function addDays(baseDate, days) {
  const date = new Date(baseDate);
  date.setDate(date.getDate() + days);
  return date;
}

function formatDate(date, language = "fr") {
  return new Intl.DateTimeFormat(language === "ar" ? "ar-MA" : "fr-FR", {
    day: "numeric",
    month: "short"
  }).format(date);
}

function cropCategory(crops = "") {
  const value = String(crops || "").toLowerCase();
  if (value.includes("potato") || value.includes("pomme de terre") || value.includes("btata")) {
    return "potato";
  }
  if (value.includes("mais") || value.includes("maïs") || value.includes("corn")) {
    return "corn";
  }
  if (value.includes("ble") || value.includes("blé") || value.includes("cereal")) {
    return "cereal";
  }
  if (value.includes("olive") || value.includes("olivier")) {
    return "olive";
  }
  return "mixed";
}

function harvestOffsetDays(category, seasonCode) {
  const matrix = {
    potato: { spring: 35, summer: 22, autumn: 40, winter: 60 },
    corn: { spring: 65, summer: 48, autumn: 72, winter: 90 },
    cereal: { spring: 42, summer: 21, autumn: 88, winter: 110 },
    olive: { spring: 180, summer: 120, autumn: 45, winter: 220 },
    mixed: { spring: 45, summer: 32, autumn: 55, winter: 72 }
  };
  return matrix[category]?.[seasonCode] || 40;
}

function compostRatePerHectare(category, seasonCode) {
  const base = {
    potato: 520,
    corn: 430,
    cereal: 320,
    olive: 280,
    mixed: 350
  }[category] || 350;

  if (seasonCode === "summer") return base + 60;
  if (seasonCode === "spring") return base + 30;
  if (seasonCode === "winter") return base - 20;
  return base;
}

function buildLocalizedStrings(language = "fr") {
  if (language === "ar") {
    return {
      irrigationPrefix: "السقي القادم",
      harvestPrefix: "فترة الجني القادمة",
      compostTimingPrefix: "أفضل موعد للكمبوست",
      compostQuantityPrefix: "الكمية الموصى بها",
      soilTemperaturePrefix: "حرارة التربة التقديرية",
      alertHighTempTitle: "حرارة مرتفعة",
      alertHighTempMessage: "درجة الحرارة مرتفعة وقد ترفع إجهاد النبات.",
      alertLowHumidityTitle: "رطوبة منخفضة",
      alertLowHumidityMessage: "الرطوبة منخفضة ويستحسن تسريع السقي.",
      alertRainTitle: "فرصة مطر",
      alertRainMessage: "يمكن تأجيل جزء من السقي بسبب احتمال التساقطات.",
      compostSoon: "خلال 3 إلى 5 أيام",
      compostMedium: "خلال أسبوع",
      compostLater: "بعد 10 أيام",
      urgent: "توصية عاجلة"
    };
  }

  return {
    irrigationPrefix: "Prochaine irrigation",
    harvestPrefix: "Fenetre de recolte",
    compostTimingPrefix: "Meilleur moment compost",
    compostQuantityPrefix: "Quantite recommandee",
    soilTemperaturePrefix: "Temperature sol estimee",
    alertHighTempTitle: "Temperature elevee",
    alertHighTempMessage: "La chaleur augmente le stress de la culture.",
    alertLowHumidityTitle: "Humidite faible",
    alertLowHumidityMessage: "Le niveau d humidite est bas, avancez l irrigation.",
    alertRainTitle: "Pluie probable",
    alertRainMessage: "Une partie de l irrigation peut etre differee selon les previsions.",
    compostSoon: "Dans 3 a 5 jours",
    compostMedium: "Dans une semaine",
    compostLater: "Dans 10 jours",
    urgent: "Recommandation urgente"
  };
}

function buildFarmerInsights(profile, weather, language = "fr") {
  const labels = buildLocalizedStrings(language);
  const area = Number(profile?.surfaceHectares || 10);
  const category = cropCategory(profile?.mainCrops || "");
  const seasonCode = weather?.seasonCode || "spring";

  const irrigationDays =
    weather?.humidity <= 30 ? 1 : weather?.temperature >= 31 ? 2 : weather?.temperature >= 26 ? 3 : 4;
  const nextIrrigationDate = addDays(new Date(), irrigationDays);
  const nextHarvestDate = addDays(new Date(), harvestOffsetDays(category, seasonCode));
  const compostRate = compostRatePerHectare(category, seasonCode);
  const compostQuantity = Math.round(area * compostRate);
  const soilTemperature = Number((Number(weather?.temperature || 22) - 1.7).toFixed(1));

  const alerts = [];
  if (Number(weather?.temperature || 0) >= 31) {
    alerts.push({
      severity: "CRITICAL",
      title: labels.alertHighTempTitle,
      message: labels.alertHighTempMessage
    });
  }
  if (Number(weather?.humidity || 0) <= 32) {
    alerts.push({
      severity: "WARNING",
      title: labels.alertLowHumidityTitle,
      message: labels.alertLowHumidityMessage
    });
  }
  if (Number(weather?.rainChance || 0) >= 45) {
    alerts.push({
      severity: "INFO",
      title: labels.alertRainTitle,
      message: labels.alertRainMessage
    });
  }

  return {
    currentSeason: weather?.seasonLabel,
    nextIrrigationDate: formatDate(nextIrrigationDate, language),
    nextHarvestPeriod: formatDate(nextHarvestDate, language),
    compostTiming:
      Number(weather?.humidity || 0) < 35
        ? labels.compostSoon
        : Number(weather?.temperature || 0) > 28
          ? labels.compostMedium
          : labels.compostLater,
    recommendedCompostQuantityKg: compostQuantity,
    soilTemperature,
    weatherSummary: weather?.conditionLabel,
    labels,
    alerts
  };
}

module.exports = {
  buildFarmerInsights
};

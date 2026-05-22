const axios = require("axios");
const env = require("../config/env");
const logger = require("../utils/logger");

const buildFarmerPrompt = (language = "fr") =>
  language === "ar"
    ? "أنت خبير زراعي وكمبوست محترف. أجب بالعربية فقط بشكل متوسط الطول ومباشر. ركز على (أفضل سماد، الكمية المطلوبة، طريقة الاستخدام، ونصائح إضافية)."
    : "Tu es un expert agronome et compostage professionnel. Réponds en français de manière directe et de taille moyenne. Concentre-toi sur (Meilleur engrais, Dosage, Application, Conseils).";

const buildProviderPrompt = (language = "fr") =>
  language === "ar"
    ? "أنت خبير في الكيمياء الحيوية العضوية والزراعة الدقيقة. قدم تحليلاً تقنياً مفصلاً."
    : "Tu es un expert en bio-chimie organique et en agronomie de précision. Donne une analyse technique détaillée.";

function sanitizeAssistantText(text = "") {
  const compact = String(text || "")
    .replace(/[`#>~|]/g, " ") // Keep * and _ for bold/italic if needed, or just relax
    .replace(/["']/g, "")
    .replace(/[•▪●◦]/g, " ")
    .replace(/\s{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const lines = compact
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  return lines.join("\n");
}

function sanitizeModel(model = "") {
  const clean = String(model || "").trim();
  if (!clean) return "gemini-2.5-flash";
  return clean.replace(/^models\//, "");
}

function buildGenerateContentUrl(modelName = env.geminiModel) {
  const model = sanitizeModel(modelName);
  const raw = String(env.geminiApiUrl || "").trim();
  const base = (raw || "https://generativelanguage.googleapis.com/v1beta").replace(/\/$/, "");

  if (base.includes(":generateContent")) {
    if (/\/models\/[^/:]+:generateContent$/.test(base)) {
      return base.replace(/\/models\/[^/:]+:generateContent$/, `/models/${model}:generateContent`);
    }
    return base;
  }

  if (base.endsWith("/models")) {
    return `${base}/${model}:generateContent`;
  }

  if (/\/models\/[^/:]+$/.test(base)) {
    return `${base.replace(/\/models\/[^/:]+$/, `/models/${model}`)}:generateContent`;
  }

  return `${base}/models/${model}:generateContent`;
}

function extractGeminiError(error) {
  return error?.response?.data?.error?.message || error?.response?.data?.message || error.message;
}

function normalizeImagePayload(imageBase64, mimeType = "image/jpeg") {
  if (!imageBase64) return null;
  const raw = String(imageBase64).trim();
  const dataUrl = raw.match(/^data:(.+?);base64,(.+)$/);
  if (dataUrl) {
    return {
      data: dataUrl[2],
      mimeType: dataUrl[1] || mimeType
    };
  }
  return {
    data: raw,
    mimeType
  };
}

function parseJsonFromText(text = "") {
  const clean = String(text || "").trim();
  if (!clean) return null;

  try {
    return JSON.parse(clean);
  } catch {
    // continue
  }

  const fenced = clean.match(/```json\s*([\s\S]*?)```/i) || clean.match(/```\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    try {
      return JSON.parse(fenced[1].trim());
    } catch {
      // continue
    }
  }

  const firstBrace = clean.indexOf("{");
  if (firstBrace === -1) return null;

  const lastBrace = clean.lastIndexOf("}");
  const jsonCandidate = lastBrace > firstBrace 
    ? clean.slice(firstBrace, lastBrace + 1) 
    : clean.slice(firstBrace);

  try {
    return JSON.parse(jsonCandidate);
  } catch (err) {
    logger.warn("[AI PARSE] JSON.parse failed, trying regex fallback...");
    
    const result = {};
    const keyMap = {
      isWaste: ["isWaste", "waste"],
      wasteType: ["wasteType", "type"],
      composition: ["composition"],
      molecularCarbon: ["molecularCarbon", "carbon", "carbone"],
      molecularHydrogen: ["molecularHydrogen", "hydrogen", "hydrogène"],
      molecularOxygen: ["molecularOxygen", "oxygen", "oxygène"],
      molecularNitrogen: ["molecularNitrogen", "nitrogen", "azote"],
      cnRatio: ["cnRatio", "rapport", "C/N"],
      estimatedHumidity: ["estimatedHumidity", "humidity", "humidité"],
      contaminationLevel: ["contaminationLevel", "contamination"],
      storageAdvice: ["storageAdvice", "storage", "stockage"],
      compostPotential: ["compostPotential", "potential", "potentiel"],
      recommendations: ["recommendations", "recommandations"],
      recipeText: ["recipeText", "recipe", "recette"],
      rejectionMessage: ["rejectionMessage", "rejection", "refus"]
    };

    Object.entries(keyMap).forEach(([canonical, variations]) => {
      for (const variant of variations) {
        const re = new RegExp(`"?${variant}"?\\s*[:=]\\s*(?:"|'|«)?([\\s\\S]*?)(?=(?:"|'|»)?\\s*,\\s*"?\\w+"?\\s*[:=]|\\s*[}"]|$)`, "i");
        const match = jsonCandidate.match(re);
        if (match) {
          let val = match[1].trim();
          val = val.replace(/^["'«]|["'»\\,]+$/g, "").trim();
          if (canonical === "isWaste") result[canonical] = val.toLowerCase().includes("true") || val.toLowerCase().includes("oui");
          else if (canonical === "estimatedHumidity") result[canonical] = parseInt(val.replace(/[^\d]/g, ""), 10) || 0;
          else result[canonical] = val;
          break; // Found one variant, move to next canonical key
        }
      }
    });

    return Object.keys(result).length > 0 ? result : null;
  }
}

function looksLikeNonWaste(text = "") {
  const value = String(text || "").toLowerCase();
  const keywords = [
    "not waste",
    "non waste",
    "not organic",
    "book",
    "cover",
    "poster",
    "screen",
    "device",
    "phone",
    "keyboard",
    "person",
    "animal",
    "vehicle",
    "livre",
    "affiche",
    "non organique",
    "pas un déchet",
    "ليس نفاية",
    "ليست نفاية"
  ];

  return keywords.some((keyword) => value.includes(keyword));
}

async function callGeminiWithModel({ textPrompt, modelName, imagePayload }) {
  const url = buildGenerateContentUrl(modelName);
  const parts = [{ text: textPrompt }];

  if (imagePayload?.data) {
    parts.push({
      inlineData: {
        mimeType: imagePayload.mimeType || "image/jpeg",
        data: imagePayload.data
      }
    });
  }

  const response = await axios.post(
    `${url}?key=${env.geminiApiKey}`,
    {
      contents: [{ parts }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 8192
      }
    },
    {
      timeout: 45000
    }
  );

  const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini returned empty text");
  return text;
}

async function callGemini({ textPrompt, imagePayload = null }) {
  if (!env.geminiApiKey) throw new Error("GEMINI_API_KEY missing");
  const candidates = [
    sanitizeModel(env.geminiModel),
    "gemini-1.5-flash",
    "gemini-2.0-flash-exp",
    "gemini-1.5-pro"
  ];
  const tried = new Set();
  let lastError = null;

  for (const candidate of candidates) {
    if (tried.has(candidate)) continue;
    tried.add(candidate);
    try {
      return await callGeminiWithModel({ textPrompt, modelName: candidate, imagePayload });
    } catch (error) {
      lastError = error;
      const message = extractGeminiError(error);
      logger.error(`Gemini call failed for model ${candidate}`, message);
      const unsupportedModel =
        String(message).toLowerCase().includes("not found") ||
        String(message).toLowerCase().includes("not supported");
      if (!unsupportedModel) {
        throw error;
      }
    }
  }

  throw lastError || new Error("Gemini request failed");
}

function farmerFallback(language) {
  if (language === "ar") {
    return `التشخيص:\nإجهاد خفيف في المحصول.\n\nالنصائح:\n- تحسين السقي.\n- إضافة كمبوست ناضج.\n\nالاحتياطات:\n- تجنب الإفراط في الري.\n\nالخطوات التالية:\n1) متابعة الرطوبة.\n2) تقييم التحسن بعد أسبوع.`;
  }
  return `Diagnostic:\nStress modéré observé.\n\nConseils:\n- Optimiser l'irrigation.\n- Ajouter du compost mûr.\n\nPrécautions:\n- Éviter le sur-arrosage.\n\nÉtapes suivantes:\n1) Suivre l'humidité.\n2) Réévaluer dans une semaine.`;
}

function providerFallback(language, sensorData = {}) {
  return {
    accepted: true,
    wasteType: language === "ar" ? "نفايات عضوية مختلطة" : "Déchets organiques mixtes",
    composition: language === "ar" ? "بقايا نباتية + مواد رطبة" : "Résidus végétaux + fraction humide",
    estimatedHumidity: Number(sensorData.humidity || 62),
    contaminationLevel: language === "ar" ? "منخفض" : "Faible",
    compostPotential: language === "ar" ? "مرتفع" : "Élevé",
    recommendations:
      language === "ar"
        ? "أضف مادة كربونية جافة بنسبة 20% وفعّل التهوية."
        : "Ajouter 20% de matiere carbonee seche et ameliorer laeration."
  };
}

function invalidWasteMessage(language) {
  return language === "ar"
    ? "الصورة لا تبدو نفايات عضوية. يرجى إرسال صورة واضحة للنفايات أو بقايا الطعام."
    : "Cette image ne semble pas contenir des déchets organiques. Veuillez envoyer une image de déchets.";
}

async function sendAgricultureChat(messages, userContext = {}) {
  const language = userContext.language || "fr";
  const merged = messages.map((m) => `${m.role}: ${m.content}`).join("\n");
  const contextBlock = [
    userContext.culture ? `Culture: ${userContext.culture}` : null,
    userContext.climate ? `Climat: ${userContext.climate}` : null,
    userContext.surface ? `Surface: ${userContext.surface} ha` : null,
    userContext.city ? `Ville: ${userContext.city}` : null,
    userContext.season ? `Saison: ${userContext.season}` : null,
    userContext.weather ? `Meteo: ${userContext.weather}` : null,
    userContext.temperature ? `Temperature: ${userContext.temperature}` : null,
    userContext.humidity ? `Humidite: ${userContext.humidity}` : null,
    userContext.compostQuantity ? `Dose compost conseillee: ${userContext.compostQuantity} kg` : null
  ]
    .filter(Boolean)
    .join("\n");
  const productsBlock = (userContext.availableProducts || [])
    .map(p => `- ${language === 'ar' ? p.titleAr : p.titleFr}: ${language === 'ar' ? p.descriptionAr : p.descriptionFr} (Prix: ${p.price} DH)`)
    .join("\n");

  const prompt = `${buildFarmerPrompt(language)}
Directives:
- Fournis une analyse technique de taille moyenne (environ 15-20 lignes max).
- Structure ta réponse ainsi:
1. **Meilleur Engrais** : Recommande spécifiquement un produit parmi ceux-ci :
${productsBlock || "Aucun produit disponible pour le moment"}
2. **Dosage** : Quantité exacte nécessaire.
3. **Application** : Comment l'appliquer précisément.
4. **Conseils** : Astuces pour maximiser la production.
- Ne sois pas trop bref, mais ne sois pas trop long non plus. Va à l'essentiel pour chaque point.
- Réponds en ${language === "ar" ? "Arabe" : "Français"}.

Contexte ferme:
${contextBlock || "Aucun contexte supplementaire"}

Historique:
${merged}`;

  try {
    const reply = sanitizeAssistantText(await callGemini({ textPrompt: prompt }));
    return { provider: "gemini", reply };
  } catch (error) {
    logger.error("Gemini chat fallback", extractGeminiError(error));
    return {
      provider: "fallback",
      reply: sanitizeAssistantText(farmerFallback(language)),
      warning: "gemini_unavailable"
    };
  }
}

async function analyzePlantOrFarmImage(imageBase64, context = {}) {
  const language = context.language || "fr";
  const imagePayload = normalizeImagePayload(imageBase64, context.mimeType || "image/jpeg");
  
  console.log(`[AI] Starting analysis for user across language: ${language}`);
  console.log(`[AI] Context: T=${context.temperature}, H=${context.humidity}, Season=${context.season}`);

  const productsBlock = (context.availableProducts || [])
    .map(p => `- ${language === 'ar' ? p.titleAr : p.titleFr}: ${language === 'ar' ? p.descriptionAr : p.descriptionFr}`)
    .join("\n");

  const prompt = `${buildFarmerPrompt(language)}
Tu es un expert en pathologie végétale. Analyse cette image et structure ton diagnostic ainsi :

1. **Diagnostic Santé** : Identification courte du problème (ravageur, maladie, carence).
2. **Meilleur Traitement** : Recommande un produit spécifique parmi ceux-ci :
${productsBlock || "Utilisez notre compost organique standard"}
3. **Dosage & Application** : Dose exacte et mode d'emploi.
4. **Conseils** : Astuces de production et de prévention.

Contexte : Température (${context.temperature || "N/A"}°C), Humidité (${context.humidity || "N/A"}%), Culture (${context.culture || "Plante inconnue"}).
Format : Titres en gras, réponse de taille moyenne.
Langue : ${language === "ar" ? "Arabe" : "Français"}.`;

  try {
    const summary = await callGemini({ textPrompt: prompt, imagePayload });
    return { provider: "gemini", summary };
  } catch (error) {
    const errorMsg = extractGeminiError(error);
    logger.error("Gemini plant fallback", errorMsg);
    return {
      provider: "fallback",
      summary: sanitizeAssistantText(farmerFallback(language, errorMsg)),
      warning: "gemini_unavailable"
    };
  }
}

async function analyzeWasteImage(imageBase64, sensorData = {}, language = "fr") {
  const imagePayload = normalizeImagePayload(imageBase64, sensorData.mimeType || "image/jpeg");
  if (!imagePayload?.data) {
    return {
      provider: "validation",
      accepted: false,
      rejectionMessage: invalidWasteMessage(language)
    };
  }

  const prompt = `EXPERT BIO-CHIMIE ORGANIQUE.
Analyse cette image de déchets et retourne UN OBJET JSON avec :
{
  "isWaste": true,
  "wasteType": "type de déchet",
  "composition": "details",
  "molecularCarbon": "XX%",
  "molecularHydrogen": "XX%",
  "molecularOxygen": "XX%",
  "molecularNitrogen": "XX%",
  "cnRatio": "X:1",
  "estimatedHumidity": 00,
  "contaminationLevel": "bas/moyen/haut",
  "storageAdvice": "comment stocker",
  "compostPotential": "potentiel",
  "recommendations": "conseils courts",
  "recipeText": "RECETTE COMPLETE ET DETAILLEE A-Z AVEC POURCENTAGES EXACTS DE CHAQUE MATIERE",
  "rejectionMessage": ""
}
Langue: ${language === "ar" ? "arabe" : "français"}.
IMPORTANT: RETOURNE UNIQUEMENT LE JSON, RIEN D'AUTRE.`;

  try {
    const raw = await callGemini({ textPrompt: prompt, imagePayload });
    console.log("[AI RAW WASTE]", raw);
    const parsed = parseJsonFromText(raw);

    if (parsed && parsed.isWaste === false) {
      return {
        provider: "gemini",
        accepted: false,
        rejectionMessage: parsed.rejectionMessage || invalidWasteMessage(language)
      };
    }

    if (parsed && (parsed.isWaste === true || parsed.molecularCarbon || parsed.wasteType)) {
      return {
        provider: "gemini",
        accepted: true,
        ...parsed,
        rawText: raw,
        estimatedHumidity: Number(parsed.estimatedHumidity || sensorData.humidity || 60),
        // Stop using sanitizer for these fields to preserve formatting and length
        recommendations: parsed.recommendations || (language === "ar" ? "أضف مادة جافة." : "Ajouter une matière sèche."),
        storageAdvice: parsed.storageAdvice || "",
        recipeText: parsed.recipeText || ""
      };
    }

    if (looksLikeNonWaste(raw)) {
      return {
        provider: "gemini",
        accepted: false,
        rejectionMessage: invalidWasteMessage(language)
      };
    }

    return {
      provider: "gemini",
      accepted: true,
      rawText: raw,
      ...providerFallback(language, sensorData),
      recommendations: "L'analyse a été effectuée dans un format inhabituel, voici le contenu brut :\n\n" + raw
    };
  } catch (error) {
    const reason = extractGeminiError(error);
    const lowerReason = String(reason).toLowerCase();
    logger.error("Gemini waste fallback", reason);

    if (
      lowerReason.includes("unable to process input image") ||
      lowerReason.includes("invalid image") ||
      lowerReason.includes("unsupported image")
    ) {
      return {
        provider: "validation",
        accepted: false,
        rejectionMessage: invalidWasteMessage(language)
      };
    }

    return { provider: "fallback", warning: "gemini_unavailable", ...providerFallback(language, sensorData) };
  }
}

module.exports = {
  sendAgricultureChat,
  analyzePlantOrFarmImage,
  analyzeWasteImage
};

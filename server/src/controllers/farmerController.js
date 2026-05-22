const prisma = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/apiError");
const aiService = require("../services/aiService");
const geminiService = require("../services/geminiService");
const { getFarmWeatherByProfile } = require("../services/weatherService");
const { buildFarmerInsights } = require("../services/farmerInsightsService");

async function ensureFarmerProfile(user) {
  let profile = await prisma.farmerProfile.findUnique({ where: { userId: user.id } });
  if (!profile) {
    profile = await prisma.farmerProfile.create({
      data: {
        userId: user.id,
        farmName: `Ferme de ${user.fullName}`,
        region: "Non renseignée",
        city: "Non renseignée",
        climate: "Tempéré"
      }
    });
  }
  return profile;
}

async function getFarmerContext(user, language) {
  const profile = await ensureFarmerProfile(user);
  const weather = await getFarmWeatherByProfile(profile, language);
  const insights = buildFarmerInsights(profile, weather, language);
  return { profile, weather, insights };
}

async function streamReply(res, response) {
  const full = String(response.reply || "");
  const chunks = full.match(/.{1,22}/g) || [];
  let assembled = "";

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");

  const sendEvent = (payload) => {
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  };

  sendEvent({ type: "start", provider: response.provider });
  for (const chunk of chunks) {
    assembled += chunk;
    sendEvent({ type: "chunk", delta: chunk, full: assembled, provider: response.provider });
    // eslint-disable-next-line no-await-in-loop
    await new Promise((resolve) => setTimeout(resolve, 35));
  }
  sendEvent({ type: "done", message: full, provider: response.provider });
  res.end();
}

const getDashboard = asyncHandler(async (req, res) => {
  const language = req.user.preferredLanguage || "fr";
  const [context, ordersCount, impact] = await Promise.all([
    getFarmerContext(req.user, language),
    prisma.order.count({ where: { userId: req.user.id } }),
    prisma.impactStat.findFirst({ where: { userId: req.user.id } })
  ]);

  res.json({
    success: true,
    data: {
      profile: context.profile,
      weather: context.weather,
      insights: context.insights,
      alerts: context.insights.alerts,
      stats: {
        ordersCount,
        co2Saved: impact?.co2Saved || 0,
        trees: impact?.treesEquivalent || 0,
        performance: impact?.performanceRate || 0
      }
    }
  });
});

const getInsights = asyncHandler(async (req, res) => {
  const language = req.user.preferredLanguage || "fr";
  const context = await getFarmerContext(req.user, language);
  res.json({ success: true, data: context.insights });
});

const getAlerts = asyncHandler(async (req, res) => {
  const language = req.user.preferredLanguage || "fr";
  const context = await getFarmerContext(req.user, language);
  res.json({ success: true, data: context.insights.alerts });
});

const getProfile = asyncHandler(async (req, res) => {
  const profile = await ensureFarmerProfile(req.user);
  res.json({ success: true, data: profile });
});

const updateProfile = asyncHandler(async (req, res) => {
  await ensureFarmerProfile(req.user);
  const updated = await prisma.farmerProfile.update({
    where: { userId: req.user.id },
    data: {
      farmName: req.body.farmName,
      region: req.body.region,
      city: req.body.city,
      surfaceHectares: req.body.surfaceHectares ? Number(req.body.surfaceHectares) : null,
      climate: req.body.climate,
      mainCrops: req.body.mainCrops,
      equipment: req.body.equipment
    }
  });
  res.json({ success: true, data: updated });
});

const getProducts = asyncHandler(async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 8);
  const search = req.query.search || "";
  const quality = req.query.quality || "";

  const where = {
    isActive: true,
    ...(quality ? { qualityLevel: quality.toUpperCase() } : {}),
    ...(search
      ? {
          OR: [
            { titleFr: { contains: search } },
            { titleAr: { contains: search } },
            { descriptionFr: { contains: search } }
          ]
        }
      : {})
  };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.product.count({ where })
  ]);

  res.json({
    success: true,
    data: {
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

const getOrders = asyncHandler(async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.user.id },
    include: {
      items: {
        include: { product: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  res.json({ success: true, data: orders });
});

const addToCart = asyncHandler(async (req, res) => {
  const product = await prisma.product.findUnique({ where: { id: Number(req.body.productId) } });
  if (!product) throw new ApiError(404, "Produit introuvable");
  res.json({
    success: true,
    message: "Produit valide pour le panier local",
    data: { product }
  });
});

const createOrder = asyncHandler(async (req, res) => {
  const items = Array.isArray(req.body.items) ? req.body.items : [];
  if (!items.length) throw new ApiError(400, "Le panier est vide");

  const productIds = items.map((item) => Number(item.productId));
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
  if (!products.length) throw new ApiError(400, "Aucun produit valide");

  const total = items.reduce((sum, item) => {
    const product = products.find((entry) => entry.id === Number(item.productId));
    if (!product) return sum;
    return sum + Number(product.price) * Number(item.quantity || 1);
  }, 0);

  const order = await prisma.$transaction(async (tx) => {
    // Verify stock and collect products to update
    for (const item of items) {
      const product = products.find((entry) => entry.id === Number(item.productId));
      if (!product) continue;
      
      const qtyRequested = Number(item.quantity || 1);
      if (product.stock < qtyRequested) {
        throw new ApiError(400, `Stock insuffisant pour le produit: ${product.titleFr}`);
      }
    }

    const createdOrder = await tx.order.create({
      data: {
        userId: req.user.id,
        totalAmount: total,
        status: "PENDING"
      }
    });

    for (const item of items) {
      const product = products.find((entry) => entry.id === Number(item.productId));
      if (!product) continue;
      
      const qty = Number(item.quantity || 1);

      // Create order item
      await tx.orderItem.create({
        data: {
          orderId: createdOrder.id,
          productId: product.id,
          quantity: qty,
          unitPrice: product.price
        }
      });

      // Decrement stock
      await tx.product.update({
        where: { id: product.id },
        data: { stock: { decrement: qty } }
      });
    }

    return createdOrder;
  });

  res.status(201).json({ success: true, data: order });
});

const getAiHistory = asyncHandler(async (req, res) => {
  const history = await aiService.getConversationHistory(req.user.id, 60);
  res.json({ success: true, data: history });
});

const postAiChat = asyncHandler(async (req, res) => {
  const language = req.user.preferredLanguage || "fr";
  const [context, products] = await Promise.all([
    getFarmerContext(req.user, language),
    prisma.product.findMany({ where: { isActive: true } })
  ]);

  const response = await aiService.chatWithAssistant({
    userId: req.user.id,
    message: req.body.message,
    context: {
      language,
      culture: context.profile.mainCrops,
      climate: context.profile.climate,
      surface: context.profile.surfaceHectares,
      city: context.profile.city,
      season: context.weather.seasonLabel,
      weather: context.weather.conditionLabel,
      humidity: context.weather.humidity,
      temperature: context.weather.temperature,
      compostQuantity: context.insights.recommendedCompostQuantityKg,
      availableProducts: products // Pass products here
    },
    history: req.body.history || []
  });

  res.json({ success: true, data: response });
});

const postAiChatStream = async (req, res, next) => {
  try {
    const language = req.user.preferredLanguage || "fr";
    const [context, products] = await Promise.all([
      getFarmerContext(req.user, language),
      prisma.product.findMany({ where: { isActive: true } })
    ]);

    const response = await aiService.chatWithAssistant({
      userId: req.user.id,
      message: req.body.message,
      context: {
        language,
        culture: context.profile.mainCrops,
        climate: context.profile.climate,
        surface: context.profile.surfaceHectares,
        city: context.profile.city,
        season: context.weather.seasonLabel,
        weather: context.weather.conditionLabel,
        humidity: context.weather.humidity,
        temperature: context.weather.temperature,
        compostQuantity: context.insights.recommendedCompostQuantityKg,
        availableProducts: products
      },
      history: req.body.history || []
    });

    await streamReply(res, response);
  } catch (error) {
    next(error);
  }
};

const postAiAnalyze = asyncHandler(async (req, res) => {
  const language = req.user.preferredLanguage || "fr";
  const [context, products] = await Promise.all([
    getFarmerContext(req.user, language),
    prisma.product.findMany({ where: { isActive: true } })
  ]);

  const result = await geminiService.analyzePlantOrFarmImage(req.body.imageBase64, {
    language,
    mimeType: req.body.context?.mimeType,
    culture: context.profile.mainCrops,
    climate: context.profile.climate,
    surface: context.profile.surfaceHectares,
    season: context.weather.seasonLabel,
    temperature: context.weather.temperature,
    humidity: context.weather.humidity,
    availableProducts: products
  });

  await aiService.saveAnalysis({
    userId: req.user.id,
    type: "farmer_plant",
    result
  });

  res.json({ success: true, data: result });
});

const resetAiConversation = asyncHandler(async (req, res) => {
  await prisma.aIConversation.deleteMany({ where: { userId: req.user.id } });
  res.json({ success: true, message: "Conversation réinitialisée" });
});

module.exports = {
  getDashboard,
  getInsights,
  getAlerts,
  getProfile,
  updateProfile,
  getProducts,
  getOrders,
  addToCart,
  createOrder,
  getAiHistory,
  postAiChat,
  postAiChatStream,
  postAiAnalyze,
  resetAiConversation
};

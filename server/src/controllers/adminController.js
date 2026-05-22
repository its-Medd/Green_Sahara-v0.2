const prisma = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/apiError");
const aiService = require("../services/aiService");
const geminiService = require("../services/geminiService");
const fs = require("fs");
const path = require("path");

const getDashboard = asyncHandler(async (req, res) => {
  const [usersCount, providersCount, farmersCount, containersCount, productsCount, recentUsers, recentOrders] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "PROVIDER" } }),
      prisma.user.count({ where: { role: "FARMER" } }),
      prisma.container.count(),
      prisma.product.count(),
      prisma.user.findMany({
        where: { role: "PROVIDER" },
        orderBy: { createdAt: "desc" },
        take: 8
      })
    ]);

  const urgentContainers = await prisma.container.findMany({
    where: { fillLevel: { gte: 85 } },
    include: { provider: true },
    orderBy: { fillLevel: "desc" },
    take: 5
  });

  const recentActivity = recentUsers.map((user) => ({
    id: `user-${user.id}`,
    type: "user",
    title: user.fullName,
    message: `${user.role} · ${user.email}`,
    createdAt: user.createdAt
  }));

  const platformAlerts = urgentContainers.map((container) => ({
    id: container.id,
    title: container.name,
    message: `${container.location} · ${container.fillLevel}%`,
    severity: container.fillLevel >= 92 ? "CRITICAL" : "WARNING"
  }));

  res.json({
    success: true,
    data: {
      stats: {
        totalUsers: usersCount,
        providers: providersCount,
        farmers: farmersCount,
        containers: containersCount,
        marketplaceProducts: productsCount
      },
      recentActivity,
      platformAlerts
    }
  });
});

const postAnalysis = asyncHandler(async (req, res) => {
  const language = req.user.preferredLanguage || req.body.language || "fr";
  const result = await geminiService.analyzeWasteImage(
    req.body.imageBase64,
    req.body.sensorData || {},
    language
  );

  await aiService.saveAnalysis({
    userId: req.user.id,
    type: "admin_waste",
    result
  });

  res.json({ success: true, data: result });
});

const getLots = asyncHandler(async (req, res) => {
  const items = await prisma.product.findMany({
    orderBy: { createdAt: "desc" }
  });
  res.json({ success: true, data: items });
});

const createLot = asyncHandler(async (req, res) => {
  const titleFr = String(req.body.titleFr || "").trim();
  const titleAr = String(req.body.titleAr || "").trim();
  const descriptionFr = String(req.body.descriptionFr || "").trim();
  const descriptionAr = String(req.body.descriptionAr || "").trim();
  const price = Number(req.body.price || 0);
  const stock = Number(req.body.stock || 0);
  const qualityLevel = String(req.body.qualityLevel || "STANDARD").toUpperCase();

  if (!titleFr || !titleAr || !descriptionFr || !descriptionAr) {
    throw new ApiError(400, "Tous les champs produit sont requis");
  }
  if (!["STANDARD", "PREMIUM"].includes(qualityLevel)) {
    throw new ApiError(400, "Qualité invalide");
  }
  if (!Number.isFinite(price) || price <= 0) {
    throw new ApiError(400, "Prix invalide");
  }

  const product = await prisma.product.create({
    data: {
      titleFr,
      titleAr,
      descriptionFr,
      descriptionAr,
      price,
      stock,
      qualityLevel,
      imageUrl: req.body.imageUrl || null,
      isActive: req.body.isActive !== false
    }
  });

  res.status(201).json({ success: true, data: product });
});

const updateLot = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const product = await prisma.product.update({
    where: { id },
    data: {
      titleFr: req.body.titleFr,
      titleAr: req.body.titleAr,
      descriptionFr: req.body.descriptionFr,
      descriptionAr: req.body.descriptionAr,
      price: req.body.price !== undefined ? Number(req.body.price) : undefined,
      stock: req.body.stock !== undefined ? Number(req.body.stock) : undefined,
      qualityLevel: req.body.qualityLevel,
      imageUrl: req.body.imageUrl,
      isActive: req.body.isActive
    }
  });
  res.json({ success: true, data: product });
});

const deleteLot = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  await prisma.product.delete({ where: { id } });
  res.json({ success: true, message: "Produit supprimé" });
});

const getStatistics = asyncHandler(async (req, res) => {
  // 1. Sales Statistics (Real data from Order)
  const orders = await prisma.order.findMany({
    where: {
      status: { in: ['CONFIRMED', 'DELIVERED'] },
      createdAt: { gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) }
    },
    select: { totalAmount: true, createdAt: true }
  });

  // 2. Compost Production (Stock + Sold logic - as requested)
  // Total Produced = Current Stock + Total Historically Sold
  const products = await prisma.product.findMany({
    where: {
      createdAt: { gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) }
    },
    include: {
      orderItems: {
        select: { quantity: true }
      }
    }
  });

  // 3. Group Statistics (Count by Region from FarmerProfile)
  const regions = await prisma.farmerProfile.groupBy({
    by: ['region'],
    _count: { id: true }
  });

  // Helper to group by month
  const groupDataByMonth = (items, valueKey) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const grouped = {};

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const m = months[d.getMonth()];
      grouped[m] = 0;
    }

    items.forEach(item => {
      const m = months[new Date(item.createdAt).getMonth()];
      if (grouped[m] !== undefined) {
        let value = 0;
        if (valueKey === 'totalAmount') {
          value = Number(item.totalAmount || 0);
        } else if (valueKey === 'stock_plus_sold') {
          const sold = item.orderItems ? item.orderItems.reduce((sum, oi) => sum + oi.quantity, 0) : 0;
          value = Number(item.stock || 0) + sold;
        }
        grouped[m] += value;
      }
    });

    const frontendKey = (valueKey === 'totalAmount') ? 'revenue' : 'volume';
    return Object.keys(grouped).map(m => ({ month: m, [frontendKey]: grouped[m] }));
  };

  const salesStats = groupDataByMonth(orders, 'totalAmount');
  const compostStats = groupDataByMonth(products, 'stock_plus_sold');
  const groupStats = regions.map(r => ({ name: r.region || "Inconnu", value: r._count.id }));

  // Waste Statistics from JSON (kept from JSON as specifically requested in first prompt)
  let wasteStats = { monthly_waste: [], waste_composition: [] };
  try {
    const filePath = path.join(__dirname, "../data/waste_stats.json");
    if (fs.existsSync(filePath)) {
      wasteStats = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    }
  } catch (err) {
    console.error("Error reading waste_stats.json:", err);
  }

  res.json({
    success: true,
    data: {
      sales: salesStats,
      waste: wasteStats,
      groups: groupStats,
      compost: compostStats
    }
  });
});

const getPendingOrders = asyncHandler(async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { status: 'PENDING' },
    include: {
      user: { select: { fullName: true, email: true } },
      items: { include: { product: true } }
    },
    orderBy: { createdAt: "desc" }
  });
  res.json({ success: true, data: orders });
});

const confirmOrder = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const order = await prisma.order.update({
    where: { id },
    data: { status: 'CONFIRMED' }
  });
  res.json({ success: true, data: order });
});

module.exports = {
  getDashboard,
  postAnalysis,
  getLots,
  createLot,
  updateLot,
  deleteLot,
  getStatistics,
  getPendingOrders,
  confirmOrder
};

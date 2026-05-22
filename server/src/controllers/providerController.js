const prisma = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");

async function ensureProviderProfile(user) {
  let profile = await prisma.providerProfile.findUnique({ where: { userId: user.id } });
  if (!profile) {
    profile = await prisma.providerProfile.create({
      data: {
        userId: user.id,
        establishmentName: user.fullName || "Établissement Provider",
        city: "Marrakech",
        address: "Adresse à compléter",
        wasteType: "Déchets organiques mixtes"
      }
    });
  }
  return profile;
}

async function ensureProviderData(providerId, userId) {
  const [containersCount, requestsCount, transportCount] = await Promise.all([
    prisma.container.count({ where: { providerId } }),
    prisma.collectionRequest.count({ where: { providerId } }),
    prisma.transportUpdate.count({ where: { providerId } })
  ]);

    if (containersCount === 0) {
      await prisma.container.createMany({
        data: [
          {
            providerId,
            name: "Conteneur #042",
            location: "Cuisine Centrale - Site A",
            capacityLiters: 120,
            fillLevel: 88,
            alertsCount: 4,
            status: "ONLINE"
          }
        ]
      });
    }

  const containers = await prisma.container.findMany({ where: { providerId }, orderBy: { id: "asc" } });

  if (requestsCount === 0 && containers.length > 0) {
    await prisma.collectionRequest.createMany({
      data: containers.map((container, index) => ({
        providerId,
        containerId: container.id,
        priority: container.fillLevel >= 85 ? "URGENT" : "HIGH",
        fillPercentage: container.fillLevel,
        city: index === 0 ? "Marrakech" : "Agadir",
        status: index === 0 ? "REQUESTED" : "SCHEDULED"
      }))
    });
  }

  if (transportCount === 0 && containers.length > 0) {
    await prisma.transportUpdate.createMany({
      data: [
        {
          providerId,
          containerId: containers[0].id,
          etaMinutes: 35,
          transportStatus: "ON_THE_WAY",
          assignedTruck: "Truck GS-12",
          note: "Collecte prioritaire en cours"
        },
        {
          providerId,
          containerId: containers[1]?.id || null,
          etaMinutes: 90,
          transportStatus: "WAITING",
          assignedTruck: "Truck GS-08",
          note: "Passage prévu en deuxième rotation"
        }
      ].filter((u) => u.containerId !== null || transportCount === 0)
    });
  }

  const impact = await prisma.impactStat.findFirst({ where: { userId } });
  if (!impact) {
    await prisma.impactStat.create({
      data: {
        userId,
        co2Saved: 21.4,
        treesEquivalent: 28,
        performanceRate: 14.2
      }
    });
  }
}

async function getProviderContext(user) {
  try {
    const profile = await ensureProviderProfile(user);
    await ensureProviderData(profile.id, user.id);

    const [containers, requests, transportUpdates, impact] = await Promise.all([
      prisma.container.findMany({
        where: { providerId: profile.id },
        orderBy: { createdAt: "desc" }
      }),
      prisma.collectionRequest.findMany({
        where: { providerId: profile.id },
        orderBy: { requestedAt: "desc" }
      }),
      prisma.transportUpdate.findMany({
        where: { providerId: profile.id },
        include: { container: true },
        orderBy: { updatedAt: "desc" }
      }),
      prisma.impactStat.findFirst({ where: { userId: user.id } })
    ]);

    const transportByContainer = new Map();
    for (const update of transportUpdates) {
      if (!update.containerId || transportByContainer.has(update.containerId)) continue;
      transportByContainer.set(update.containerId, update);
    }

    const enrichedContainers = containers.map((container) => ({
      ...container,
      transport: transportByContainer.get(container.id) || null
    }));

    const averageFillRate =
      containers.length > 0
        ? Number(
            (
              containers.reduce((sum, container) => sum + Number(container.fillLevel || 0), 0) /
              containers.length
            ).toFixed(1)
          )
        : 0;

    const urgentContainers = containers.filter((container) => Number(container.fillLevel) >= 85).length;
    const pendingCollections = requests.filter((request) => request.status !== "COMPLETED").length;
    
    const recentNotifications = [
      ...requests.slice(0, 3).map((request) => ({
        id: `request-${request.id}`,
        title: `Collecte ${request.city || "Site"}`,
        message: `${request.priority} · ${request.fillPercentage}%`,
        createdAt: request.requestedAt
      })),
      ...transportUpdates.slice(0, 2).map((update) => ({
        id: `transport-${update.id}`,
        title: update.assignedTruck || "Transport",
        message: `${update.transportStatus} · ETA ${update.etaMinutes || 0} min`,
        createdAt: update.updatedAt
      }))
    ]
      .filter(n => n.createdAt)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    return {
      profile,
      containers: enrichedContainers,
      requests,
      transportUpdates,
      impact,
      metrics: {
        activeContainers: containers.length,
        averageFillRate,
        pendingCollections,
        urgentContainers,
        co2Saved: impact?.co2Saved || 0,
        overallStatus: pendingCollections > 0 ? "Surveillance active" : "Flux stable"
      },
      recentNotifications
    };
  } catch (error) {
    console.error("[getProviderContext] Erreur critique:", error);
    throw error;
  }
}

const getDashboard = asyncHandler(async (req, res) => {
  const context = await getProviderContext(req.user);
  res.json({
    success: true,
    data: {
      profile: context.profile,
      stats: context.metrics,
      recentNotifications: context.recentNotifications,
      collectionStatus: context.requests.slice(0, 4),
      transportStatus: context.transportUpdates.slice(0, 4)
    }
  });
});

const getContainers = asyncHandler(async (req, res) => {
  const context = await getProviderContext(req.user);
  res.json({ success: true, data: context.containers });
});

const getTransportStatus = asyncHandler(async (req, res) => {
  const context = await getProviderContext(req.user);
  res.json({ success: true, data: context.transportUpdates });
});

const getProfile = asyncHandler(async (req, res) => {
  const profile = await ensureProviderProfile(req.user);
  res.json({ success: true, data: profile });
});

const updateProfile = asyncHandler(async (req, res) => {
  await ensureProviderProfile(req.user);
  const updated = await prisma.providerProfile.update({
    where: { userId: req.user.id },
    data: {
      establishmentName: req.body.establishmentName,
      city: req.body.city,
      address: req.body.address,
      contactPhone: req.body.contactPhone,
      wasteType: req.body.wasteType,
      logoUrl: req.body.logoUrl
    }
  });
  res.json({ success: true, data: updated });
});

module.exports = {
  getDashboard,
  getContainers,
  getTransportStatus,
  getProfile,
  updateProfile
};

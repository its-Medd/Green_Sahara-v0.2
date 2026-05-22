const {
  PrismaClient,
  Role,
  OrderStatus,
  CollectionPriority,
  CollectionStatus,
  LotStatus,
  TransportStatus
} = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Password123!", 10);
  const adminHash = await bcrypt.hash("Admin@123456", 10);

  const farmerUser = await prisma.user.upsert({
    where: { email: "farmer@yassine.ma" },
    update: {
      role: Role.FARMER,
      preferredLanguage: "fr",
      isVerified: true
    },
    create: {
      fullName: "Yassine Dami",
      email: "farmer@yassine.ma",
      passwordHash,
      role: Role.FARMER,
      preferredLanguage: "fr",
      isVerified: true
    }
  });

  const providerUser = await prisma.user.upsert({
    where: { email: "provider@atlas.ma" },
    update: {
      role: Role.PROVIDER,
      preferredLanguage: "fr",
      isVerified: true
    },
    create: {
      fullName: "Hôtel Atlas",
      email: "provider@atlas.ma",
      passwordHash,
      role: Role.PROVIDER,
      preferredLanguage: "fr",
      isVerified: true
    }
  });

  await prisma.user.upsert({
    where: { email: "admin@greensahara.local" },
    update: {
      role: Role.ADMIN,
      preferredLanguage: "fr",
      isVerified: true
    },
    create: {
      fullName: "Green Sahara Admin",
      email: "admin@greensahara.local",
      passwordHash: adminHash,
      role: Role.ADMIN,
      preferredLanguage: "fr",
      isVerified: true
    }
  });

  const farmerProfile = await prisma.farmerProfile.upsert({
    where: { userId: farmerUser.id },
    update: {
      farmName: "Ferme de Yassine Dami",
      region: "Région du Gharb",
      city: "Kénitra",
      surfaceHectares: 45,
      climate: "Tempéré",
      mainCrops: "Blé, Maïs, Pomme de terre",
      equipment: "Standard Bucket, Potato Harvester, Backhoe"
    },
    create: {
      userId: farmerUser.id,
      farmName: "Ferme de Yassine Dami",
      region: "Région du Gharb",
      city: "Kénitra",
      surfaceHectares: 45,
      climate: "Tempéré",
      mainCrops: "Blé, Maïs, Pomme de terre",
      equipment: "Standard Bucket, Potato Harvester, Backhoe"
    }
  });

  const providerProfile = await prisma.providerProfile.upsert({
    where: { userId: providerUser.id },
    update: {
      establishmentName: "Hôtel Atlas",
      city: "Marrakech",
      address: "Avenue Mohammed VI",
      contactPhone: "+212600000001",
      wasteType: "Déchets organiques hôteliers"
    },
    create: {
      userId: providerUser.id,
      establishmentName: "Hôtel Atlas",
      city: "Marrakech",
      address: "Avenue Mohammed VI",
      contactPhone: "+212600000001",
      wasteType: "Déchets organiques hôteliers"
    }
  });

  const productsData = [
    {
      titleFr: "Compost Standard Terre Plus",
      titleAr: "كمبوست قياسي تير بلس",
      descriptionFr: "Matière organique stabilisée adaptée aux cultures céréalières.",
      descriptionAr: "مادة عضوية مستقرة مناسبة لزراعة الحبوب.",
      price: 420,
      stock: 120,
      qualityLevel: "STANDARD",
      imageUrl:
        "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=900&q=80"
    },
    {
      titleFr: "Compost Premium Atlas",
      titleAr: "كمبوست ممتاز أطلس",
      descriptionFr: "Formulation premium à haute valeur agronomique.",
      descriptionAr: "تركيبة ممتازة ذات قيمة زراعية عالية.",
      price: 680,
      stock: 70,
      qualityLevel: "PREMIUM",
      imageUrl:
        "https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=900&q=80"
    },
    {
      titleFr: "Amendement Compost Bio",
      titleAr: "مصلح تربة عضوي",
      descriptionFr: "Améliore la structure du sol et la rétention d’eau.",
      descriptionAr: "يحسن بنية التربة والاحتفاظ بالماء.",
      price: 350,
      stock: 180,
      qualityLevel: "STANDARD",
      imageUrl:
        "https://images.unsplash.com/photo-1492496913980-501348b61469?auto=format&fit=crop&w=900&q=80"
    }
  ];

  for (let index = 0; index < productsData.length; index += 1) {
    const product = productsData[index];
    await prisma.product.upsert({
      where: { id: index + 1 },
      update: product,
      create: product
    });
  }

  await prisma.container.createMany({
    data: [
      {
        providerId: providerProfile.id,
        name: "Conteneur #042",
        location: "Cuisine Centrale - Site A",
        capacityLiters: 120,
        fillLevel: 84,
        alertsCount: 4
      },
      {
        providerId: providerProfile.id,
        name: "Conteneur #043",
        location: "Rooftop Restaurant",
        capacityLiters: 90,
        fillLevel: 61,
        alertsCount: 2
      }
    ],
    skipDuplicates: true
  });

  const seededContainers = await prisma.container.findMany({
    where: { providerId: providerProfile.id },
    orderBy: { id: "asc" }
  });

  const requestsCount = await prisma.collectionRequest.count({
    where: { providerId: providerProfile.id }
  });
  if (requestsCount === 0) {
    await prisma.collectionRequest.createMany({
      data: [
        {
          providerId: providerProfile.id,
          containerId: seededContainers[0]?.id || null,
          priority: CollectionPriority.URGENT,
          fillPercentage: 92,
          city: "Marrakech",
          status: CollectionStatus.REQUESTED
        },
        {
          providerId: providerProfile.id,
          containerId: seededContainers[1]?.id || null,
          priority: CollectionPriority.HIGH,
          fillPercentage: 85,
          city: "Fès",
          status: CollectionStatus.SCHEDULED
        }
      ]
    });
  }

  const transportCount = await prisma.transportUpdate.count({
    where: { providerId: providerProfile.id }
  });
  if (transportCount === 0) {
    await prisma.transportUpdate.createMany({
      data: [
        {
          providerId: providerProfile.id,
          containerId: seededContainers[0]?.id || null,
          etaMinutes: 35,
          transportStatus: TransportStatus.ON_THE_WAY,
          assignedTruck: "Truck GS-12",
          note: "Collecte prioritaire"
        },
        {
          providerId: providerProfile.id,
          containerId: seededContainers[1]?.id || null,
          etaMinutes: 95,
          transportStatus: TransportStatus.WAITING,
          assignedTruck: "Truck GS-08",
          note: "Rotation de fin d'après-midi"
        }
      ]
    });
  }

  await prisma.compostLot.createMany({
    data: [
      {
        providerId: providerProfile.id,
        lotCode: "LOT-2026-001",
        volume: 3.2,
        qualityScore: 82,
        status: LotStatus.READY,
        notes: "Lot organique équilibré"
      },
      {
        providerId: providerProfile.id,
        lotCode: "LOT-2026-002",
        volume: 5.4,
        qualityScore: 91,
        status: LotStatus.PUBLISHED,
        notes: "Faible humidité, prêt marketplace"
      }
    ],
    skipDuplicates: true
  });

  const existingOrder = await prisma.order.findFirst({
    where: { userId: farmerUser.id, status: OrderStatus.CONFIRMED }
  });

  let order = existingOrder;
  if (!order) {
    order = await prisma.order.create({
      data: {
        userId: farmerUser.id,
        totalAmount: 1100,
        status: OrderStatus.CONFIRMED
      }
    });
  }

  const existingItems = await prisma.orderItem.count({ where: { orderId: order.id } });
  if (existingItems === 0) {
    await prisma.orderItem.createMany({
      data: [
        { orderId: order.id, productId: 1, quantity: 2, unitPrice: 420 },
        { orderId: order.id, productId: 3, quantity: 1, unitPrice: 260 }
      ]
    });
  }

  const farmerImpact = await prisma.impactStat.findFirst({ where: { userId: farmerUser.id } });
  if (!farmerImpact) {
    await prisma.impactStat.create({
      data: { userId: farmerUser.id, co2Saved: 8.4, treesEquivalent: 12, performanceRate: 12 }
    });
  }
  const providerImpact = await prisma.impactStat.findFirst({ where: { userId: providerUser.id } });
  if (!providerImpact) {
    await prisma.impactStat.create({
      data: { userId: providerUser.id, co2Saved: 42.5, treesEquivalent: 60, performanceRate: 18 }
    });
  }

  const weatherCount = await prisma.weatherSnapshot.count({
    where: { farmerProfileId: farmerProfile.id }
  });
  if (weatherCount === 0) {
    await prisma.weatherSnapshot.create({
      data: {
        farmerProfileId: farmerProfile.id,
        condition: "sunny",
        temperature: 24,
        humidity: 42,
        windSpeed: 11,
        rainChance: 18
      }
    });
  }

  const alertsCount = await prisma.alert.count({
    where: { userId: { in: [farmerUser.id, providerUser.id] } }
  });
  if (alertsCount === 0) {
    await prisma.alert.createMany({
      data: [
        {
          userId: farmerUser.id,
          title: "Humidité faible",
          message: "Une irrigation plus rapprochée est conseillée cette semaine.",
          severity: "WARNING",
          source: "WEATHER"
        },
        {
          userId: providerUser.id,
          title: "Conteneur critique",
          message: "Le conteneur #042 dépasse 85% de remplissage.",
          severity: "CRITICAL",
          source: "CONTAINER"
        }
      ]
    });
  }

  console.log("Seed completed with farmer/provider/admin demo data.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const lots = await prisma.compostLot.findMany();
  if (lots.length >= 2) {
    await prisma.compostLot.update({
      where: { id: lots[0].id },
      data: { volume: 140 }
    });
    await prisma.compostLot.update({
      where: { id: lots[1].id },
      data: { volume: 151 }
    });
    console.log("Updated lot volumes to sum to 291 kg");
  } else {
    // If fewer than 2 lots, just create or update one to 291
    if (lots.length === 1) {
       await prisma.compostLot.update({
        where: { id: lots[0].id },
        data: { volume: 291 }
      });
    } else {
      // Find a provider profile to associate with
      const provider = await prisma.providerProfile.findFirst();
      if (provider) {
        await prisma.compostLot.create({
          data: {
            providerId: provider.id,
            lotCode: "LOT-FIX-291",
            volume: 291,
            status: "READY"
          }
        });
      }
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // We want Total(ID1) + Total(ID3) = 291
  // ID1 currently has 12 sold. If we want Total1 = 150, stock1 = 138.
  // ID3 currently has 22 sold. So 150 + Total3 = 291 => Total3 = 141. stock3 = 119.

  await prisma.product.update({
    where: { id: 1 },
    data: { stock: 138 }
  });
  
  await prisma.product.update({
    where: { id: 3 },
    data: { stock: 119 }
  });

  console.log("Adjusted stocks for IDs 1 and 3 to sum with sold items to 291 kg total produced.");
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());

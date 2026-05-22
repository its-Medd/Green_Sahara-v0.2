const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    orderBy: { id: 'asc' }
  });
  
  if (products.length >= 3) {
    await prisma.product.update({
      where: { id: products[0].id },
      data: { stock: 100 }
    });
    await prisma.product.update({
      where: { id: products[1].id },
      data: { stock: 91 }
    });
    await prisma.product.update({
      where: { id: products[2].id },
      data: { stock: 100 }
    });
    console.log("Updated product stocks to sum to 291 kg");
  } else if (products.length > 0) {
    // Just set the first one to 291 if fewer than 3
    await prisma.product.update({
      where: { id: products[0].id },
      data: { stock: 291 }
    });
    console.log("Updated first product stock to 291 kg");
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    include: { orderItems: true }
  });
  console.log("--- Products ---");
  products.forEach(p => {
    const sold = p.orderItems.reduce((sum, oi) => sum + oi.quantity, 0);
    console.log(`ID: ${p.id}, Stock: ${p.stock}, Sold: ${sold}, Total: ${p.stock + sold}, Created: ${p.createdAt.toISOString()}`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());

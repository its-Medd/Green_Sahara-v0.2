const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const product = await prisma.product.findFirst({ orderBy: { id: 'asc' } });
  if (!product) return console.log("No product found");

  const user = await prisma.user.findFirst({ where: { role: 'FARMER' } });
  if (!user) return console.log("No user found");

  const initialTotal = product.stock;
  console.log(`Initial Stock: ${initialTotal}`);

  // Simulate a sale of 10kg
  const sellQty = 10;
  
  // 1. Create Order
  const order = await prisma.order.create({
    data: {
      userId: user.id,
      totalAmount: product.price.mul(sellQty),
      status: 'DELIVERED',
      items: {
        create: {
          productId: product.id,
          quantity: sellQty,
          unitPrice: product.price
        }
      }
    }
  });

  // 2. Decrement Stock
  await prisma.product.update({
    where: { id: product.id },
    data: { stock: product.stock - sellQty }
  });

  console.log(`Sold ${sellQty}kg. New Stock: ${product.stock - sellQty}`);
  console.log(`Logic: Stock (${product.stock - sellQty}) + Sold (${sellQty}) = ${initialTotal}`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());

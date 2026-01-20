import { prisma } from "../src/lib/db";

async function main() {
  const products = [
    { name: "Veg Burger", category: "Burger", price: 9900, costPrice: 4500, stockCount: 9999 },
    { name: "Chicken Burger", category: "Burger", price: 14900, costPrice: 6500, stockCount: 9999 },

    { name: "Veg Sandwich", category: "Sandwich", price: 8900, costPrice: 4000, stockCount: 9999 },
    { name: "Grilled Cheese Sandwich", category: "Sandwich", price: 10900, costPrice: 5000, stockCount: 9999 },

    { name: "White Sauce Pasta", category: "Pasta", price: 15900, costPrice: 7000, stockCount: 9999 },
    { name: "Red Sauce Pasta", category: "Pasta", price: 14900, costPrice: 6500, stockCount: 9999 },

    { name: "Margherita Pizza", category: "Pizza", price: 19900, costPrice: 9000, stockCount: 9999 },
    { name: "Veg Loaded Pizza", category: "Pizza", price: 23900, costPrice: 11000, stockCount: 9999 },

    { name: "Espresso", category: "Coffee", price: 8900, costPrice: 2500, stockCount: 9999 },
    { name: "Cappuccino", category: "Coffee", price: 12900, costPrice: 3500, stockCount: 9999 },
    { name: "Cold Coffee", category: "Coffee", price: 14900, costPrice: 4500, stockCount: 9999 },

    { name: "Masala Tea", category: "Tea", price: 4900, costPrice: 1500, stockCount: 9999 },
    { name: "Green Tea", category: "Tea", price: 6900, costPrice: 2000, stockCount: 9999 },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { name: p.name },
      update: p,
      create: p,
    });
  }

  console.log("✅ Seed completed");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const orders = await prisma.order.findMany({
    where: {
      createdAt: { gte: start, lte: end },
    },
    include: {
      items: {
        include: { product: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  const paymentSplit = orders.reduce(
    (acc, o) => {
      acc[o.paymentType] = (acc[o.paymentType] || 0) + o.totalAmount;
      return acc;
    },
    {} as Record<string, number>
  );

  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  // Top items
  const itemMap = new Map<
    string,
    { name: string; qty: number; revenue: number }
  >();

  for (const order of orders) {
    for (const item of order.items) {
      const key = item.productId;
      const existing = itemMap.get(key) || {
        name: item.product.name,
        qty: 0,
        revenue: 0,
      };

      existing.qty += item.quantity;
      existing.revenue += item.quantity * item.price;

      itemMap.set(key, existing);
    }
  }

  const topItems = Array.from(itemMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 7);

  // Peak hour distribution
  const hourBuckets: { hour: number; orders: number }[] = Array.from(
    { length: 24 },
    (_, i) => ({ hour: i, orders: 0 })
  );

  for (const order of orders) {
    const hour = new Date(order.createdAt).getHours();
    hourBuckets[hour].orders += 1;
  }

  return NextResponse.json({
    totalOrders,
    totalRevenue,
    avgOrderValue,
    paymentSplit,
    topItems,
    hourBuckets,
  });
}

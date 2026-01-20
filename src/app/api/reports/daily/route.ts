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
      status: "PLACED",
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

  // Item summary: how many times sold + revenue generated
  const itemSummaryMap = new Map<
    string,
    { productId: string; name: string; quantity: number; revenue: number }
  >();

  for (const order of orders) {
    for (const it of order.items) {
      const prev = itemSummaryMap.get(it.productId) || {
        productId: it.productId,
        name: it.product.name,
        quantity: 0,
        revenue: 0,
      };

      prev.quantity += it.quantity;
      prev.revenue += it.price * it.quantity;

      itemSummaryMap.set(it.productId, prev);
    }
  }

  const itemsSold = Array.from(itemSummaryMap.values()).sort(
    (a, b) => b.quantity - a.quantity
  );

  const topItems = itemsSold.slice(0, 5);

  // Peak hour (by revenue)
  const hourRevenueMap = new Map<number, number>();
  for (const order of orders) {
    const hour = new Date(order.createdAt).getHours();
    hourRevenueMap.set(hour, (hourRevenueMap.get(hour) || 0) + order.totalAmount);
  }

  const peakHourEntry = Array.from(hourRevenueMap.entries()).sort(
    (a, b) => b[1] - a[1]
  )[0];

  const peakHour = peakHourEntry
    ? `${String(peakHourEntry[0]).padStart(2, "0")}:00 - ${String(
        peakHourEntry[0] + 1
      ).padStart(2, "0")}:00`
    : "N/A";

  return NextResponse.json({
    date: new Date().toISOString().slice(0, 10),
    totalOrders,
    totalRevenue,
    paymentSplit,
    peakHour,
    topItems,
    itemsSold, // full list: every item, count + revenue
  });
}

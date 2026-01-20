import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";

const CreateOrderSchema = z.object({
  paymentType: z.enum(["CASH", "UPI", "CARD"]).default("CASH"),
  orderType: z.enum(["DINE_IN", "TAKEAWAY"]).default("TAKEAWAY"),
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().min(1),
        notes: z.string().optional(),
      })
    )
    .min(1),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = CreateOrderSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { items, paymentType, orderType } = parsed.data;

  const products = await prisma.product.findMany({
    where: { id: { in: items.map((i) => i.productId) } },
  });

  let subtotal = 0;

  const orderItems = items.map((item) => {
    const product = products.find((p) => p.id === item.productId);

    if (!product) {
      throw new Error(`Invalid productId: ${item.productId}`);
    }

    subtotal += product.price * item.quantity;

    return {
      productId: product.id,
      quantity: item.quantity,
      price: product.price,
      notes: item.notes ?? null,
    };
  });

  const taxAmount = Math.round(subtotal * 0.05); // 5%
  const discount = 0;
  const totalAmount = subtotal + taxAmount - discount;

  const order = await prisma.order.create({
    data: {
      subtotal,
      taxAmount,
      discount,
      totalAmount,
      paymentType,
      orderType,
      items: { create: orderItems },
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  return NextResponse.json(order, { status: 201 });
}

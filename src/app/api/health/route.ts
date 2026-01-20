import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const count = await prisma.product.count();
    return NextResponse.json({ ok: true, productCount: count });
  } catch (e: unknown) {
    const errorMessage =
      e instanceof Error ? e.message : "Database check failed";
    return NextResponse.json({ ok: false, error: errorMessage }, { status: 500 });
  }
}

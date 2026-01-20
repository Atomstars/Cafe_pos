// src/actions/ai-consultant.ts
"use server"

import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function getAiBusinessConsult() {
  // 1. Fetch sales from the last 24 hours
  const dailySales = await prisma.order.findMany({
    where: {
      createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    },
    include: { items: { include: { product: true } } }
  });

  // 2. Pass to AI for "Crazy" insights
  const completion = await openai.chat.completions.create({
    model: "gpt-4o", // Using 2026's optimized model
    messages: [
      { role: "system", content: "You are a world-class cafe consultant. Analyze sales and inventory." },
      { role: "user", content: `Here are today's orders: ${JSON.stringify(dailySales)}. 
        Tell the owner: 
        1. The 'Hero Item' 
        2. The 'Ghost Item' (not selling) 
        3. A 'Crazy Prediction' for tomorrow based on time zones.` }
    ]
  });

  return completion.choices[0].message.content;
}
import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { z } from "zod";

const ReqSchema = z.object({
  report: z.any(),
});

export async function POST(req: Request) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "Missing GROQ_API_KEY in environment variables" },
        { status: 500 }
      );
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const body = await req.json();
    const parsed = ReqSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { report } = parsed.data;

    const prompt = `
You are a cafe business assistant.
Use ONLY the numbers in the report JSON.
Give WhatsApp-friendly summary + 2 suggestions.

REPORT JSON:
${JSON.stringify(report)}
`.trim();

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      temperature: 0.2,
      messages: [{ role: "user", content: prompt }],
    });

    const summary =
      response.choices?.[0]?.message?.content ?? "No summary generated";

    return NextResponse.json({ summary });
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : "AI summary failed";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

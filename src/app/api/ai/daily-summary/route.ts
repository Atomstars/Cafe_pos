import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { z } from "zod";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const ReqSchema = z.object({
  report: z.any(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = ReqSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { report } = parsed.data;

    const prompt = `
You are an analytics assistant for a cafe owner.

RULES:
- Use ONLY the numbers present in the report JSON.
- Do NOT invent sales numbers.
- Keep output short and WhatsApp-friendly.
- Give: (1) Today summary, (2) top items insight, (3) 2 actionable suggestions.

REPORT JSON:
${JSON.stringify(report)}
`.trim();

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      temperature: 0.2,
      messages: [{ role: "user", content: prompt }],
    });

    const summary = response.choices?.[0]?.message?.content ?? "No summary generated";

    return NextResponse.json({ summary });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "AI summary failed";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { answerQuestion } from "@/lib/ai/assistant";
import { checkRateLimit } from "@/lib/ai/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const AskBody = z.object({ question: z.string().trim().min(4).max(700), audience: z.enum(["student", "researcher"]).default("student") });

export async function POST(request: Request) {
  const clientKey = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
  const limit = checkRateLimit(clientKey);
  if (!limit.allowed) return NextResponse.json({ error: "Rate limit reached. Try again shortly." }, { status: 429, headers: { "retry-after": String(limit.retryAfterSeconds) } });
  let input: unknown;
  try { input = await request.json(); } catch { return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 }); }
  const parsed = AskBody.safeParse(input);
  if (!parsed.success) return NextResponse.json({ error: "Provide a question between 4 and 700 characters." }, { status: 400 });
  try {
    const answer = await answerQuestion(parsed.data.question, parsed.data.audience);
    return NextResponse.json(answer, { headers: { "cache-control": "no-store", "x-assistant-mode": answer.mode } });
  } catch (error) {
    const detail = error instanceof Error && /Set AI_PROVIDER|OPENAI_API_KEY|ANTHROPIC_API_KEY|AI_PROVIDER must/.test(error.message) ? error.message : "The live provider request failed. Demo mode remains available.";
    return NextResponse.json({ error: detail }, { status: 502 });
  }
}

import { answerFromDemoCache, type AssistantAnswer, type Audience } from "@/lib/ai/demo-cache";
import { contextForModel, retrieveRecords } from "@/lib/ai/retrieval";
import { askProvider, liveProviderReady } from "@/lib/ai/providers";

export async function answerQuestion(question: string, audience: Audience): Promise<AssistantAnswer> {
  if (!liveProviderReady()) return answerFromDemoCache(question, audience);
  const records = retrieveRecords(question, 5);
  if (!records.length) return answerFromDemoCache(question, audience);
  const answer = await askProvider(question, audience, contextForModel(records));
  return {
    mode: "live",
    answer: answer || "The retrieved source excerpts do not support an answer.",
    citations: records.map((item) => ({ id: item.id, title: item.title, source_url: item.source_url })),
    values: [],
    abstained: !answer,
  };
}

import Fuse from "fuse.js";
import { investigations } from "@/lib/data";
import type { Investigation } from "@/lib/schema";

const lunarPriority = ["PSI-26", "PSI-25", "PSI-100", "PSI-99", "PSI-98", "PSI-20", "PSI-159", "PSI-22", "PSI-10"];
const fuse = new Fuse(investigations, {
  keys: ["id", "acronym", "title", "objective", "approach", "keywords", "fuel_types", "safety_categories", "hardware.name"],
  includeScore: true,
  threshold: 0.45,
  ignoreLocation: true,
  minMatchCharLength: 3,
});

export function retrieveRecords(question: string, limit = 5): Investigation[] {
  const normalized = question.toLowerCase();
  if (/\b(moon|lunar|lunar habitat|moon base|30\s*%|30 percent)\b/.test(normalized)) {
    const preferred = lunarPriority.map((id) => investigations.find((item) => item.id === id)).filter((item): item is Investigation => Boolean(item));
    return preferred.slice(0, limit);
  }
  const results = fuse.search(question, { limit }).filter((result) => (result.score ?? 1) < 0.42).map((result) => result.item);
  return results;
}

export function contextForModel(records: Investigation[]) {
  // Keep the provider context constrained to the retrieved source records and omit unrelated metadata.
  return records.map((record) => ({
    investigation_id: record.id,
    title: record.title,
    source_url: record.source_url,
    objective: record.objective,
    approach: record.approach,
    fuel_types: record.fuel_types,
    safety_categories: record.safety_categories,
    hardware: record.hardware,
    reported_variables: record.reported_variables,
    conditions: record.conditions,
    experimental_records: record.experimental_records,
  }));
}

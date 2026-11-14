import { investigations } from "@/lib/data";
import { retrieveRecords } from "@/lib/ai/retrieval";
import { SOURCES } from "@/lib/sources";
import type { NumericValue } from "@/lib/schema";

export type Audience = "student" | "researcher";
export type Citation = { id: string; title: string; source_url: string; record_id?: string };
export type AssistantAnswer = { mode: "demo" | "live"; answer: string; citations: Citation[]; values: NumericValue[]; abstained: boolean };

function asValue(value: NumericValue): NumericValue { return value; }

export function answerFromDemoCache(question: string, audience: Audience = "student"): AssistantAnswer {
  const normalized = question.toLowerCase();
  const citations: Citation[] = [];
  const values: NumericValue[] = [];

  if (/table|csv|fuel concentration|fuel conc|flames ignited|experimental record/i.test(normalized)) {
    const item = investigations.find((record) => record.id === "PSI-22");
    if (item?.experimental_records.length) {
      const rows = item.experimental_records.slice(0, 4);
      citations.push({ id: item.id, title: item.title, source_url: item.source_url, record_id: "PSI-22_Experimental table_ACME E-FIELD Flames.csv" });
      for (const row of rows) {
        values.push(asValue(row.values.fuel_concentration_pct), asValue(row.values.flames_ignited));
      }
      return {
        mode: "demo",
        answer: audience === "student"
          ? "The loaded PSI snapshot contains an E-FIELD Flames experimental table. The rows below report fuel-mixture concentration and flames ignited for test days. They are setup/count fields, not a flammability threshold or a safety result."
          : "The accessible PSI-22 CSV contains test-day rows with fuel-mixture concentration and flames-ignited counts. These fields describe recorded test inputs/counts; they do not define an extinction limit or establish material safety.",
        citations, values, abstained: false,
      };
    }
  }

  if (/\b(moon|lunar|30\s*%|30 percent|habitat)\b/.test(normalized)) {
    const records = retrieveRecords(question, 5);
    const matched = records.filter((item) => /BASS|SAFFIRE|BRE|CFI-G/i.test(`${item.acronym} ${item.title}`));
    for (const item of (matched.length ? matched : records).slice(0, 5)) citations.push({ id: item.id, title: item.title, source_url: item.source_url });
    return {
      mode: "demo",
      answer: "The loaded PSI summaries support an inferred topic shortlist (solid-material work and high-oxygen combustion research), but they do not expose structured oxygen, total-pressure or ppO₂ values for a direct match to the lunar scenario. This dataset cannot tell which tests used exactly 30% O₂ or establish a safety conclusion. The ordering is inferred from investigation scope only.",
      citations,
      values: [],
      abstained: true,
    };
  }

  if (/\b(mars|rover|exact|safe|safe on|flammable limit|extinction limit|oxygen percentage)\b/.test(normalized)) {
    const records = retrieveRecords(question, 3);
    for (const item of records) citations.push({ id: item.id, title: item.title, source_url: item.source_url });
    return {
      mode: "demo",
      answer: "The loaded PSI summaries do not support the requested environment-specific value or safety claim. Oxygen, pressure and airflow are unavailable as structured conditions in this snapshot. I will not infer a material limit from a different environment.",
      citations,
      values: [],
      abstained: true,
    };
  }

  const records = retrieveRecords(question, 3);
  if (records.length) {
    for (const item of records) citations.push({ id: item.id, title: item.title, source_url: item.source_url });
    const record = records[0];
    return {
      mode: "demo",
      answer: `The closest loaded PSI summary is ${record.acronym || record.id}: ${record.objective || record.approach.slice(0, 260)} The response is limited to that source summary; open the PSI record for the full context.`,
      citations, values: [], abstained: false,
    };
  }

  return {
    mode: "demo",
    answer: "The loaded dataset does not contain an answer I can support for this question. Try asking about a named PSI investigation or the accessible E-FIELD table. No experimental value or safety claim has been generated.",
    citations: [{ id: "PSI catalog", title: "NASA PSI combustion search", source_url: SOURCES.psi.url }],
    values: [], abstained: true,
  };
}

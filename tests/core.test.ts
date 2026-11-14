import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { dataset, investigations } from "@/lib/data";
import { InvestigationDatasetSchema, NumericValueSchema, type Investigation } from "@/lib/schema";
import { calculatePpO2, REFERENCE_SCENARIOS } from "@/lib/units/oxygen";
import { DEFAULT_INFERENCE_WEIGHTS, scoreInvestigation, type InferenceWeights } from "@/lib/ranking";
import { answerFromDemoCache } from "@/lib/ai/demo-cache";
import { datasetRows, datasetToCsv } from "@/lib/export";
import { normalizePsiSearchResponse, readEFieldTable } from "@/scripts/ingest";

const rawDirectory = path.join(process.cwd(), "data", "raw");

function numericObjects(value: unknown, output: Record<string, unknown>[] = []) {
  if (Array.isArray(value)) { for (const item of value) numericObjects(item, output); return output; }
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    if ("value" in record && "unit" in record) output.push(record);
    for (const child of Object.values(record)) if (child && typeof child === "object") numericObjects(child, output);
  }
  return output;
}

function parseCsv(text: string) {
  const rows: string[][] = [];
  let cells: string[] = [];
  let value = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (char === '"' && quoted && text[i + 1] === '"') { value += '"'; i += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) { cells.push(value); value = ""; }
    else if ((char === "\n" || char === "\r") && !quoted) {
      cells.push(value); rows.push(cells);
      cells = []; value = "";
      if (char === "\r" && text[i + 1] === "\n") i += 1;
    } else value += char;
  }
  if (value || cells.length) { cells.push(value); rows.push(cells); }
  return rows;
}

describe("PSI normalization and schema", () => {
  it("normalizes the saved PSI response and the fetched E-FIELD table", async () => {
    const raw = JSON.parse(await readFile(path.join(rawDirectory, "psi-search.json"), "utf8"));
    const table = await readEFieldTable();
    const normalized = normalizePsiSearchResponse(raw, table);
    expect(normalized).toHaveLength(26);
    expect(normalized.find((item) => item.id === "PSI-22")?.experimental_records).toHaveLength(21);
    expect(normalized.some((item) => item.acronym === "BASS" || item.acronym === "BASS-II")).toBe(true);
    expect(() => InvestigationDatasetSchema.parse(dataset)).not.toThrow();
  });

  it("rejects an absent source URL or value type", () => {
    expect(NumericValueSchema.safeParse({ value: 21, unit: "%" }).success).toBe(false);
    expect(NumericValueSchema.safeParse({ value: 21, unit: "%", type: "measured" }).success).toBe(false);
    expect(NumericValueSchema.safeParse({ value: null, unit: "%", type: "unavailable", source_url: "https://psi.nasa.gov/record" }).success).toBe(true);
    expect(NumericValueSchema.safeParse({ value: 21, unit: "%", type: "unavailable", source_url: "https://psi.nasa.gov/record" }).success).toBe(false);
  });

  it("gives every numeric value object a unit, type and URL", () => {
    const values = numericObjects(dataset);
    expect(values.length).toBeGreaterThan(100);
    for (const field of values) {
      expect(typeof field.unit).toBe("string");
      expect(field.type).toMatch(/^(measured|calculated|literature-derived|unavailable)$/);
      expect(typeof field.source_url).toBe("string");
      expect(() => new URL(field.source_url as string)).not.toThrow();
    }
  });
});

describe("oxygen calculations", () => {
  it("calculates partial pressure from separately displayed inputs", () => {
    expect(calculatePpO2(21, 14.7)).toBeCloseTo(3.087, 3);
    expect(calculatePpO2(30, 10.2)).toBeCloseTo(3.06, 3);
    expect(calculatePpO2(100, 4.3)).toBeCloseTo(4.3, 3);
    expect(REFERENCE_SCENARIOS.map((item) => item.oxygen_partial_pressure_psi.type)).toEqual(["calculated", "calculated", "calculated"]);
  });
});

describe("ranking", () => {
  it("does not call missing conditions mismatches or blend evidence with inference", () => {
    const item = investigations[0];
    const score = scoreInvestigation(item, "moon");
    expect(score.evidence.value).toBeNull();
    expect(score.evidence.type).toBe("unavailable");
    expect(score.inferred.value).not.toBeNull();
    expect(score.inferred.type).toBe("calculated");
    expect(score.evidence.source_url).toBe(item.source_url);
  });

  it("scores only recorded condition fields when a target exists", () => {
    const item = structuredClone(investigations[0]) as Investigation;
    item.conditions.oxygen_concentration_pct = { value: 30, unit: "% O₂", type: "measured", source_url: item.source_url };
    item.conditions.total_pressure_psi = { value: 10.2, unit: "psi", type: "measured", source_url: item.source_url };
    const score = scoreInvestigation(item, "moon");
    expect(score.evidence.value).toBe(100);
    expect(score.evidenceBreakdown.find((field) => field.label === "ppO₂")?.score.value).toBeNull();
  });

  it("normalizes editable inferred weights without changing evidence", () => {
    const item = investigations[0];
    const weights: InferenceWeights = { ...DEFAULT_INFERENCE_WEIGHTS, safety_function: 100, platform: 0, fuel_class: 0, hardware: 0 };
    const score = scoreInvestigation(item, "moon", weights);
    expect(score.inferred.value).toBeGreaterThanOrEqual(0);
    expect(score.inferred.value).toBeLessThanOrEqual(100);
    expect(score.evidence.value).toBeNull();
  });
});

describe("demo assistant and exports", () => {
  it("answers the table question from PSI-22 rows and abstains on an unsupported safety limit", () => {
    const available = answerFromDemoCache("What records contain measured fuel concentration values?", "researcher");
    expect(available.mode).toBe("demo");
    expect(available.abstained).toBe(false);
    expect(available.citations.some((source) => source.id === "PSI-22")).toBe(true);
    expect(available.values.length).toBeGreaterThan(0);
    expect(available.values.every((value) => value.record_id && value.source_url)).toBe(true);

    const unavailable = answerFromDemoCache("What oxygen percentage makes a fabric safe on Mars?");
    expect(unavailable.mode).toBe("demo");
    expect(unavailable.abstained).toBe(true);
    expect(unavailable.values).toHaveLength(0);
    expect(unavailable.answer).toMatch(/do not support|does not support/i);
  });

  it("exports rows from the exact API dataset payload", () => {
    const apiPayload = dataset;
    const records = datasetRows(apiPayload);
    expect(JSON.stringify(apiPayload)).toBe(JSON.stringify(dataset));
    expect(records).toHaveLength(apiPayload.investigations.length - 1 + apiPayload.investigations.find((item) => item.id === "PSI-22")!.experimental_records.length);
    const parsed = parseCsv(datasetToCsv(apiPayload));
    const header = parsed[0];
    const idColumn = header.indexOf("investigation_id");
    const outputIds = parsed.slice(1).map((row) => row[idColumn]);
    expect(outputIds).toEqual(records.map((row) => row.investigation_id));
    expect(header).toContain("source_url");
    expect(header).toContain("oxygen_partial_pressure_psi");
  });
});

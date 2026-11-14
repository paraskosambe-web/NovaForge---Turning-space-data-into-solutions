import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { InvestigationDatasetSchema, type ExperimentalRecord, type NumericValue, type SafetyCategory, type FuelType } from "../lib/schema";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const rawPath = path.join(root, "data/raw/psi-search.json");
const normalizedDir = path.join(root, "data/normalized");
const normalizedPath = path.join(normalizedDir, "investigations.json");
const PSI_BASE = process.env.PSI_API_BASE ?? "https://psi.nasa.gov/geode-py/ws";
const QUERY = `${PSI_BASE}/repo/search?term=combustion&source=psi&type=investigation&from=0&size=100`;
const PSI_SEARCH = "https://psi.nasa.gov/physci/repo/search?q=combustion&data_source=psi&data_type=investigation";
const challengeUrl = "https://www.spaceappschallenge.org/2026/challenges/flame-in-freefall/";

type Hit = { _id?: string; _source: Record<string, unknown> };
type SearchPayload = { hits?: { hits?: Hit[] } };

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}
function nullable(value: unknown): string | null {
  const text = str(value);
  return text && !/^(not applicable|n\/a|none|null)$/i.test(text) ? text : null;
}
function list(value: string): string[] {
  return value.split(/\s{2,}|\n|;\s*/).map((item) => item.trim()).filter(Boolean);
}
function field(value: number | null, unit: string, type: NumericValue["type"], sourceUrl: string, investigationId: string, note?: string, recordId?: string): NumericValue {
  return {
    value, unit, type, source_url: sourceUrl, source_label: "NASA PSI investigation record",
    investigation_id: investigationId, ...(recordId ? { record_id: recordId } : {}), ...(note ? { note } : {}),
  };
}
function makeUnavailableConditions(sourceUrl: string, id: string) {
  const unavailable = (unit: string, label: string) => field(null, unit, "unavailable", sourceUrl, id, `${label} is not available as a structured value in this PSI search record.`);
  return {
    oxygen_concentration_pct: unavailable("% O₂", "Oxygen concentration"),
    total_pressure_psi: unavailable("psi", "Total pressure"),
    oxygen_partial_pressure_psi: unavailable("psi ppO₂", "Oxygen partial pressure"),
    airflow_m_s: unavailable("m/s", "Airflow speed"),
  };
}

function deriveCategories(id: string, acronym: string, text: string): SafetyCategory[] {
  const code = `${id} ${acronym}`.toLowerCase();
  if (/same|daft/.test(code)) return ["detection"];
  if (/flex/.test(code)) return ["suppression"];
  if (/bass|saffire|bre|spice|slice/.test(code)) return ["prevention"];
  if (/cfi-g/.test(code)) return ["prevention", "fundamental"];
  if (/\bcfi\b/.test(code)) return ["suppression", "fundamental"];
  if (/combustion science/i.test(text) && !/STDCE|solder|colloid|surface tension driven/i.test(text)) return ["fundamental"];
  return ["other"];
}

function deriveFuelTypes(acronym: string, text: string): FuelType[] {
  const code = acronym.toLowerCase();
  const lower = text.toLowerCase();
  const fuels: FuelType[] = [];
  if (/\b(bass|saffire|bre)\b/.test(code) || /fabric|solid fuel|solid material|polymer sample|plastic specimen/i.test(text)) fuels.push("solid");
  if (/\b(flex|cfi)\b/.test(code) || /droplet|liquid fuel/i.test(text)) fuels.push("liquid droplet");
  if (/\b(acme|spice|slice|cfi-g)\b/.test(code) || /gas.fueled|gaseous flame|fuel gas|methane|ethylene|propane/i.test(text)) fuels.push("gas");
  if (/same/.test(code) || /smoke|aerosol/i.test(lower)) fuels.push("smoke/aerosol");
  if (/daft/.test(code) || /dust/.test(lower)) fuels.push("dust");
  return fuels.length ? [...new Set(fuels)] : ["unspecified"];
}

function sourceSentences(text: string, pattern: RegExp, limit = 4): string[] {
  return text.split(/(?<=[.!?])\s+/).map((part) => part.trim()).filter((part) => part && pattern.test(part)).slice(0, limit);
}

function parseCsvLine(line: string): string[] {
  const output: string[] = [];
  let fieldText = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"' && quoted && line[index + 1] === '"') { fieldText += '"'; index += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) { output.push(fieldText); fieldText = ""; }
    else fieldText += char;
  }
  output.push(fieldText);
  return output;
}

export async function readEFieldTable(): Promise<ExperimentalRecord[]> {
  const tablePath = path.join(root, "data/raw/PSI-22-experimental-table.csv");
  let body: string;
  try { body = await readFile(tablePath, "utf8"); } catch { return []; }
  const lines = body.replace(/^\uFEFF/, "").split(/\r?\n/);
  const headers = parseCsvLine(lines[0] ?? "");
  const index = (name: string) => headers.findIndex((header) => header.trim().toLowerCase() === name.toLowerCase());
  const at = { type: index("Test Type"), year: index("Year"), month: index("Month"), date: index("Date"), bottle: index("Fuel Bottle"), fuelPct: index("Fuel Conc"), ignited: index("Flames Ignited") };
  const id = "PSI-22";
  const sourceUrl = "https://psi.nasa.gov/physci/repo/data/investigations/PSI-22";
  return lines.slice(1).flatMap((line, rowIndex) => {
    if (!line.trim()) return [];
    const cells = parseCsvLine(line);
    const numeric = (column: number) => column < 0 ? null : Number.parseFloat((cells[column] ?? "").replace(/%/g, ""));
    const concentration = numeric(at.fuelPct);
    const ignited = numeric(at.ignited);
    if (!Number.isFinite(concentration) || !Number.isFinite(ignited)) return [];
    const year = cells[at.year] ?? "";
    const month = (cells[at.month] ?? "").padStart(2, "0");
    const day = (cells[at.date] ?? "").padStart(2, "0");
    const testDate = year && month && day ? `${year}-${month}-${day}` : undefined;
    const recordId = `${id}-experimental-table-row-${String(rowIndex).padStart(2, "0")}`;
    const fileRecord = "PSI-22_Experimental table_ACME E-FIELD Flames.csv";
    return [{
      record_id: recordId,
      label: [cells[at.type], testDate].filter(Boolean).join(" · "),
      fuel: cells[at.bottle] || undefined,
      ...(testDate ? { test_date: testDate } : {}),
      values: {
        fuel_concentration_pct: field(concentration, "%", "measured", sourceUrl, id, "Recorded fuel-mixture concentration in the PSI experimental table; this is an input condition, not a fire-risk result.", `${fileRecord} · data row ${rowIndex}`),
        flames_ignited: field(ignited, "flames", "measured", sourceUrl, id, "Count recorded by PSI for this test day; not a measure of material safety.", `${fileRecord} · data row ${rowIndex}`),
      },
      source_url: sourceUrl,
    }];
  });
}

function normalize(hit: Hit, eFieldRows: ExperimentalRecord[]) {
  const source = hit._source;
  const id = str(source.Accession);
  const title = str(source.Title);
  const acronym = nullable(source.Acronym);
  const sourceUrl = `https://psi.nasa.gov/physci/repo/data/investigations/${id}`;
  const hardwareSource = source["Experiment Hardware"] as { Name?: unknown; Link?: unknown } | undefined;
  const text = [title, str(source.Keywords), str(source.Objectives), str(source.Approach), str(source.Hypothesis)].filter(Boolean).join(" ");
  const rawKeywords = str(source.Keywords).split(/\s{2,}|\s{3,}/).map((part) => part.trim()).filter(Boolean);
  const hardwareName = str(hardwareSource?.Name);
  const hardwareLinks = str(hardwareSource?.Link).match(/https?:\/\/[^\s]+/g) ?? [];
  const hardware = hardwareName ? [{ name: hardwareName, ...(hardwareLinks[0] ? { url: hardwareLinks[0].replace(/[;,]$/, "") } : {}) }] : [];
  const sourceId = id;
  const eField = id === "PSI-22" ? eFieldRows : [];
  const uniqueByText = (values: string[]) => [...new Set(values)];
  const sensors = uniqueByText([
    /camera|imaging|video/i.test(text) ? "Camera / imaging" : "",
    /thermocouple|thermopile/i.test(text) ? "Thermal sensing" : "",
    /ion current/i.test(text) ? "Ion-current measurement" : "",
    /spectral|chemiluminescence/i.test(text) ? "Spectral / optical measurement" : "",
    /smoke|aerosol/i.test(text) && /sensor|measure|detector/i.test(text) ? "Smoke / aerosol measurement" : "",
  ].filter(Boolean));
  const measurements = sourceSentences(str(source.Approach), /measur|record|capture|observe|monitor/i, 3);
  const changed = sourceSentences(str(source.Approach), /varied|vary|changed|adjusted/i, 4);
  const unchanged = sourceSentences(str(source.Approach), /held constant|kept constant|remained constant/i, 3);
  const shape = str(source.Approach).match(/\b(?:\d+(?:\.\d+)?\s*(?:mm|cm|m)\s+(?:diameter|wide|long|thick)|(?:diameter|shape|geometry)\s+(?:of|was|is)\s+[^,.]{1,90})/i)?.[0] ?? null;

  return {
    id, title, acronym, objective: str(source.Objectives), approach: str(source.Approach), hypothesis: nullable(source.Hypothesis),
    earth_benefits: nullable(source["Research Impacts/Earth Benefits"]),
    research_area: nullable(source["Research Area"]), sub_research_area: nullable(source["SubResearch Area"]),
    project_type: nullable(source["Project Type"]), flight_platform: nullable(source["Flight Platform"]),
    start_date: nullable(source["Investigation Start Date"]), end_date: nullable(source["Investigation End Date"]),
    doi: nullable(source.DOI), keywords: rawKeywords, fuel_types: deriveFuelTypes(acronym ?? "", text), fuel_shape_size: shape,
    safety_categories: deriveCategories(id, acronym ?? "", text), hardware, sensors, reported_variables: changed,
    unchanged_conditions: unchanged, measurements,
    conditions: makeUnavailableConditions(sourceUrl, id), experimental_records: eField,
    source_url: sourceUrl,
    api_source_url: `https://psi.nasa.gov/geode-py/ws/repo/investigations/${id}`,
    source_record_id: str(hit._id) || sourceId,
    source_updated: nullable(source["Public Release Date"] ? new Date(Number(source["Public Release Date"]) * 1000).toISOString().slice(0, 10) : null),
  };
}

export function normalizePsiSearchResponse(payload: SearchPayload, eFieldRows: ExperimentalRecord[] = []) {
  return (payload.hits?.hits ?? []).map((hit) => normalize(hit, eFieldRows));
}

async function main() {
  await mkdir(path.dirname(rawPath), { recursive: true });
  await mkdir(normalizedDir, { recursive: true });
  let payload: SearchPayload;
  if (process.env.PSI_OFFLINE === "true") {
    payload = JSON.parse(await readFile(rawPath, "utf8")) as SearchPayload;
    console.log("Using saved NASA PSI search response (PSI_OFFLINE=true).");
  } else {
    try {
      const response = await fetch(QUERY, { headers: { accept: "application/json" }, signal: AbortSignal.timeout(30_000) });
      if (!response.ok) throw new Error(`PSI search returned HTTP ${response.status}`);
      const body = await response.text();
      payload = JSON.parse(body) as SearchPayload;
      await writeFile(rawPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
      console.log(`Fetched current records from ${QUERY}`);
    } catch (error) {
      try {
        payload = JSON.parse(await readFile(rawPath, "utf8")) as SearchPayload;
        console.warn(`Live PSI fetch failed; using the committed raw response. ${String(error)}`);
      } catch {
        throw error;
      }
    }
  }
  const hits = payload.hits?.hits ?? [];
  if (!hits.length) throw new Error("PSI response contained no investigation records.");
  const eFieldRows = await readEFieldTable();
  const records = normalizePsiSearchResponse(payload, eFieldRows);
  const output = InvestigationDatasetSchema.parse({
    schema_version: "1.0.0",
    source: PSI_SEARCH,
    generated_at: new Date().toISOString(),
    ingest_note: `Normalized ${records.length} records from the NASA PSI public search API. Only the accessible PSI-22 experimental table was row-parsed; absent oxygen, total-pressure, ppO₂ and airflow fields remain explicitly unavailable. No measurements were generated. Reference atmosphere scenarios are separate challenge-derived calculations. See docs/PSI_ACCESS.md.`,
    investigations: records,
  });
  await writeFile(normalizedPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
  console.log(`Validated and wrote ${output.investigations.length} investigations to data/normalized/investigations.json.`);
  console.log(`Included ${eFieldRows.length} sourced rows from the accessible PSI-22 experimental table.`);
}

const invokedPath = (process.argv[1] ?? "").replaceAll("\\", "/");
if (/(?:^|\/)scripts\/ingest\.ts$/.test(invokedPath)) {
  void main().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
}

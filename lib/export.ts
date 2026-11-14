import type { Investigation, InvestigationDataset, NumericValue } from "@/lib/schema";

function quote(value: unknown) {
  const string = value === null || value === undefined ? "" : typeof value === "string" ? value : JSON.stringify(value);
  return `"${string.replace(/"/g, '""')}"`;
}

function cell(value: NumericValue | undefined) {
  return value ? { value: value.value ?? "", type: value.type, unit: value.unit, source: value.source_url, record: value.record_id ?? "" } : { value: "", type: "unavailable", unit: "", source: "", record: "" };
}

export function datasetRows(dataset: InvestigationDataset) {
  return dataset.investigations.flatMap((item) => {
    const records = item.experimental_records.length ? item.experimental_records : [null];
    return records.map((record) => {
      const fields = record?.values ?? {};
      return {
        investigation_id: item.id,
        acronym: item.acronym ?? "",
        title: item.title,
        record_id: record?.record_id ?? "",
        record_label: record?.label ?? "",
        test_date: record?.test_date ?? "",
        fuel: record?.fuel ?? item.fuel_types.join("; "),
        oxygen_concentration_pct: cell(item.conditions.oxygen_concentration_pct),
        total_pressure_psi: cell(item.conditions.total_pressure_psi),
        oxygen_partial_pressure_psi: cell(item.conditions.oxygen_partial_pressure_psi),
        airflow_m_s: cell(item.conditions.airflow_m_s),
        fuel_concentration_pct: cell(fields.fuel_concentration_pct as NumericValue | undefined),
        flames_ignited: cell(fields.flames_ignited as NumericValue | undefined),
        objective: item.objective,
        source_url: record?.source_url ?? item.source_url,
        source_record_id: item.source_record_id,
      };
    });
  });
}

export function datasetToCsv(dataset: InvestigationDataset) {
  const rows = datasetRows(dataset);
  if (!rows.length) return "";
  const keys = Object.keys(rows[0]) as (keyof (typeof rows)[number])[];
  return [keys.map(quote).join(","), ...rows.map((row) => keys.map((key) => quote(row[key])).join(","))].join("\r\n") + "\r\n";
}

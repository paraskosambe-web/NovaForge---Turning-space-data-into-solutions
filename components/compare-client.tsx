"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Check, GitCompareArrows, X } from "lucide-react";
import type { Investigation } from "@/lib/schema";
import { PageTitle, Panel, Pill } from "@/components/ui";
import { ValueBadge } from "@/components/value-badge";
import { SourceLink } from "@/components/source-link";
import { EFieldTableChart } from "@/components/visualizations";

export function CompareClient({ items }: { items: Investigation[] }) {
  const [selected, setSelected] = useState<string[]>(items.slice(0, 2).map((item) => item.id));
  const chosen = useMemo(() => items.filter((item) => selected.includes(item.id)), [items, selected]);
  const intersection = (key: "safety_categories" | "fuel_types") => chosen.length ? chosen[0][key].filter((value) => chosen.every((item) => item[key].includes(value as never))) : [];
  const sharedCategories = intersection("safety_categories");
  const sharedFuels = intersection("fuel_types");
  const sharedHardware = chosen.length > 1 ? chosen[0].hardware.map((hardware) => hardware.name).filter((name) => chosen.every((item) => item.hardware.some((entry) => entry.name === name))) : [];
  const toggle = (id: string) => setSelected((current) => current.includes(id) ? current.filter((value) => value !== id) : current.length < 4 ? [...current, id] : current);
  return <>
    <PageTitle eyebrow="Investigation comparison / 03" title="Compare the evidence" intro="Choose two to four investigations. Direct metadata overlaps are separated from missing experimental conditions." actions={<span className="compare-count"><GitCompareArrows size={14} /> {chosen.length} selected · maximum 4</span>} />
    <Panel title="Select investigations" note="A maximum of four records keeps the comparison readable.">
      <div className="compare-select-grid">{items.map((item) => <label className={`compare-choice ${selected.includes(item.id) ? "selected" : ""}`} key={item.id}><input type="checkbox" checked={selected.includes(item.id)} onChange={() => toggle(item.id)} disabled={!selected.includes(item.id) && selected.length >= 4} /><span className="compare-check">{selected.includes(item.id) ? <Check size={12} /> : null}</span><span><strong>{item.acronym || item.id}</strong><small>{item.id} · {item.title}</small></span></label>)}</div>
    </Panel>
    {chosen.length < 2 ? <Panel><div className="empty-state"><h3>Select at least two investigations</h3><p>Use the checkboxes above to choose records for comparison.</p></div></Panel> : <>
      <div className="grid grid-2 compare-insights">
        <Panel title="Shared metadata" note="Derived from each loaded PSI search record."><div className="detail-line"><span>Safety focus</span><div className="tag-row">{sharedCategories.length ? sharedCategories.map((item) => <Pill key={item}>{item}</Pill>) : <span className="muted-copy">No shared category</span>}</div></div><div className="detail-line"><span>Fuel class</span><div className="tag-row">{sharedFuels.length ? sharedFuels.map((item) => <Pill key={item}>{item}</Pill>) : <span className="muted-copy">No shared fuel class</span>}</div></div><div className="detail-line"><span>Shared hardware name</span><strong>{sharedHardware.length ? sharedHardware.join(" · ") : "No identical hardware name reported"}</strong></div><div className="callout"><GitCompareArrows size={15} /><span>Matching labels indicate shared metadata tags. They do not establish equal conditions or outcomes.</span></div></Panel>
        <Panel title="Condition availability" note="A range is shown only when PSI records a numeric value in the loaded dataset."><div className="compare-condition-grid">{chosen.map((item) => <div key={item.id} className="compare-condition-card"><span className="record-id">{item.id}</span><strong>{item.acronym || item.title}</strong><ValueBadge field={item.conditions.oxygen_concentration_pct} compact /><ValueBadge field={item.conditions.total_pressure_psi} compact /><ValueBadge field={item.conditions.airflow_m_s} compact /><SourceLink href={item.source_url} label="PSI record" /></div>)}</div></Panel>
      </div>
      <div className="compare-matrix-scroll panel"><table className="data-table compare-matrix"><thead><tr><th>Field</th>{chosen.map((item) => <th key={item.id}>{item.acronym || item.id}<small>{item.id}</small></th>)}</tr></thead><tbody>
        {[{ label: "Objective", value: (item: Investigation) => item.objective }, { label: "Fuel / sample tags", value: (item: Investigation) => item.fuel_types.join(" · ") }, { label: "Hardware", value: (item: Investigation) => item.hardware.map((entry) => entry.name).join(" · ") || "Not reported" }, { label: "Platform", value: (item: Investigation) => item.flight_platform ?? "Not reported" }, { label: "Reported variables", value: (item: Investigation) => item.reported_variables.join(" ") || "Not structured" }].map((row) => <tr key={row.label}><th>{row.label}</th>{chosen.map((item) => <td key={item.id}>{row.value(item)}</td>)}</tr>)}
        <tr><th>O₂ concentration</th>{chosen.map((item) => <td key={item.id}><ValueBadge field={item.conditions.oxygen_concentration_pct} compact /></td>)}</tr><tr><th>Total pressure</th>{chosen.map((item) => <td key={item.id}><ValueBadge field={item.conditions.total_pressure_psi} compact /></td>)}</tr><tr><th>Airflow</th>{chosen.map((item) => <td key={item.id}><ValueBadge field={item.conditions.airflow_m_s} compact /></td>)}</tr>
      </tbody></table></div>
      <EFieldTableChart items={chosen} />
      <div className="source-row">{chosen.map((item) => <Link className="button button-quiet" href={`/investigations/${item.id}`} key={item.id}>{item.id} detail <ArrowUpRight size={13} /></Link>)}</div>
    </>}
    <p className="fine-print"><X size={12} /> A missing range does not mean two investigations used the same value.</p>
  </>;
}

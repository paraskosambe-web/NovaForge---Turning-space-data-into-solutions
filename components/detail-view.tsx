import Link from "next/link";
import { ArrowLeft, ArrowUpRight, FileText, Gauge, Info, Radio, Ruler, Waves } from "lucide-react";
import type { Investigation } from "@/lib/schema";
import { EFieldTableChart } from "@/components/visualizations";
import { PageTitle, Panel, Pill } from "@/components/ui";
import { ValueBadge } from "@/components/value-badge";
import { SourceLink } from "@/components/source-link";
import { SOURCES } from "@/lib/sources";

export function DetailView({ item, all }: { item: Investigation; all: Investigation[] }) {
  const metrics = [
    ["Oxygen concentration", item.conditions.oxygen_concentration_pct, Gauge],
    ["Total pressure", item.conditions.total_pressure_psi, Ruler],
    ["Oxygen partial pressure", item.conditions.oxygen_partial_pressure_psi, Waves],
    ["Airflow speed", item.conditions.airflow_m_s, Radio],
  ] as const;
  return <>
    <div className="back-row"><Link href="/investigations"><ArrowLeft size={14} /> Back to investigations</Link><span className="record-id">{item.id}</span></div>
    <PageTitle eyebrow={`PSI investigation / ${item.id}`} title={item.acronym || item.title} intro={item.title} actions={<SourceLink href={item.source_url} label="Open PSI record" />} />
    <div className="detail-tag-row">{item.safety_categories.map((category) => <Pill tone={category === "detection" ? "green" : category === "suppression" ? "ice" : "flame"} key={category}>{category}</Pill>)}{item.fuel_types.map((fuel) => <Pill key={fuel}>{fuel}</Pill>)}{item.flight_platform && <Pill tone="ice">{item.flight_platform}</Pill>}</div>
    <div className="grid grid-4 detail-metrics">{metrics.map(([label, field, Icon]) => <div className="metric-tile" key={label}><span className="metric-label"><Icon size={13} />{label}</span><ValueBadge field={field} compact /><span className="metric-footnote">Structured experimental condition</span></div>)}</div>
    <div className="grid grid-2 detail-columns">
      <div className="stack"><Panel title="Objective" note="From NASA PSI search metadata"><p className="prose">{item.objective || "The PSI summary does not expose an objective field for this record."}</p></Panel><Panel title="Test approach" note="Original PSI summary text"><p className="prose">{item.approach || "The PSI summary does not expose an approach field for this record."}</p></Panel></div>
      <div className="stack">
        <Panel title="Reported variables" note="Only sentences that explicitly describe variation are surfaced.">
          {item.reported_variables.length ? <ul className="source-list">{item.reported_variables.map((value, index) => <li key={index}>{value}<SourceLink href={item.source_url} label="PSI text" /></li>)}</ul> : <p className="muted-copy">No varied parameter is structured in the loaded PSI summary.</p>}
          <div className="divider" /><h3 className="subhead">Conditions stated unchanged</h3>
          {item.unchanged_conditions.length ? <ul className="source-list">{item.unchanged_conditions.map((value, index) => <li key={index}>{value}<SourceLink href={item.source_url} label="PSI text" /></li>)}</ul> : <p className="muted-copy">The loaded summary does not explicitly state a controlled or held-constant condition.</p>}
        </Panel>
        <Panel title="Fuel, hardware & sensors" note="Tags are based on source text and are not additional measurements.">
          <div className="detail-line"><span>Fuel / sample class</span><div className="tag-row">{item.fuel_types.map((fuel) => <Pill key={fuel}>{fuel}</Pill>)}</div></div>
          <div className="detail-line"><span>Shape & size</span><strong>{item.fuel_shape_size ?? "Not reported as a structured field"}</strong></div>
          <div className="detail-line"><span>Hardware</span><strong>{item.hardware.length ? item.hardware.map((entry) => entry.name).join(" · ") : "Not reported in search summary"}</strong></div>
          {item.hardware.map((hardware) => hardware.url && <SourceLink key={hardware.url} href={hardware.url} label="Hardware reference" />)}
          <div className="detail-line"><span>Sensors / measurements</span><div className="tag-row">{item.sensors.map((sensor) => <Pill tone="ice" key={sensor}>{sensor}</Pill>)}{!item.sensors.length && <span className="muted-copy">Not explicitly listed</span>}</div></div>
          {item.measurements.length > 0 && <ul className="source-list compact-list">{item.measurements.map((value, index) => <li key={index}>{value}<SourceLink href={item.source_url} label="PSI text" /></li>)}</ul>}
        </Panel>
      </div>
    </div>
    {item.experimental_records.length > 0 && <>
      <div className="section-label"><h2>Accessible experimental table</h2><span className="fine-print">One real PSI table was retrievable in this snapshot.</span></div>
      <div className="grid grid-2"><EFieldTableChart items={[item]} /><Panel title="PSI table rows" note="Fuel concentration and ignition count are reported by the source. Neither is a material-safety verdict.">
        <div className="table-scroll nested-table"><table className="data-table"><thead><tr><th>Record</th><th>Fuel</th><th>Fuel concentration</th><th>Flames ignited</th></tr></thead><tbody>{item.experimental_records.slice(0, 8).map((row) => <tr key={row.record_id}><td><span className="record-id">{row.record_id}</span><small>{row.test_date} · {row.label}</small></td><td>{row.fuel ?? "Not reported"}</td><td><ValueBadge field={row.values.fuel_concentration_pct} compact /></td><td><ValueBadge field={row.values.flames_ignited} compact /></td></tr>)}</tbody></table></div>
        <p className="fine-print table-note">Showing the first rows from the downloaded PSI CSV; the complete file is in <code>data/raw/PSI-22-experimental-table.csv</code>.</p>
      </Panel></div>
    </>}
    <Panel title="Source record & related context" className="source-panel"><div className="source-cards"><a className="source-card" href={item.source_url} target="_blank" rel="noopener noreferrer"><span><FileText size={15} /></span><div><strong>NASA PSI investigation page</strong><small>{item.id} · {item.source_record_id}</small></div><ArrowUpRight size={14} /></a><a className="source-card" href={item.api_source_url} target="_blank" rel="noopener noreferrer"><span><Info size={15} /></span><div><strong>NASA PSI JSON detail endpoint</strong><small>Record metadata API</small></div><ArrowUpRight size={14} /></a>{item.doi && <a className="source-card" href={`https://doi.org/${item.doi}`} target="_blank" rel="noopener noreferrer"><span><FileText size={15} /></span><div><strong>Dataset DOI</strong><small>{item.doi}</small></div><ArrowUpRight size={14} /></a>}<a className="source-card" href={SOURCES.nasaCombustion.url} target="_blank" rel="noopener noreferrer"><span><Info size={15} /></span><div><strong>NASA combustion science</strong><small>Background and mission context</small></div><ArrowUpRight size={14} /></a></div></Panel>
  </>;
}

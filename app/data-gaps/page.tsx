import { ArrowDownRight, CircleHelp, Compass, FlaskConical, Gauge, Orbit, Waves } from "lucide-react";
import type { NumericValue } from "@/lib/schema";
import { PageTitle, Panel, Pill } from "@/components/ui";
import { ValueBadge } from "@/components/value-badge";
import { SourceLink } from "@/components/source-link";
import { investigations } from "@/lib/data";
import { GRAVITY_REFERENCES } from "@/lib/units/oxygen";
import { SOURCES } from "@/lib/sources";

const missingFields = ["O₂ concentration", "Total pressure", "ppO₂", "Airflow"];
function missingField(value: number, id: string, url: string): NumericValue {
  return { value, unit: "condition fields", type: "calculated", source_url: url, investigation_id: id, note: "Count of required structured condition fields marked unavailable in this PSI summary." };
}

export default function DataGapsPage() {
  return <>
    <PageTitle eyebrow="Data gaps / 08" title="Make the missing evidence visible" intro="A blank field is a research gap, not a zero. The current snapshot records investigation metadata and a limited number of table rows." />
    <div className="gap-callouts grid grid-3"><div className="gap-stat"><span><FlaskConical size={15} /></span><strong>Most condition values are absent</strong><p>O₂, total pressure, ppO₂ and airflow are not structured in the loaded search summaries.</p></div><div className="gap-stat"><span><Orbit size={15} /></span><strong>Partial-g PSI coverage is missing</strong><p>No LUCI or FM² record appears in the current PSI combustion query.</p></div><div className="gap-stat"><span><CircleHelp size={15} /></span><strong>Do not interpolate safety</strong><p>Microgravity and 1g results alone do not establish a material limit at lunar or Mars gravity.</p></div></div>
    <Panel title="NASA partial-gravity context" note="Keep PSI coverage separate from other NASA publications.">
      <div className="grid grid-2 context-cards">
        <div className="context-card"><Pill tone="ice">LUCI · OUTSIDE LOADED PSI SET</Pill><h3>Simulated lunar-g results are already published</h3><p>NASA reported LUCI tests on a rotating New Shepard flight that simulated lunar gravity; the NASA NTRS record describes tests on fabric and plastic and oxygen tracking. Those results are not in the 26 loaded PSI summaries and are not merged into the PSI experimental dataset here.</p><div className="source-row"><SourceLink href={SOURCES.luciFlight.url} label="NASA LUCI flight report" /><SourceLink href={SOURCES.luciResults.url} label="NASA NTRS results" /></div></div>
        <div className="context-card"><Pill tone="flame">FM² · DIRECT MOON PROGRAM</Pill><h3>Mission status needs a current record</h3><p>NASA describes FM² as a Moon flammability investigation. The linked program page gives its objectives and hardware but does not establish a current launch/result date. This app leaves that status unverified instead of carrying the challenge brief’s older expectation forward.</p><SourceLink href={SOURCES.fm2.url} label="NASA FM² program page" /></div>
      </div>
      <div className="divider" /><div className="gravity-row"><span className="gravity-item"><Compass size={14} /><strong>Moon gravity context</strong><ValueBadge field={GRAVITY_REFERENCES.moon} compact /><SourceLink href={SOURCES.moonGravity.url} label="NASA" /></span><span className="gravity-item"><Compass size={14} /><strong>Mars gravity context</strong><ValueBadge field={GRAVITY_REFERENCES.mars} compact /><SourceLink href={SOURCES.marsGravity.url} label="NASA" /></span></div>
      <div className="callout"><Waves size={15} /><span>NASA describes E-FIELD as applying voltage to flame-generated ions. A prior NASA paper discusses tuning ion-driven convection as a gravity-convection equivalent; this is a mechanism analogy, not a direct lunar- or Mars-gravity test. <SourceLink href={SOURCES.eField.url} label="E-FIELD experiment" /> <SourceLink href={SOURCES.electricFieldGravity.url} label="NASA NTRS mechanism paper" /></span></div>
    </Panel>
    <Panel title="Missing condition fields by investigation" note="Each absent value remains type-badged and source-linked in the record detail and API export.">
      <div className="table-scroll"><table className="data-table gap-table"><thead><tr><th>Investigation</th><th>O₂</th><th>Total pressure</th><th>ppO₂</th><th>Airflow</th><th>Missing fields</th><th>Source</th></tr></thead><tbody>{investigations.map((item) => <tr key={item.id}><td><a className="table-record-link" href={`/investigations/${item.id}`}><span className="record-id">{item.id}</span><strong>{item.acronym || item.title}</strong></a></td><td><ValueBadge field={item.conditions.oxygen_concentration_pct} compact /></td><td><ValueBadge field={item.conditions.total_pressure_psi} compact /></td><td><ValueBadge field={item.conditions.oxygen_partial_pressure_psi} compact /></td><td><ValueBadge field={item.conditions.airflow_m_s} compact /></td><td><ValueBadge field={missingField(missingFields.length, item.id, item.source_url)} compact /></td><td><SourceLink href={item.source_url} label="PSI" /></td></tr>)}</tbody></table></div>
    </Panel>
    <Panel title="What this snapshot contains" className="gap-bottom"><div className="snapshot-row"><span><ArrowDownRight size={15} /> Investigation metadata</span><span>26 source records</span><SourceLink href={SOURCES.psi.url} label="PSI query" /></div><div className="snapshot-row"><span><ArrowDownRight size={15} /> Parsed experimental table</span><span>PSI-22 · E-FIELD Flames CSV</span><SourceLink href="https://psi.nasa.gov/physci/repo/data/investigations/PSI-22" label="PSI-22 record" /></div><p className="fine-print">The E-FIELD table contains fuel-mixture concentration and flames-ignited counts. It does not contain structured oxygen, total-pressure or airflow fields, and these entries are not interpreted as a suppression outcome.</p></Panel>
  </>;
}

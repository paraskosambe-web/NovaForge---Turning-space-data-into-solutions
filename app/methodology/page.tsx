import { ArrowRight, BookOpenText, Calculator, CheckCircle2, ClipboardList, Database, Orbit, Scale, ShieldCheck } from "lucide-react";
import { PageTitle, Panel, Pill } from "@/components/ui";
import { SourceLink } from "@/components/source-link";
import { ValueBadge, ValueTypeLegend } from "@/components/value-badge";
import { WeightsEditor } from "@/components/weights-editor";
import { dataset, investigations } from "@/lib/data";
import { MOON_O2_INCREASE, REFERENCE_SCENARIOS } from "@/lib/units/oxygen";
import { SOURCES } from "@/lib/sources";

const snapshotCount = { value: investigations.length, unit: "records", type: "calculated" as const, source_url: SOURCES.psi.url, source_label: "NASA PSI query" };
const tableCount = { value: investigations.reduce((sum, item) => sum + item.experimental_records.length, 0), unit: "table rows", type: "calculated" as const, source_url: "https://psi.nasa.gov/physci/repo/data/investigations/PSI-22", investigation_id: "PSI-22", source_label: "PSI-22 table record" };

export default function MethodologyPage() {
  return <>
    <PageTitle eyebrow="Methodology / 09" title="How to read these scores" intro="The dashboard separates source-recorded condition matching from analyst-inferred relevance. Neither is a NASA rating." />
    <div className="grid grid-2 methodology-score-cards">
      <Panel title="Evidence score" note="Condition match from source-recorded values only."><div className="method-icon-line"><span className="principle-mark mark-measured"><Database size={16} /></span><Pill tone="flame">EXPERIMENTAL EVIDENCE</Pill></div><p>Compare a PSI record’s O₂ concentration, total pressure, calculated ppO₂ and airflow with a numeric environment target. A field is scored only when both the test value and environment target exist in the data. If no supported comparison can be made, the score is <strong>Unavailable</strong>, not zero and not a mismatch.</p><div className="equation-box"><code>Evidence = weighted match over available targetable conditions</code><small>Missing fields are excluded from the denominator.</small></div></Panel>
      <Panel title="Inferred relevance score" note="A transparent heuristic; always labeled inferred."><div className="method-icon-line"><span className="principle-mark mark-inferred"><Orbit size={16} /></span><Pill tone="ice">INFERRED</Pill></div><p>Use the source-described safety topic, platform, fuel class and presence of hardware metadata as relevance clues. Those clues do not establish that an investigation matches a habitat atmosphere, material or gravity condition.</p><div className="equation-box"><code>Inferred = Σ normalized weight × metadata fit</code><small>No evidence score is blended into this result.</small></div></Panel>
    </div>
    <div className="section-label"><h2>Change the inference weights</h2><span className="fine-print">Saved in this browser; reflected on the dashboard ranking.</span></div>
    <WeightsEditor />
    <div className="section-label"><h2>Value types and oxygen references</h2><ValueTypeLegend /></div>
    <div className="grid grid-2">
      <Panel title="Four value types" note="Numeric schema requires a value, unit, type and source URL for every field."><div className="value-type-list"><div><Pill tone="green">Measured</Pill><span>Recorded by the PSI source table or dataset.</span></div><div><Pill tone="ice">Calculated</Pill><span>Derived from visible, cited inputs using a stated formula.</span></div><div><Pill>Literature-derived</Pill><span>Reported by a cited source; not a PSI measurement.</span></div><div><Pill>Unavailable</Pill><span>The loaded source does not supply this value. Stored as null with a cited PSI record.</span></div></div></Panel>
      <Panel title="Atmosphere quantities stay separate" note="The Moon case below is an exact-boundary calculation, not a single target range."><div className="home-scenarios">{REFERENCE_SCENARIOS.map((scenario) => <div className={`home-scenario scenario-${scenario.id}`} key={scenario.id}><strong>{scenario.name}</strong><div><span>O₂ concentration</span><ValueBadge field={scenario.oxygen_concentration_pct} compact /></div><div><span>Total pressure</span><ValueBadge field={scenario.total_pressure_psi} compact /></div><div><span>Calculated ppO₂</span><ValueBadge field={scenario.oxygen_partial_pressure_psi} compact /></div></div>)}</div><p className="fine-print">ppO₂ = oxygen fraction × total pressure. For Moon, ≥30% O₂ and ≤10.2 psi define a range; 3.06 psi is only the exact 30% × 10.2 psi boundary calculation. The stated &gt;40% comparison is concentration-only: <ValueBadge field={MOON_O2_INCREASE} compact /></p><SourceLink href={SOURCES.challenge.url} label="NASA Space Apps challenge brief" /></Panel>
    </div>
    <div className="section-label"><h2>Current loaded snapshot</h2><span className="fine-print">From the saved public PSI search response and one retrievable table.</span></div>
    <div className="snapshot-metrics"><div><strong><ValueBadge field={snapshotCount} compact /></strong><span>Combustion search summaries loaded</span></div><div><strong><ValueBadge field={tableCount} compact /></strong><span>PSI-22 E-FIELD table rows parsed</span></div><div><strong>{dataset.schema_version}</strong><span>Shared Zod schema version</span></div></div>
    <Panel title="Validation rules" note="Implemented in the shared schema and checked when the dataset is imported."><ul className="check-list"><li><CheckCircle2 size={15} />A numeric value without unit, value type or source URL fails schema validation.</li><li><CheckCircle2 size={15} />An unavailable value must be null; a typed available value must be numeric.</li><li><CheckCircle2 size={15} />Experimental exports retain investigation IDs, record identifiers and source URLs.</li><li><CheckCircle2 size={15} />No source measurement is filled from a challenge scenario or a model answer.</li></ul></Panel>
    <Panel title="Source register" note="Primary PSI data and NASA challenge/reference material.">
      <div className="source-register">{Object.values(SOURCES).map((source) => <div key={source.url}><BookOpenText size={13} /><SourceLink href={source.url} label={source.title} /></div>)}</div>
    </Panel>
    <div className="callout"><Scale size={15} /><span>Ranking assumptions are editable analysis choices, not hazard probabilities, material certifications or NASA operational standards. <SourceLink href={SOURCES.nasaCombustion.url} label="NASA Combustion Science" /> <SourceLink href={SOURCES.issGuide.url} label="ISS research guide" /></span></div>
  </>;
}

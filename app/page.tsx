import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight, Database, Flame, Orbit, ShieldCheck, Sparkles, Telescope } from "lucide-react";
import { PageTitle, Panel, Pill } from "@/components/ui";
import { ValueBadge } from "@/components/value-badge";
import { SourceLink } from "@/components/source-link";
import { dataset, investigations } from "@/lib/data";
import { REFERENCE_SCENARIOS, MOON_O2_INCREASE } from "@/lib/units/oxygen";
import { SOURCES } from "@/lib/sources";

const count = { value: investigations.length, unit: "investigation summaries", type: "calculated" as const, source_url: SOURCES.psi.url, source_label: "NASA PSI search snapshot", note: "Count of actual records returned by the PSI API query." };
const tableRows = investigations.reduce((sum, item) => sum + item.experimental_records.length, 0);
const rows = { value: tableRows, unit: "E-FIELD table rows", type: "calculated" as const, source_url: "https://psi.nasa.gov/physci/repo/data/investigations/PSI-22", investigation_id: "PSI-22", record_id: "PSI-22_Experimental table_ACME E-FIELD Flames.csv", note: "Rows parsed from the downloaded NASA PSI experimental table." };

export default function HomePage() {
  return <>
    <section className="hero">
      <div className="hero-copy"><p className="eyebrow"><span className="hero-pulse" /> NASA SPACE APPS 2026 · NOVAFORGE</p><h1>Flame in<br /><em>freefall.</em></h1><p className="hero-lede">NASA has decades of microgravity combustion research. NovaForge turns the PSI record into a clearer path from experiment to fire-safety question.</p><div className="hero-actions"><Link href="/dashboard" className="button button-primary">Open mission dashboard <ArrowRight size={15} /></Link><Link href="/investigations" className="button button-secondary">Explore investigations</Link></div><div className="hero-source"><SourceLink href={SOURCES.psi.url} label="Primary source · NASA PSI repository" /></div></div>
      <div className="hero-art" aria-hidden="true"><div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" /><div className="hero-planet"><div className="planet-moon" /><div className="planet-flare" /></div><div className="hero-crosshair crosshair-a" /><div className="hero-crosshair crosshair-b" /><span className="hero-art-label">MICRO-G<br />FLAME STUDIES</span><span className="hero-art-coordinate">CIR / ISS · PSI</span></div>
      <div className="hero-vertical-label">TURNING SPACE DATA INTO SOLUTIONS</div>
    </section>
    <div className="hero-foot"><span><Database size={13} /> Current data snapshot</span><ValueBadge field={count} compact /><span className="hero-foot-sep" /><ValueBadge field={rows} compact /><span className="hero-foot-end">Experimental source values only</span></div>
    <div className="section-label"><h2>Start with a mission environment</h2><span className="fine-print">Environment choice guides the ranking lens, not the experimental data.</span></div>
    <div className="environment-cards">
      <a href="/dashboard?environment=moon" className="environment-card environment-moon"><span className="environment-icon"><Orbit size={18} /></span><span className="environment-kicker">PRESET · MOON BASE</span><strong>Moon Base</strong><small>Start from the challenge’s habitat scenario.</small><span className="environment-go">Launch preset <ArrowUpRight size={14} /></span></a>
      {[
        ["ISS", "iss", "Orbital laboratory · fire detection and response"],
        ["Spacecraft cabin", "spacecraft", "Transit habitat · pressure profile unspecified"],
        ["Mars base", "mars", "Partial-gravity context · habitat mix unspecified"],
        ["Pressurized rover", "rover", "Mobile habitat · atmosphere unspecified"],
        ["Spacesuit", "spacesuit", "Low-pressure, oxygen-rich reference scenario"],
      ].map(([name, id, note]) => <Link href={`/dashboard?environment=${id}`} className="environment-card" key={id}><span className="environment-kicker">SCENARIO</span><strong>{name}</strong><small>{note}</small><span className="environment-go">View ranking <ArrowUpRight size={14} /></span></Link>)}
    </div>
    <div className="grid grid-2 home-lower">
      <Panel title="Oxygen is three different quantities" note="Challenge reference values are displayed as source-backed scenarios, not experimental test points.">
        <div className="home-scenarios">{REFERENCE_SCENARIOS.map((scenario) => <div className={`home-scenario scenario-${scenario.id}`} key={scenario.id}><strong>{scenario.name}</strong><div><span>O₂ concentration</span><ValueBadge field={scenario.oxygen_concentration_pct} compact /></div><div><span>Total pressure</span><ValueBadge field={scenario.total_pressure_psi} compact /></div><div><span>Calculated ppO₂</span><ValueBadge field={scenario.oxygen_partial_pressure_psi} compact /></div></div>)}</div>
        <div className="callout callout-warn"><Flame size={14} /><span>The challenge says the Moon scenario raises O₂ concentration by more than 40% relative to Earth. That is a concentration comparison only; it does not specify ppO₂ or a fire-risk increase. <ValueBadge field={MOON_O2_INCREASE} compact /></span></div>
        <SourceLink href={SOURCES.challenge.url} label="NASA Space Apps challenge brief" />
      </Panel>
      <Panel title="A careful reading of the evidence" note="Evidence matching and inferred relevance are never blended into one score.">
        <div className="evidence-principles"><div><span className="principle-mark mark-measured"><ShieldCheck size={16} /></span><strong>Evidence score</strong><p>Only source-recorded conditions can match an environment. Missing O₂, pressure or flow fields stay unavailable.</p></div><div><span className="principle-mark mark-inferred"><Sparkles size={16} /></span><strong>Inferred relevance</strong><p>Topic, platform and hardware can suggest relevance, but the score is labeled inferred and is never a safety rating.</p></div><div><span className="principle-mark mark-gap"><Telescope size={16} /></span><strong>Data gaps stay visible</strong><p>The PSI summary snapshot has no structured condition values for most records. The explorer links back to each source.</p></div></div>
        <Link className="panel-action-link" href="/methodology">Read the ranking methodology <ArrowRight size={14} /></Link>
      </Panel>
    </div>
    <Panel className="home-cta"><div className="cta-icon"><Sparkles size={19} /></div><div><p className="eyebrow">SOURCE-GROUNDED ASSISTANT</p><h2>Ask a question. See the records behind the answer.</h2><p>The assistant retrieves PSI summaries first, cites the records it used, and names unsupported information.</p></div><Link href="/assistant" className="button button-primary">Ask Nova SI <ArrowRight size={15} /></Link></Panel>
    <p className="home-source-note"><ArrowDown size={13} /> PSI is authoritative for the experimental records in the loaded dataset. <SourceLink href={SOURCES.nasaCombustion.url} label="NASA Combustion Science context" /> <SourceLink href={SOURCES.issGuide.url} label="Researcher’s Guide to ISS Combustion Science" /></p>
  </>;
}

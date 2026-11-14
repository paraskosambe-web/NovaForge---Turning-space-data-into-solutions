import { ArrowUpRight, BriefcaseBusiness, FireExtinguisher, HardHat, RadioTower, TriangleAlert } from "lucide-react";
import { PageTitle, Panel, Pill } from "@/components/ui";
import { SourceLink } from "@/components/source-link";
import { SOURCES } from "@/lib/sources";

const applications = [
  { title: "Fine-water-mist extinguishers", copy: "NASA-developed fine-water-mist hardware was designed to discharge in any orientation for spacecraft use. The linked NASA sources describe a separate technology path; FLEX measurements are not a performance rating for this extinguisher.", icon: FireExtinguisher, source: SOURCES.fineMist, secondary: SOURCES.mistTechPort, tag: "SUPPRESSION" },
  { title: "Smoke versus dust discrimination", copy: "The shuttle-era incipient-fire detector described by NASA Spinoff distinguished combustion particles from extraneous material such as dust, reducing nuisance alarms in large-area settings.", icon: RadioTower, source: SOURCES.spinoffDetector, tag: "DETECTION" },
  { title: "Firefighter breathing equipment", copy: "A NASA Johnson Space Center technology-transfer effort with Scott Aviation produced lighter firefighter air tanks and breathing equipment derived from astronaut systems.", icon: BriefcaseBusiness, source: SOURCES.spinoffTanks, tag: "FIRST RESPONDERS" },
  { title: "Firefighter protective clothing", copy: "NASA materials and suit design work contributed to later firefighter protective-ensemble development, as described in NASA’s firefighter technology-transfer resources.", icon: HardHat, source: SOURCES.spinoffClothing, tag: "PROTECTIVE GEAR" },
];

const incidents = [
  { title: "Apollo 1", copy: "Mission-safety incident record", source: SOURCES.apollo1 },
  { title: "Apollo 13", copy: "Mission-safety and recovery record", source: SOURCES.apollo13 },
  { title: "Mir fire", copy: "Space-station fire history", source: SOURCES.mir },
];

export default function EarthApplicationsPage() {
  return <>
    <PageTitle eyebrow="Earth applications / 07" title="Space research, terrestrial value" intro="NASA combustion research also connects to Earth fire protection, sensing and materials work. Each application links to the NASA source describing it." />
    <div className="callout"><TriangleAlert size={15} /><span>These links are technology-transfer context, not proof that a microgravity test or a listed product is suitable for a specific Earth or space application.</span></div>
    <div className="application-grid">{applications.map((item) => { const Icon = item.icon; return <Panel key={item.title} className="application-card"><span className="application-icon"><Icon size={18} /></span><Pill tone="ice">{item.tag}</Pill><h2>{item.title}</h2><p>{item.copy}</p><div className="application-sources"><SourceLink href={item.source.url} label={item.source.title} />{item.secondary && <SourceLink href={item.secondary.url} label={item.secondary.title} />}</div></Panel>; })}</div>
    <Panel title="Human-spaceflight incident context" note="These are historical sources; no causal analysis is inferred from PSI investigation data.">
      <div className="incident-grid">{incidents.map((incident) => <a className="incident-card" href={incident.source.url} target="_blank" rel="noopener noreferrer" key={incident.title}><span className="incident-mark"><ArrowUpRight size={14} /></span><strong>{incident.title}</strong><small>{incident.copy}</small><SourceLink href={incident.source.url} label="NASA source" /></a>)}</div>
    </Panel>
    <p className="fine-print earth-footnote">Challenge source: <SourceLink href={SOURCES.challenge.url} label="Flame in Freefall challenge brief" /> · NASA context: <SourceLink href={SOURCES.nasaCombustion.url} label="Combustion Science" /></p>
  </>;
}

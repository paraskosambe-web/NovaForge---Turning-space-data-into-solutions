import Link from "next/link";
import { ArrowUpRight, Eye, Flame, ScanLine, Shield } from "lucide-react";
import { PageTitle, Panel, Pill } from "@/components/ui";
import { InvestigationCard } from "@/components/investigation-card";
import { SourceLink } from "@/components/source-link";
import { investigations } from "@/lib/data";
import { SOURCES } from "@/lib/sources";

const groups = [
  { key: "detection", title: "Detection", icon: ScanLine, color: "green" as const, copy: "SAME and SAME-R characterize smoke aerosols; DAFT and DAFT-2 reuse the relevant instrument family for dust measurement. That smoke–dust distinction matters when interpreting a detector response.", ids: ["PSI-102", "PSI-101", "PSI-47"] },
  { key: "suppression", title: "Suppression & droplets", icon: Shield, color: "ice" as const, copy: "FLEX / FLEX-2 investigate gas suppressants and liquid-droplet combustion in the MDCA. PSI lists CO₂ and helium dilution as part of the investigation scope; missing table values are not filled in here.", ids: ["PSI-69", "PSI-68", "PSI-39"] },
  { key: "prevention", title: "Materials & flame spread", icon: Flame, color: "flame" as const, copy: "BASS, BASS-II and Saffire examine solid-fuel / material behavior. BRE studies material flammability through gas-fueled experiments. A test result applies only to its recorded conditions.", ids: ["PSI-26", "PSI-25", "PSI-98", "PSI-99", "PSI-100", "PSI-20"] },
];

export default function SafetyTechPage() {
  return <>
    <PageTitle eyebrow="Safety technology / 06" title="Research for next-generation fire safety" intro="Browse PSI investigations by prevention, detection and suppression. These are research areas, not equipment recommendations or safety approvals." />
    <div className="callout"><Eye size={15} /><span>Investigation focus is taken from PSI metadata and the challenge brief. A category tag helps navigation; it does not imply an operational capability was validated.</span></div>
    {groups.map((group) => {
      const records = group.ids.map((id) => investigations.find((item) => item.id === id)).filter((item): item is NonNullable<typeof item> => Boolean(item));
      const Icon = group.icon;
      return <section className="safety-section" key={group.key}><div className="safety-heading"><span className={`safety-icon safety-${group.color}`}><Icon size={17} /></span><div><p className="eyebrow">{group.key.toUpperCase()}</p><h2>{group.title}</h2><p>{group.copy}</p></div></div><div className="rank-grid safety-card-grid">{records.map((item) => <InvestigationCard investigation={item} key={item.id} />)}</div></section>;
    })}
    <Panel title="Connections and equipment references" note="NASA investigation context and source pages.">
      <div className="earth-link-grid"><div className="application-mini"><strong>Fine water mist</strong><p>NASA reports a portable fine-water-mist concept designed to discharge across orientations in microgravity. It is a separate program reference, not a result from the loaded PSI record table.</p><SourceLink href={SOURCES.fineMist.url} label="NASA Spinoff · fine-water-mist system" /><SourceLink href={SOURCES.mistTechPort.url} label="NASA TechPort project" /></div><div className="application-mini"><strong>Combustion Integrated Rack</strong><p>NASA describes CIR as the facility that hosts MDCA, ACME and SoFIE work.</p><SourceLink href={SOURCES.nasaCombustion.url} label="NASA Combustion Science" /><SourceLink href={SOURCES.issGuide.url} label="Researcher’s Guide to ISS Combustion Science" /></div></div>
      <Link href="/investigations" className="panel-action-link">Open the full PSI investigation explorer <ArrowUpRight size={14} /></Link>
    </Panel>
  </>;
}

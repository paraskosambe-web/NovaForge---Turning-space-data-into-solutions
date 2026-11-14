import Link from "next/link";
import { ArrowUpRight, ChevronRight, Orbit } from "lucide-react";
import type { Investigation } from "@/lib/schema";
import { Pill } from "@/components/ui";
import { SourceLink } from "@/components/source-link";
import { ValueBadge } from "@/components/value-badge";

const categoryName: Record<string, string> = { prevention: "Prevention", detection: "Detection", suppression: "Suppression", fundamental: "Combustion science", other: "Other PSI" };

export function InvestigationCard({ investigation, scores, highlight = false }: {
  investigation: Investigation;
  scores?: { evidence: import("@/lib/schema").NumericValue; inferred: import("@/lib/schema").NumericValue };
  highlight?: boolean;
}) {
  return <article className={`investigation-card ${highlight ? "investigation-card-highlight" : ""}`}>
    <div className="card-topline"><span className="record-id">{investigation.id}</span><div className="tag-row">{investigation.safety_categories.slice(0, 2).map((category) => <Pill key={category} tone={category === "suppression" ? "ice" : category === "detection" ? "green" : "flame"}>{categoryName[category]}</Pill>)}</div></div>
    <h3><Link href={`/investigations/${investigation.id}`}>{investigation.acronym || investigation.title}</Link></h3>
    <p className="card-title-sub">{investigation.title}</p>
    <p className="card-objective">{investigation.objective || investigation.approach || "The PSI search record does not include an objective summary."}</p>
    <div className="tag-row card-tags">{investigation.fuel_types.map((fuel) => <Pill key={fuel}>{fuel}</Pill>)}{investigation.flight_platform && <Pill tone="ice">{investigation.flight_platform}</Pill>}</div>
    {scores && <div className="score-pair"><div><span className="score-label score-label-evidence">Evidence match</span><ValueBadge field={scores.evidence} compact /></div><div><span className="score-label score-label-inferred"><Orbit size={11} /> Inferred relevance</span><ValueBadge field={scores.inferred} compact /></div></div>}
    <div className="card-bottom"><SourceLink href={investigation.source_url} label="PSI investigation" /><Link href={`/investigations/${investigation.id}`} className="detail-link">Open record <ChevronRight size={13} /></Link></div>
    <span className="card-corner" aria-hidden="true"><ArrowUpRight size={14} /></span>
  </article>;
}

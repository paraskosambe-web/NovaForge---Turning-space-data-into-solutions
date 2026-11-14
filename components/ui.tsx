import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { SourceLink } from "@/components/source-link";
import { ValueBadge } from "@/components/value-badge";
import type { NumericValue } from "@/lib/schema";

export function PageTitle({ eyebrow, title, intro, actions }: { eyebrow: string; title: string; intro?: string; actions?: ReactNode }) {
  return <div className="page-title-row"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1>{intro && <p className="page-intro">{intro}</p>}</div>{actions && <div className="page-title-actions">{actions}</div>}</div>;
}

export function Panel({ children, className = "", title, note, action }: { children: ReactNode; className?: string; title?: string; note?: string; action?: ReactNode }) {
  return <section className={`panel ${className}`}>{(title || note || action) && <div className="panel-head"><div>{title && <h2>{title}</h2>}{note && <p>{note}</p>}</div>{action}</div>}{children}</section>;
}

export function MetricTile({ label, field, icon, footnote }: { label: string; field: NumericValue; icon?: ReactNode; footnote?: string }) {
  return <div className="metric-tile"><span className="metric-label">{icon}{label}</span><ValueBadge field={field} compact />{footnote && <span className="metric-footnote">{footnote}</span>}</div>;
}

export function SectionLabel({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return <div className="section-label"><h2>{children}</h2>{aside}</div>;
}

export function Pill({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "flame" | "ice" | "green" }) {
  return <span className={`tag tag-${tone}`}>{children}</span>;
}

export function EmptyState({ title, children }: { title: string; children: ReactNode }) {
  return <div className="empty-state"><span className="empty-mark">/ /</span><h3>{title}</h3><p>{children}</p></div>;
}

export function TextSource({ href, label }: { href: string; label: string }) {
  return <SourceLink href={href} label={label} />;
}

export function ExternalAction({ href, children }: { href: string; children: ReactNode }) {
  return <a className="button button-secondary" href={href} target="_blank" rel="noopener noreferrer">{children}<ArrowUpRight size={15} aria-hidden="true" /></a>;
}

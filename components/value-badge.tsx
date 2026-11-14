import { Activity, BookOpenText, Calculator, CircleHelp, Database, Minus } from "lucide-react";
import type { NumericValue, ValueType } from "@/lib/schema";
import { SourceLink } from "@/components/source-link";

const visual: Record<ValueType, { label: string; className: string; Icon: typeof Activity }> = {
  measured: { label: "Measured", className: "value-measured", Icon: Activity },
  calculated: { label: "Calculated", className: "value-calculated", Icon: Calculator },
  "literature-derived": { label: "Literature-derived", className: "value-literature", Icon: BookOpenText },
  unavailable: { label: "Unavailable", className: "value-unavailable", Icon: CircleHelp },
};

export function ValueBadge({ field, compact = false }: { field: NumericValue; compact?: boolean }) {
  const { label, className, Icon } = visual[field.type];
  const shown = field.value === null ? "Unavailable" : `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 3 }).format(field.value)} ${field.unit}`;
  return <span className={`value-wrap ${compact ? "value-wrap-compact" : ""}`}>
    <span className={`value-pill ${className}`} title={field.note ?? `${label} value`}>
      <Icon size={13} aria-hidden="true" />
      <span className="value-text">{shown}</span>
      <span className="value-kind">{label}</span>
    </span>
    {field.source_url && <SourceLink href={field.source_url} label={field.source_label ?? field.investigation_id ?? "Source"} className="value-source" />}
  </span>;
}

export function ValueTypeLegend() {
  return <div className="value-legend" aria-label="Value type legend">
    <span><Database size={13} /> Measured</span><span><Calculator size={13} /> Calculated</span><span><BookOpenText size={13} /> Literature-derived</span><span><Minus size={13} /> Unavailable</span>
  </div>;
}

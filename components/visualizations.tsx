"use client";

import { useMemo } from "react";
import { CartesianGrid, Label, Line, LineChart, ReferenceLine, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from "recharts";
import { Panel, Pill } from "@/components/ui";
import { SourceLink } from "@/components/source-link";
import { ValueBadge } from "@/components/value-badge";
import type { Investigation } from "@/lib/schema";
import { REFERENCE_SCENARIOS } from "@/lib/units/oxygen";
import { SOURCES } from "@/lib/sources";

const axis = { fill: "#8b99b2", fontSize: 10 };
const grid = "#24304d";

export function OxygenAirflowChart() {
  return <Panel title="O₂ concentration × airflow" note="Experimental coverage · PSI loaded records" className="chart-panel">
    <div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><ScatterChart margin={{ top: 16, right: 16, bottom: 24, left: 10 }}>
      <CartesianGrid stroke={grid} strokeDasharray="3 4" /><XAxis type="number" dataKey="x" domain={[0, 100]} tick={axis} label={{ value: "Oxygen concentration (%)", position: "insideBottom", offset: -12, fill: "#8b99b2", fontSize: 10 }} /><YAxis type="number" dataKey="y" tick={axis} label={{ value: "Airflow (m/s)", angle: -90, position: "insideLeft", fill: "#8b99b2", fontSize: 10 }} /><Tooltip cursor={{ strokeDasharray: "3 3" }} />
    </ScatterChart></ResponsiveContainer><div className="chart-empty-overlay"><span>NO PAIRED CONDITION VALUES</span><small>The loaded PSI summaries do not expose structured O₂ and airflow pairs.</small></div></div>
    <div className="chart-foot"><span className="chart-legend-dot dot-flame" /> No experimental points plotted <SourceLink href={SOURCES.psi.url} label="PSI search" /></div>
  </Panel>;
}

export function PpO2PressureChart() {
  const colors = ["#9AA7C2", "#FFB347", "#FF4D4D"];
  const points = REFERENCE_SCENARIOS.map((scenario, index) => ({
    name: scenario.name,
    x: scenario.total_pressure_psi.value ?? 0,
    y: scenario.oxygen_partial_pressure_psi.value ?? 0,
    color: colors[index],
    source: scenario.total_pressure_psi.source_url,
    type: scenario.oxygen_partial_pressure_psi.type,
  }));
  return <Panel title="ppO₂ × total pressure" note="Challenge reference scenarios · not PSI experiment points" className="chart-panel">
    <div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><ScatterChart margin={{ top: 14, right: 20, bottom: 25, left: 8 }}>
      <CartesianGrid stroke={grid} strokeDasharray="3 4" /><XAxis type="number" dataKey="x" domain={[0, 16]} tick={axis} label={{ value: "Total pressure (psi)", position: "insideBottom", offset: -12, fill: "#8b99b2", fontSize: 10 }} /><YAxis type="number" dataKey="y" domain={[0, 5]} tick={axis} label={{ value: "Calculated ppO₂ (psi)", angle: -90, position: "insideLeft", fill: "#8b99b2", fontSize: 10 }} /><Tooltip formatter={(value: number) => [`${value.toFixed(2)} psi`, "Reference value"]} />
      {points.map((point) => <Scatter key={point.name} name={point.name} data={[point]} fill={point.color} shape="diamond" />)}
    </ScatterChart></ResponsiveContainer></div>
    <div className="reference-list">{REFERENCE_SCENARIOS.map((scenario, index) => <div className="reference-row" key={scenario.id}>
      <span className="reference-dot" style={{ background: colors[index] }} />
      <strong className="reference-title">{scenario.name}</strong>
      <div className="reference-values">
        <div className="reference-value"><span>O₂ concentration</span><ValueBadge field={scenario.oxygen_concentration_pct} compact showSource={false} /></div>
        <div className="reference-value"><span>Total pressure</span><ValueBadge field={scenario.total_pressure_psi} compact showSource={false} /></div>
        <div className="reference-value"><span>Calculated ppO₂</span><ValueBadge field={scenario.oxygen_partial_pressure_psi} compact showSource={false} /></div>
      </div>
      <SourceLink href={scenario.oxygen_concentration_pct.source_url} label="Challenge source" />
    </div>)}</div>
  </Panel>;
}

export function EFieldTableChart({ items }: { items: Investigation[] }) {
  const points = useMemo(() => items.flatMap((investigation) => investigation.experimental_records.map((record) => ({
    id: investigation.id, fuel: record.fuel ?? investigation.acronym ?? investigation.id,
    x: record.values.fuel_concentration_pct.value ?? 0,
    y: record.values.flames_ignited.value ?? 0,
    label: record.label,
  }))), [items]);
  return <Panel title="E-FIELD table · recorded test conditions" note="PSI experimental-table rows · not a flammability outcome" className="chart-panel">
    {points.length ? <><div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><LineChart data={[...points].sort((a, b) => a.x - b.x)} margin={{ top: 12, right: 17, bottom: 23, left: 2 }}>
      <CartesianGrid stroke={grid} strokeDasharray="3 4" /><XAxis dataKey="x" type="number" domain={[0, 100]} tick={axis} label={{ value: "Recorded fuel concentration (%)", position: "insideBottom", offset: -12, fill: "#8b99b2", fontSize: 10 }} /><YAxis dataKey="y" type="number" tick={axis} label={{ value: "Flames ignited (count)", angle: -90, position: "insideLeft", fill: "#8b99b2", fontSize: 10 }} /><Tooltip labelFormatter={(label) => `Fuel concentration: ${label}%`} formatter={(value: number) => [value, "Flames ignited"]} /><Line type="monotone" dataKey="y" stroke="#4CC9F0" strokeWidth={1.5} dot={{ r: 3, fill: "#FFB347", stroke: "#0E1626", strokeWidth: 1 }} activeDot={{ r: 5 }} />
      </LineChart></ResponsiveContainer></div><div className="chart-foot"><span className="chart-legend-line" /> PSI table values · each point is linked in the record/source row <SourceLink href="https://psi.nasa.gov/physci/repo/data/investigations/PSI-22" label="PSI-22 table record" /></div></> : <div className="chart-empty-inline"><span>No selected investigation has a parsed numeric table in this snapshot.</span><SourceLink href={SOURCES.psi.url} label="PSI data repository" /></div>}
  </Panel>;
}

const hardwareGroups = [
  { title: "CIR · ACME modular insert", names: ["ACME BRE", "ACME Flame Design", "ACME CFI-G", "ACME E-FIELD", "ACME coflow", "ACME spherical flame"], ids: ["PSI-20", "PSI-10", "PSI-159", "PSI-22", "PSI-21", "PSI-23"], tone: "flame" as const },
  { title: "CIR · MDCA droplet work", names: ["FLEX", "FLEX-2", "CFI"], ids: ["PSI-69", "PSI-68", "PSI-39"], tone: "ice" as const },
  { title: "MSG · fan-driven flow duct", names: ["BASS", "BASS-II", "SPICE", "SLICE"], ids: ["PSI-26", "PSI-25", "PSI-107", "PSI-106"], tone: "green" as const },
  { title: "Smoke / dust instrument lineage", names: ["SAME", "SAME-R", "DAFT", "DAFT-2"], ids: ["PSI-102", "PSI-101", "PSI-47"], tone: "neutral" as const },
];

export function HardwareSharingDiagram() {
  return <Panel title="Hardware sharing map" note="Groups described by the challenge brief; follow each PSI record for setup details." className="hardware-panel">
    <div className="hardware-orbit"><div className="orbit-core"><span><FlameGlyph /></span><strong>COMBUSTION<br />STUDIES</strong></div><div className="hardware-spokes" />
      <div className="hardware-groups">{hardwareGroups.map((group) => <div className="hardware-group" key={group.title}><div className="hardware-group-head"><span className="hardware-node" /><div><strong>{group.title}</strong><small>{group.names.join(" · ")}</small></div></div><div className="hardware-records">{group.ids.map((id) => <Pill key={id} tone={group.tone}>{id}</Pill>)}</div></div>)}</div>
    </div><div className="chart-foot"><SourceLink href={SOURCES.challenge.url} label="NASA Space Apps challenge brief" /></div>
  </Panel>;
}

function FlameGlyph() { return <span className="flame-glyph" aria-hidden="true">✦</span>; }

export function Timeline({ items }: { items: Investigation[] }) {
  const timeline = [...items].filter((item) => item.start_date || item.end_date).sort((a, b) => (a.start_date ?? "").localeCompare(b.start_date ?? ""));
  return <Panel title="Investigation timeline" note="Dates displayed as recorded in PSI search metadata" className="timeline-panel">
    <div className="timeline-list">{timeline.map((item) => <div className="timeline-item" key={item.id}><span className="timeline-node" /><span className="timeline-date">{item.start_date ?? "Start date unavailable"}<br /><small>{item.end_date ? `to ${item.end_date}` : "End date unavailable"}</small></span><div className="timeline-content"><strong>{item.acronym || item.id}</strong><span>{item.title}</span><SourceLink href={item.source_url} label={item.id} /></div></div>)}</div>
  </Panel>;
}

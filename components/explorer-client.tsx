"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Fuse from "fuse.js";
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table";
import { ArrowUpRight, RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import type { Investigation } from "@/lib/schema";
import { PageTitle, Panel, Pill } from "@/components/ui";
import { ValueBadge } from "@/components/value-badge";
import { SourceLink } from "@/components/source-link";
import { matchesNumericRange } from "@/lib/ranking";
import { SOURCES } from "@/lib/sources";

const categoryLabels: Record<string, string> = { prevention: "Prevention", detection: "Detection", suppression: "Suppression", fundamental: "Fundamental", other: "Other PSI" };

export function ExplorerClient({ items }: { items: Investigation[] }) {
  const [query, setQuery] = useState("");
  const [fuel, setFuel] = useState("");
  const [category, setCategory] = useState("");
  const [hardware, setHardware] = useState("");
  const [sensor, setSensor] = useState("");
  const [minO2, setMinO2] = useState("");
  const [maxPressure, setMaxPressure] = useState("");
  const [minAirflow, setMinAirflow] = useState("");
  const fuse = useMemo(() => new Fuse(items, { keys: ["id", "acronym", "title", "objective", "approach", "keywords", "hardware.name"], threshold: 0.34, ignoreLocation: true, minMatchCharLength: 2 }), [items]);
  const fuels = useMemo(() => [...new Set(items.flatMap((item) => item.fuel_types))].sort(), [items]);
  const hardwares = useMemo(() => [...new Set(items.flatMap((item) => item.hardware.map((entry) => entry.name)))].sort(), [items]);
  const sensors = useMemo(() => [...new Set(items.flatMap((item) => item.sensors))].sort(), [items]);
  const filtered = useMemo(() => {
    const candidates = query.trim() ? fuse.search(query).map((hit) => hit.item) : items;
    return candidates.filter((item) =>
      (!fuel || item.fuel_types.includes(fuel as never)) &&
      (!category || item.safety_categories.includes(category as never)) &&
      (!hardware || item.hardware.some((entry) => entry.name === hardware)) &&
      (!sensor || item.sensors.includes(sensor)) &&
      matchesNumericRange(item.conditions.oxygen_concentration_pct, minO2 ? Number(minO2) : undefined) &&
      matchesNumericRange(item.conditions.total_pressure_psi, undefined, maxPressure ? Number(maxPressure) : undefined) &&
      matchesNumericRange(item.conditions.airflow_m_s, minAirflow ? Number(minAirflow) : undefined),
    );
  }, [category, fuse, fuel, hardware, items, maxPressure, minAirflow, minO2, query, sensor]);
  const clear = () => { setQuery(""); setFuel(""); setCategory(""); setHardware(""); setSensor(""); setMinO2(""); setMaxPressure(""); setMinAirflow(""); };
  const columns = useMemo<ColumnDef<Investigation>[]>(() => [
    { id: "record", header: "Investigation", cell: ({ row }) => <div className="table-record"><span className="record-id">{row.original.id}</span><Link href={`/investigations/${row.original.id}`}>{row.original.acronym || row.original.title}<ArrowUpRight size={12} /></Link><small>{row.original.title}</small></div> },
    { id: "fuel", header: "Fuel class", cell: ({ row }) => <div className="tag-row">{row.original.fuel_types.map((item) => <Pill key={item}>{item}</Pill>)}</div> },
    { id: "category", header: "Safety focus", cell: ({ row }) => <div className="tag-row">{row.original.safety_categories.map((item) => <Pill key={item} tone={item === "detection" ? "green" : item === "suppression" ? "ice" : "flame"}>{categoryLabels[item]}</Pill>)}</div> },
    { id: "oxygen", header: "O₂ concentration", cell: ({ row }) => <ValueBadge field={row.original.conditions.oxygen_concentration_pct} compact /> },
    { id: "pressure", header: "Total pressure", cell: ({ row }) => <ValueBadge field={row.original.conditions.total_pressure_psi} compact /> },
    { id: "source", header: "Source", cell: ({ row }) => <SourceLink href={row.original.source_url} label="PSI" /> },
  ], []);
  const table = useReactTable({ data: filtered, columns, getCoreRowModel: getCoreRowModel() });
  const structuredCount = items.filter((item) => item.conditions.oxygen_concentration_pct.value !== null || item.conditions.total_pressure_psi.value !== null || item.conditions.airflow_m_s.value !== null).length;

  return <>
    <PageTitle eyebrow="Investigation explorer / 02" title="Find the source record" intro="Search titles, objectives and approach text. Filters only match values that exist in the loaded dataset; missing conditions stay visible as unavailable." actions={<Link href="/api/export?format=json" className="button button-secondary">Export JSON <ArrowUpRight size={14} /></Link>} />
    <Panel title="Search and refine" note="An empty numeric filter includes records with unavailable values; setting a limit only returns records with a real numeric value." action={<button onClick={clear} className="button button-quiet"><RotateCcw size={13} /> Reset</button>}>
      <div className="filter-grid">
        <label className="field-label"><span>Search investigations</span><span className="search-field"><Search size={15} /><input className="field-input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try BASS, soot, smoke, methane…" /></span></label>
        <label className="field-label"><span>Fuel type</span><select className="field-select" value={fuel} onChange={(event) => setFuel(event.target.value)}><option value="">All fuel types</option>{fuels.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="field-label"><span>Safety category</span><select className="field-select" value={category} onChange={(event) => setCategory(event.target.value)}><option value="">All categories</option>{Object.entries(categoryLabels).map(([key, value]) => <option key={key} value={key}>{value}</option>)}</select></label>
        <label className="field-label"><span>Hardware</span><select className="field-select" value={hardware} onChange={(event) => setHardware(event.target.value)}><option value="">All hardware</option>{hardwares.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="field-label"><span>Sensor / measurement</span><select className="field-select" value={sensor} onChange={(event) => setSensor(event.target.value)}><option value="">All sensors</option>{sensors.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="field-label"><span>O₂ minimum (%)</span><input type="number" min="0" max="100" className="field-input" value={minO2} onChange={(event) => setMinO2(event.target.value)} placeholder="Requires recorded O₂" /></label>
        <label className="field-label"><span>Total pressure maximum (psi)</span><input type="number" min="0" className="field-input" value={maxPressure} onChange={(event) => setMaxPressure(event.target.value)} placeholder="Requires recorded pressure" /></label>
        <label className="field-label"><span>Airflow minimum (m/s)</span><input type="number" min="0" className="field-input" value={minAirflow} onChange={(event) => setMinAirflow(event.target.value)} placeholder="Requires recorded airflow" /></label>
      </div>
      <div className="filter-summary"><span><SlidersHorizontal size={13} /> Showing {filtered.length} investigation records</span><span>Structured O₂ / pressure / airflow: {structuredCount} of {items.length} <SourceLink href={SOURCES.psi.url} label="PSI source" /></span></div>
    </Panel>
    <div className="table-scroll panel explorer-desktop-table"><table className="data-table"><thead>{table.getHeaderGroups().map((group) => <tr key={group.id}>{group.headers.map((header) => <th key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</th>)}</tr>)}</thead><tbody>
      {table.getRowModel().rows.map((row) => <tr key={row.id}>{row.getVisibleCells().map((cell) => <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}</tr>)}
    </tbody></table>{!filtered.length && <div className="empty-state"><h3>No records match</h3><p>Try removing numeric limits. The current PSI search snapshot has no structured O₂, pressure or airflow values.</p></div>}</div>
    <div className="explorer-mobile-list" aria-label="Investigation results">
      {filtered.length ? filtered.map((item) => <article className="explorer-mobile-card" key={item.id}>
        <div className="explorer-mobile-heading"><Link href={`/investigations/${item.id}`}><span className="record-id">{item.id}</span><strong>{item.acronym || item.title}</strong><ArrowUpRight size={13} /></Link><SourceLink href={item.source_url} label="PSI source" /></div>
        <p className="explorer-mobile-title">{item.title}</p>
        <div className="tag-row">{item.fuel_types.map((value) => <Pill key={value}>{value}</Pill>)}{item.safety_categories.map((value) => <Pill key={value} tone={value === "detection" ? "green" : value === "suppression" ? "ice" : "flame"}>{categoryLabels[value]}</Pill>)}</div>
        <div className="explorer-mobile-values"><div><span>O₂ concentration</span><ValueBadge field={item.conditions.oxygen_concentration_pct} compact showSource={false} /></div><div><span>Total pressure</span><ValueBadge field={item.conditions.total_pressure_psi} compact showSource={false} /></div><div><span>Airflow</span><ValueBadge field={item.conditions.airflow_m_s} compact showSource={false} /></div></div>
      </article>) : <div className="empty-state"><h3>No records match</h3><p>Try removing filters or numeric limits that need unavailable test conditions.</p></div>}
    </div>
    <p className="fine-print explorer-foot">Classification chips are inferred from each PSI summary and the official challenge brief. They are navigation aids, not NASA-defined hazard labels.</p>
  </>;
}

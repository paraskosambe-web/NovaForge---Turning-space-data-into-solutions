"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDownWideNarrow, Compass, Download, Filter, Lightbulb, MoveUpRight, SlidersHorizontal } from "lucide-react";
import type { Investigation, NumericValue } from "@/lib/schema";
import { DEFAULT_INFERENCE_WEIGHTS, ENVIRONMENTS, rankInvestigations, type EnvironmentId, type InferenceWeights } from "@/lib/ranking";
import { PageTitle, Panel, Pill } from "@/components/ui";
import { InvestigationCard } from "@/components/investigation-card";
import { OxygenAirflowChart, PpO2PressureChart, HardwareSharingDiagram, Timeline } from "@/components/visualizations";
import { SOURCES } from "@/lib/sources";
import { ValueBadge } from "@/components/value-badge";

const countField = (value: number): NumericValue => ({ value, unit: "investigations", type: "calculated", source_url: SOURCES.psi.url, source_label: "Loaded PSI search records", note: "Count from the current PSI search response." });

export function DashboardClient({ items }: { items: Investigation[] }) {
  const [environment, setEnvironment] = useState<EnvironmentId>("moon");
  const [weights, setWeights] = useState<InferenceWeights>(DEFAULT_INFERENCE_WEIGHTS);
  useEffect(() => {
    const valid = ENVIRONMENTS.map((item) => item.id) as readonly string[];
    const fromQuery = new URLSearchParams(window.location.search).get("environment");
    if (fromQuery && valid.includes(fromQuery)) {
      setEnvironment(fromQuery as EnvironmentId);
      localStorage.setItem("novaforge-environment", fromQuery);
    } else {
      const savedEnvironment = localStorage.getItem("novaforge-environment");
      if (savedEnvironment && valid.includes(savedEnvironment)) setEnvironment(savedEnvironment as EnvironmentId);
    }
    const savedWeights = localStorage.getItem("novaforge-inference-weights");
    if (savedWeights) { try { setWeights({ ...DEFAULT_INFERENCE_WEIGHTS, ...JSON.parse(savedWeights) as Partial<InferenceWeights> }); } catch { localStorage.removeItem("novaforge-inference-weights"); } }
    const updateWeights = (event: Event) => setWeights((event as CustomEvent<InferenceWeights>).detail);
    window.addEventListener("novaforge-ranking-weights", updateWeights);
    return () => window.removeEventListener("novaforge-ranking-weights", updateWeights);
  }, []);
  const ranked = useMemo(() => rankInvestigations(items, environment, weights), [items, environment, weights]);
  const top = ranked.slice(0, 6);
  return <>
    <PageTitle eyebrow="Mission dashboard / 01" title="Fire safety intelligence" intro="Explore NASA combustion investigations against human-exploration scenarios. Evidence and inferred relevance stay separate." actions={<a href="/api/export?format=csv" className="button button-secondary"><Download size={14} /> Export dataset</a>} />
    <div className="dashboard-controls panel"><div className="environment-select"><span className="control-kicker"><Compass size={14} /> ENVIRONMENT SCENARIO</span><label className="sr-only" htmlFor="environment">Select an environment</label><select id="environment" className="field-select" value={environment} onChange={(event) => { const next = event.target.value as EnvironmentId; setEnvironment(next); localStorage.setItem("novaforge-environment", next); }} >{ENVIRONMENTS.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</select><span className="fine-print">{ENVIRONMENTS.find((item) => item.id === environment)?.note}</span></div><div className="ranking-controls"><span className="control-kicker"><ArrowDownWideNarrow size={14} /> ORDERED BY INFERRED RELEVANCE</span><p>Evidence match remains independently visible. Missing condition values cannot earn match points.</p><Link href="/methodology" className="text-action">Edit inference weights <MoveUpRight size={13} /></Link></div><div className="control-total"><span>INDEXED RECORDS</span><ValueBadge field={countField(items.length)} compact /></div></div>
    <div className="dashboard-summary grid grid-3">
      <div className="summary-block"><span className="summary-index">A</span><div><strong>Find an investigation</strong><span>Search PSI summaries and source records.</span></div><Link href="/investigations" aria-label="Open investigations"><MoveUpRight size={15} /></Link></div>
      <div className="summary-block"><span className="summary-index ice">B</span><div><strong>Compare the conditions</strong><span>Look for shared tests and missing fields.</span></div><Link href="/compare" aria-label="Compare investigations"><MoveUpRight size={15} /></Link></div>
      <div className="summary-block"><span className="summary-index green">C</span><div><strong>Ask the SI assistant</strong><span>Answers cite the records retrieved first.</span></div><Link href="/assistant" aria-label="Open assistant"><MoveUpRight size={15} /></Link></div>
    </div>
    <div className="section-label"><h2>Investigation ranking</h2><span className="ranking-disclaimer"><Lightbulb size={13} /> Inferred ranking is a heuristic, not a NASA safety rating</span></div>
    <div className="rank-grid">{top.map(({ investigation, score }, index) => <InvestigationCard key={investigation.id} investigation={investigation} scores={{ evidence: score.evidence, inferred: score.inferred }} highlight={index === 0} />)}</div>
    <div className="grid grid-2 chart-grid"><OxygenAirflowChart /><PpO2PressureChart /></div>
    <div className="section-label"><h2>Experiment context</h2><Pill tone="ice">Source-linked metadata</Pill></div>
    <div className="grid grid-2"><HardwareSharingDiagram /><Timeline items={items} /></div>
    <div className="bottom-note"><Filter size={14} /><span>For full filters, including fuel class, hardware, O₂, pressure, airflow and sensors, open the explorer.</span><Link href="/investigations">Explore records <MoveUpRight size={13} /></Link></div>
  </>;
}

"use client";

import { useEffect, useState } from "react";
import { RotateCcw, SlidersHorizontal } from "lucide-react";
import { DEFAULT_INFERENCE_WEIGHTS, type InferenceWeights } from "@/lib/ranking";
import { Panel } from "@/components/ui";

const STORE_KEY = "novaforge-inference-weights";
const labels: Record<keyof InferenceWeights, { label: string; note: string }> = {
  safety_function: { label: "Safety function", note: "Prevention, detection or suppression topic match" },
  platform: { label: "Platform context", note: "Recorded flight-platform relationship" },
  fuel_class: { label: "Fuel class", note: "Source-described fuel/material family" },
  hardware: { label: "Hardware context", note: "Presence of a source-reported hardware field" },
};

function publish(weights: InferenceWeights) {
  localStorage.setItem(STORE_KEY, JSON.stringify(weights));
  window.dispatchEvent(new CustomEvent("novaforge-ranking-weights", { detail: weights }));
}

export function WeightsEditor() {
  const [weights, setWeights] = useState<InferenceWeights>(DEFAULT_INFERENCE_WEIGHTS);
  useEffect(() => {
    const saved = localStorage.getItem(STORE_KEY);
    if (saved) {
      try { setWeights({ ...DEFAULT_INFERENCE_WEIGHTS, ...JSON.parse(saved) as Partial<InferenceWeights> }); } catch { localStorage.removeItem(STORE_KEY); }
    }
  }, []);
  const update = (key: keyof InferenceWeights, value: number) => {
    const next = { ...weights, [key]: value };
    setWeights(next); publish(next);
  };
  const reset = () => { setWeights(DEFAULT_INFERENCE_WEIGHTS); publish(DEFAULT_INFERENCE_WEIGHTS); };
  const total = Object.values(weights).reduce((sum, value) => sum + value, 0);
  return <Panel title="Adjust inferred-relevance weights" note="These analyst-selected weights change only the inferred score. Evidence-match scoring is separate." action={<button className="button button-quiet" onClick={reset}><RotateCcw size={13} /> Reset</button>}>
    <div className="weight-editor">{(Object.keys(labels) as (keyof InferenceWeights)[]).map((key) => <label className="weight-row" key={key}><span className="weight-name"><strong>{labels[key].label}</strong><small>{labels[key].note}</small></span><input type="range" min="0" max="100" step="5" value={weights[key]} onChange={(event) => update(key, Number(event.target.value))} aria-label={`${labels[key].label} inferred weight`} /><span className="weight-value"><SlidersHorizontal size={12} />{weights[key]}%</span></label>)}</div>
    <p className="fine-print weight-total">Weight total {total}% · scores normalize the active weights before ranking.</p>
  </Panel>;
}

import type { Investigation, NumericValue, SafetyCategory } from "@/lib/schema";

export const ENVIRONMENTS = [
  { id: "iss", label: "ISS", group: "orbital", note: "No target atmosphere is assumed; PSI conditions must be compared with measured values." },
  { id: "spacecraft", label: "Spacecraft cabin", group: "transit", note: "Cabin oxygen, pressure and airflow are not supplied by this preset." },
  { id: "moon", label: "Moon base", group: "lunar", note: "Uses the challenge scenario for context; its exact-boundary reference is not an experimental target." },
  { id: "mars", label: "Mars base", group: "planetary", note: "Mars gravity is lower than Earth’s; habitat atmosphere remains unspecified." },
  { id: "rover", label: "Pressurized rover", group: "surface_vehicle", note: "No rover-specific oxygen or pressure target is assumed." },
  { id: "spacesuit", label: "Spacesuit", group: "suit", note: "Uses the challenge’s spacesuit reference for context." },
] as const;
export type EnvironmentId = (typeof ENVIRONMENTS)[number]["id"];

export type InferenceWeights = { safety_function: number; platform: number; fuel_class: number; hardware: number };
export const DEFAULT_INFERENCE_WEIGHTS: InferenceWeights = { safety_function: 40, platform: 20, fuel_class: 25, hardware: 15 };
export const EVIDENCE_WEIGHTS = { oxygen: 30, pressure: 25, ppO2: 25, airflow: 20 } as const;

function valueField(value: number | null, url: string, unit = "points / 100", note?: string, unavailable = false): NumericValue {
  return { value, unit, type: unavailable ? "unavailable" : "calculated", source_url: url, note };
}

function environmentCategoryPriorities(environment: EnvironmentId): SafetyCategory[] {
  if (environment === "spacesuit") return ["prevention", "suppression", "detection"];
  if (environment === "iss") return ["detection", "suppression", "prevention"];
  return ["prevention", "detection", "suppression"];
}

function numericTargets(environment: EnvironmentId) {
  if (environment === "moon") return { oxygen: { min: 30 }, pressure: { max: 10.2 } };
  if (environment === "spacesuit") return { oxygen: { min: 100, max: 100 }, pressure: { min: 4.3, max: 4.3 }, ppO2: { min: 4.3, max: 4.3 } };
  return {};
}

export function scoreInvestigation(item: Investigation, environment: EnvironmentId, weights = DEFAULT_INFERENCE_WEIGHTS) {
  const categoryMatch = environmentCategoryPriorities(environment).some((category) => item.safety_categories.includes(category));
  const environmentText = `${environment} ${ENVIRONMENTS.find((entry) => entry.id === environment)?.label ?? environment}`.toLowerCase();
  const platformDirect = Boolean(item.flight_platform && item.flight_platform.toLowerCase().includes(environmentText));
  const platformRelated = (environment === "iss" || environment === "spacecraft") && /iss|space station|spacecraft/i.test(item.flight_platform ?? "");
  const fuelPresent = item.fuel_types.some((fuel) => fuel !== "unspecified");
  const hardwarePresent = item.hardware.length > 0;
  const normalizedWeights = Object.values(weights).reduce((sum, weight) => sum + Math.max(0, weight), 0) || 1;
  const infer = {
    safety_function: categoryMatch ? 100 : 0,
    platform: platformDirect ? 100 : platformRelated ? 65 : 25,
    fuel_class: fuelPresent ? 65 : 25,
    hardware: hardwarePresent ? 70 : 20,
  };
  const inferredScore = Object.entries(infer).reduce((sum, [key, score]) => {
    const weight = weights[key as keyof InferenceWeights];
    return sum + (score * Math.max(0, weight)) / normalizedWeights;
  }, 0);

  // Environment numeric targets are deliberately not invented. A match is earned only
  // when both sides contain a documented numeric value; unavailable inputs earn zero.
  const targets = numericTargets(environment);
  const conditionFields = [
    ["oxygen", "O₂ concentration", item.conditions.oxygen_concentration_pct, EVIDENCE_WEIGHTS.oxygen],
    ["pressure", "Total pressure", item.conditions.total_pressure_psi, EVIDENCE_WEIGHTS.pressure],
    ["ppO2", "ppO₂", item.conditions.oxygen_partial_pressure_psi, EVIDENCE_WEIGHTS.ppO2],
    ["airflow", "Airflow", item.conditions.airflow_m_s, EVIDENCE_WEIGHTS.airflow],
  ] as const;
  const evidenceBreakdown = conditionFields.map(([key, label, field, weight]) => {
    const target = targets[key as keyof typeof targets];
    if (!target || field.value === null) return {
      label,
      score: valueField(null, item.source_url, "points / 100", !target ? "Not scored: this environment has no numeric target for this field." : "Not scored: the loaded PSI record has no numeric value for this field.", true),
      availability: field,
      weight,
    };
    const matches = (target.min === undefined || field.value >= target.min) && (target.max === undefined || field.value <= target.max);
    return {
      label,
      score: valueField(matches ? 100 : 0, item.source_url, "condition match points / 100", "Direct numeric comparison with the selected scenario target."),
      availability: field,
      weight,
    };
  });
  const scoredParts = evidenceBreakdown.filter((part) => part.score.value !== null);
  const matchedWeight = scoredParts.reduce((sum, part) => sum + (part.score.value ?? 0) * part.weight, 0);
  const availableWeight = scoredParts.reduce((sum, part) => sum + part.weight, 0);
  const evidenceValue = availableWeight ? matchedWeight / availableWeight : null;
  return {
    id: item.id,
    evidence: valueField(evidenceValue, item.source_url, "points / 100", evidenceValue === null ? "Unavailable: no target and source-recorded numeric condition pair could be compared." : "Calculated from only available, targetable experimental conditions; missing fields are not treated as mismatches.", evidenceValue === null),
    inferred: valueField(inferredScore, item.source_url, "points / 100", "Inference from topic, platform, disclosed fuel class and hardware presence; not an experimental result."),
    evidenceBreakdown,
    inferredBreakdown: Object.entries(infer).map(([key, score]) => ({ key, score: valueField(score, item.source_url, "inferred points / 100", "Reasoned relevance from source metadata."), weight_pct: weights[key as keyof InferenceWeights] })),
    environment_note: ENVIRONMENTS.find((entry) => entry.id === environment)?.note ?? "",
  };
}

export function rankInvestigations(items: Investigation[], environment: EnvironmentId, weights = DEFAULT_INFERENCE_WEIGHTS) {
  return items
    .map((item) => ({ investigation: item, score: scoreInvestigation(item, environment, weights) }))
    .sort((a, b) => (b.score.inferred.value ?? 0) - (a.score.inferred.value ?? 0) || (b.score.evidence.value ?? 0) - (a.score.evidence.value ?? 0) || a.investigation.id.localeCompare(b.investigation.id));
}

export function matchesNumericRange(value: NumericValue, min?: number, max?: number) {
  if (value.value === null) return min === undefined && max === undefined;
  return (min === undefined || value.value >= min) && (max === undefined || value.value <= max);
}

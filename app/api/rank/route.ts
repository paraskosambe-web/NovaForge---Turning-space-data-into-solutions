import { NextResponse } from "next/server";
import { investigations } from "@/lib/data";
import { DEFAULT_INFERENCE_WEIGHTS, ENVIRONMENTS, rankInvestigations, type EnvironmentId, type InferenceWeights } from "@/lib/ranking";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const environment = (params.get("environment") ?? "moon") as EnvironmentId;
  if (!ENVIRONMENTS.some((item) => item.id === environment)) return NextResponse.json({ error: "Unknown environment." }, { status: 400 });
  const weights: InferenceWeights = {
    safety_function: Number(params.get("safety_function")) || DEFAULT_INFERENCE_WEIGHTS.safety_function,
    platform: Number(params.get("platform")) || DEFAULT_INFERENCE_WEIGHTS.platform,
    fuel_class: Number(params.get("fuel_class")) || DEFAULT_INFERENCE_WEIGHTS.fuel_class,
    hardware: Number(params.get("hardware")) || DEFAULT_INFERENCE_WEIGHTS.hardware,
  };
  return NextResponse.json({ environment, sort_basis: "inferred relevance", evidence_and_inference_are_separate: true, results: rankInvestigations(investigations, environment, weights) });
}

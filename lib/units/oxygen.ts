import type { NumericValue } from "@/lib/schema";

export const CHALLENGE_URL = "https://www.spaceappschallenge.org/2026/challenges/flame-in-freefall/";
export const NASA_MOON_URL = "https://science.nasa.gov/moon/top-moon-questions/";
export const NASA_MARS_URL = "https://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html?level=1";

export function calculatePpO2(oxygenPercent: number, totalPressurePsi: number): number {
  if (oxygenPercent < 0 || oxygenPercent > 100) throw new RangeError("Oxygen concentration must be 0–100 percent.");
  if (totalPressurePsi < 0) throw new RangeError("Total pressure cannot be negative.");
  return (oxygenPercent / 100) * totalPressurePsi;
}

function field(value: number, unit: string, type: NumericValue["type"], note?: string): NumericValue {
  return { value, unit, type, source_url: CHALLENGE_URL, source_label: "NASA Space Apps challenge scenario", note };
}

function scenario(id: string, name: string, oxygenPercent: number, pressurePsi: number, note: string) {
  return {
    id,
    name,
    oxygen_concentration_pct: field(oxygenPercent, "% O₂", "literature-derived", note),
    total_pressure_psi: field(pressurePsi, "psi", "literature-derived", note),
    oxygen_partial_pressure_psi: field(calculatePpO2(oxygenPercent, pressurePsi), "psi ppO₂", "calculated", "Calculated as oxygen fraction × total pressure; inputs are shown separately."),
  };
}

export const REFERENCE_SCENARIOS = [
  scenario("earth", "Earth sea level", 21, 14.7, "Reference scenario from the challenge brief."),
  scenario("moon", "Moon base · exact boundary case", 30, 10.2, "Challenge scenario at exactly 30% O₂ and 10.2 psi; the brief also describes ≥30% and ≤10.2 psi."),
  scenario("suit", "Spacesuit", 100, 4.3, "Reference scenario from the challenge brief."),
] as const;

export const MOON_O2_INCREASE = field((30 / 21 - 1) * 100, "% concentration increase", "calculated", "Compares concentration only; it does not imply a specific ppO₂ or fire-risk change.");

export const GRAVITY_REFERENCES = {
  moon: { value: 1 / 6, unit: "g relative to Earth", type: "literature-derived", source_url: NASA_MOON_URL, source_label: "NASA Moon FAQ" },
  mars: { value: 0.38, unit: "g relative to Earth", type: "literature-derived", source_url: NASA_MARS_URL, source_label: "NASA Mars Fact Sheet" },
} satisfies Record<string, NumericValue>;

import { z } from "zod";

export const ValueTypeSchema = z.enum(["measured", "calculated", "literature-derived", "unavailable"]);

/** Numeric research values always retain their provenance, including unavailable fields. */
export const NumericValueSchema = z.object({
  value: z.number().nullable(),
  unit: z.string().min(1),
  type: ValueTypeSchema,
  source_url: z.string().url(),
  source_label: z.string().optional(),
  investigation_id: z.string().optional(),
  record_id: z.string().optional(),
  note: z.string().optional(),
}).superRefine((field, ctx) => {
  if (field.type === "unavailable" && field.value !== null) {
    ctx.addIssue({ code: "custom", message: "Unavailable values must use null." });
  }
  if (field.type !== "unavailable" && field.value === null) {
    ctx.addIssue({ code: "custom", message: "Available values must include a number." });
  }
});

export const SafetyCategorySchema = z.enum(["prevention", "detection", "suppression", "fundamental", "other"]);
export const FuelTypeSchema = z.enum(["solid", "gas", "liquid droplet", "smoke/aerosol", "dust", "unspecified"]);

export const ExperimentalRecordSchema = z.object({
  record_id: z.string().min(1),
  label: z.string().min(1),
  fuel: z.string().optional(),
  test_date: z.string().optional(),
  values: z.record(NumericValueSchema),
  source_url: z.string().url(),
});

export const InvestigationSchema = z.object({
  id: z.string().regex(/^PSI-\d+$/),
  title: z.string().min(1),
  acronym: z.string().nullable(),
  objective: z.string(),
  approach: z.string(),
  hypothesis: z.string().nullable(),
  earth_benefits: z.string().nullable(),
  research_area: z.string().nullable(),
  sub_research_area: z.string().nullable(),
  project_type: z.string().nullable(),
  flight_platform: z.string().nullable(),
  start_date: z.string().nullable(),
  end_date: z.string().nullable(),
  doi: z.string().nullable(),
  keywords: z.array(z.string()),
  fuel_types: z.array(FuelTypeSchema),
  fuel_shape_size: z.string().nullable(),
  safety_categories: z.array(SafetyCategorySchema),
  hardware: z.array(z.object({ name: z.string(), url: z.string().url().optional() })),
  sensors: z.array(z.string()),
  reported_variables: z.array(z.string()),
  unchanged_conditions: z.array(z.string()),
  measurements: z.array(z.string()),
  conditions: z.object({
    oxygen_concentration_pct: NumericValueSchema,
    total_pressure_psi: NumericValueSchema,
    oxygen_partial_pressure_psi: NumericValueSchema,
    airflow_m_s: NumericValueSchema,
  }),
  experimental_records: z.array(ExperimentalRecordSchema),
  source_url: z.string().url(),
  api_source_url: z.string().url(),
  source_record_id: z.string(),
  source_updated: z.string().nullable(),
});

export const InvestigationDatasetSchema = z.object({
  schema_version: z.literal("1.0.0"),
  source: z.string().url(),
  generated_at: z.string(),
  ingest_note: z.string(),
  investigations: z.array(InvestigationSchema),
});

export type ValueType = z.infer<typeof ValueTypeSchema>;
export type NumericValue = z.infer<typeof NumericValueSchema>;
export type Investigation = z.infer<typeof InvestigationSchema>;
export type InvestigationDataset = z.infer<typeof InvestigationDatasetSchema>;
export type ExperimentalRecord = z.infer<typeof ExperimentalRecordSchema>;
export type SafetyCategory = z.infer<typeof SafetyCategorySchema>;
export type FuelType = z.infer<typeof FuelTypeSchema>;

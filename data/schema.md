# Normalized dataset schema

The app and `scripts/ingest.ts` share Zod definitions in `lib/schema/index.ts`. At build time the committed JSON is parsed through `InvestigationDatasetSchema`; invalid or unattributed numeric values fail the import and the build.

Top level:

- `schema_version`: normalized schema version
- `source`: PSI search URL
- `generated_at`: ingestion time as an ISO date string
- `ingest_note`: what was fetched and what remains unavailable
- `investigations`: normalized PSI investigation records

Each investigation keeps source identity (`id`, `source_record_id`, `source_url`, `api_source_url`), PSI metadata, qualitative tags and the `conditions` object. The conditions object always has oxygen concentration, total pressure, ppO₂ and airflow fields. Missing entries use `value: null`, `type: "unavailable"`, an appropriate unit and the investigation URL.

Every numeric object follows this shape:

```json
{
  "value": 70,
  "unit": "%",
  "type": "measured",
  "source_url": "https://psi.nasa.gov/physci/repo/data/investigations/PSI-22",
  "investigation_id": "PSI-22",
  "record_id": "PSI-22_Experimental table_ACME E-FIELD Flames.csv · data row 2"
}
```

The E-FIELD CSV rows use `experimental_records[]`, with a source file/row identifier and typed fields. JSON export preserves the complete structure. CSV export is record-oriented and carries a parallel type/unit/source column group for each numeric field.

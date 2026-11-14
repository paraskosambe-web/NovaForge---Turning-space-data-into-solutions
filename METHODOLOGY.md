# Ranking and scientific methodology

## Two separate rankings

The app displays an **Evidence match** score and an **Inferred relevance** score. It never blends them.

### Evidence match

Evidence matching compares source-recorded oxygen concentration, total pressure, oxygen partial pressure and airflow with numeric targets that the selected scenario actually supplies. The scoring weights are O₂ 30, total pressure 25, ppO₂ 25 and airflow 20. For Moon Base, only the brief’s O₂ lower bound and total-pressure upper bound are used as condition targets. For Spacesuit, the brief provides O₂, total pressure and ppO₂ reference inputs. Other environment presets do not receive invented pressure or gas assumptions.

Only fields with both a PSI numeric value and a documented environment target enter the score. Available fields that fall outside a target range are a mismatch; unavailable fields are excluded, not treated as a mismatch. When there is no comparable field, the evidence score is **Unavailable**. This is the current behavior for all 26 loaded PSI summaries because they do not expose structured O₂, pressure, ppO₂ or airflow values.

Evidence conditions retain their own value type and source URL. ppO₂ calculations use the recorded oxygen fraction and total pressure separately: `ppO₂ = (O₂ percent / 100) × total pressure`.

### Inferred relevance

Inferred relevance is a heuristic based on four source-metadata relationships:

- investigation safety function or subject
- recorded flight-platform context
- source-described fuel class
- presence of source-reported hardware metadata

Each component is assigned a fit score and the active weights are normalized before summation. Default weights are safety function 40%, platform 20%, fuel class 25% and hardware 15%. Users can edit the weights in `/methodology`; the values persist in that browser and update `/dashboard`. The inferred score is always labeled **inferred**. It does not claim an experiment tested a particular habitat mix, gravity level or safety outcome.

The investigation chips and family groups are also inferred from PSI summaries and the challenge brief. Follow the PSI record for exact hardware, test design, fuels and outputs.

## Value types

Every numeric data field uses `{ value, unit, type, source_url }`, with optional investigation and record identifiers. Zod validation rejects absent type/source/unit, a non-numeric value for an available field, or a numeric value labeled unavailable.

- **Measured**: directly recorded by the accessible PSI experimental table.
- **Calculated**: derived from cited inputs with a stated formula.
- **Literature-derived**: an input or fact stated by a cited non-table source.
- **Unavailable**: not supplied in the loaded source; represented as `null` with a source URL.

The NASA Space Apps scenario references are not experimental points. Earth sea-level inputs, Moon Base boundary inputs and the spacesuit inputs are linked to the challenge brief. ppO₂ is calculated from the displayed inputs. The challenge’s comparison of more than 40% refers to oxygen concentration only. It does not by itself specify ppO₂ or quantify a fire-risk change.

## PSI snapshot and scope

The data snapshot contains 26 JSON investigation summaries returned by NASA PSI’s public combustion search. One real PSI-22 E-FIELD experimental table was downloadable and is included as raw source data; the ingest script parses 21 rows with fuel-mixture concentration and flames-ignited fields. Those are test-condition/count entries, not a material-safety result. Other experimental file trees were not harvested, so the dashboard marks absent condition fields unavailable.

The partial-gravity gap is specifically a **gap in the loaded PSI result set**, not a claim that NASA has no partial-gravity combustion work. NASA has separately published simulated lunar-gravity LUCI results. The dashboard links to that publication but does not merge it into the PSI-only experimental export. NASA’s current FM² page provides project objectives; an up-to-date FM² launch/result date was not established in this inspection.

## Limitations

- PSI search descriptions do not replace source data files, reports or publications.
- The retrieved summary set is not a complete download of all PSI files.
- The current dataset does not provide structured oxygen, total-pressure, ppO₂ or airflow values for direct investigation ranking.
- The one fetched table does not provide a flammability limit, suppression performance result or safety certification.
- Ranking and classification are research-navigation aids, not NASA ratings or fire-risk probabilities.
- The AI assistant receives retrieved records only, but live model prose remains fallible. The dataset is the authority and missing data should trigger an abstention.

See [docs/PSI_ACCESS.md](docs/PSI_ACCESS.md) for step-zero access evidence. Sources are listed in `/methodology` and `lib/sources.ts`.

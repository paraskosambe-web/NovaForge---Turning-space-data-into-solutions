# PSI access inspection

Inspected on **13 November 2026** before building the app. Source captures are in `data/raw/`.

## What worked

- The public combustion search page returned the Angular application shell. Its JavaScript client identified the public JSON routes under `https://psi.nasa.gov/geode-py/ws`.
- `GET /repo/search?term=combustion&source=psi&type=investigation&from=0&size=100` returned **26 PSI investigation summaries** as JSON. The saved response includes titles, accessions, objectives, approach text, research area, dates, hardware metadata and keywords.
- `GET /repo/filter-options` returned the public filter taxonomy.
- `GET /repo/investigations/{id}` returned detailed JSON for all **26 search results**. The files are saved under `data/raw/investigations/`; the PSI-22 detail is also saved at `data/raw/psi-PSI-22-detail.json`. The detail response includes metadata and investigation-file listings.
- PSI's `/studies/{accession}/download` route returned a temporary signed link for the PSI-22 E-FIELD Flames experimental table. The 2,475-byte CSV was fetched and saved as `data/raw/PSI-22-experimental-table.csv`. Temporary signed links are not stored.
- The normalized dataset is built from the saved/live JSON search response. The ingestion script only parses the rows in the one table that was successfully retrieved. Other condition fields remain `unavailable`.

## What was not established

- No all-investigation metadata bulk-export endpoint or public, documented PSI API specification was found in the inspected pages/client bundle.
- PSI's UI supports selecting investigation files for ZIP download, but a complete bulk export of the combustion catalog was not run. The PSI guide describes large selected-file downloads as an email-prepared process when they exceed 1 GB.
- The experiment data trees for the remaining 25 search results were not downloaded or normalized. The search summary often describes conditions in prose; it does not provide structured O₂, total-pressure, ppO₂ or airflow values for those records.
- The one accessible experimental table contains E-FIELD test-day metadata, methane mixture concentration and flames-ignited counts. Those rows do **not** supply the missing O₂, pressure or airflow fields. The CSV is kept as source material and its values are marked as recorded test data, not safety outcomes.
- The `term=combustion` query also returned records whose titles are not directly fire-safety investigations. They remain in the dataset and rank lower; topic categories are explicitly inferred from source text and the challenge brief.

The NASA repository remains authoritative for experimental data. Metadata summaries are not a substitute for source tables or publications. See `README.md` and `/data-gaps` for the dataset's practical limits.

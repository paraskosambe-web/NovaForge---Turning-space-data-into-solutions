# Test record

Run `npm test` for Vitest checks, `npm run test:e2e` for the Playwright smoke test, and `npm run build` for the production build.

## Assistant grounding questions

These are exercised against the same cached dataset used by `/api/ask` when live credentials are absent.

### Answerable from the loaded records

**Question:** “What records contain measured fuel concentration values?”

**Expected behavior:** return PSI-22 and cite the accessible PSI-22 experimental table. Numeric entries must render as type-badged values with the PSI investigation source and the CSV row identifier. The answer must say they are recorded input conditions, not a safety result.

### Not answerable from the loaded records

**Question:** “What oxygen percentage makes a fabric safe on Mars?”

**Expected behavior:** abstain. The loaded PSI snapshot has no structured condition combination that answers this, and it must not invent a threshold or safety conclusion. Cite retrieved PSI records when relevant and state that O₂, pressure and airflow are unavailable.

### Lunar-scenario limitation check

**Question:** “Which tests are most relevant to a 30% O₂ lunar habitat?”

**Expected behavior:** provide a shortlist inferred from investigation topic only, label it inferred, and say the loaded summaries cannot directly compare test O₂/pressure/ppO₂ to the scenario.

## Automated checks

- Normalization of the saved NASA PSI query and the fetched PSI-22 table.
- Schema rejection when any numeric field lacks its value type or source URL.
- Recursive provenance audit for numeric value objects.
- ppO₂ calculation and boundary scenarios.
- Ranking separation, missing-condition behavior and editable inference weights.
- DEMO cache answerable/unanswerable assistant prompts.
- CSV rows are generated from the same normalized investigation object returned by the dataset API.
- One Playwright landing/dashboard smoke test.

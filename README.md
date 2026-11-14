# NovaForge · Flame in Freefall

Source-grounded research dashboard for the NASA Space Apps 2026 challenge. It searches, ranks and compares NASA PSI combustion investigations while keeping experimental evidence separate from inferred relevance.

## Quick start

Requires Node.js 22 or newer and npm.

```powershell
npm install
npm run ingest
npm run dev
```

Open `http://localhost:3000`. Without a provider and key, the assistant runs in **DEMO (cached)** mode. It uses only the loaded PSI dataset and abstains when the dataset does not support an answer.

To regenerate from the committed PSI search response without network access:

```powershell
$env:PSI_OFFLINE = 'true'
npm run ingest
```

The ingestion command saves the current PSI search response to `data/raw/psi-search.json`, validates every numeric field with the shared Zod schema, then writes `data/normalized/investigations.json`. If a live request fails, it uses the committed raw response and reports that fallback. The separately downloaded E-FIELD CSV is parsed when present.

## What is loaded

- The verified PSI search route returned 26 investigation summaries for `term=combustion`, `source=psi`, `type=investigation`.
- One PSI-22 E-FIELD experimental table was successfully downloaded. The normalized snapshot includes its recorded fuel-mixture concentration and flames-ignited fields for 21 source rows.
- O₂ concentration, total pressure, ppO₂ and airflow are marked unavailable in the loaded search summaries. A missing field is never filled with a sample, model estimate or challenge scenario.
- Topic chips and the inferred-relevance ranking are derived from source-summary text and the official challenge brief. They are reasoning aids, not NASA labels or safety scores.
- The challenge brief’s atmosphere inputs are separate from experiments. ppO₂ is calculated as oxygen fraction × total pressure, with both inputs shown.

See [docs/PSI_ACCESS.md](docs/PSI_ACCESS.md) for the exact PSI access findings and limits. See [METHODOLOGY.md](METHODOLOGY.md) for scoring rules and [data/schema.md](data/schema.md) for the dataset schema.

## Pages and API

- `/` landing and Moon Base preset
- `/dashboard` ranked records by environment
- `/investigations` search and filters
- `/investigations/[id]` source detail and available table rows
- `/compare` compare two to four investigations
- `/assistant` grounded SI Q&A
- `/safety-tech` prevention, detection and suppression records
- `/earth-applications` NASA technology-transfer resources
- `/data-gaps` unavailable fields and partial-gravity coverage
- `/methodology` value types, score weights and source register
- `/api/investigations` loaded JSON dataset
- `/api/rank?environment=moon` ranking output
- `/api/ask` rate-limited assistant (`mode` is `demo` or `live`)
- `/api/export?format=json` or `/api/export?format=csv` dataset export

Exports reflect the same validated static JSON returned by `/api/investigations`. CSV emits one row per loaded experimental row, plus one summary row for investigations without a parsed table. Numeric condition columns include value, unit, type and source URL.

## AI configuration

Live mode is opt-in. Set a provider, model and matching server-side key in `.env.local`:

```dotenv
AI_PROVIDER=openai
AI_MODEL=gpt-5.5
OPENAI_API_KEY=...
```

Or choose `AI_PROVIDER=anthropic`, set `AI_MODEL` to a model available to your Anthropic account, and configure `ANTHROPIC_API_KEY`. Do not add keys to client components or commit them. If no configured provider/key/model is present, the app stays in cached demo mode.

The API retrieves a small set of PSI records before contacting a provider and sends only those record excerpts. Responses are limited to 240 output tokens, the route is rate-limited, and unsupported questions should be refused. Live provider output still needs human review; it is not a certified safety judgment. The in-memory rate limiter is per application instance, so use an external shared limiter before a high-volume public deployment.

## Tests and production build

```powershell
npm test
npm run test:e2e
npm run build
```

Vitest covers the PSI normalization path, source/type validation, oxygen calculation, ranking separation, demo assistant answerable/unanswerable cases, and export parity. Playwright has one landing/dashboard smoke test.

## Vercel deployment

1. Push this folder to a GitHub repository.
2. In Vercel, choose **Add New → Project** and import the repository.
3. Keep the framework preset as Next.js and the build command as `npm run build`.
4. Set `AI_PROVIDER`, `AI_MODEL`, and the corresponding server-side provider key if live Q&A is wanted. Leave them unset for spending-safe demo mode. Set `RATE_LIMIT_MAX` and `RATE_LIMIT_WINDOW_MS` as needed.
5. Deploy. The normalized dataset is committed with the application; no database or separate Python service is required.

## Safety and endorsement

Educational research tool, **not a certified safety system**. Do not use it to approve materials, select extinguishers, set an atmosphere or make mission-safety decisions. NASA is not affiliated with or endorsing NovaForge. The official PSI record remains authoritative for experiment data.

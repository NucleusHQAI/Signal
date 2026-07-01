# SIGNAL app (Phase 1 prototype)

Mobile-first PWA implementing the Phase 1 build sequence from
`../docs/product/02-mvp-scope.md`: check-in, workout logging, supplement
logging, demo data, readiness score v0, insight explanation format and
weekly review.

## Run locally

```bash
npm install
npm run dev
```

Open the printed local URL on a phone-sized viewport (or your browser's
device toolbar) - the layout is mobile-first.

On first load, the dashboard offers to seed 28 days of demo data so the
readiness score, insights and weekly review have something to show. You can
also do this from Settings, or start logging real check-ins/workouts today.

## Data storage

Phase 1 stores data in the browser's `localStorage` (see
`src/lib/repository.ts`) - no backend is required to run the prototype.

Cross-device cloud sync via Supabase (Postgres + Auth) is scaffolded for
when it's needed:

1. Create a project at supabase.com.
2. Run `supabase/schema.sql` in the SQL editor - it creates one table per
   entity in `../docs/technical/01-data-model.md` with row-level security.
3. Copy `.env.example` to `.env` and set `VITE_SUPABASE_URL` /
   `VITE_SUPABASE_ANON_KEY`.

`src/lib/supabaseClient.ts` exposes the configured client; the local
repository remains the active data layer for Phase 1.

## Key modules

- `src/lib/readiness.ts` - deterministic readiness score (rules engine v0)
- `src/lib/insights.ts` - explainable insight format (title, explanation,
  data used, rule triggered, confidence, recommended action)
- `src/lib/baseline.ts` - rolling baselines and acute:chronic training load
- `src/lib/demoData.ts` - seeded demo data generator
- `src/pages/` - Dashboard, check-in, workouts, supplements, weekly review,
  settings

## Scripts

```bash
npm run dev       # start dev server
npm run build     # type-check and build for production
npm run lint      # oxlint
npm run preview   # preview the production build
```

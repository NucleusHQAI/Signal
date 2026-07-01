# SIGNAL Technical Architecture

## Architecture principle

SIGNAL should be built around one central intelligence engine.

The interface, integrations and charts should all feed into or read from this engine.

## Suggested MVP architecture

```text
Client PWA
  |
  |-- Daily check-in
  |-- Workout logging
  |-- Supplement logging
  |-- Dashboard views
  |
Application layer
  |
  |-- Data normalisation
  |-- Validation
  |-- Rules engine
  |-- Score calculation
  |-- Insight generation
  |
Data layer (Supabase: Postgres + Auth)
  |
  |-- User profile
  |-- Daily metrics
  |-- Workouts
  |-- Supplements
  |-- Baselines
  |-- Insights
  |
External sources
  |
  |-- Fitbit
  |-- Google Health / Health Connect
  |-- Manual imports where APIs are limited
```

## Confirmed stack

- React
- TypeScript
- Vite (confirmed over Next.js: SIGNAL is a mobile-first PWA with no server-rendering requirement, and `docs/technical/04-build-commands.md` already scaffolds with `npm create vite@latest`)
- PWA support (e.g. `vite-plugin-pwa`)
- Supabase (Postgres + Auth) as the backend from day one — cloud sync is required from the start rather than deferred to Phase 2. Supabase's free tier (Postgres database, auth, storage, realtime) fits a solo prototype, and its relational Postgres model maps directly onto the entities in `docs/technical/01-data-model.md`
- Recharts for charts
- Lucide React for icons

Styling approach (Tailwind vs. inline styles / CSS Modules) is intentionally left open — there is no existing prototype aesthetic in this repo to preserve, so this should be decided when the PWA shell issue is started, not before.

## Key architectural decisions

### 1. Algorithms before AI

Core recommendations must be deterministic.

### 2. Explainability first

Every score should expose its inputs, weights and drivers.

### 3. Data confidence is a first-class concept

A score should be reduced or marked lower-confidence if data is missing, stale or manually estimated.

### 4. Manual fallback matters

The app should remain useful even when APIs are incomplete.

### 5. Integrations should be adapters

External data sources should be normalised into internal entities before being used by the rules engine.

## Main services / modules

### Data adapters

Convert source-specific data into SIGNAL's internal schema.

Examples:

- Fitbit sleep to `daily_metrics.sleep`
- Fitbit resting heart rate to `daily_metrics.resting_heart_rate`
- Manual mood check-in to `daily_checkins.mood`

### Baseline engine

Calculates user-specific norms.

Examples:

- 7-day average
- 28-day average
- Rolling standard deviation
- Personal high / low bands
- Minimum data requirement

### Rules engine

Applies deterministic rules to generate scores and recommendations.

### Insight engine

Converts score movement and rules into human-readable explanations.

### Dashboard layer

Displays daily, weekly and longer-term trends.

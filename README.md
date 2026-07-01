# SIGNAL

SIGNAL is a personal Health Operating System, not simply a health dashboard or workout tracker.

Its purpose is to combine health data, recovery, sleep, nutrition, supplements, mental wellbeing and adaptive training into a single explainable decision engine.

The application is intended to be a mobile-first Progressive Web App, with a desktop analytics experience for deeper review.

## Core philosophy

- Mobile-first
- Desktop for analysis
- Algorithms before AI
- Explainable recommendations
- User-specific baselines
- Evidence-informed logic
- Adaptive planning
- One central intelligence engine
- No dependency on LLMs or external AI APIs for core functionality

## Primary automated data sources

Initial automated sources should focus on:

- Fitbit
- Google Health / Health Connect, where supported

Manual inputs should cover the data that consumer wearables often miss:

- Mood
- Energy
- Stress
- Motivation
- Recovery
- Supplements
- Gym workouts
- Injuries
- Activities
- Journal entries
- Nutrition, where API access is unavailable or incomplete

## Product status

Phase 0 (product foundation) is complete: MVP scope, data model and tech stack are finalised.

Phase 1 (prototype without integrations) is in progress: `signal-app/` is a mobile-first PWA implementing the daily check-in, workout logging, supplement logging, demo data, readiness score v0, insight explanation format and weekly review described in `docs/roadmap/00-mvp-roadmap.md`.

## Repository structure

```text
docs/
  product/       Product bible, MVP scope, feature map and user journeys
  technical/     Architecture, data model, integrations and rules engine
  roadmap/       Phased plan and delivery sequence
  adr/           Architecture Decision Records

signal-app/      React + TypeScript + Vite PWA (Phase 1 prototype)

.github/
  ISSUE_TEMPLATE/  GitHub issue templates
```

See `signal-app/README.md` for how to run the app.

## Important product boundary

SIGNAL should not make medical claims. It should not diagnose, treat or replace professional medical advice.

It should help the user understand trends, patterns, recovery, training load and behaviour, while being transparent about data quality and confidence.

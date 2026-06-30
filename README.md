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

SIGNAL is currently in product-definition stage.

The first objective is to finalise the product scope, data model and deterministic intelligence engine before building the interface.

## Repository structure

```text
docs/
  product/       Product bible, MVP scope, feature map and user journeys
  technical/     Architecture, data model, integrations and rules engine
  roadmap/       Phased plan and delivery sequence
  adr/           Architecture Decision Records

.github/
  ISSUE_TEMPLATE/  GitHub issue templates
```

## Important product boundary

SIGNAL should not make medical claims. It should not diagnose, treat or replace professional medical advice.

It should help the user understand trends, patterns, recovery, training load and behaviour, while being transparent about data quality and confidence.

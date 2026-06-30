# ADR 0001: Rules Before AI

## Status

Accepted

## Context

SIGNAL is a personal Health Operating System that provides readiness, recovery and training recommendations.

The product could be built around AI-generated coaching, but that would make the core system harder to explain, harder to test and dependent on external services.

The product philosophy is algorithms before AI.

## Decision

SIGNAL will not rely on LLMs or external AI APIs for core functionality.

Core scoring and recommendations will be produced by deterministic systems:

- Rules
- Weighted scores
- Thresholds
- Rolling baselines
- Trend detection
- Data confidence checks

AI may be added later only as an optional enhancement for summarisation, language generation or coaching style.

## Consequences

Positive:

- Recommendations are explainable.
- The system can be tested.
- The product can work without AI costs.
- User trust is easier to build.
- Data privacy is easier to protect.

Negative:

- The app may initially feel less conversational.
- More product thinking is needed upfront.
- Rules will need ongoing refinement.

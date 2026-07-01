# SIGNAL MVP Scope

## MVP goal

Build the smallest useful version of SIGNAL that can:

1. Collect wearable and manual health data.
2. Calculate an explainable daily readiness score.
3. Track gym workouts and recovery.
4. Recommend whether to train, reduce load or recover.
5. Show weekly trends and drivers.

## MVP user promise

> SIGNAL helps me understand whether I should push, maintain, modify or recover today, and why.

## In scope for MVP, grouped by module

### Readiness module

- Baseline calculation per metric
- Readiness score, 0 to 100
- Status: Green, Amber, Red
- Data confidence modifier when inputs are missing or stale
- Top positive and negative drivers
- Suggested action (train, modify, recover)

### Training module

- Gym workout tracker: session, exercise, sets, reps, load, RPE, pain flag, duration
- Training load estimate from logged sessions
- Adaptive recommendation: proceed, reduce, or recover based on readiness
- Injury-aware substitution flag (surface the flag; exercise substitution logic can stay simple in MVP)
- Deload trigger when accumulated strain exceeds recovery trend

### Recovery module

- Fitbit / Google Health import where technically available: sleep, resting heart rate, HRV if available, steps, activity minutes
- Manual fallback for any wearable metric that is unavailable
- Recovery trend derived from sleep, resting heart rate, HRV and training load
- Injury / illness modifiers feeding the readiness score

### Mind module

- Daily check-in fields: mood, energy, motivation, stress, soreness, notes, sleep quality perception, training intent
- Injury flag and illness flag
- Mood / stress / motivation trend feeding readiness and weekly review

### Supplements module

- Supplement logging: name, dose, time, taken/missed, notes, perceived effect
- Adherence trend
- Correlation candidates, always shown with a "correlation is not causation" disclaimer

### Nutrition module

- Manual high-level logging only, used where Fitbit / Google Health nutrition data is unavailable or unreliable
- No full nutrition database or macro-tracking in MVP

### Insights module

- Insight format: signal, why it matters, recommended action, confidence level, data used
- Weekly review: training load trend, sleep trend, recovery trend, mood/stress trend, readiness average, completed/missed workouts, supplement adherence, key correlations, recommendation for next week

### Cross-cutting interface

- Mobile-first PWA shell and daily dashboard
- Check-in form, workout logging, supplement logging
- Weekly trends view and insight feed
- Settings for baselines and data sources

## Deferred features (post-MVP)

These are real candidates for later phases, not rejected ideas:

- Apple Health integration
- Garmin export / import workflow
- Runna-style running plan support
- Full nutrition database and macro analysis
- Goal-specific training blocks
- Longitudinal correlation explorer
- Optional AI summarisation layer (natural-language explanation only, never core scoring)
- Desktop analytics console
- Data export
- Backup / restore

## Non-goals (permanent product boundaries)

SIGNAL will not become any of these, in MVP or later:

- A medical device, or a source of diagnosis or treatment guidance
- A tool that makes medical claims
- A social fitness app or coaching marketplace
- A paid subscription product
- Dependent on an LLM or external AI API for core scoring or recommendations
- A black-box AI coach with no explainable logic
- A complex running plan builder or Body Battery clone
- An interpreter of sleep stages beyond what source data actually supports

## Build sequence

Agreed order for Phase 1 (prototype without integrations), each step buildable on the last:

1. Mobile-first PWA shell with local storage / mock backend
2. Daily check-in (Mind + Recovery capture)
3. Gym workout logging (Training module)
4. Supplement logging (Supplements module)
5. Demo data, so the product loop can be exercised before real integrations exist
6. Readiness score v0 (Readiness module, consumes 2 to 5)
7. Insight explanation format (Insights module, explains the score from step 6)
8. Weekly review view (Insights module, aggregates the above over time)

Real data import (Fitbit / Google Health, Phase 2) and adaptive training rules (Phase 3) follow only once this loop is proven with manual and demo data. See `docs/roadmap/00-mvp-roadmap.md` for the full phased plan.

## MVP success criteria

The MVP is successful if the user can answer these questions:

- How ready am I today?
- What is driving that score?
- Should I train as planned?
- What should I change if I am not recovered?
- Is my weekly training load increasing too quickly?
- Am I recovering well enough to keep progressing?
- Are mood, supplements, sleep or training patterns clearly affecting outcomes?

## Product risk

The biggest MVP risk is overbuilding.

SIGNAL should start with a small number of high-confidence metrics and make them useful before adding more data sources or advanced analytics.

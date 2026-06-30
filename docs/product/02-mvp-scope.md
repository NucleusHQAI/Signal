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

## In scope for MVP

### Data capture

- Manual daily check-in
- Manual gym workout logging
- Manual supplement logging
- Fitbit / Google Health data where technically available
- Manual fallback for missing wearable metrics

### Intelligence

- Baseline calculation
- Readiness score
- Training load estimate
- Recovery trend
- Injury / illness modifiers
- Explainable daily recommendation
- Weekly review summary

### Interface

- Mobile-first daily dashboard
- Check-in form
- Workout logging
- Supplement logging
- Weekly trends
- Insight feed
- Settings for baselines and data sources

## Out of scope for MVP

- Medical claims
- Diagnosis or treatment guidance
- Social features
- Coaching marketplace
- Paid subscriptions
- Full nutrition database
- Full Apple Health support unless chosen as the primary platform
- AI-generated recommendations
- LLM dependency
- Complex running plan builder
- Body Battery clone
- Sleep stage interpretation beyond what source data supports

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

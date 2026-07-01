# SIGNAL MVP Roadmap

## Phase 0: Product foundation

Goal: turn the concept into a buildable specification.

Tasks:

- Finalise MVP feature list
- Finalise internal data model
- Confirm first integration strategy
- Define readiness score v0
- Define training load v0
- Define dashboard information hierarchy
- Confirm tech stack

Exit criteria:

- Product bible completed
- MVP scope agreed
- Initial GitHub issues created
- No major open questions blocking build

## Phase 1: Prototype without integrations

Goal: prove the product loop before fighting APIs.

Tasks:

- Build mobile-first PWA shell
- Set up Supabase (Postgres + Auth) for storage and cross-device sync
- Add daily check-in
- Add workout logging
- Add supplement logging
- Add demo data
- Implement readiness score v0
- Implement insight explanation format
- Build weekly review view

Exit criteria:

- User can complete a daily check-in
- User can log a workout
- User can see a readiness score
- User can see why the score changed
- User can see a weekly trend

## Phase 2: Real data import

Goal: connect automated health data.

Tasks:

- Implement Fitbit OAuth
- Import sleep
- Import resting heart rate
- Import activity / steps
- Import workout sessions where available
- Build data quality flags
- Merge manual and automated data

Exit criteria:

- Wearable data populates daily metrics
- Readiness score uses real data
- Missing data is handled transparently

## Phase 3: Adaptive training

Goal: make SIGNAL useful for daily training decisions.

Tasks:

- Add planned workouts
- Add adaptive recommendation rules
- Add deload logic
- Add injury-aware modification rules
- Add progression suggestions
- Add weekly training review

Exit criteria:

- SIGNAL can recommend train / modify / recover
- Recommendations are explainable
- Training progression is tracked

## Phase 4: Desktop analytics

Goal: support deeper review.

Tasks:

- Add desktop dashboard
- Add longer-term trend views
- Add correlation explorer
- Add supplement adherence view
- Add export options

Exit criteria:

- User can review trends across weeks and months
- User can inspect correlations without medical claims

# SIGNAL Feature Map

## MVP features

### 1. Daily check-in

Purpose: capture subjective context that wearables miss.

Fields:

- Mood
- Energy
- Motivation
- Stress
- Soreness
- Injury flag
- Illness flag
- Notes
- Sleep quality perception
- Training intent for the day

### 2. Health data import

Purpose: bring automated data into SIGNAL.

Initial sources:

- Fitbit
- Google Health / Health Connect, depending on available device and platform
- Manual fallback where APIs are limited

Priority metrics:

- Sleep duration
- Resting heart rate
- HRV, if available
- Steps
- Activity minutes
- Workout history
- Calories, only if available and useful
- Nutrition, only if available and reliable

### 3. Readiness score

Purpose: provide a daily training and recovery signal.

Suggested components:

- Sleep component
- Resting heart rate component
- HRV component, if available
- Training load component
- Stress component
- Mood / subjective component
- Injury / illness penalty
- Data confidence modifier

Output:

- Readiness score from 0 to 100
- Status: Green, Amber, Red
- Explanation of top positive and negative drivers
- Suggested action

### 4. Adaptive workout planning

Purpose: adjust training recommendations based on readiness, recovery and recent load.

MVP behaviour:

- Green readiness: proceed as planned or progress slightly
- Amber readiness: reduce volume, intensity or exercise selection
- Red readiness: recovery session, mobility, walk or rest
- Injury flag: remove risky movements and suggest safer alternatives
- Deload trigger: reduce load when accumulated strain exceeds recovery trend

### 5. Gym workout tracker

Purpose: track strength training in enough detail to support progression.

Fields:

- Date
- Workout type
- Exercise
- Sets
- Reps
- Load
- RPE
- Notes
- Pain / discomfort flag
- Session duration

### 6. Supplement tracker

Purpose: track supplement usage and possible patterns.

Fields:

- Supplement name
- Dose
- Time
- Taken / missed
- Notes
- Side effects or perceived impact

Output:

- Adherence trend
- Correlation candidates
- Warnings that correlation is not causation

### 7. Insights feed

Purpose: translate scores and trends into understandable actions.

Insight format:

- Signal
- Why it matters
- Recommended action
- Confidence level
- Data used

### 8. Weekly review

Purpose: move beyond daily noise.

Weekly view should show:

- Training load trend
- Sleep trend
- Recovery trend
- Mood / stress trend
- Readiness average
- Missed workouts
- Completed workouts
- Supplement adherence
- Key correlations
- Recommendation for next week

## Later features

- Apple Health integration
- Garmin export/import workflow
- Runna-style running plan support
- More advanced nutrition analysis
- Goal-specific training blocks
- Longitudinal correlation explorer
- Optional AI summarisation layer
- Desktop analytics console
- Data export
- Backup / restore

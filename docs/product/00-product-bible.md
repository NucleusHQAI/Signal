# SIGNAL Product Bible

## 1. Product definition

SIGNAL is a personal Health Operating System.

It is designed to help one user understand how sleep, recovery, training, mood, supplements, nutrition and lifestyle interact over time.

It should answer:

> What is my body telling me, what should I adjust today, and how is my long-term health and training trend changing?

## 2. Product philosophy

SIGNAL should be:

- Explainable, not mysterious
- Adaptive, not generic
- Evidence-informed, not pseudo-scientific
- Personalised through baselines, not population averages alone
- Useful daily, but more powerful over weeks and months
- Honest about data quality and confidence
- Built around deterministic logic before AI

## 3. Non-negotiables

SIGNAL must not rely on LLMs or external AI APIs for core functionality.

Core insights must come from:

- Rules
- Thresholds
- Weighted scoring
- Rolling averages
- User-specific baselines
- Trend detection
- Data completeness checks
- Explainable recommendation logic

AI can be considered later only as an optional layer for summarisation, coaching tone or natural-language explanation.

## 4. Core product pillars

### Capture

Collect automated and manual health signals in one place.

### Interpret

Turn raw data into meaningful, explainable scores and trends.

### Decide

Recommend daily adjustments to training, recovery and lifestyle.

### Learn

Adapt thresholds and baselines over time.

### Review

Help the user understand patterns across weeks, months and training blocks.

## 5. Core modules

### Readiness

Daily indication of how prepared the user appears to be for training or higher strain.

Inputs may include:

- Sleep duration
- Sleep quality
- Resting heart rate
- HRV, if available
- Recent training load
- Stress
- Mood
- Soreness
- Injury status
- Manual recovery score

### Training

Plans and records gym workouts, cardio, activities and overall load.

The training module should support:

- Planned sessions
- Completed sessions
- Exercise library
- Sets, reps, weight, RPE
- Session duration
- Session strain
- Progressive overload
- Deload logic
- Injury-aware substitutions

### Recovery

Tracks whether the user is coping with training and life load.

Inputs may include:

- Sleep
- Resting heart rate
- HRV
- Stress
- Mood
- Soreness
- Steps
- Training load
- Manual check-ins

### Mind

Tracks mental wellbeing and subjective state.

Inputs may include:

- Mood
- Stress
- Motivation
- Energy
- Journal entries
- Notes about work, travel, alcohol, illness or life events

### Supplements

Tracks supplement usage and possible correlations over time.

The product should not claim supplement efficacy. It should show associations and patterns only.

### Nutrition

Where possible, nutrition should use Google Health or another available data source.

If automated nutrition is unavailable or incomplete, SIGNAL should support manual logging for high-level categories.

### Insights

Explains what changed, why a score moved, and what action is recommended.

Every insight should answer:

- What changed?
- Why does it matter?
- What should I do?
- How confident is SIGNAL?

## 6. Product boundaries

SIGNAL should not become:

- A generic fitness tracker
- A medical device
- A social fitness app
- A calorie obsession tool
- A black-box AI coach
- A dashboard with no decision-making layer

## 7. Design direction

Dark clinical precision.

The design should feel like a high-end biometric monitoring terminal, not a generic wellness app.

Suggested palette:

- Background: `#060F1C`
- Card: `#0C1B2E`
- Raised surface: `#112540`
- Borders: `rgba(148,163,184,0.09)`
- Health accent: `#22D3EE`
- Mind accent: `#A78BFA`
- Supplement accent: `#FBBF24`
- Correlations accent: `#34D399`
- Text: `#CBD5E1`
- Bright text: `#F1F5F9`
- Muted text: `#64748B`
- Red: `#F87171`

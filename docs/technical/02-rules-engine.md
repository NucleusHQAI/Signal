# SIGNAL Rules Engine

## Purpose

The rules engine is the core of SIGNAL.

It converts health data, manual check-ins and training history into explainable scores and recommendations.

## Design principles

- Deterministic
- Transparent
- Adjustable
- Personal baseline-led
- Honest about missing data
- Conservative when injury, illness or low recovery is present

## Readiness score structure

Suggested initial weighting:

```text
Sleep:               25%
Resting heart rate:  15%
HRV:                 15%
Training load:       15%
Stress:              10%
Mood / energy:       10%
Soreness:             5%
Injury / illness:     5%
```

If HRV is unavailable, redistribute its weight across sleep, resting heart rate and subjective recovery.

## Status bands

```text
Green: 75 to 100
Amber: 50 to 74
Red:   0 to 49
```

These should become user-specific over time.

## Example rules

### Sleep duration

- If sleep is above 90% of baseline, score positively.
- If sleep is 75% to 90% of baseline, score neutrally or slightly negatively.
- If sleep is below 75% of baseline, score negatively.

### Resting heart rate

- If resting heart rate is meaningfully above baseline, reduce readiness.
- If resting heart rate is near baseline, neutral.
- If resting heart rate is below or close to baseline with good sleep, positive.

### HRV

- If HRV is above baseline, positive.
- If HRV is materially below baseline, negative.
- If HRV data is missing, mark the score as lower confidence rather than pretending it exists.

### Training load

- If acute load has increased sharply versus recent baseline, reduce readiness.
- If acute load is stable and recovery is good, neutral or positive.
- If acute load is high and sleep/mood is poor, recommend reducing intensity.

### Mood / stress

- Low mood, low energy or high stress should reduce readiness.
- Subjective data should be treated as important, not secondary.

### Injury or illness

- Injury flag should cap readiness and force modified recommendations.
- Illness flag should heavily reduce readiness and recommend rest or very light activity.

## Data confidence rules

A readiness score should have confidence attached:

### High confidence

- Sleep available
- Resting heart rate available
- Recent training data available
- Daily check-in completed

### Medium confidence

- One important signal missing
- Manual fallback used for some fields

### Low confidence

- Multiple important signals missing
- No check-in
- No recent wearable data

## Recommendation examples

### Green

Proceed with planned session. Consider normal progression if the same movement pattern is pain-free and recent load has been stable.

### Amber

Train, but reduce either intensity or volume. Prioritise technique, avoid maximal efforts and monitor soreness.

### Red

Prioritise recovery. Consider walking, mobility, stretching or rest. Do not progress load today.

## Explainability requirement

Every generated recommendation must include:

- Top positive driver
- Top negative driver
- Data confidence
- Rule that triggered the recommendation

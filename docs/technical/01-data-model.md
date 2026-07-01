# SIGNAL Data Model

This is the Phase 0 data model, refined and ready to build against.

Entities map 1:1 to Supabase Postgres tables (snake_case columns), with `userId` referencing Supabase Auth's `auth.users.id`.

## User

```ts
type User = {
  id: string
  createdAt: string
  timezone: string
  units: 'metric' | 'imperial'
  dateOfBirth?: string
  sex?: string
  heightCm?: number
  weightKg?: number
}
```

## DailyMetric

Automated or imported daily wearable data.

```ts
type DailyMetric = {
  id: string
  userId: string
  date: string

  sleepDurationMinutes?: number
  sleepScore?: number
  restingHeartRate?: number
  hrvRmssd?: number
  steps?: number
  activeMinutes?: number
  caloriesBurned?: number
  stressScore?: number

  source: 'fitbit' | 'google_health' | 'manual' | 'estimated' | 'import'
  recordedAt: string
  dataCompleteness: number
  confidence: 'high' | 'medium' | 'low'
}
```

## DailyCheckIn

Manual subjective data.

```ts
type DailyCheckIn = {
  id: string
  userId: string
  date: string

  mood: number
  energy: number
  motivation: number
  stress: number
  soreness: number
  sleepQuality: number

  injuryFlag: boolean
  illnessFlag: boolean
  alcoholFlag?: boolean
  travelFlag?: boolean

  notes?: string
}
```

## WorkoutSession

```ts
type WorkoutSession = {
  id: string
  userId: string
  date: string

  planned: boolean
  completed: boolean
  type: 'strength' | 'cardio' | 'mobility' | 'sport' | 'other'

  title: string
  durationMinutes?: number
  sessionRpe?: number
  estimatedLoad?: number

  painFlag?: boolean
  notes?: string
}
```

## WorkoutExercise

```ts
type WorkoutExercise = {
  id: string
  workoutSessionId: string

  exerciseName: string
  bodyRegion?: string
  movementPattern?: string

  sets: number
  reps?: number
  loadKg?: number
  rpe?: number
  painFlag?: boolean
  notes?: string
}
```

## SupplementLog

```ts
type SupplementLog = {
  id: string
  userId: string
  date: string

  supplementName: string
  dose?: string
  timeTaken?: string
  taken: boolean

  perceivedEffect?: number
  sideEffectFlag?: boolean
  notes?: string
}
```

## Baseline

```ts
type Baseline = {
  id: string
  userId: string
  metricName: string

  periodDays: number
  mean: number
  standardDeviation?: number
  lowBand?: number
  highBand?: number
  minimumViableDataPoints: number

  calculatedAt: string
}
```

## ReadinessScore

```ts
type ReadinessScore = {
  id: string
  userId: string
  date: string

  score: number
  status: 'green' | 'amber' | 'red'
  confidence: 'high' | 'medium' | 'low'

  components: {
    sleep?: number
    restingHeartRate?: number
    hrv?: number
    trainingLoad?: number
    stress?: number
    mood?: number
    soreness?: number
    injuryIllness?: number
  }

  // Actual weight (%) applied to each component for this score, after any
  // redistribution (e.g. HRV missing redistributes its weight elsewhere)
  weightsUsed: {
    sleep?: number
    restingHeartRate?: number
    hrv?: number
    trainingLoad?: number
    stress?: number
    mood?: number
    soreness?: number
    injuryIllness?: number
  }

  positiveDrivers: string[]
  negativeDrivers: string[]
  triggeredRules: string[]
  recommendation: string
}
```

## Insight

```ts
type Insight = {
  id: string
  userId: string
  date: string

  category: 'readiness' | 'training' | 'recovery' | 'mind' | 'supplements' | 'nutrition'
  severity: 'info' | 'positive' | 'warning' | 'critical'

  title: string
  explanation: string
  recommendedAction?: string

  dataUsed: string[]
  confidence: 'high' | 'medium' | 'low'
}
```

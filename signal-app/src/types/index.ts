// Core SIGNAL entities, mirroring docs/technical/01-data-model.md 1:1.
// Entities map to Supabase Postgres tables (snake_case columns) when a
// project is configured; the local repository keeps the same shape.

export type Units = 'metric' | 'imperial'

export type User = {
  id: string
  createdAt: string
  timezone: string
  units: Units
  dateOfBirth?: string
  sex?: string
  heightCm?: number
  weightKg?: number
}

export type DataSource = 'fitbit' | 'google_health' | 'manual' | 'estimated' | 'import'
export type Confidence = 'high' | 'medium' | 'low'

export type DailyMetric = {
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

  source: DataSource
  recordedAt: string
  dataCompleteness: number
  confidence: Confidence
}

export type DailyCheckIn = {
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

export type WorkoutType = 'strength' | 'cardio' | 'mobility' | 'sport' | 'other'

export type WorkoutSession = {
  id: string
  userId: string
  date: string

  planned: boolean
  completed: boolean
  type: WorkoutType

  title: string
  durationMinutes?: number
  sessionRpe?: number
  estimatedLoad?: number

  painFlag?: boolean
  notes?: string
}

export type WorkoutExercise = {
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

export type SupplementLog = {
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

export type Baseline = {
  id: string
  userId: string
  metricName: string

  periodDays: number
  mean: number
  standardDeviation?: number
  lowBand?: number
  highBand?: number
  minimumViableDataPoints: number
  dataPointsUsed: number

  calculatedAt: string
}

// Derived training-load context (acute/chronic load, ACWR, monotony, strain).
// Kept distinct from Baseline: a baseline is a mean/SD norm for a metric,
// this is a set of load-ratio metrics computed from recent session history.
export type TrainingLoadMetric = {
  id: string
  userId: string
  date: string

  acuteLoad: number
  chronicLoad: number
  acwr?: number
  monotony?: number
  strain?: number
  weeklyLoadChange?: number
  dataPointsUsed: number

  calculatedAt: string
}

export type ReadinessStatus = 'green' | 'amber' | 'red'

export type ReadinessComponents = {
  sleep?: number
  restingHeartRate?: number
  hrv?: number
  trainingLoad?: number
  stress?: number
  mood?: number
  soreness?: number
  injuryIllness?: number
}

export type ReadinessScore = {
  id: string
  userId: string
  date: string

  score: number
  status: ReadinessStatus
  confidence: Confidence

  components: ReadinessComponents

  // Actual weight (%) applied to each component for this score, after any
  // redistribution (e.g. HRV missing redistributes its weight elsewhere)
  weightsUsed: ReadinessComponents

  positiveDrivers: string[]
  negativeDrivers: string[]
  triggeredRules: string[]
  recommendation: string
}

export type InsightCategory = 'readiness' | 'training' | 'recovery' | 'mind' | 'supplements' | 'nutrition'
export type InsightSeverity = 'info' | 'positive' | 'warning' | 'critical'

export type Insight = {
  id: string
  userId: string
  date: string

  category: InsightCategory
  severity: InsightSeverity

  title: string
  explanation: string
  recommendedAction?: string

  dataUsed: string[]
  confidence: Confidence
}

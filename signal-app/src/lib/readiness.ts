import type {
  Confidence,
  DailyCheckIn,
  DailyMetric,
  ReadinessComponents,
  ReadinessScore,
  ReadinessStatus,
  WorkoutSession,
} from '../types'
import { computeAcwr, computeBaseline } from './baseline'

// Check-in fields are captured on a 1-5 scale (see CheckInPage). For mood,
// energy, motivation and sleepQuality, 5 is best; for stress and soreness,
// 5 is worst.
const CHECK_IN_SCALE_MAX = 5

// Suggested initial weighting from docs/technical/02-rules-engine.md.
const BASE_WEIGHTS: Required<ReadinessComponents> = {
  sleep: 25,
  restingHeartRate: 15,
  hrv: 15,
  trainingLoad: 15,
  stress: 10,
  mood: 10,
  soreness: 5,
  injuryIllness: 5,
}

const STATUS_BANDS: Array<{ status: ReadinessStatus; min: number }> = [
  { status: 'green', min: 75 },
  { status: 'amber', min: 50 },
  { status: 'red', min: 0 },
]

function statusForScore(score: number): ReadinessStatus {
  return STATUS_BANDS.find((band) => score >= band.min)?.status ?? 'red'
}

function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value))
}

/** Maps "value as a ratio of baseline" onto a 0-100 score via the bands in the rules-engine doc. */
function ratioToScore(ratio: number): number {
  if (ratio >= 0.9) return clamp(70 + (ratio - 0.9) * 300)
  if (ratio >= 0.75) return clamp(40 + (ratio - 0.75) * 200)
  return clamp(ratio / 0.75 * 40)
}

type ComponentResult = {
  score: number | undefined
  driver?: string
  rule?: string
}

function scoreSleep(metric: DailyMetric | undefined, baselineMean: number | undefined): ComponentResult {
  if (!metric?.sleepDurationMinutes || !baselineMean) return { score: undefined }
  const ratio = metric.sleepDurationMinutes / baselineMean
  const score = ratioToScore(ratio)
  const pct = Math.round(ratio * 100)
  const hours = (metric.sleepDurationMinutes / 60).toFixed(1)
  const baselineHours = (baselineMean / 60).toFixed(1)
  return {
    score,
    driver: `Sleep: ${hours}h vs ${baselineHours}h baseline (${pct}%)`,
    rule: ratio < 0.75 ? 'Sleep below 75% of baseline' : undefined,
  }
}

function scoreRestingHeartRate(
  metric: DailyMetric | undefined,
  baselineMean: number | undefined,
  baselineSd: number | undefined,
): ComponentResult {
  if (metric?.restingHeartRate == null || baselineMean == null) return { score: undefined }
  const sd = baselineSd && baselineSd > 0 ? baselineSd : baselineMean * 0.05
  const z = (metric.restingHeartRate - baselineMean) / sd
  // Higher RHR than baseline is bad; at/below baseline is good or neutral.
  const score = clamp(70 - z * 25)
  return {
    score,
    driver: `Resting heart rate: ${metric.restingHeartRate} vs ${Math.round(baselineMean)} baseline`,
    rule: z >= 1 ? 'Resting heart rate meaningfully above baseline' : undefined,
  }
}

function scoreHrv(metric: DailyMetric | undefined, baselineMean: number | undefined, baselineSd: number | undefined): ComponentResult {
  if (metric?.hrvRmssd == null || baselineMean == null) return { score: undefined }
  const sd = baselineSd && baselineSd > 0 ? baselineSd : baselineMean * 0.1
  const z = (metric.hrvRmssd - baselineMean) / sd
  const score = clamp(50 + z * 25)
  return {
    score,
    driver: `HRV: ${metric.hrvRmssd} vs ${Math.round(baselineMean)} baseline`,
    rule: z <= -1 ? 'HRV materially below baseline' : undefined,
  }
}

function scoreTrainingLoad(recentLoads: number[]): ComponentResult {
  const { ratio } = computeAcwr(recentLoads)
  if (ratio == null) return { score: undefined }
  let score = 80
  let rule: string | undefined
  if (ratio > 1.5) {
    score = 25
    rule = 'Acute training load sharply above chronic baseline (ACWR > 1.5)'
  } else if (ratio > 1.3) {
    score = 50
    rule = 'Acute training load elevated versus chronic baseline (ACWR > 1.3)'
  } else if (ratio < 0.5) {
    score = 70
  }
  return {
    score,
    driver: `Training load ratio (acute:chronic): ${ratio.toFixed(2)}`,
    rule,
  }
}

function scoreStress(checkIn: DailyCheckIn | undefined): ComponentResult {
  if (!checkIn) return { score: undefined }
  const score = clamp(((CHECK_IN_SCALE_MAX - checkIn.stress) / (CHECK_IN_SCALE_MAX - 1)) * 100)
  return {
    score,
    driver: `Stress: ${checkIn.stress}/${CHECK_IN_SCALE_MAX}`,
    rule: checkIn.stress >= 4 ? 'High self-reported stress' : undefined,
  }
}

function scoreMood(checkIn: DailyCheckIn | undefined): ComponentResult {
  if (!checkIn) return { score: undefined }
  const average = (checkIn.mood + checkIn.energy + checkIn.motivation) / 3
  const score = clamp(((average - 1) / (CHECK_IN_SCALE_MAX - 1)) * 100)
  return {
    score,
    driver: `Mood/energy/motivation average: ${average.toFixed(1)}/${CHECK_IN_SCALE_MAX}`,
    rule: average <= 2 ? 'Low mood, energy or motivation' : undefined,
  }
}

function scoreSoreness(checkIn: DailyCheckIn | undefined): ComponentResult {
  if (!checkIn) return { score: undefined }
  const score = clamp(((CHECK_IN_SCALE_MAX - checkIn.soreness) / (CHECK_IN_SCALE_MAX - 1)) * 100)
  return {
    score,
    driver: `Soreness: ${checkIn.soreness}/${CHECK_IN_SCALE_MAX}`,
    rule: checkIn.soreness >= 4 ? 'High self-reported soreness' : undefined,
  }
}

function scoreInjuryIllness(checkIn: DailyCheckIn | undefined): ComponentResult {
  if (!checkIn) return { score: undefined }
  if (checkIn.illnessFlag) {
    return { score: 0, driver: 'Illness flagged today', rule: 'Illness flag heavily reduces readiness' }
  }
  if (checkIn.injuryFlag) {
    return { score: 40, driver: 'Injury flagged today', rule: 'Injury flag caps readiness and forces modified recommendation' }
  }
  return { score: 100 }
}

export type ReadinessInput = {
  date: string
  metric: DailyMetric | undefined
  checkIn: DailyCheckIn | undefined
  /** Most-recent-first history, used to build baselines. */
  metricHistory: DailyMetric[]
  sessionHistory: WorkoutSession[]
}

function recommendationFor(status: ReadinessStatus, checkIn: DailyCheckIn | undefined): string {
  if (checkIn?.illnessFlag) {
    return 'Illness flagged: prioritise recovery. Rest or very light activity only, do not train as planned.'
  }
  if (checkIn?.injuryFlag) {
    return 'Injury flagged: modify today\'s session. Avoid the affected movement pattern and any maximal effort.'
  }
  if (status === 'green') {
    return 'Proceed with planned session. Consider normal progression if the same movement pattern is pain-free and recent load has been stable.'
  }
  if (status === 'amber') {
    return 'Train, but reduce either intensity or volume. Prioritise technique, avoid maximal efforts and monitor soreness.'
  }
  return 'Prioritise recovery. Consider walking, mobility, stretching or rest. Do not progress load today.'
}

export function calculateReadinessScore(input: ReadinessInput): Omit<ReadinessScore, 'id' | 'userId'> {
  const sleepBaseline = computeBaseline(
    input.metricHistory.map((m) => m.sleepDurationMinutes).filter((v): v is number => v != null),
    28,
  )
  const rhrValues = input.metricHistory.map((m) => m.restingHeartRate).filter((v): v is number => v != null)
  const rhrBaseline = computeBaseline(rhrValues, 28)
  const hrvValues = input.metricHistory.map((m) => m.hrvRmssd).filter((v): v is number => v != null)
  const hrvBaseline = computeBaseline(hrvValues, 28)
  const recentLoads = input.sessionHistory
    .filter((s) => s.completed)
    .map((s) => s.estimatedLoad ?? 0)

  const results: Record<keyof ReadinessComponents, ComponentResult> = {
    sleep: scoreSleep(input.metric, sleepBaseline?.mean),
    restingHeartRate: scoreRestingHeartRate(input.metric, rhrBaseline?.mean, rhrBaseline?.standardDeviation),
    hrv: scoreHrv(input.metric, hrvBaseline?.mean, hrvBaseline?.standardDeviation),
    trainingLoad: scoreTrainingLoad(recentLoads),
    stress: scoreStress(input.checkIn),
    mood: scoreMood(input.checkIn),
    soreness: scoreSoreness(input.checkIn),
    injuryIllness: scoreInjuryIllness(input.checkIn),
  }

  const available = (Object.keys(BASE_WEIGHTS) as Array<keyof ReadinessComponents>).filter(
    (key) => results[key].score != null,
  )
  const missingWeight = (Object.keys(BASE_WEIGHTS) as Array<keyof ReadinessComponents>)
    .filter((key) => !available.includes(key))
    .reduce((sum, key) => sum + BASE_WEIGHTS[key], 0)
  const availableWeightTotal = available.reduce((sum, key) => sum + BASE_WEIGHTS[key], 0)

  const weightsUsed: ReadinessComponents = {}
  const components: ReadinessComponents = {}
  let weightedScore = 0

  for (const key of available) {
    // Missing weight is redistributed proportionally across whatever data is
    // available (this generalises the doc's "HRV missing -> redistribute
    // across sleep, resting heart rate and subjective recovery" rule to any
    // combination of missing signals).
    const redistributed = availableWeightTotal > 0 ? (BASE_WEIGHTS[key] / availableWeightTotal) * missingWeight : 0
    const weight = BASE_WEIGHTS[key] + redistributed
    weightsUsed[key] = Math.round(weight * 10) / 10
    components[key] = Math.round(results[key].score!)
    weightedScore += (results[key].score! * weight) / 100
  }

  const score = available.length > 0 ? Math.round(clamp(weightedScore)) : 50
  const status = statusForScore(score)

  const positiveDrivers: string[] = []
  const negativeDrivers: string[] = []
  const triggeredRules: string[] = []

  for (const key of available) {
    const result = results[key]
    if (!result.driver) continue
    if ((result.score ?? 0) >= 65) positiveDrivers.push(result.driver)
    else if ((result.score ?? 0) <= 45) negativeDrivers.push(result.driver)
    if (result.rule) triggeredRules.push(result.rule)
  }

  let confidence: Confidence = 'high'
  if (!input.checkIn || !input.metric?.restingHeartRate) confidence = 'low'
  else if (missingWeight > 0) confidence = 'medium'
  if (!input.checkIn && (input.metric == null || missingWeight >= 40)) confidence = 'low'

  return {
    date: input.date,
    score,
    status,
    confidence,
    components,
    weightsUsed,
    positiveDrivers,
    negativeDrivers,
    triggeredRules,
    recommendation: recommendationFor(status, input.checkIn),
  }
}

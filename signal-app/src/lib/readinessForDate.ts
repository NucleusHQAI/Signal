import { repository, DEMO_USER_ID } from './repository'
import { calculateReadinessScore } from './readiness'
import type { Baseline, ReadinessScore, TrainingLoadMetric } from '../types'

// Deterministic ids so recomputing a score/baseline/training-load metric
// overwrites the same record instead of accumulating duplicates in storage.
function readinessId(date: string): string {
  return `readiness:${DEMO_USER_ID}:${date}`
}

function baselineId(metricName: string, periodDays: number): string {
  return `baseline:${DEMO_USER_ID}:${metricName}:${periodDays}`
}

function trainingLoadId(date: string): string {
  return `trainingLoad:${DEMO_USER_ID}:${date}`
}

export function computeReadinessForDate(date: string): ReadinessScore {
  const allMetrics = repository.listDailyMetrics()
  const allSessions = repository.listWorkoutSessions()

  const metric = allMetrics.find((m) => m.date === date)
  const checkIn = repository.getDailyCheckIn(date)
  // Baselines and training-load history describe the days leading into
  // today - they must not include today's own values.
  const metricHistory = allMetrics.filter((m) => m.date < date)
  const sessionHistory = allSessions.filter((s) => s.date < date)

  const result = calculateReadinessScore({ date, metric, checkIn, metricHistory, sessionHistory })

  // Persist the secondary (personal-context) layer this calculation
  // produced, so it can be shown as "your baseline, calculated from N
  // readings" rather than only ever existing as a fresh recompute.
  result.baselines.forEach((baseline) => {
    const persisted: Baseline = { id: baselineId(baseline.metricName, baseline.periodDays), userId: DEMO_USER_ID, ...baseline }
    repository.upsertBaseline(persisted)
  })
  if (result.trainingLoad) {
    const persisted: TrainingLoadMetric = { id: trainingLoadId(date), userId: DEMO_USER_ID, ...result.trainingLoad }
    repository.upsertTrainingLoadMetric(persisted)
  }

  const score: ReadinessScore = { id: readinessId(date), userId: DEMO_USER_ID, ...result.readiness }
  repository.upsertReadinessScore(score)
  return score
}

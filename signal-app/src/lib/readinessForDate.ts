import { repository, DEMO_USER_ID } from './repository'
import { calculateReadinessScore } from './readiness'
import type { ReadinessScore } from '../types'

// Deterministic per-day id so recomputing a score overwrites the same
// record instead of accumulating duplicates in storage.
function readinessId(date: string): string {
  return `readiness:${DEMO_USER_ID}:${date}`
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

  const score: ReadinessScore = { id: readinessId(date), userId: DEMO_USER_ID, ...result }
  repository.upsertReadinessScore(score)
  return score
}

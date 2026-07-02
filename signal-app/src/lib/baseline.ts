// Baseline engine - user-specific norms per docs/technical/00-architecture.md
// and docs/technical/02-rules-engine.md. Deliberately simple for v0: rolling
// mean/SD over a trailing window, with a minimum-data-point guard so a
// baseline is never asserted from too little history.

export type BaselineStats = {
  mean: number
  standardDeviation?: number
  lowBand?: number
  highBand?: number
  count: number
}

export const DEFAULT_MINIMUM_DATA_POINTS = 5

/**
 * `series` is ordered most-recent-first, one entry per day (gaps allowed).
 * Only the most recent `periodDays` values are used.
 */
export function computeBaseline(
  series: number[],
  periodDays: number,
  minimumViableDataPoints = DEFAULT_MINIMUM_DATA_POINTS,
): BaselineStats | null {
  const window = series.slice(0, periodDays)
  if (window.length < minimumViableDataPoints) return null

  const mean = window.reduce((sum, value) => sum + value, 0) / window.length

  if (window.length < 2) {
    return { mean, count: window.length }
  }

  const variance = window.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (window.length - 1)
  const standardDeviation = Math.sqrt(variance)

  return {
    mean,
    standardDeviation,
    lowBand: mean - standardDeviation,
    highBand: mean + standardDeviation,
    count: window.length,
  }
}

export type TrainingLoadStats = {
  acuteLoad: number
  chronicLoad: number
  acwr: number | null
  monotony: number | null
  strain: number | null
  weeklyLoadChange: number | null
  count: number
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0)
}

/**
 * Derived training-load context (acute/chronic load, ACWR, monotony, strain,
 * week-over-week change), distinct from a mean/SD Baseline. `recentLoads` is
 * ordered most-recent-first, one entry per completed session; acute (7) and
 * chronic (28) windows approximate calendar days by session count.
 */
export function computeTrainingLoadMetric(recentLoads: number[]): TrainingLoadStats {
  if (recentLoads.length === 0) {
    return { acuteLoad: 0, chronicLoad: 0, acwr: null, monotony: null, strain: null, weeklyLoadChange: null, count: 0 }
  }

  const acuteWindow = recentLoads.slice(0, 7)
  const chronicWindow = recentLoads.slice(0, 28)
  const priorWeekWindow = recentLoads.slice(7, 14)

  const acuteLoad = sum(acuteWindow) / 7
  const chronicLoad = sum(chronicWindow) / 28
  const acwr = chronicLoad > 0 ? acuteLoad / chronicLoad : null

  const weeklyTotal = sum(acuteWindow)
  const acuteMean = weeklyTotal / acuteWindow.length
  const acuteVariance = acuteWindow.reduce((total, value) => total + (value - acuteMean) ** 2, 0) / acuteWindow.length
  const acuteSd = Math.sqrt(acuteVariance)
  // Foster's monotony: mean daily load / SD of daily load over the same window.
  const monotony = acuteSd > 0 ? acuteMean / acuteSd : null
  const strain = monotony != null ? weeklyTotal * monotony : null

  const priorWeekTotal = sum(priorWeekWindow)
  const weeklyLoadChange = priorWeekTotal > 0 ? (weeklyTotal - priorWeekTotal) / priorWeekTotal : null

  return { acuteLoad, chronicLoad, acwr, monotony, strain, weeklyLoadChange, count: recentLoads.length }
}

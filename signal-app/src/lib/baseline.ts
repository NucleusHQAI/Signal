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

const DEFAULT_MINIMUM_DATA_POINTS = 5

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

/** Acute (7-day) vs chronic (28-day) workload ratio, used for training-load readiness. */
export function computeAcwr(dailyLoads: number[]): { acute: number; chronic: number; ratio: number | null } {
  const acuteWindow = dailyLoads.slice(0, 7)
  const chronicWindow = dailyLoads.slice(0, 28)

  const acute = acuteWindow.reduce((sum, value) => sum + value, 0) / 7
  const chronic = chronicWindow.reduce((sum, value) => sum + value, 0) / 28

  if (chronic <= 0) return { acute, chronic, ratio: null }
  return { acute, chronic, ratio: acute / chronic }
}

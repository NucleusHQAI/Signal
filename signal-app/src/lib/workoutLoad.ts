import type { WorkoutExercise, WorkoutSession } from '../types'

/**
 * Estimated session load, per docs/product/02-mvp-scope.md ("training load
 * estimate from logged sessions"). Prefers session-RPE x duration (Foster's
 * method, the standard simple training-load proxy); falls back to summed
 * exercise tonnage x RPE when duration/session RPE aren't logged.
 */
export function computeEstimatedLoad(session: WorkoutSession, exercises: WorkoutExercise[]): number {
  if (session.sessionRpe && session.durationMinutes) {
    return Math.round(session.sessionRpe * session.durationMinutes)
  }

  const tonnageLoad = exercises.reduce((sum, exercise) => {
    const tonnage = exercise.sets * (exercise.reps ?? 0) * (exercise.loadKg ?? 0)
    const rpeFactor = (exercise.rpe ?? 6) / 10
    return sum + tonnage * rpeFactor
  }, 0)

  return Math.round(tonnageLoad)
}

import { generateId, listAll, remove, upsert } from './localStore'
import type {
  Baseline,
  DailyCheckIn,
  DailyMetric,
  Insight,
  ReadinessScore,
  SupplementLog,
  WorkoutExercise,
  WorkoutSession,
} from '../types'

// Phase 1 uses a single local demo user - no auth flow yet. When Supabase
// Auth is wired up, this becomes the signed-in user's auth.users.id.
export const DEMO_USER_ID = 'demo-user'

const KEYS = {
  dailyMetrics: 'dailyMetrics',
  dailyCheckIns: 'dailyCheckIns',
  workoutSessions: 'workoutSessions',
  workoutExercises: 'workoutExercises',
  supplementLogs: 'supplementLogs',
  baselines: 'baselines',
  readinessScores: 'readinessScores',
  insights: 'insights',
} as const

function byUser<T extends { userId: string }>(items: T[]): T[] {
  return items.filter((item) => item.userId === DEMO_USER_ID)
}

function byDateDesc<T extends { date: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => b.date.localeCompare(a.date))
}

export const repository = {
  newId: generateId,

  listDailyMetrics(): DailyMetric[] {
    return byDateDesc(byUser(listAll<DailyMetric>(KEYS.dailyMetrics)))
  },
  upsertDailyMetric(metric: DailyMetric): DailyMetric {
    return upsert(KEYS.dailyMetrics, metric)
  },

  listDailyCheckIns(): DailyCheckIn[] {
    return byDateDesc(byUser(listAll<DailyCheckIn>(KEYS.dailyCheckIns)))
  },
  upsertDailyCheckIn(checkIn: DailyCheckIn): DailyCheckIn {
    return upsert(KEYS.dailyCheckIns, checkIn)
  },
  getDailyCheckIn(date: string): DailyCheckIn | undefined {
    return this.listDailyCheckIns().find((c) => c.date === date)
  },

  listWorkoutSessions(): WorkoutSession[] {
    return byDateDesc(byUser(listAll<WorkoutSession>(KEYS.workoutSessions)))
  },
  upsertWorkoutSession(session: WorkoutSession): WorkoutSession {
    return upsert(KEYS.workoutSessions, session)
  },
  deleteWorkoutSession(id: string): void {
    remove(KEYS.workoutSessions, id)
    this.listWorkoutExercises(id).forEach((exercise) => remove(KEYS.workoutExercises, exercise.id))
  },

  listWorkoutExercises(sessionId?: string): WorkoutExercise[] {
    const all = listAll<WorkoutExercise>(KEYS.workoutExercises)
    return sessionId ? all.filter((e) => e.workoutSessionId === sessionId) : all
  },
  upsertWorkoutExercise(exercise: WorkoutExercise): WorkoutExercise {
    return upsert(KEYS.workoutExercises, exercise)
  },
  deleteWorkoutExercise(id: string): void {
    remove(KEYS.workoutExercises, id)
  },

  listSupplementLogs(): SupplementLog[] {
    return byDateDesc(byUser(listAll<SupplementLog>(KEYS.supplementLogs)))
  },
  upsertSupplementLog(log: SupplementLog): SupplementLog {
    return upsert(KEYS.supplementLogs, log)
  },
  deleteSupplementLog(id: string): void {
    remove(KEYS.supplementLogs, id)
  },

  listBaselines(): Baseline[] {
    return byUser(listAll<Baseline>(KEYS.baselines))
  },
  upsertBaseline(baseline: Baseline): Baseline {
    return upsert(KEYS.baselines, baseline)
  },

  listReadinessScores(): ReadinessScore[] {
    return byDateDesc(byUser(listAll<ReadinessScore>(KEYS.readinessScores)))
  },
  upsertReadinessScore(score: ReadinessScore): ReadinessScore {
    return upsert(KEYS.readinessScores, score)
  },
  getReadinessScore(date: string): ReadinessScore | undefined {
    return this.listReadinessScores().find((s) => s.date === date)
  },

  listInsights(): Insight[] {
    return byDateDesc(byUser(listAll<Insight>(KEYS.insights)))
  },
  upsertInsight(insight: Insight): Insight {
    return upsert(KEYS.insights, insight)
  },

  clearAll(): void {
    Object.values(KEYS).forEach((key) => localStorage.removeItem('signal:' + key))
  },
}

export type Repository = typeof repository

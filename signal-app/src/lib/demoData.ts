import { repository, DEMO_USER_ID } from './repository'
import { lastNDates } from './dates'
import { computeEstimatedLoad } from './workoutLoad'
import type { DailyCheckIn, DailyMetric, SupplementLog, WorkoutExercise, WorkoutSession } from '../types'

const DEMO_DAYS = 28

// Small seeded PRNG so demo data is stable across reloads within a session
// rather than reshuffling every time the dashboard renders.
function mulberry32(seed: number) {
  return function random() {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function gaussian(random: () => number, mean: number, sd: number): number {
  const u1 = Math.max(random(), 1e-9)
  const u2 = random()
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
  return mean + z * sd
}

function round(value: number, decimals = 0): number {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

export function hasDemoData(): boolean {
  return repository.listDailyMetrics().length > 0 || repository.listDailyCheckIns().length > 0
}

export function clearDemoData(): void {
  repository.clearAll()
}

/**
 * Seeds ~28 days of DailyMetric / DailyCheckIn / WorkoutSession /
 * SupplementLog data so the product loop (readiness score, insights, weekly
 * review) can be exercised before real integrations exist (roadmap Phase 1,
 * step 5).
 */
export function seedDemoData(): void {
  clearDemoData()
  const random = mulberry32(42)
  const dates = lastNDates(DEMO_DAYS).reverse() // oldest first

  // Day offsets (from the oldest date) used to script a short illness dip
  // and a single injury flag, so the readiness engine has something to react to.
  const illnessDayIndexes = new Set([DEMO_DAYS - 11, DEMO_DAYS - 10])
  const injuryDayIndexes = new Set([DEMO_DAYS - 4, DEMO_DAYS - 3])
  const trainingDayIndexes = (index: number) => index % 7 === 1 || index % 7 === 3 || index % 7 === 5

  dates.forEach((date, index) => {
    const isIll = illnessDayIndexes.has(index)
    const isInjured = injuryDayIndexes.has(index)

    const sleepMinutes = round(gaussian(random, isIll ? 340 : 430, 35))
    const restingHeartRate = round(gaussian(random, isIll ? 66 : 54, isIll ? 4 : 3))
    const hrvRmssd = round(gaussian(random, isIll ? 45 : 65, 8))
    const steps = Math.max(0, round(gaussian(random, isIll ? 3000 : 8200, 2000)))
    const activeMinutes = Math.max(0, round(gaussian(random, isIll ? 15 : 48, 15)))
    const caloriesBurned = round(gaussian(random, 2350, 200))

    const metric: DailyMetric = {
      id: repository.newId(),
      userId: DEMO_USER_ID,
      date,
      sleepDurationMinutes: sleepMinutes,
      sleepScore: round(clampScore(sleepMinutes / 480 * 100)),
      restingHeartRate,
      hrvRmssd,
      steps,
      activeMinutes,
      caloriesBurned,
      source: 'manual',
      recordedAt: new Date(date + 'T07:00:00Z').toISOString(),
      dataCompleteness: 0.9,
      confidence: 'medium',
    }
    repository.upsertDailyMetric(metric)

    const moodBase = isIll ? 2 : isInjured ? 3 : 4
    const checkIn: DailyCheckIn = {
      id: repository.newId(),
      userId: DEMO_USER_ID,
      date,
      mood: clampScale(round(gaussian(random, moodBase, 0.6))),
      energy: clampScale(round(gaussian(random, isIll ? 2 : 3.6, 0.7))),
      motivation: clampScale(round(gaussian(random, isIll ? 2 : 3.8, 0.7))),
      stress: clampScale(round(gaussian(random, isIll ? 3.5 : 2.4, 0.8))),
      soreness: clampScale(round(gaussian(random, isInjured ? 4 : 2.3, 0.8))),
      sleepQuality: clampScale(round(sleepMinutes / 480 * 5)),
      injuryFlag: isInjured,
      illnessFlag: isIll,
      notes: isIll ? 'Feeling run down, taking it easy.' : isInjured ? 'Slight knee niggle from Tuesday.' : undefined,
    }
    repository.upsertDailyCheckIn(checkIn)

    if (trainingDayIndexes(index) && !isIll) {
      const session: WorkoutSession = {
        id: repository.newId(),
        userId: DEMO_USER_ID,
        date,
        planned: true,
        completed: true,
        type: 'strength',
        title: index % 7 === 1 ? 'Upper body strength' : index % 7 === 3 ? 'Lower body strength' : 'Full body strength',
        durationMinutes: round(gaussian(random, 55, 10)),
        sessionRpe: round(clampScale(gaussian(random, isInjured ? 5 : 7, 1), 10)),
        painFlag: isInjured,
        notes: isInjured ? 'Reduced load on the knee.' : undefined,
      }

      const exerciseNames =
        index % 7 === 1
          ? ['Bench press', 'Row', 'Overhead press', 'Lat pulldown']
          : index % 7 === 3
            ? ['Back squat', 'Romanian deadlift', 'Leg press', 'Calf raise']
            : ['Deadlift', 'Pull-up', 'Goblet squat', 'Plank']

      const exercises: WorkoutExercise[] = exerciseNames.map((exerciseName) => ({
        id: repository.newId(),
        workoutSessionId: session.id,
        exerciseName,
        sets: 3 + Math.round(random()),
        reps: 6 + Math.round(random() * 6),
        loadKg: round(gaussian(random, isInjured ? 35 : 50, 15), 1),
        rpe: round(clampScale(gaussian(random, isInjured ? 5 : 7, 1), 10), 1),
        painFlag: isInjured && exerciseName.toLowerCase().includes('squat'),
      }))

      session.estimatedLoad = computeEstimatedLoad(session, exercises)
      repository.upsertWorkoutSession(session)
      exercises.forEach((exercise) => repository.upsertWorkoutExercise(exercise))
    }

    const supplements: Array<Pick<SupplementLog, 'supplementName' | 'dose' | 'timeTaken'>> = [
      { supplementName: 'Creatine monohydrate', dose: '5g', timeTaken: '08:00' },
      { supplementName: 'Vitamin D3', dose: '2000 IU', timeTaken: '08:00' },
      { supplementName: 'Magnesium glycinate', dose: '300mg', timeTaken: '21:30' },
    ]
    supplements.forEach(({ supplementName, dose, timeTaken }) => {
      const taken = random() > (supplementName.startsWith('Magnesium') ? 0.3 : 0.15)
      const log: SupplementLog = {
        id: repository.newId(),
        userId: DEMO_USER_ID,
        date,
        supplementName,
        dose,
        timeTaken,
        taken,
        perceivedEffect: taken ? clampScale(round(gaussian(random, 3.5, 0.8))) : undefined,
      }
      repository.upsertSupplementLog(log)
    })
  })
}

function clampScore(value: number): number {
  return Math.min(100, Math.max(0, value))
}

function clampScale(value: number, max = 5): number {
  return Math.min(max, Math.max(1, Math.round(value)))
}

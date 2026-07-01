import { useMemo } from 'react'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { repository } from '../lib/repository'
import { computeReadinessForDate } from '../lib/readinessForDate'
import { lastNDates, formatDateLabel } from '../lib/dates'
import { hasDemoData } from '../lib/demoData'

const WINDOW_DAYS = 7

export function WeeklyReviewPage() {
  const dates = useMemo(() => lastNDates(WINDOW_DAYS).reverse(), [])

  const metrics = repository.listDailyMetrics()
  const checkIns = repository.listDailyCheckIns()
  const sessions = repository.listWorkoutSessions()
  const supplementLogs = repository.listSupplementLogs()

  const rows = useMemo(
    () =>
      dates.map((date) => {
        const readiness = computeReadinessForDate(date)
        const metric = metrics.find((m) => m.date === date)
        const checkIn = checkIns.find((c) => c.date === date)
        const dailySessions = sessions.filter((s) => s.date === date)
        return {
          date,
          label: formatDateLabel(date).split(',')[0],
          readiness: readiness.score,
          sleepHours: metric?.sleepDurationMinutes ? Math.round((metric.sleepDurationMinutes / 60) * 10) / 10 : null,
          mood: checkIn?.mood ?? null,
          stress: checkIn?.stress ?? null,
          load: dailySessions.reduce((sum, s) => sum + (s.estimatedLoad ?? 0), 0),
          completedWorkout: dailySessions.some((s) => s.completed),
          plannedWorkout: dailySessions.some((s) => s.planned),
        }
      }),
    [dates, metrics, checkIns, sessions],
  )

  if (!hasDemoData() && rows.every((r) => r.sleepHours == null && r.mood == null)) {
    return (
      <div>
        <div className="page-header">
          <h1>Weekly review</h1>
        </div>
        <p className="empty-state">Not enough history yet. Log a few days or load demo data from Settings.</p>
      </div>
    )
  }

  const readinessValues = rows.map((r) => r.readiness)
  const avgReadiness = Math.round(readinessValues.reduce((a, b) => a + b, 0) / readinessValues.length)

  const completed = rows.filter((r) => r.completedWorkout).length
  const planned = rows.filter((r) => r.plannedWorkout).length

  const supplementNames = Array.from(new Set(supplementLogs.map((l) => l.supplementName)))
  const adherence =
    supplementNames.length > 0
      ? Math.round(
          (dates.reduce(
            (sum, date) => sum + supplementNames.filter((name) => supplementLogs.some((l) => l.supplementName === name && l.date === date && l.taken)).length,
            0,
          ) /
            (dates.length * supplementNames.length)) *
            100,
        )
      : null

  const totalLoad = rows.reduce((sum, r) => sum + r.load, 0)
  const recommendation =
    avgReadiness >= 75
      ? 'Readiness has been strong this week. Consider a small progression in load next week if pain-free.'
      : avgReadiness >= 50
        ? 'Readiness has been mixed this week. Hold load steady and prioritise sleep and recovery before progressing.'
        : 'Readiness has been low this week. Plan a lighter or deload week before adding load back.'

  return (
    <div>
      <div className="page-header">
        <h1>Weekly review</h1>
        <p>Last {WINDOW_DAYS} days</p>
      </div>

      <div className="card">
        <h2>Summary</h2>
        <div className="trend-grid">
          <div className="stat-block">
            <div className="value">{avgReadiness}</div>
            <div className="label">Avg readiness</div>
          </div>
          <div className="stat-block">
            <div className="value">
              {completed}/{planned || completed}
            </div>
            <div className="label">Workouts completed</div>
          </div>
          <div className="stat-block">
            <div className="value">{totalLoad}</div>
            <div className="label">Total training load</div>
          </div>
          <div className="stat-block">
            <div className="value">{adherence != null ? `${adherence}%` : '-'}</div>
            <div className="label">Supplement adherence</div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Readiness trend</h2>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={rows}>
            <XAxis dataKey="label" stroke="var(--text-faint)" fontSize={11} />
            <YAxis domain={[0, 100]} stroke="var(--text-faint)" fontSize={11} width={28} />
            <Tooltip contentStyle={{ background: 'var(--surface-raised)', border: '1px solid var(--border)' }} />
            <Line type="monotone" dataKey="readiness" stroke="var(--accent)" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <h2>Sleep trend</h2>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={rows}>
            <XAxis dataKey="label" stroke="var(--text-faint)" fontSize={11} />
            <YAxis stroke="var(--text-faint)" fontSize={11} width={28} />
            <Tooltip contentStyle={{ background: 'var(--surface-raised)', border: '1px solid var(--border)' }} />
            <Line type="monotone" dataKey="sleepHours" name="Sleep (h)" stroke="#7aa7ff" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <h2>Mood / stress trend</h2>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={rows}>
            <XAxis dataKey="label" stroke="var(--text-faint)" fontSize={11} />
            <YAxis domain={[1, 5]} stroke="var(--text-faint)" fontSize={11} width={28} />
            <Tooltip contentStyle={{ background: 'var(--surface-raised)', border: '1px solid var(--border)' }} />
            <Line type="monotone" dataKey="mood" name="Mood" stroke="var(--green)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="stress" name="Stress" stroke="var(--red)" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <h2>Recommendation for next week</h2>
        <p style={{ fontSize: 14 }}>{recommendation}</p>
      </div>
    </div>
  )
}

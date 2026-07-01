import { useState } from 'react'
import { Link } from 'react-router-dom'
import { StatusPill } from '../components/StatusPill'
import { computeReadinessForDate } from '../lib/readinessForDate'
import { generateInsightsForReadiness } from '../lib/insights'
import { hasDemoData, seedDemoData } from '../lib/demoData'
import { DEMO_USER_ID } from '../lib/repository'
import { todayISODate } from '../lib/dates'

export function DashboardPage() {
  const [hasData, setHasData] = useState(hasDemoData)
  // Bumped by the "Recalculate" button to force a re-render (the readiness
  // score itself is recomputed fresh from storage on every render below).
  const [, forceRecalculate] = useState(0)

  const readiness = hasData ? computeReadinessForDate(todayISODate()) : null
  const insights = readiness ? generateInsightsForReadiness(DEMO_USER_ID, readiness) : []

  if (!hasData) {
    return (
      <div>
        <div className="page-header">
          <h1>SIGNAL</h1>
          <p>Your readiness score needs a few days of history before it means anything.</p>
        </div>
        <div className="card">
          <h2>Get started</h2>
          <p style={{ fontSize: 14, marginBottom: 12 }}>
            Load 28 days of demo data to see the full product loop, or start logging check-ins and workouts today and
            come back once you have a history.
          </p>
          <button
            type="button"
            className="btn"
            onClick={() => {
              seedDemoData()
              setHasData(true)
            }}
          >
            Load demo data
          </button>
        </div>
      </div>
    )
  }

  if (!readiness) return null

  return (
    <div>
      <div className="page-header">
        <h1>Today</h1>
        <p>{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
      </div>

      <div className="card">
        <h2>Readiness</h2>
        <div className="readiness-ring">
          <div className="readiness-score">{readiness.score}</div>
          <div>
            <StatusPill status={readiness.status} />
            <div className="confidence-tag" style={{ marginTop: 6 }}>
              {readiness.confidence} confidence
            </div>
          </div>
        </div>
        <p style={{ marginTop: 16, fontSize: 14 }}>{readiness.recommendation}</p>
      </div>

      <div className="card">
        <h2>Drivers</h2>
        <ul className="driver-list">
          {readiness.positiveDrivers.map((driver) => (
            <li key={driver}>
              <span className="positive">+</span> {driver}
            </li>
          ))}
          {readiness.negativeDrivers.map((driver) => (
            <li key={driver}>
              <span className="negative">-</span> {driver}
            </li>
          ))}
          {readiness.positiveDrivers.length === 0 && readiness.negativeDrivers.length === 0 && (
            <li className="empty-state">No strong drivers today.</li>
          )}
        </ul>
      </div>

      <div className="card">
        <h2>Insights</h2>
        {insights.map((insight) => (
          <div key={insight.id} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <strong style={{ fontSize: 14 }}>{insight.title}</strong>
              <span className="confidence-tag">{insight.confidence}</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '6px 0' }}>{insight.explanation}</p>
            {insight.recommendedAction && (
              <p style={{ fontSize: 13, margin: 0 }}>
                <strong>Action:</strong> {insight.recommendedAction}
              </p>
            )}
            {insight.dataUsed.length > 0 && (
              <p className="confidence-tag" style={{ marginTop: 6 }}>
                Data used: {insight.dataUsed.join(', ')}
              </p>
            )}
          </div>
        ))}
      </div>

      <button type="button" className="btn secondary" onClick={() => forceRecalculate((k) => k + 1)}>
        Recalculate
      </button>

      <Link to="/weekly-review" className="btn secondary" style={{ marginTop: 8, textDecoration: 'none', textAlign: 'center' }}>
        View weekly review
      </Link>
    </div>
  )
}

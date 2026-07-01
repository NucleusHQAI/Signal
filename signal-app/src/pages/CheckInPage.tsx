import { useEffect, useState } from 'react'
import { ScalePicker } from '../components/ScalePicker'
import { repository, DEMO_USER_ID } from '../lib/repository'
import { todayISODate } from '../lib/dates'
import type { DailyCheckIn } from '../types'

function checkInId(date: string): string {
  return `checkin:${DEMO_USER_ID}:${date}`
}

function emptyCheckIn(date: string): DailyCheckIn {
  return {
    id: checkInId(date),
    userId: DEMO_USER_ID,
    date,
    mood: 3,
    energy: 3,
    motivation: 3,
    stress: 3,
    soreness: 3,
    sleepQuality: 3,
    injuryFlag: false,
    illnessFlag: false,
    alcoholFlag: false,
    travelFlag: false,
  }
}

export function CheckInPage() {
  const [date, setDate] = useState(todayISODate())
  const [checkIn, setCheckIn] = useState<DailyCheckIn>(() => repository.getDailyCheckIn(date) ?? emptyCheckIn(date))
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setCheckIn(repository.getDailyCheckIn(date) ?? emptyCheckIn(date))
    setSaved(false)
  }, [date])

  function update<K extends keyof DailyCheckIn>(key: K, value: DailyCheckIn[K]) {
    setCheckIn((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  function handleSave() {
    repository.upsertDailyCheckIn({ ...checkIn, id: checkInId(date), date })
    setSaved(true)
  }

  return (
    <div>
      <div className="page-header">
        <h1>Daily check-in</h1>
        <p>How are you doing today? This feeds your readiness score.</p>
      </div>

      <div className="card">
        <div className="form-field">
          <label htmlFor="checkin-date">Date</label>
          <input
            id="checkin-date"
            type="text"
            inputMode="numeric"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>

      <div className="card">
        <h2>Mind</h2>
        <div className="form-field">
          <label>Mood</label>
          <ScalePicker value={checkIn.mood} onChange={(v) => update('mood', v)} lowLabel="Low" highLabel="Great" />
        </div>
        <div className="form-field">
          <label>Energy</label>
          <ScalePicker value={checkIn.energy} onChange={(v) => update('energy', v)} lowLabel="Drained" highLabel="Energised" />
        </div>
        <div className="form-field">
          <label>Motivation</label>
          <ScalePicker
            value={checkIn.motivation}
            onChange={(v) => update('motivation', v)}
            lowLabel="None"
            highLabel="High"
          />
        </div>
        <div className="form-field">
          <label>Stress</label>
          <ScalePicker value={checkIn.stress} onChange={(v) => update('stress', v)} lowLabel="Calm" highLabel="Stressed" />
        </div>
      </div>

      <div className="card">
        <h2>Recovery</h2>
        <div className="form-field">
          <label>Soreness</label>
          <ScalePicker
            value={checkIn.soreness}
            onChange={(v) => update('soreness', v)}
            lowLabel="None"
            highLabel="Very sore"
          />
        </div>
        <div className="form-field">
          <label>Perceived sleep quality</label>
          <ScalePicker
            value={checkIn.sleepQuality}
            onChange={(v) => update('sleepQuality', v)}
            lowLabel="Poor"
            highLabel="Great"
          />
        </div>
      </div>

      <div className="card">
        <h2>Flags</h2>
        <div className="toggle-row">
          <span>Injury</span>
          <input type="checkbox" checked={checkIn.injuryFlag} onChange={(e) => update('injuryFlag', e.target.checked)} />
        </div>
        <div className="toggle-row">
          <span>Illness</span>
          <input type="checkbox" checked={checkIn.illnessFlag} onChange={(e) => update('illnessFlag', e.target.checked)} />
        </div>
        <div className="toggle-row">
          <span>Alcohol yesterday</span>
          <input
            type="checkbox"
            checked={checkIn.alcoholFlag ?? false}
            onChange={(e) => update('alcoholFlag', e.target.checked)}
          />
        </div>
        <div className="toggle-row">
          <span>Travel</span>
          <input
            type="checkbox"
            checked={checkIn.travelFlag ?? false}
            onChange={(e) => update('travelFlag', e.target.checked)}
          />
        </div>
      </div>

      <div className="card">
        <h2>Notes</h2>
        <textarea
          rows={3}
          value={checkIn.notes ?? ''}
          onChange={(e) => update('notes', e.target.value)}
          placeholder="Anything else worth noting today?"
          style={{
            width: '100%',
            background: 'var(--surface-raised)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            padding: 10,
            resize: 'vertical',
          }}
        />
      </div>

      <button type="button" className="btn" onClick={handleSave}>
        {saved ? 'Saved' : 'Save check-in'}
      </button>
    </div>
  )
}

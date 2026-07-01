import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { repository, DEMO_USER_ID } from '../lib/repository'
import { todayISODate, lastNDates } from '../lib/dates'
import { ScalePicker } from '../components/ScalePicker'
import type { SupplementLog } from '../types'

function logId(name: string, date: string): string {
  return `supp:${DEMO_USER_ID}:${date}:${name}`
}

export function SupplementsPage() {
  const [logs, setLogs] = useState<SupplementLog[]>(() => repository.listSupplementLogs())
  const [newName, setNewName] = useState('')
  const [newDose, setNewDose] = useState('')
  const today = todayISODate()

  const supplementNames = useMemo(() => {
    const names = new Set(logs.map((log) => log.supplementName))
    return Array.from(names).sort()
  }, [logs])

  const todaysLogs = useMemo(() => {
    return supplementNames.map(
      (name) =>
        logs.find((log) => log.supplementName === name && log.date === today) ?? {
          id: logId(name, today),
          userId: DEMO_USER_ID,
          date: today,
          supplementName: name,
          taken: false,
        },
    )
  }, [supplementNames, logs, today])

  function refresh() {
    setLogs(repository.listSupplementLogs())
  }

  function save(log: SupplementLog) {
    repository.upsertSupplementLog(log)
    refresh()
  }

  function addSupplement() {
    if (!newName.trim()) return
    save({ id: logId(newName.trim(), today), userId: DEMO_USER_ID, date: today, supplementName: newName.trim(), dose: newDose || undefined, taken: true })
    setNewName('')
    setNewDose('')
  }

  function adherence(name: string): number {
    const window = lastNDates(14)
    const takenCount = window.filter((date) => logs.some((log) => log.supplementName === name && log.date === date && log.taken)).length
    return Math.round((takenCount / window.length) * 100)
  }

  return (
    <div>
      <div className="page-header">
        <h1>Supplements</h1>
        <p>Log today's supplements and track adherence over time.</p>
      </div>

      <div className="card">
        <h2>Today</h2>
        {todaysLogs.length === 0 && <p className="empty-state">No supplements tracked yet - add one below.</p>}
        {todaysLogs.map((log) => (
          <div key={log.supplementName} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
            <div className="toggle-row" style={{ borderBottom: 'none', padding: '0 0 8px' }}>
              <div>
                <div style={{ fontWeight: 600 }}>{log.supplementName}</div>
                {log.dose && <div className="confidence-tag">{log.dose}</div>}
              </div>
              <input type="checkbox" checked={log.taken} onChange={(e) => save({ ...log, taken: e.target.checked })} />
            </div>
            {log.taken && (
              <div className="form-field" style={{ marginBottom: 0 }}>
                <label>Perceived effect</label>
                <ScalePicker value={log.perceivedEffect ?? 3} onChange={(v) => save({ ...log, perceivedEffect: v })} lowLabel="None" highLabel="Strong" />
              </div>
            )}
          </div>
        ))}

        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            placeholder="Supplement name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            style={{ flex: 2, background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: 10, padding: 10 }}
          />
          <input
            type="text"
            placeholder="Dose"
            value={newDose}
            onChange={(e) => setNewDose(e.target.value)}
            style={{ flex: 1, background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: 10, padding: 10 }}
          />
        </div>
        <button type="button" className="btn secondary" style={{ marginTop: 8 }} onClick={addSupplement}>
          <Plus size={16} /> Add supplement
        </button>
      </div>

      {supplementNames.length > 0 && (
        <div className="card">
          <h2>14-day adherence</h2>
          {supplementNames.map((name) => (
            <div key={name} className="list-item">
              <span>{name}</span>
              <span style={{ fontWeight: 600 }}>{adherence(name)}%</span>
            </div>
          ))}
          <p className="confidence-tag" style={{ marginTop: 8 }}>
            Adherence trends are shown for context only - correlation is not causation.
          </p>
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { repository, DEMO_USER_ID } from '../lib/repository'
import { computeEstimatedLoad } from '../lib/workoutLoad'
import { todayISODate, formatDateLabel } from '../lib/dates'
import type { WorkoutExercise, WorkoutSession, WorkoutType } from '../types'

const WORKOUT_TYPES: WorkoutType[] = ['strength', 'cardio', 'mobility', 'sport', 'other']

function emptySession(): Omit<WorkoutSession, 'id' | 'userId'> {
  return {
    date: todayISODate(),
    planned: true,
    completed: true,
    type: 'strength',
    title: '',
    durationMinutes: undefined,
    sessionRpe: undefined,
    painFlag: false,
  }
}

function emptyExercise(sessionId: string): Omit<WorkoutExercise, 'id'> {
  return { workoutSessionId: sessionId, exerciseName: '', sets: 3, reps: 8, loadKg: undefined, rpe: undefined, painFlag: false }
}

export function WorkoutsPage() {
  const [sessions, setSessions] = useState<WorkoutSession[]>(() => repository.listWorkoutSessions())
  const [showForm, setShowForm] = useState(false)
  const [draft, setDraft] = useState(emptySession())
  const [expanded, setExpanded] = useState<string | null>(null)

  function refresh() {
    setSessions(repository.listWorkoutSessions())
  }

  function addSession() {
    if (!draft.title.trim()) return
    const session: WorkoutSession = { id: repository.newId(), userId: DEMO_USER_ID, ...draft }
    repository.upsertWorkoutSession(session)
    setDraft(emptySession())
    setShowForm(false)
    setExpanded(session.id)
    refresh()
  }

  function deleteSession(id: string) {
    repository.deleteWorkoutSession(id)
    refresh()
  }

  return (
    <div>
      <div className="page-header">
        <h1>Workouts</h1>
        <p>Log gym sessions, sets, reps, load and RPE.</p>
      </div>

      {showForm ? (
        <div className="card">
          <h2>New session</h2>
          <div className="form-field">
            <label>Title</label>
            <input
              type="text"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="e.g. Upper body strength"
            />
          </div>
          <div className="form-field">
            <label>Date</label>
            <input type="text" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
          </div>
          <div className="form-field">
            <label>Type</label>
            <select value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value as WorkoutType })}>
              {WORKOUT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label>Duration (minutes)</label>
            <input
              type="number"
              value={draft.durationMinutes ?? ''}
              onChange={(e) => setDraft({ ...draft, durationMinutes: e.target.value ? Number(e.target.value) : undefined })}
            />
          </div>
          <div className="form-field">
            <label>Session RPE (1-10)</label>
            <input
              type="number"
              min={1}
              max={10}
              value={draft.sessionRpe ?? ''}
              onChange={(e) => setDraft({ ...draft, sessionRpe: e.target.value ? Number(e.target.value) : undefined })}
            />
          </div>
          <div className="toggle-row">
            <span>Pain during session</span>
            <input type="checkbox" checked={draft.painFlag ?? false} onChange={(e) => setDraft({ ...draft, painFlag: e.target.checked })} />
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button type="button" className="btn secondary" onClick={() => setShowForm(false)}>
              Cancel
            </button>
            <button type="button" className="btn" onClick={addSession}>
              Add session
            </button>
          </div>
        </div>
      ) : (
        <button type="button" className="btn" onClick={() => setShowForm(true)}>
          <Plus size={18} /> Log a workout
        </button>
      )}

      {sessions.length === 0 && !showForm && <p className="empty-state">No workouts logged yet.</p>}

      {sessions.map((session) => (
        <SessionCard
          key={session.id}
          session={session}
          expanded={expanded === session.id}
          onToggle={() => setExpanded(expanded === session.id ? null : session.id)}
          onDelete={() => deleteSession(session.id)}
          onChange={refresh}
        />
      ))}
    </div>
  )
}

function SessionCard({
  session,
  expanded,
  onToggle,
  onDelete,
  onChange,
}: {
  session: WorkoutSession
  expanded: boolean
  onToggle: () => void
  onDelete: () => void
  onChange: () => void
}) {
  const [exercises, setExercises] = useState<WorkoutExercise[]>(() => repository.listWorkoutExercises(session.id))
  const [draft, setDraft] = useState(emptyExercise(session.id))

  function recomputeLoad(updatedExercises: WorkoutExercise[]) {
    const estimatedLoad = computeEstimatedLoad(session, updatedExercises)
    repository.upsertWorkoutSession({ ...session, estimatedLoad })
    onChange()
  }

  function addExercise() {
    if (!draft.exerciseName.trim()) return
    const exercise: WorkoutExercise = { id: repository.newId(), ...draft }
    repository.upsertWorkoutExercise(exercise)
    const updated = [...exercises, exercise]
    setExercises(updated)
    setDraft(emptyExercise(session.id))
    recomputeLoad(updated)
  }

  function removeExercise(id: string) {
    repository.deleteWorkoutExercise(id)
    const updated = exercises.filter((e) => e.id !== id)
    setExercises(updated)
    recomputeLoad(updated)
  }

  return (
    <div className="card">
      <div className="list-item" onClick={onToggle} style={{ cursor: 'pointer', borderBottom: expanded ? '1px solid var(--border)' : 'none' }}>
        <div>
          <div style={{ fontWeight: 600 }}>{session.title}</div>
          <div className="confidence-tag">
            {formatDateLabel(session.date)} · {session.type}
            {session.painFlag ? ' · pain flagged' : ''}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 600 }}>{session.estimatedLoad ?? 0}</div>
          <div className="confidence-tag">load</div>
        </div>
      </div>

      {expanded && (
        <div style={{ marginTop: 12 }}>
          {exercises.map((exercise) => (
            <div key={exercise.id} className="list-item">
              <div>
                <div>{exercise.exerciseName}</div>
                <div className="confidence-tag">
                  {exercise.sets} x {exercise.reps ?? '-'} @ {exercise.loadKg ?? '-'}kg, RPE {exercise.rpe ?? '-'}
                  {exercise.painFlag ? ' · pain' : ''}
                </div>
              </div>
              <button type="button" className="btn danger" style={{ width: 'auto', padding: 8 }} onClick={() => removeExercise(exercise.id)}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 8, marginTop: 8 }}>
            <input
              type="text"
              placeholder="Exercise"
              value={draft.exerciseName}
              onChange={(e) => setDraft({ ...draft, exerciseName: e.target.value })}
              style={{ gridColumn: '1 / -1', background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: 10, padding: 10 }}
            />
            <input
              type="number"
              placeholder="Sets"
              value={draft.sets}
              onChange={(e) => setDraft({ ...draft, sets: Number(e.target.value) })}
              style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: 10, padding: 10 }}
            />
            <input
              type="number"
              placeholder="Reps"
              value={draft.reps ?? ''}
              onChange={(e) => setDraft({ ...draft, reps: e.target.value ? Number(e.target.value) : undefined })}
              style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: 10, padding: 10 }}
            />
            <input
              type="number"
              placeholder="Load kg"
              value={draft.loadKg ?? ''}
              onChange={(e) => setDraft({ ...draft, loadKg: e.target.value ? Number(e.target.value) : undefined })}
              style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: 10, padding: 10 }}
            />
            <input
              type="number"
              placeholder="RPE"
              value={draft.rpe ?? ''}
              onChange={(e) => setDraft({ ...draft, rpe: e.target.value ? Number(e.target.value) : undefined })}
              style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: 10, padding: 10 }}
            />
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
              <input type="checkbox" checked={draft.painFlag ?? false} onChange={(e) => setDraft({ ...draft, painFlag: e.target.checked })} />
              Pain
            </label>
          </div>
          <button type="button" className="btn secondary" style={{ marginTop: 8 }} onClick={addExercise}>
            <Plus size={16} /> Add exercise
          </button>

          <button type="button" className="btn danger" style={{ marginTop: 12 }} onClick={onDelete}>
            <Trash2 size={16} /> Delete session
          </button>
        </div>
      )}
    </div>
  )
}

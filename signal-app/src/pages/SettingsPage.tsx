import { useState } from 'react'
import { clearDemoData, seedDemoData } from '../lib/demoData'
import { isSupabaseConfigured } from '../lib/supabaseClient'

export function SettingsPage() {
  const [message, setMessage] = useState<string | null>(null)

  return (
    <div>
      <div className="page-header">
        <h1>Settings</h1>
      </div>

      <div className="card">
        <h2>Data</h2>
        <p style={{ fontSize: 14, marginBottom: 12 }}>
          SIGNAL Phase 1 stores your data locally in this browser. Demo data lets you exercise the full product loop
          (check-ins, workouts, supplements, readiness, insights, weekly review) before real integrations exist.
        </p>
        <button
          type="button"
          className="btn secondary"
          onClick={() => {
            seedDemoData()
            setMessage('Demo data loaded.')
          }}
        >
          Load 28 days of demo data
        </button>
        <button
          type="button"
          className="btn danger"
          style={{ marginTop: 8 }}
          onClick={() => {
            clearDemoData()
            setMessage('All local data cleared.')
          }}
        >
          Clear all data
        </button>
        {message && (
          <p className="confidence-tag" style={{ marginTop: 8 }}>
            {message}
          </p>
        )}
      </div>

      <div className="card">
        <h2>Backend</h2>
        <p style={{ fontSize: 14 }}>
          Cloud sync via Supabase: {isSupabaseConfigured ? 'configured' : 'not configured (running on local storage only)'}
        </p>
        <p className="confidence-tag">
          Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, and run supabase/schema.sql against your project to enable
          cross-device sync.
        </p>
      </div>

      <div className="card">
        <h2>About</h2>
        <p style={{ fontSize: 14 }}>
          SIGNAL is a personal health operating system. Readiness scores and recommendations are deterministic and
          explainable - not medical advice.
        </p>
      </div>
    </div>
  )
}

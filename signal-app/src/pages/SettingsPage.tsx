import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { clearDemoData, seedDemoData } from '../lib/demoData'
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient'

type ConnectionStatus = 'disconnected' | 'connected' | 'error'

export function SettingsPage() {
  const [message, setMessage] = useState<string | null>(null)
  const [searchParams, setSearchParams] = useSearchParams()
  const [signedIn, setSignedIn] = useState(false)
  const [googleHealthStatus, setGoogleHealthStatus] = useState<ConnectionStatus>('disconnected')
  const [googleHealthBusy, setGoogleHealthBusy] = useState(false)
  const [googleHealthMessage, setGoogleHealthMessage] = useState<string | null>(null)

  useEffect(() => {
    const client = supabase
    if (!client) return

    client.auth.getUser().then(({ data }) => setSignedIn(Boolean(data.user)))

    const refreshConnectionStatus = async () => {
      const { data } = await client.auth.getUser()
      if (!data.user) return
      const { data: connection } = await client
        .from('integration_connections')
        .select('status')
        .eq('provider', 'google_health')
        .maybeSingle()
      if (connection) setGoogleHealthStatus(connection.status as ConnectionStatus)
    }
    refreshConnectionStatus()
  }, [])

  useEffect(() => {
    const result = searchParams.get('google_health')
    if (result === 'connected') {
      setGoogleHealthStatus('connected')
      setGoogleHealthMessage('Google Health connected.')
      setSearchParams({}, { replace: true })
    } else if (result === 'error') {
      setGoogleHealthStatus('error')
      setGoogleHealthMessage(`Google Health connection failed (${searchParams.get('reason') ?? 'unknown error'}).`)
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams])

  async function connectGoogleHealth() {
    if (!supabase) return
    setGoogleHealthBusy(true)
    setGoogleHealthMessage(null)
    const { data, error } = await supabase.functions.invoke<{ url?: string; error?: string }>(
      'google-health-authorize',
    )
    setGoogleHealthBusy(false)
    if (error || !data?.url) {
      setGoogleHealthMessage(data?.error ?? error?.message ?? 'Could not start Google Health connection.')
      return
    }
    window.location.href = data.url
  }

  async function syncGoogleHealth() {
    if (!supabase) return
    setGoogleHealthBusy(true)
    setGoogleHealthMessage(null)
    const { data, error } = await supabase.functions.invoke<{ synced?: number; error?: string }>(
      'google-health-sync',
    )
    setGoogleHealthBusy(false)
    if (error || data?.error) {
      setGoogleHealthMessage(data?.error ?? error?.message ?? 'Sync failed.')
      return
    }
    setGoogleHealthMessage(`Synced ${data?.synced ?? 0} day(s) of Google Health data.`)
  }

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
        <h2>Google Health</h2>
        <p style={{ fontSize: 14, marginBottom: 12 }}>
          Import sleep, resting heart rate, steps and activity automatically. Status:{' '}
          {googleHealthStatus === 'connected' ? 'connected' : googleHealthStatus === 'error' ? 'error' : 'not connected'}
        </p>
        {!isSupabaseConfigured ? (
          <p className="confidence-tag">Configure Supabase below first - Google Health needs it to store your connection.</p>
        ) : !signedIn ? (
          <p className="confidence-tag">
            Sign in with Supabase Auth to connect Google Health. SIGNAL doesn't have a sign-in flow yet - this is the
            next piece needed before this button will work.
          </p>
        ) : (
          <>
            <button type="button" className="btn secondary" onClick={connectGoogleHealth} disabled={googleHealthBusy}>
              {googleHealthStatus === 'connected' ? 'Reconnect Google Health' : 'Connect Google Health'}
            </button>
            {googleHealthStatus === 'connected' && (
              <button
                type="button"
                className="btn secondary"
                style={{ marginTop: 8, marginLeft: 8 }}
                onClick={syncGoogleHealth}
                disabled={googleHealthBusy}
              >
                Sync now
              </button>
            )}
          </>
        )}
        {googleHealthMessage && (
          <p className="confidence-tag" style={{ marginTop: 8 }}>
            {googleHealthMessage}
          </p>
        )}
      </div>

      <div className="card">
        <h2>Backend</h2>
        <p style={{ fontSize: 14 }}>
          Cloud sync via Supabase: {isSupabaseConfigured ? 'configured' : 'not configured (running on local storage only)'}
        </p>
        <p className="confidence-tag">
          Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, run supabase/schema.sql and the migrations in
          supabase/migrations against your project, and deploy supabase/functions to enable cross-device sync and
          integrations. See docs/technical/05-google-health-setup.md for a full walkthrough.
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

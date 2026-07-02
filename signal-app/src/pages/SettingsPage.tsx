import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { clearDemoData, seedDemoData } from '../lib/demoData'
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient'
import { useSupabaseUser } from '../lib/useSupabaseUser'

type ConnectionStatus = 'disconnected' | 'connected' | 'error'

const inputStyle = {
  background: 'var(--surface-raised)',
  border: '1px solid var(--border)',
  borderRadius: 10,
  padding: 10,
}

export function SettingsPage() {
  const [message, setMessage] = useState<string | null>(null)
  const [searchParams, setSearchParams] = useSearchParams()
  const { user, loading: userLoading } = useSupabaseUser()
  const signedIn = Boolean(user)
  const [email, setEmail] = useState('')
  const [authBusy, setAuthBusy] = useState(false)
  const [authMessage, setAuthMessage] = useState<string | null>(null)
  const [googleHealthStatus, setGoogleHealthStatus] = useState<ConnectionStatus>('disconnected')
  const [googleHealthBusy, setGoogleHealthBusy] = useState(false)
  const [googleHealthMessage, setGoogleHealthMessage] = useState<string | null>(null)

  useEffect(() => {
    const client = supabase
    if (!client || !user) {
      setGoogleHealthStatus('disconnected')
      return
    }

    client
      .from('integration_connections')
      .select('status')
      .eq('provider', 'google_health')
      .maybeSingle()
      .then(({ data: connection }) => {
        if (connection) setGoogleHealthStatus(connection.status as ConnectionStatus)
      })
  }, [user])

  async function sendMagicLink() {
    if (!supabase || !email) return
    setAuthBusy(true)
    setAuthMessage(null)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + window.location.pathname },
    })
    setAuthBusy(false)
    setAuthMessage(error ? error.message : `Check ${email} for a sign-in link.`)
  }

  async function signOut() {
    if (!supabase) return
    await supabase.auth.signOut()
    setAuthMessage(null)
  }

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
        <h2>Account</h2>
        <p style={{ fontSize: 14, marginBottom: 12 }}>
          Signing in isn't required for local check-ins, workouts or demo data - it's only needed for cloud sync and
          connecting Google Health, since both are tied to your Supabase user.
        </p>
        {!isSupabaseConfigured ? (
          <p className="confidence-tag">Configure Supabase below first.</p>
        ) : userLoading ? (
          <p className="confidence-tag">Checking sign-in status...</p>
        ) : signedIn ? (
          <>
            <p style={{ fontSize: 14, marginBottom: 8 }}>Signed in as {user?.email}.</p>
            <button type="button" className="btn secondary" onClick={signOut}>
              Sign out
            </button>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ flex: 1, ...inputStyle }}
              />
              <button type="button" className="btn secondary" onClick={sendMagicLink} disabled={authBusy || !email}>
                Send magic link
              </button>
            </div>
            {authMessage && (
              <p className="confidence-tag" style={{ marginTop: 8 }}>
                {authMessage}
              </p>
            )}
          </>
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
          <p className="confidence-tag">Sign in above to connect Google Health.</p>
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

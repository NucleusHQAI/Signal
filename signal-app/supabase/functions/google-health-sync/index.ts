// Pulls recent Google Health data for the signed-in user and upserts it into
// daily_metrics (source = 'google_health'), following the source adapter
// pattern in docs/technical/03-integrations.md: source API -> adapter ->
// normalised SIGNAL entity -> storage.
//
// Called from the client via supabase.functions.invoke('google-health-sync').
// Not scheduled yet - trigger it manually from Settings for now, or wire up
// a Supabase Cron Trigger to call it daily once this is verified working
// (see docs/technical/05-google-health-setup.md).
//
// VERIFY BEFORE RELYING ON THIS: the dataTypeId values and response field
// names below are best-effort, assembled from public Google Health API
// search results because developers.google.com/health returned 403 to
// automated fetches while this was written. Confirm both against
// https://developers.google.com/health/data-types and
// https://developers.google.com/health/reference/rest/v4/users.dataTypes.dataPoints/dailyRollUp
// once you have console access, and adjust DATA_TYPES below if they differ.

import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const API_BASE = 'https://health.googleapis.com/v4'
const SYNC_WINDOW_DAYS = 7

type DailyMetricColumn =
  | 'sleep_duration_minutes'
  | 'resting_heart_rate'
  | 'hrv_rmssd'
  | 'steps'
  | 'active_minutes'
  | 'calories_burned'

type DataTypeConfig = {
  dataTypeId: string
  column: DailyMetricColumn
  // Pulls the numeric value out of one rollupDataPoint entry. Response field
  // names differ per data type (confirmed for steps: countSum); the others
  // are guesses across the most likely field names - see the VERIFY note above.
  extract: (point: Record<string, unknown>) => number | undefined
}

function firstNumericField(obj: unknown, keys: string[]): number | undefined {
  if (!obj || typeof obj !== 'object') return undefined
  for (const key of keys) {
    const value = (obj as Record<string, unknown>)[key]
    if (value !== undefined && value !== null) {
      const num = Number(value)
      if (!Number.isNaN(num)) return num
    }
  }
  return undefined
}

const DATA_TYPES: DataTypeConfig[] = [
  {
    dataTypeId: 'steps',
    column: 'steps',
    extract: (p) => firstNumericField(p.steps, ['countSum']),
  },
  {
    dataTypeId: 'dailyRestingHeartRate',
    column: 'resting_heart_rate',
    extract: (p) => firstNumericField(p.dailyRestingHeartRate, ['bpm', 'value', 'avg']),
  },
  {
    dataTypeId: 'dailyHeartRateVariability',
    column: 'hrv_rmssd',
    extract: (p) => firstNumericField(p.dailyHeartRateVariability, ['rmssdMillis', 'value', 'avg']),
  },
  {
    dataTypeId: 'activeZoneMinutes',
    column: 'active_minutes',
    extract: (p) => firstNumericField(p.activeZoneMinutes, ['minutesSum', 'sum']),
  },
  {
    dataTypeId: 'totalCalories',
    column: 'calories_burned',
    extract: (p) => firstNumericField(p.totalCalories, ['kcalSum', 'sum']),
  },
  {
    dataTypeId: 'sleep',
    column: 'sleep_duration_minutes',
    extract: (p) => firstNumericField(p.sleep, ['durationMinutes', 'totalSleepMinutes']),
  },
]

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function civilDate(date: Date) {
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() }
}

async function refreshAccessToken(refreshToken: string) {
  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: Deno.env.get('GOOGLE_HEALTH_CLIENT_ID')!,
      client_secret: Deno.env.get('GOOGLE_HEALTH_CLIENT_SECRET')!,
      grant_type: 'refresh_token',
    }),
  })

  if (!response.ok) {
    throw new Error(`Token refresh failed: ${await response.text()}`)
  }

  return (await response.json()) as { access_token: string; expires_in: number }
}

async function fetchDailyRollUp(accessToken: string, dataTypeId: string, start: Date, end: Date) {
  const response = await fetch(
    `${API_BASE}/users/me/dataTypes/${dataTypeId}/dataPoints:dailyRollUp`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range: {
          start: { date: civilDate(start), time: { hours: 0, minutes: 0, seconds: 0 } },
          end: { date: civilDate(end), time: { hours: 23, minutes: 59, seconds: 59 } },
        },
        windowSizeDays: 1,
      }),
    },
  )

  if (!response.ok) {
    // Don't fail the whole sync because one data type is unavailable for
    // this user's device/scopes - log and treat as no data for this type.
    console.error(`dailyRollUp failed for ${dataTypeId}`, await response.text())
    return []
  }

  const body = (await response.json()) as { rollupDataPoints?: Record<string, unknown>[] }
  return body.rollupDataPoints ?? []
}

function rollupDateISO(point: Record<string, unknown>): string | undefined {
  const start = point.civilStartTime as { date?: { year: number; month: number; day: number } } | undefined
  const d = start?.date
  if (!d) return undefined
  return `${d.year}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!

  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
  })

  const {
    data: { user },
    error: authError,
  } = await callerClient.auth.getUser()

  if (authError || !user) {
    return jsonResponse({ error: 'Not authenticated' }, 401)
  }

  const admin = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

  const { data: connection, error: connectionError } = await admin
    .from('integration_connections')
    .select('id, status')
    .eq('user_id', user.id)
    .eq('provider', 'google_health')
    .maybeSingle()

  if (connectionError || !connection || connection.status !== 'connected') {
    return jsonResponse({ error: 'Google Health is not connected for this user' }, 400)
  }

  const { data: tokenRow, error: tokenError } = await admin
    .from('integration_tokens')
    .select('access_token, refresh_token, expires_at')
    .eq('connection_id', connection.id)
    .single()

  if (tokenError || !tokenRow) {
    return jsonResponse({ error: 'No stored token for this connection' }, 400)
  }

  let accessToken = tokenRow.access_token as string
  const expiresAt = new Date(tokenRow.expires_at as string)

  try {
    if (expiresAt.getTime() < Date.now() + 60_000) {
      const refreshed = await refreshAccessToken(tokenRow.refresh_token as string)
      accessToken = refreshed.access_token
      await admin
        .from('integration_tokens')
        .update({
          access_token: accessToken,
          expires_at: new Date(Date.now() + refreshed.expires_in * 1000).toISOString(),
        })
        .eq('connection_id', connection.id)
    }

    const end = new Date()
    const start = new Date(end)
    start.setUTCDate(start.getUTCDate() - SYNC_WINDOW_DAYS)

    // date -> partial daily_metrics row, built up across all data types.
    const rowsByDate = new Map<string, Partial<Record<DailyMetricColumn, number>>>()

    for (const dataType of DATA_TYPES) {
      const points = await fetchDailyRollUp(accessToken, dataType.dataTypeId, start, end)
      for (const point of points) {
        const date = rollupDateISO(point)
        const value = dataType.extract(point)
        if (!date || value === undefined) continue
        const row = rowsByDate.get(date) ?? {}
        row[dataType.column] = value
        rowsByDate.set(date, row)
      }
    }

    const fieldCount = DATA_TYPES.length
    const upsertRows = Array.from(rowsByDate.entries()).map(([date, fields]) => ({
      user_id: user.id,
      date,
      ...fields,
      source: 'google_health',
      recorded_at: new Date().toISOString(),
      data_completeness: Object.keys(fields).length / fieldCount,
      confidence: Object.keys(fields).length >= fieldCount / 2 ? 'high' : 'medium',
    }))

    if (upsertRows.length > 0) {
      const { error: upsertError } = await admin
        .from('daily_metrics')
        .upsert(upsertRows, { onConflict: 'user_id,date,source' })
      if (upsertError) throw upsertError
    }

    await admin
      .from('integration_connections')
      .update({ status: 'connected', last_synced_at: new Date().toISOString(), last_error: null })
      .eq('id', connection.id)

    return jsonResponse({ synced: upsertRows.length, days: SYNC_WINDOW_DAYS })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    await admin
      .from('integration_connections')
      .update({ status: 'error', last_error: message })
      .eq('id', connection.id)
    return jsonResponse({ error: message }, 500)
  }
})

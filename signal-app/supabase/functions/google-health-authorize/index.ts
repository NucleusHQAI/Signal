// Starts the Google Health OAuth flow for the signed-in SIGNAL user.
//
// Called from the client via supabase.functions.invoke('google-health-authorize').
// Returns { url } - the client redirects the browser there itself
// (window.location.href = url) rather than this function redirecting,
// since it's invoked with fetch, not a top-level navigation.
//
// Requires these secrets (see supabase/functions/.env.example):
//   GOOGLE_HEALTH_CLIENT_ID, GOOGLE_HEALTH_REDIRECT_URI
// SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY are injected
// automatically by the Supabase Edge Runtime.

import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'

// Read-only scopes covering sleep, heart rate/HRV, steps and activity.
// Verify against https://developers.google.com/health/scopes once you have
// console access - scope naming may have shifted since this was written.
const SCOPES = [
  'https://www.googleapis.com/auth/googlehealth.activity_and_fitness.readonly',
  'https://www.googleapis.com/auth/googlehealth.health_metrics_and_measurements.readonly',
]

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!

  // Client bound to the caller's JWT so auth.getUser() reflects who's asking.
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

  const clientId = Deno.env.get('GOOGLE_HEALTH_CLIENT_ID')
  const redirectUri = Deno.env.get('GOOGLE_HEALTH_REDIRECT_URI')
  if (!clientId || !redirectUri) {
    return jsonResponse({ error: 'Google Health OAuth is not configured on the server yet' }, 500)
  }

  // Service-role client to write the CSRF state row (RLS blocks this table
  // from the anon/authenticated roles entirely - see the migration).
  const admin = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

  const state = crypto.randomUUID()
  const { error: stateError } = await admin.from('oauth_states').insert({
    state,
    user_id: user.id,
    provider: 'google_health',
  })

  if (stateError) {
    return jsonResponse({ error: stateError.message }, 500)
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    // offline + consent guarantees a refresh_token comes back even if the
    // user has authorized this app before.
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES.join(' '),
    state,
  })

  return jsonResponse({ url: `${GOOGLE_AUTH_URL}?${params.toString()}` })
})

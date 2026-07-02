// Google redirects the user's browser here (a top-level navigation, not a
// fetch call from the app) after they approve or deny consent. Exchanges the
// auth code for tokens, stores them, then redirects back into the app.
//
// Requires these secrets (see supabase/functions/.env.example):
//   GOOGLE_HEALTH_CLIENT_ID, GOOGLE_HEALTH_CLIENT_SECRET,
//   GOOGLE_HEALTH_REDIRECT_URI (must exactly match this function's deployed
//   URL and the redirect URI registered in Google Cloud Console), APP_URL

import { createClient } from 'jsr:@supabase/supabase-js@2'

const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const STATE_TTL_MS = 10 * 60 * 1000

type GoogleTokenResponse = {
  access_token: string
  refresh_token?: string
  expires_in: number
  scope: string
}

Deno.serve(async (req) => {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const appUrl = Deno.env.get('APP_URL')!

  // SIGNAL uses HashRouter, so the route + query string live after the '#'.
  const failRedirect = (reason: string) =>
    Response.redirect(`${appUrl}/#/settings?google_health=error&reason=${encodeURIComponent(reason)}`, 302)

  if (url.searchParams.get('error')) {
    return failRedirect(url.searchParams.get('error') ?? 'consent_denied')
  }
  if (!code || !state) {
    return failRedirect('missing_code_or_state')
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const admin = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

  const { data: stateRow, error: stateError } = await admin
    .from('oauth_states')
    .select('user_id, created_at')
    .eq('state', state)
    .maybeSingle()

  if (stateError || !stateRow) {
    return failRedirect('invalid_state')
  }

  // One-time use: consume the state row immediately regardless of outcome.
  await admin.from('oauth_states').delete().eq('state', state)

  if (Date.now() - new Date(stateRow.created_at).getTime() > STATE_TTL_MS) {
    return failRedirect('expired_state')
  }

  const tokenResponse = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: Deno.env.get('GOOGLE_HEALTH_CLIENT_ID')!,
      client_secret: Deno.env.get('GOOGLE_HEALTH_CLIENT_SECRET')!,
      redirect_uri: Deno.env.get('GOOGLE_HEALTH_REDIRECT_URI')!,
      grant_type: 'authorization_code',
    }),
  })

  if (!tokenResponse.ok) {
    console.error('Google token exchange failed', await tokenResponse.text())
    return failRedirect('token_exchange_failed')
  }

  const tokens = (await tokenResponse.json()) as GoogleTokenResponse

  if (!tokens.refresh_token) {
    // Expected to always be present because authorize requests
    // access_type=offline&prompt=consent, but guard anyway - a connection
    // saved without one would silently stop syncing once the access token
    // (typically ~1hr) expires.
    return failRedirect('missing_refresh_token')
  }

  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString()

  const { data: connection, error: connectionError } = await admin
    .from('integration_connections')
    .upsert(
      {
        user_id: stateRow.user_id,
        provider: 'google_health',
        status: 'connected',
        scopes: tokens.scope.split(' '),
        connected_at: new Date().toISOString(),
        last_error: null,
      },
      { onConflict: 'user_id,provider' },
    )
    .select('id')
    .single()

  if (connectionError || !connection) {
    console.error('Failed to save integration_connections row', connectionError)
    return failRedirect('connection_save_failed')
  }

  const { error: tokenSaveError } = await admin.from('integration_tokens').upsert(
    {
      connection_id: connection.id,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: expiresAt,
    },
    { onConflict: 'connection_id' },
  )

  if (tokenSaveError) {
    console.error('Failed to save integration_tokens row', tokenSaveError)
    return failRedirect('token_save_failed')
  }

  return Response.redirect(`${appUrl}/#/settings?google_health=connected`, 302)
})

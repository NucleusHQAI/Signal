# Google Health Integration Setup

Step-by-step setup for the Google Health source adapter (`daily_metrics.source = 'google_health'`): a Supabase project, the OAuth token storage tables, the three Edge Functions, and the Google Cloud OAuth client. Written for a first Supabase project - no prior Supabase experience assumed.

Code already in the repo: `signal-app/supabase/migrations/`, `signal-app/supabase/functions/`, and the "Google Health" card on the Settings page. This doc is about getting a real Supabase project and Google Cloud project wired up so that code runs.

## What Supabase is, briefly

Supabase is a hosted Postgres database plus auth, storage and serverless functions ("Edge Functions" - small TypeScript functions that run on Deno, similar to AWS Lambda). SIGNAL uses the Postgres database for cross-device sync and Edge Functions to keep the Google OAuth client secret off the browser.

## 1. Create a Supabase project

1. Go to supabase.com and create a free account, then a new project.
2. Pick any project name and a strong database password (save it somewhere - you won't need it for this setup, but you will if you ever connect a Postgres client directly).
3. Wait for the project to finish provisioning (a couple of minutes).
4. In the dashboard: **Project Settings > API**. Copy the **Project URL** and the **anon public** key.

## 2. Configure the SIGNAL app

In `signal-app/`, copy `.env.example` to `.env` and fill in the values from step 1:

```
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-public-key>
```

`.env` is gitignored - never commit it.

## 3. Create the database tables

In the Supabase dashboard: **SQL Editor > New query**. Run these two files' contents, in order (paste the full file contents and click Run):

1. `signal-app/supabase/schema.sql` - the core SIGNAL tables (daily metrics, check-ins, workouts, etc).
2. `signal-app/supabase/migrations/20260702120000_add_google_health_integration.sql` - the Google Health connection/token tables.

You can confirm they landed under **Table Editor** - you should see `daily_metrics`, `integration_connections`, `integration_tokens`, `oauth_states`, and the rest.

## 4. Set up Google Cloud OAuth credentials

1. Go to console.cloud.google.com and create a project (or pick an existing one).
2. Enable the **Google Health API** for that project (search for it in APIs & Services > Library).
3. **APIs & Services > OAuth consent screen**: choose *External*, enter an app name and your email as support/contact, save. While the app is unpublished ("Testing" status) you don't need Google's verification review, but only test users you explicitly add can authorize it.
4. On the consent screen's **Audience** (or **Test users**) page, add your own Google account email as a test user.
5. On the **Data Access** page, add the scopes: search "Google Health API" and select the `activity_and_fitness.readonly` and `health_metrics_and_measurements.readonly` scopes (read-only is enough for SIGNAL - it never writes to Google Health).
6. **APIs & Services > Credentials > Create Credentials > OAuth client ID**. Application type: **Web application**. Under **Authorized redirect URIs**, add:
   ```
   https://<your-project-ref>.supabase.co/functions/v1/google-health-callback
   ```
   (same `<your-project-ref>` as your Supabase project URL).
7. Save. Copy the **Client ID** and **Client secret** - you'll need them in step 6.

## 5. Install and log in to the Supabase CLI

Tables can be created by pasting SQL, but Edge Functions need the CLI to deploy.

```bash
npm install -g supabase
supabase login
```

`supabase login` opens a browser to authorize the CLI against your Supabase account.

## 6. Link the project and set function secrets

From `signal-app/`:

```bash
supabase link --project-ref <your-project-ref>
```

(`<your-project-ref>` is the subdomain in your project URL, e.g. `abcdefghijklmnop`.)

Copy `supabase/functions/.env.example` to `supabase/functions/.env` and fill it in:

```
GOOGLE_HEALTH_CLIENT_ID=<from step 4>
GOOGLE_HEALTH_CLIENT_SECRET=<from step 4>
GOOGLE_HEALTH_REDIRECT_URI=https://<your-project-ref>.supabase.co/functions/v1/google-health-callback
APP_URL=http://localhost:5173
```

`APP_URL` is where the browser lands after connecting - use your deployed URL once SIGNAL is hosted somewhere.

Push the secrets to Supabase (this file stays local, never commit it):

```bash
supabase secrets set --env-file supabase/functions/.env
```

## 7. Deploy the Edge Functions

```bash
supabase functions deploy google-health-authorize
supabase functions deploy google-health-callback
supabase functions deploy google-health-sync
```

## 8. Known gap: no sign-in flow yet

The Google Health connect button on the Settings page requires a signed-in Supabase Auth user (`auth.uid()` is how the database and Edge Functions know whose tokens belong to whom). SIGNAL's Phase 1 prototype doesn't have a sign-in screen yet - it runs on a single hardcoded local demo user (`DEMO_USER_ID` in `src/lib/repository.ts`). Until Supabase Auth (e.g. email/password or magic link) is wired into the app, the Settings page will show "sign in required" instead of a working connect button. That's the next piece of work needed to actually exercise this end-to-end.

## 9. Verify the API assumptions before relying on synced data

`supabase/functions/google-health-sync/index.ts` calls the `dailyRollUp` endpoint per data type and maps specific response field names (e.g. `steps.countSum`) into `daily_metrics` columns. The endpoint shape for `steps` is confirmed from Google's public documentation; the other data types (`dailyRestingHeartRate`, `dailyHeartRateVariability`, `activeZoneMinutes`, `totalCalories`, `sleep`) use best-effort field names because `developers.google.com/health` blocked automated fetches while this was written. Once you can sign in to the Google Cloud console, cross-check `DATA_TYPES` in that file against:

- https://developers.google.com/health/data-types
- https://developers.google.com/health/reference/rest/v4/users.dataTypes.dataPoints/dailyRollUp

and adjust the `dataTypeId` or `extract` field names if they differ. The safest way to confirm is to call `google-health-sync` once it's deployed and check the Edge Function logs (**Supabase dashboard > Edge Functions > google-health-sync > Logs**) - `fetchDailyRollUp` logs the raw error body if a call fails, and you can temporarily log the raw response to see the actual field names.

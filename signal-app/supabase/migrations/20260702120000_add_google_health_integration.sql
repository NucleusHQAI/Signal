-- Google Health integration: connection status + OAuth token storage.
--
-- Split into two tables on purpose:
--   integration_connections - status the client is allowed to read (no secrets)
--   integration_tokens      - access/refresh tokens, never exposed to the client
--
-- integration_tokens and oauth_states have RLS enabled with NO policies, which
-- blocks the anon/authenticated roles entirely. Only Edge Functions using the
-- service role key (which bypasses RLS) can read or write them.

create table if not exists integration_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  provider text not null check (provider in ('google_health')),

  status text not null default 'disconnected' check (status in ('connected', 'disconnected', 'error')),
  scopes text[] not null default '{}',

  connected_at timestamptz,
  last_synced_at timestamptz,
  last_error text,

  unique (user_id, provider)
);

create table if not exists integration_tokens (
  id uuid primary key default gen_random_uuid(),
  connection_id uuid not null references integration_connections (id) on delete cascade,

  access_token text not null,
  refresh_token text not null,
  expires_at timestamptz not null,

  unique (connection_id)
);

-- Short-lived CSRF state for the authorize -> Google -> callback round trip.
-- Rows are deleted as soon as they're consumed by the callback function;
-- anything older than ~10 minutes is treated as expired.
create table if not exists oauth_states (
  state text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  provider text not null,
  created_at timestamptz not null default now()
);

alter table integration_connections enable row level security;
alter table integration_tokens enable row level security;
alter table oauth_states enable row level security;

-- Client can see its own connection status (e.g. to render "Connected" in
-- Settings) but cannot insert/update/delete - only Edge Functions write here.
create policy "Users read their own integration_connections" on integration_connections
  for select using (auth.uid() = user_id);

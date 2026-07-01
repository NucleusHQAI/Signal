-- SIGNAL Supabase schema, one table per entity in docs/technical/01-data-model.md.
-- Run this against a Supabase project (SQL editor) once real cloud sync is
-- needed. Row-level security keeps every user scoped to their own rows.
-- Phase 1 runs on localStorage (src/lib/repository.ts) without this schema.

create table if not exists daily_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,

  sleep_duration_minutes integer,
  sleep_score numeric,
  resting_heart_rate numeric,
  hrv_rmssd numeric,
  steps integer,
  active_minutes integer,
  calories_burned numeric,
  stress_score numeric,

  source text not null check (source in ('fitbit', 'google_health', 'manual', 'estimated', 'import')),
  recorded_at timestamptz not null default now(),
  data_completeness numeric not null default 1,
  confidence text not null check (confidence in ('high', 'medium', 'low')),

  unique (user_id, date, source)
);

create table if not exists daily_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,

  mood numeric not null,
  energy numeric not null,
  motivation numeric not null,
  stress numeric not null,
  soreness numeric not null,
  sleep_quality numeric not null,

  injury_flag boolean not null default false,
  illness_flag boolean not null default false,
  alcohol_flag boolean,
  travel_flag boolean,

  notes text,

  unique (user_id, date)
);

create table if not exists workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,

  planned boolean not null default false,
  completed boolean not null default false,
  type text not null check (type in ('strength', 'cardio', 'mobility', 'sport', 'other')),

  title text not null,
  duration_minutes integer,
  session_rpe numeric,
  estimated_load numeric,

  pain_flag boolean,
  notes text
);

create table if not exists workout_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_session_id uuid not null references workout_sessions (id) on delete cascade,

  exercise_name text not null,
  body_region text,
  movement_pattern text,

  sets integer not null,
  reps integer,
  load_kg numeric,
  rpe numeric,
  pain_flag boolean,
  notes text
);

create table if not exists supplement_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,

  supplement_name text not null,
  dose text,
  time_taken time,
  taken boolean not null default false,

  perceived_effect numeric,
  side_effect_flag boolean,
  notes text
);

create table if not exists baselines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  metric_name text not null,

  period_days integer not null,
  mean numeric not null,
  standard_deviation numeric,
  low_band numeric,
  high_band numeric,
  minimum_viable_data_points integer not null default 1,

  calculated_at timestamptz not null default now(),

  unique (user_id, metric_name, period_days)
);

create table if not exists readiness_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,

  score numeric not null,
  status text not null check (status in ('green', 'amber', 'red')),
  confidence text not null check (confidence in ('high', 'medium', 'low')),

  components jsonb not null default '{}',
  weights_used jsonb not null default '{}',

  positive_drivers text[] not null default '{}',
  negative_drivers text[] not null default '{}',
  triggered_rules text[] not null default '{}',
  recommendation text not null,

  unique (user_id, date)
);

create table if not exists insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,

  category text not null check (category in ('readiness', 'training', 'recovery', 'mind', 'supplements', 'nutrition')),
  severity text not null check (severity in ('info', 'positive', 'warning', 'critical')),

  title text not null,
  explanation text not null,
  recommended_action text,

  data_used text[] not null default '{}',
  confidence text not null check (confidence in ('high', 'medium', 'low'))
);

alter table daily_metrics enable row level security;
alter table daily_checkins enable row level security;
alter table workout_sessions enable row level security;
alter table workout_exercises enable row level security;
alter table supplement_logs enable row level security;
alter table baselines enable row level security;
alter table readiness_scores enable row level security;
alter table insights enable row level security;

create policy "Users manage their own daily_metrics" on daily_metrics
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage their own daily_checkins" on daily_checkins
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage their own workout_sessions" on workout_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage exercises via owning session" on workout_exercises
  for all using (
    exists (
      select 1 from workout_sessions s
      where s.id = workout_exercises.workout_session_id and s.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from workout_sessions s
      where s.id = workout_exercises.workout_session_id and s.user_id = auth.uid()
    )
  );
create policy "Users manage their own supplement_logs" on supplement_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage their own baselines" on baselines
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage their own readiness_scores" on readiness_scores
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage their own insights" on insights
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

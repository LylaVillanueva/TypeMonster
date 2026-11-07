-- Type Monster's browser client uses only the Supabase publishable key.
-- Row-level security restricts every record to its owning signed-in user.

create table if not exists public.typing_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  client_session_id uuid not null,
  practice_date date not null,
  mode text not null check (mode in ('time', 'words', 'zen', 'quote')),
  round_seconds integer not null check (round_seconds between 1 and 3600),
  active_milliseconds bigint not null default 0 check (active_milliseconds >= 0),
  words_per_minute numeric(8, 2) not null default 0 check (words_per_minute >= 0),
  raw_wpm numeric(8, 2) not null default 0 check (raw_wpm >= 0),
  accuracy numeric(5, 2) not null default 100 check (accuracy between 0 and 100),
  correct_characters integer not null default 0 check (correct_characters >= 0),
  total_characters integer not null default 0 check (total_characters >= 0),
  focus_letters text[] not null default '{}',
  created_at timestamptz not null default now(),
  unique (user_id, client_session_id)
);

create index if not exists typing_sessions_user_created_idx
  on public.typing_sessions (user_id, created_at desc);

create table if not exists public.daily_practice (
  user_id uuid not null references auth.users (id) on delete cascade,
  practice_date date not null,
  active_milliseconds bigint not null default 0 check (active_milliseconds >= 0),
  goal_milliseconds bigint not null default 900000 check (goal_milliseconds > 0),
  goal_reached_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, practice_date)
);

create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  daily_goal_minutes integer not null default 15 check (daily_goal_minutes between 1 and 240),
  round_seconds integer not null default 30 check (round_seconds between 1 and 3600),
  focus_letters text[] not null default '{}',
  caps_lock boolean not null default true,
  include_punctuation boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.typing_sessions enable row level security;
alter table public.daily_practice enable row level security;
alter table public.user_preferences enable row level security;

revoke all on table public.typing_sessions from anon, public;
revoke all on table public.daily_practice from anon, public;
revoke all on table public.user_preferences from anon, public;
grant usage on schema public to authenticated;
grant select, insert, update, delete on table public.typing_sessions to authenticated;
grant select, insert, update, delete on table public.daily_practice to authenticated;
grant select, insert, update, delete on table public.user_preferences to authenticated;

drop policy if exists "Users manage their own typing sessions" on public.typing_sessions;
create policy "Users manage their own typing sessions"
  on public.typing_sessions for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users manage their own daily practice" on public.daily_practice;
create policy "Users manage their own daily practice"
  on public.daily_practice for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users manage their own preferences" on public.user_preferences;
create policy "Users manage their own preferences"
  on public.user_preferences for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

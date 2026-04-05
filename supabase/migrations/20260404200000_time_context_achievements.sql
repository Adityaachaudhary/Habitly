-- Time / context on habits (dashboard lanes + tags)
alter table public.habits
  add column if not exists time_lane text default 'any',
  add column if not exists context_tag text;

-- Unlocked badges (7d/21d habit streaks, perfect-day streaks)
create table if not exists public.user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  dedupe_key text not null,
  badge_name text not null,
  badge_type text not null,
  habit_id uuid references public.habits (id) on delete set null,
  unlocked_at timestamptz not null default now(),
  unique (user_id, dedupe_key)
);

create index if not exists user_achievements_user_idx
  on public.user_achievements (user_id, unlocked_at desc);

alter table public.user_achievements enable row level security;

create policy "user_achievements_select_own"
  on public.user_achievements for select
  using (auth.uid() = user_id);

create policy "user_achievements_insert_own"
  on public.user_achievements for insert
  with check (auth.uid() = user_id);

create policy "user_achievements_delete_own"
  on public.user_achievements for delete
  using (auth.uid() = user_id);

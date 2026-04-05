-- End-of-week reflection (what worked, what broke, one change next week)
create table if not exists public.week_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  week_start_date date not null,
  what_worked text not null,
  what_broke text not null,
  change_next_week text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, week_start_date)
);

create index if not exists week_reviews_user_week_idx
  on public.week_reviews (user_id, week_start_date desc);

alter table public.week_reviews enable row level security;

create policy "week_reviews_select_own"
  on public.week_reviews for select
  using (auth.uid() = user_id);

create policy "week_reviews_insert_own"
  on public.week_reviews for insert
  with check (auth.uid() = user_id);

create policy "week_reviews_update_own"
  on public.week_reviews for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "week_reviews_delete_own"
  on public.week_reviews for delete
  using (auth.uid() = user_id);

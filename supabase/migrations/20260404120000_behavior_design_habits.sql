-- Behavior design: implementation intentions, stacking, fallback plans
alter table public.habits
  add column if not exists stack_after_habit_id uuid references public.habits (id) on delete set null,
  add column if not exists implementation_cue text,
  add column if not exists implementation_context text,
  add column if not exists fallback_plan text;

create index if not exists habits_stack_after_habit_id_idx
  on public.habits (stack_after_habit_id)
  where stack_after_habit_id is not null;

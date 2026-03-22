create extension if not exists pgcrypto;

create table if not exists public.habits (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text not null,
  type text not null check (type in ('checkbox', 'count', 'minutes')),
  goal_target integer not null check (goal_target > 0),
  goal_period text not null check (goal_period in ('daily', 'weekly')),
  created_at timestamptz not null default now()
);

create table if not exists public.habit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  habit_id text not null references public.habits(id) on delete cascade,
  log_date date not null,
  value integer not null default 0 check (value >= 0),
  created_at timestamptz not null default now(),
  unique (user_id, habit_id, log_date)
);

create index if not exists habits_user_id_idx on public.habits (user_id);
create index if not exists habit_logs_user_id_idx on public.habit_logs (user_id);
create index if not exists habit_logs_habit_id_idx on public.habit_logs (habit_id);
create index if not exists habit_logs_log_date_idx on public.habit_logs (log_date desc);

alter table public.habits enable row level security;
alter table public.habit_logs enable row level security;

create policy "Users can view their habits"
on public.habits
for select
using (auth.uid() = user_id);

create policy "Users can insert their habits"
on public.habits
for insert
with check (auth.uid() = user_id);

create policy "Users can update their habits"
on public.habits
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their habits"
on public.habits
for delete
using (auth.uid() = user_id);

create policy "Users can view their habit logs"
on public.habit_logs
for select
using (auth.uid() = user_id);

create policy "Users can insert their habit logs"
on public.habit_logs
for insert
with check (auth.uid() = user_id);

create policy "Users can update their habit logs"
on public.habit_logs
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their habit logs"
on public.habit_logs
for delete
using (auth.uid() = user_id);

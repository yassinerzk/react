-- Barakah Stories: run this in the Supabase SQL editor of your project.
-- Sign-up uses Supabase Auth (email + password). These tables hold the data
-- the mobile app syncs for a signed-in user. Row Level Security limits every
-- row to its owner.

create table if not exists public.saved_designs (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  design jsonb not null,
  created_at bigint not null,
  updated_at bigint not null
);
create index if not exists saved_designs_user_idx on public.saved_designs (user_id);

create table if not exists public.quran_progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  last_surah int,
  last_ayah int,
  finished int[] not null default '{}',
  updated_at bigint not null
);

alter table public.saved_designs enable row level security;
alter table public.quran_progress enable row level security;

create policy "own saved designs" on public.saved_designs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own quran progress" on public.quran_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Account deletion. Google Play requires any app that offers account creation
-- to let users delete that account, both in the app and from a web page.
--
-- The anon key shipped in the app cannot touch auth.users, and the service_role
-- key must never be in a client, so deletion runs through this security-definer
-- function instead: it deletes only the caller, and the foreign keys above
-- cascade their rows away with them.
create or replace function public.delete_account()
returns void
language sql
security definer
set search_path = ''
as $$
  delete from auth.users where id = auth.uid();
$$;

revoke execute on function public.delete_account() from public, anon;
grant execute on function public.delete_account() to authenticated;

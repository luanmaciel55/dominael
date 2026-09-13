alter table public.egg_users add column if not exists full_name text;
alter table public.egg_users add column if not exists recovery_salt text;
alter table public.egg_users add column if not exists recovery_birth_hash text;
alter table public.egg_users add column if not exists recovery_grand_hash text;
alter table public.egg_users add column if not exists recovery_birth_cipher text;
alter table public.egg_users add column if not exists recovery_grand_cipher text;

create table if not exists public.account_recovery_attempts (
  user_id uuid primary key references public.egg_users(id) on delete cascade,
  attempts integer not null default 0,
  window_start timestamptz not null default now()
);
alter table public.account_recovery_attempts enable row level security;
revoke all on public.account_recovery_attempts from anon, authenticated;

create table if not exists public.account_audit (
  id bigint generated always as identity primary key,
  user_id uuid not null,
  username text not null,
  actor text not null,
  action text not null,
  created_at timestamptz not null default now()
);
create index if not exists account_audit_created_at_idx on public.account_audit (created_at desc);
alter table public.account_audit enable row level security;
revoke all on public.account_audit from anon, authenticated;

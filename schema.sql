-- CampusPulse schema — run once in the Supabase SQL Editor
-- Reverse-engineered from server.js queries

-- users: admin / counsellor / student with cookie-session password auth
create table if not exists public.users (
  id bigint generated always as identity primary key,
  role text not null check (role in ('admin','counsellor','student')),
  name text not null,
  email text not null unique,
  password_salt text not null,
  password_hash text not null,
  counsellor_id bigint references public.users (id) on delete set null,
  status text check (status in ('new','contacted','counselling','enrolled')),
  profile jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists users_role_idx on public.users (role);
create index if not exists users_counsellor_idx on public.users (counsellor_id);
create index if not exists users_email_idx on public.users (email);

-- cookie sessions (token stored in cp_sid HttpOnly cookie, 7-day expiry enforced in code)
create table if not exists public.sessions (
  token text primary key,
  user_id bigint not null references public.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
create index if not exists sessions_user_idx on public.sessions (user_id);

-- student session / callback requests
create table if not exists public.session_requests (
  id bigint generated always as identity primary key,
  student_id bigint not null references public.users (id) on delete cascade,
  requested_date date not null,
  note text default '',
  created_at timestamptz not null default now()
);
create index if not exists session_requests_student_idx on public.session_requests (student_id);

-- every status transition, who changed it and when (changed_by null = system/registration)
create table if not exists public.status_history (
  id bigint generated always as identity primary key,
  student_id bigint not null references public.users (id) on delete cascade,
  from_status text,
  to_status text not null,
  changed_by bigint references public.users (id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists status_history_student_idx on public.status_history (student_id);

-- Phase 2: counsellor <-> student threads (one thread per student, admin read-only)
create table if not exists public.messages (
  id bigint generated always as identity primary key,
  student_id bigint not null references public.users (id) on delete cascade,
  sender_id bigint not null references public.users (id) on delete cascade,
  body text not null check (char_length(body) >= 1 and char_length(body) <= 1000),
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists messages_student_idx on public.messages (student_id, created_at);

-- Phase 3: counsellor availability slots + booking lifecycle
create table if not exists public.slots (
  id bigint generated always as identity primary key,
  counsellor_id bigint not null references public.users (id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  start_time text not null check (start_time ~ '^[0-2][0-9]:[0-5][0-9]$'),
  minutes smallint not null default 30 check (minutes between 15 and 120),
  created_at timestamptz not null default now(),
  unique (counsellor_id, weekday, start_time)
);
create index if not exists slots_counsellor_idx on public.slots (counsellor_id);

alter table public.session_requests
  add column if not exists status text not null default 'pending'
    check (status in ('pending','confirmed','declined','completed','cancelled')),
  add column if not exists slot_id bigint references public.slots (id) on delete set null,
  add column if not exists decided_by bigint references public.users (id) on delete set null,
  add column if not exists decided_at timestamptz;
create index if not exists session_requests_status_idx on public.session_requests (status, requested_date);

-- NOTE: this project uses the SERVICE_ROLE key from Node, so no RLS policies are required.
-- If you enable RLS, add permissive policies for the service role or disable RLS on these tables.

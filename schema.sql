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

-- NOTE: this project uses the SERVICE_ROLE key from Node, so no RLS policies are required.
-- If you enable RLS, add permissive policies for the service role or disable RLS on these tables.

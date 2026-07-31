-- ============================================================
-- Portal Familiar - Script SQL completo para Supabase
-- Ejecutar en: https://supabase.com/dashboard/project/vvvvyusnjwssdahqurqo/sql/new
-- ============================================================

-- birthdays
create table if not exists birthdays (
  id text primary key,
  name text not null,
  relationship text,
  birth_date text,
  avatar text,
  gift_ideas jsonb default '[]',
  notes text,
  created_at timestamptz default now()
);

-- anniversaries
create table if not exists anniversaries (
  id text primary key,
  title text not null,
  type text default 'Otro',
  date text,
  member_ids jsonb default '[]',
  notes text,
  created_at timestamptz default now()
);

-- reward_requests
create table if not exists reward_requests (
  id text primary key,
  reward_id text,
  reward_title text,
  points_cost integer,
  member_id text,
  member_name text,
  status text default 'requested',
  requested_at text,
  approved_at text,
  created_at timestamptz default now()
);

-- custom_task_lists
create table if not exists custom_task_lists (
  id text primary key,
  name text not null,
  categories jsonb default '[]',
  created_at timestamptz default now()
);

-- app_config (key/value store for family name, dark mode, theme, etc.)
create table if not exists app_config (
  key text primary key,
  value jsonb,
  updated_at timestamptz default now()
);

-- Disable RLS on all new tables (family app, no per-user auth)
alter table birthdays disable row level security;
alter table anniversaries disable row level security;
alter table reward_requests disable row level security;
alter table custom_task_lists disable row level security;
alter table app_config disable row level security;

-- Ensure family_members has all required columns
alter table family_members add column if not exists birth_date text;
alter table family_members add column if not exists pin_code text default '1234';
alter table family_members add column if not exists gender text;
alter table family_members add column if not exists clothing_sizes jsonb;
alter table family_members add column if not exists allergies jsonb;
alter table family_members add column if not exists permissions jsonb;
alter table family_members add column if not exists updated_at timestamptz default now();
alter table family_members add column if not exists age integer;
alter table family_members add column if not exists phone text;
alter table family_members add column if not exists notes text;

-- Update all existing members to have pin_code = '1234' if null
update family_members set pin_code = '1234' where pin_code is null or pin_code = '';

select 'Setup complete!' as status;

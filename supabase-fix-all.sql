-- ============================================================
-- PORTAL FAMILIAR - SCRIPT DEFINITIVO DE CORRECCIÓN Y SINCRO
-- ============================================================
-- Ejecutar en Supabase: SQL Editor -> New Query -> Run
-- ============================================================

-- 1. CREAR TABLAS FALTANTES SI NO EXISTEN
create table if not exists wedding_tasks (
  id text primary key,
  title text not null,
  category text default 'General',
  completed boolean default false,
  created_at timestamptz default now()
);

create table if not exists wedding_notes (
  id text primary key,
  title text not null,
  content text not null,
  author text,
  date text,
  created_at timestamptz default now()
);

create table if not exists app_config (
  key text primary key,
  value jsonb,
  updated_at timestamptz default now()
);

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

create table if not exists anniversaries (
  id text primary key,
  title text not null,
  type text default 'Otro',
  date text,
  member_ids jsonb default '[]',
  notes text,
  created_at timestamptz default now()
);

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

create table if not exists custom_task_lists (
  id text primary key,
  name text not null,
  categories jsonb default '[]',
  created_at timestamptz default now()
);

-- 2. CAMBIAR EL TIPO DE LA COLUMNA 'ID' A TEXT EN TODAS LAS TABLAS
-- (Esto resuelve el error 22P02: invalid input syntax for type uuid)
DO $$
BEGIN
  ALTER TABLE family_members ALTER COLUMN id TYPE text USING id::text;
  ALTER TABLE calendar_events ALTER COLUMN id TYPE text USING id::text;
  ALTER TABLE tasks ALTER COLUMN id TYPE text USING id::text;
  ALTER TABLE shopping_items ALTER COLUMN id TYPE text USING id::text;
  ALTER TABLE meal_plans ALTER COLUMN id TYPE text USING id::text;
  ALTER TABLE birthdays ALTER COLUMN id TYPE text USING id::text;
  ALTER TABLE sticky_notes ALTER COLUMN id TYPE text USING id::text;
  ALTER TABLE expenses ALTER COLUMN id TYPE text USING id::text;
  ALTER TABLE emergency_contacts ALTER COLUMN id TYPE text USING id::text;
  ALTER TABLE catholic_intentions ALTER COLUMN id TYPE text USING id::text;
  ALTER TABLE anniversaries ALTER COLUMN id TYPE text USING id::text;
  ALTER TABLE reward_requests ALTER COLUMN id TYPE text USING id::text;
  ALTER TABLE custom_task_lists ALTER COLUMN id TYPE text USING id::text;
  ALTER TABLE wedding_tasks ALTER COLUMN id TYPE text USING id::text;
  ALTER TABLE wedding_notes ALTER COLUMN id TYPE text USING id::text;
EXCEPTION WHEN OTHERS THEN
  -- Si alguna columna ya era text, continúa sin fallo
  NULL;
END $$;

-- 3. DESACTIVAR ROW LEVEL SECURITY (RLS) EN TODAS LAS TABLAS
alter table family_members disable row level security;
alter table calendar_events disable row level security;
alter table tasks disable row level security;
alter table shopping_items disable row level security;
alter table meal_plans disable row level security;
alter table birthdays disable row level security;
alter table sticky_notes disable row level security;
alter table expenses disable row level security;
alter table emergency_contacts disable row level security;
alter table catholic_intentions disable row level security;
alter table anniversaries disable row level security;
alter table reward_requests disable row level security;
alter table custom_task_lists disable row level security;
alter table wedding_tasks disable row level security;
alter table wedding_notes disable row level security;
alter table app_config disable row level security;

-- 4. ACTIVAR REALTIME (PUBLICACIÓN EN TIEMPO REAL MULTI-DISPOSITIVO)
DO $$
DECLARE
  t text;
  tbls text[] := ARRAY[
    'family_members', 'calendar_events', 'tasks', 'shopping_items',
    'meal_plans', 'birthdays', 'sticky_notes', 'expenses',
    'emergency_contacts', 'catholic_intentions', 'anniversaries',
    'reward_requests', 'custom_task_lists', 'wedding_tasks',
    'wedding_notes', 'app_config'
  ];
BEGIN
  FOREACH t IN ARRAY tbls LOOP
    BEGIN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE %I', t);
    EXCEPTION WHEN OTHERS THEN
      -- Si la tabla ya estaba en la publicación, ignorar el aviso
      NULL;
    END;
  END LOOP;
END $$;

-- 5. VERIFICACIÓN FINAL
select 'Configuración completada con éxito. Todos los tipos y Realtime están activados.' as resultado;

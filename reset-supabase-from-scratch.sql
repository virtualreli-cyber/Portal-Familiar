-- ============================================================
-- PORTAL FAMILIAR - RESET COMPLETO DESDE CERO
-- ============================================================
-- Ejecutar en: https://supabase.com/dashboard/project/vvvvyusnjwssdahqurqo/sql/new
-- Este script:
-- 1. Elimina todas las tablas antiguas si existen.
-- 2. Crea las 16 tablas con columnas tipo TEXT para IDs.
-- 3. Desactiva RLS (Row Level Security) para acceso completo.
-- 4. Activa la sincronización Realtime multi-dispositivo.
-- 5. Inserta los miembros de la familia y unos pocos datos iniciales de prueba.
-- ============================================================

-- 1. ELIMINAR TABLAS EXISTENTES
drop table if exists family_members cascade;
drop table if exists calendar_events cascade;
drop table if exists tasks cascade;
drop table if exists shopping_items cascade;
drop table if exists meal_plans cascade;
drop table if exists birthdays cascade;
drop table if exists sticky_notes cascade;
drop table if exists expenses cascade;
drop table if exists emergency_contacts cascade;
drop table if exists catholic_intentions cascade;
drop table if exists anniversaries cascade;
drop table if exists reward_requests cascade;
drop table if exists custom_task_lists cascade;
drop table if exists wedding_tasks cascade;
drop table if exists wedding_notes cascade;
drop table if exists app_config cascade;

-- 2. CREAR TABLAS NUEVAS DESDE CERO

-- Miembros de la familia
create table family_members (
  id text primary key,
  name text not null,
  role text not null,
  avatar text default '👤',
  color text default 'bg-indigo-600 text-white',
  pin_code text default '1234',
  email text,
  birth_date text,
  age integer,
  gender text,
  points integer default 0,
  phone text,
  clothing_sizes jsonb default '{}',
  allergies jsonb default '[]',
  notes text,
  permissions jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Eventos del calendario
create table calendar_events (
  id text primary key,
  title text not null,
  date text not null,
  time text,
  end_time text,
  category text,
  assigned_member_ids jsonb default '[]',
  location text,
  notes text,
  created_at timestamptz default now()
);

-- Tareas
create table tasks (
  id text primary key,
  title text not null,
  category text,
  assigned_member_id text,
  points integer default 10,
  due_date text,
  completed boolean default false,
  completed_at text,
  priority text default 'Media',
  frequency text default 'Única',
  list_id text,
  validation_status text default 'none',
  requested_by_member_id text,
  created_at timestamptz default now()
);

-- Lista de la compra
create table shopping_items (
  id text primary key,
  name text not null,
  category text,
  quantity text,
  estimated_price numeric,
  store text,
  completed boolean default false,
  added_by text,
  urgent boolean default false,
  created_at timestamptz default now()
);

-- Menú semanal
create table meal_plans (
  id text primary key,
  day_key text unique not null,
  breakfast text,
  lunch text,
  snack text,
  dinner text,
  notes text,
  created_at timestamptz default now()
);

-- Cumpleaños adicionales
create table birthdays (
  id text primary key,
  name text not null,
  relationship text,
  birth_date text,
  avatar text default '🎂',
  gift_ideas jsonb default '[]',
  notes text,
  created_at timestamptz default now()
);

-- Notas adhesivas del frigorífico
create table sticky_notes (
  id text primary key,
  title text,
  content text,
  color text default 'yellow',
  author text,
  pinned boolean default false,
  created_at timestamptz default now()
);

-- Gastos familiares
create table expenses (
  id text primary key,
  title text not null,
  amount numeric not null,
  category text,
  due_date_day integer,
  paid boolean default false,
  paid_by text,
  date text,
  notes text,
  created_at timestamptz default now()
);

-- Contactos de emergencia y directorio
create table emergency_contacts (
  id text primary key,
  name text not null,
  relation_or_type text,
  phone text,
  address text,
  notes text,
  created_at timestamptz default now()
);

-- Intenciones oracionales / católicas
create table catholic_intentions (
  id text primary key,
  title text not null,
  date text,
  type text,
  requested_by text,
  completed boolean default false,
  created_at timestamptz default now()
);

-- Aniversarios
create table anniversaries (
  id text primary key,
  title text not null,
  type text default 'Otro',
  date text,
  member_ids jsonb default '[]',
  notes text,
  created_at timestamptz default now()
);

-- Solicitudes de recompensa
create table reward_requests (
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

-- Listas de tareas personalizadas
create table custom_task_lists (
  id text primary key,
  name text not null,
  categories jsonb default '[]',
  created_at timestamptz default now()
);

-- Tareas de la boda
create table wedding_tasks (
  id text primary key,
  title text not null,
  category text default 'General',
  completed boolean default false,
  created_at timestamptz default now()
);

-- Notas de la boda
create table wedding_notes (
  id text primary key,
  title text not null,
  content text not null,
  author text,
  date text,
  created_at timestamptz default now()
);

-- Configuración global (nombre de familia, modo oscuro, wifi, etc.)
create table app_config (
  key text primary key,
  value jsonb,
  updated_at timestamptz default now()
);

-- 3. DESACTIVAR ROW LEVEL SECURITY (RLS)
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

-- 4. ACTIVAR REALTIME MULTI-DISPOSITIVO EN TODAS LAS TABLAS
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
      NULL;
    END;
  END LOOP;
END $$;

-- 5. DATOS INICIALES DE LA FAMILIA (EDITABLES Y BORRABLES LIBREMENTE)

-- Miembros de la familia
insert into family_members (id, name, role, avatar, color, pin_code, email, birth_date, age, gender, points, phone, clothing_sizes, allergies, notes)
values
  ('m1', 'Carlos Santos (Papá)', 'Padre', '👨‍💼', 'bg-indigo-600 text-white', '1234', 'padre@familia.com', '1984-06-15', 42, 'Masculino', 350, '+34 600 111 222', '{"shirt": "L", "pants": "42", "shoes": "43"}', '["Polen"]', 'Administrador principal del hogar'),
  ('m2', 'María González (Mamá)', 'Madre', '👩‍🏫', 'bg-rose-600 text-white', '1234', 'mama@familia.com', '1986-09-20', 40, 'Femenino', 420, '+34 600 333 444', '{"shirt": "M", "pants": "38", "shoes": "38"}', '[]', 'Coordinadora de actividades'),
  ('m3', 'Mateo Santos', 'Hijo', '👦', 'bg-amber-500 text-white', '1234', 'mateo@familia.com', '2014-03-10', 12, 'Masculino', 120, null, '{"shirt": "12 años", "pants": "12 años", "shoes": "36"}', '["Melocotón"]', 'Fútbol y robótica'),
  ('m4', 'Sofía Santos', 'Hija', '👧', 'bg-emerald-500 text-white', '1234', 'sofia@familia.com', '2017-11-05', 9, 'Femenino', 95, null, '{"shirt": "9 años", "pants": "9 años", "shoes": "33"}', '["Frutos secos"]', 'Violín y catequesis'),
  ('m5', 'Abuela Carmen', 'Abuela', '👵', 'bg-purple-600 text-white', '1234', 'abuela@familia.com', '1958-07-16', 68, 'Femenino', 500, '+34 600 555 666', '{"shirt": "XL", "pants": "44", "shoes": "39"}', '["Lactosa"]', 'Reza el Rosario diario');

-- Configuración inicial
insert into app_config (key, value)
values
  ('fam_name', '"Familia Santos"'),
  ('fam_dark_mode', 'false'),
  ('fam_theme_color', '"indigo"'),
  ('wifi_ssid', '"FamiliaSantos_5G"'),
  ('wifi_pass', '"PazYBien2026"');

-- 1 Evento de ejemplo
insert into calendar_events (id, title, date, time, end_time, category, assigned_member_ids, location, notes)
values ('ev_ejemplo_1', 'Misa Dominical en Parroquia San José', CURRENT_DATE::text, '12:00', '13:00', 'Misa/Liturgia', '["m1", "m2", "m3", "m4", "m5"]', 'Parroquia San José', 'Llegar 10 minutos antes.');

-- 1 Tarea de ejemplo
insert into tasks (id, title, category, assigned_member_id, points, due_date, completed, priority, frequency)
values ('task_ejemplo_1', 'Ordenar habitación y hacer la cama', 'Limpieza', 'm3', 15, CURRENT_DATE::text, false, 'Media', 'Diaria');

-- 1 Item de compra de ejemplo
insert into shopping_items (id, name, category, quantity, estimated_price, store, completed, added_by, urgent)
values ('shop_ejemplo_1', 'Aceite de Oliva Virgen Extra', 'Despensa y Bebidas', '2 botellas', 18.50, 'Mercadona', false, 'María González (Mamá)', true);

-- 1 Nota adhesiva de ejemplo
insert into sticky_notes (id, title, content, color, author, pinned)
values ('note_ejemplo_1', '📌 Recordatorio de Bienvenida', '¡Bienvenidos al Portal Familiar! Todo lo que modifiques aquí se sincronizará entre dispositivos.', 'yellow', 'Carlos Santos (Papá)', true);

-- 1 Gasto de ejemplo
insert into expenses (id, title, amount, category, due_date_day, paid, paid_by, date, notes)
values ('exp_ejemplo_1', 'Suministros del Hogar', 112.40, 'Suministros', 10, true, 'Carlos Santos (Papá)', CURRENT_DATE::text, 'Pago mensual');

-- 1 Contacto de emergencia de ejemplo
insert into emergency_contacts (id, name, relation_or_type, phone, address, notes)
values ('contact_ejemplo_1', 'Parroquia San José', 'Parroquia / Sacerdote', '+34 912 345 678', 'Calle Mayor 12', 'Para intenciones y misas.');

-- 1 Intención oracional de ejemplo
insert into catholic_intentions (id, title, date, type, requested_by, completed)
values ('int_ejemplo_1', 'Por la salud y paz de la familia', CURRENT_DATE::text, 'Misa', 'Abuela Carmen', false);

-- Mensaje final
select '¡Portal Familiar reiniciado con éxito desde cero! Tablas creadas, Realtime activo y datos iniciales listos.' as status;

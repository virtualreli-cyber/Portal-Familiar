-- ========================================================
-- SCHEMA SQL PARA PORTAL FAMILIAR CATÓLICO
-- Proyecto Supabase ID: vvvvyusnjwssdahqurqo
-- ========================================================

-- 1. MIEMBROS DE LA FAMILIA
CREATE TABLE IF NOT EXISTS public.family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Padre', 'Madre', 'Hijo', 'Hija', 'Abuelo', 'Abuela', 'Otro')),
  avatar TEXT NOT NULL DEFAULT '👤',
  color TEXT NOT NULL DEFAULT 'bg-indigo-600 text-white',
  pin_code TEXT DEFAULT '1234',
  email TEXT UNIQUE,
  birth_date DATE,
  points INTEGER DEFAULT 0,
  phone TEXT,
  clothing_sizes JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CALENDARIO Y EVENTOS
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME,
  end_time TIME,
  category TEXT NOT NULL CHECK (category IN ('Médico', 'Colegio', 'Misa/Liturgia', 'Ocio/Fiesta', 'Deporte', 'Gestiones', 'Hogar', 'Otro')),
  assigned_member_ids TEXT[] DEFAULT '{}',
  location TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TAREAS Y TAREAS DEL HOGAR
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Limpieza', 'Cocina', 'Estudios', 'Oración', 'Mascotas', 'General')),
  assigned_member_id UUID REFERENCES public.family_members(id) ON DELETE SET NULL,
  points INTEGER DEFAULT 10,
  due_date DATE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  priority TEXT CHECK (priority IN ('Baja', 'Media', 'Alta')),
  frequency TEXT CHECK (frequency IN ('Única', 'Diaria', 'Semanal', 'Mensual')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. LISTA DE LA COMPRA
CREATE TABLE IF NOT EXISTS public.shopping_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity TEXT NOT NULL DEFAULT '1',
  estimated_price NUMERIC(10,2),
  store TEXT,
  completed BOOLEAN DEFAULT FALSE,
  added_by TEXT NOT NULL,
  urgent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. MENÚ SEMANAL
CREATE TABLE IF NOT EXISTS public.meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_key TEXT NOT NULL UNIQUE CHECK (day_key IN ('lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo')),
  breakfast TEXT,
  lunch TEXT,
  snack TEXT,
  dinner TEXT,
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CUMPLEAÑOS E IDEAS DE REGALOS
CREATE TABLE IF NOT EXISTS public.birthdays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  relationship TEXT,
  birth_date DATE NOT NULL,
  avatar TEXT DEFAULT '🎂',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.gift_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  birthday_id UUID REFERENCES public.birthdays(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  estimated_cost NUMERIC(10,2),
  status TEXT CHECK (status IN ('Idea', 'Reservado', 'Comprado')),
  assigned_to TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. NOTAS DE NEVERA (STICKY NOTES)
CREATE TABLE IF NOT EXISTS public.sticky_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  color TEXT NOT NULL CHECK (color IN ('yellow', 'pink', 'blue', 'green', 'purple')),
  author TEXT NOT NULL,
  pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. GASTOS Y FACTURAS DEL HOGAR
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  category TEXT NOT NULL,
  due_date_day INTEGER,
  paid BOOLEAN DEFAULT FALSE,
  paid_by TEXT,
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. CONTACTOS DE EMERGENCIA Y HOGAR
CREATE TABLE IF NOT EXISTS public.emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  relation_or_type TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. INTENCIONES DE MISA Y ORACIÓN
CREATE TABLE IF NOT EXISTS public.catholic_intentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  date DATE NOT NULL,
  type TEXT CHECK (type IN ('Misa', 'Rosario', 'Ofrecimiento', 'Novena')),
  requested_by TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- HABILITAR RLS (ROW LEVEL SECURITY) CON ACCESO LECTURA/ESCRITURA ANÓNIMO/AUTENTICADO PARA LA FAMILIA
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.birthdays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sticky_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catholic_intentions ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS PERMISIVAS PARA LA FAMILIA (ANON & AUTHENTICATED)
CREATE POLICY "Acceso total a la familia para miembros" ON public.family_members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total a la familia para eventos" ON public.calendar_events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total a la familia para tareas" ON public.tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total a la familia para compras" ON public.shopping_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total a la familia para comidas" ON public.meal_plans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total a la familia para cumpleaños" ON public.birthdays FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total a la familia para regalos" ON public.gift_ideas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total a la familia para notas" ON public.sticky_notes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total a la familia para gastos" ON public.expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total a la familia para contactos" ON public.emergency_contacts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total a la familia para intenciones" ON public.catholic_intentions FOR ALL USING (true) WITH CHECK (true);

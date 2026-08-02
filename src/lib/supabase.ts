/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

// Supabase project ID: vvvvyusnjwssdahqurqo
export const SUPABASE_PROJECT_ID = 'vvvvyusnjwssdahqurqo';

const DEFAULT_SUPABASE_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co`;
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2dnZ5dXNuandzc2RhaHF1cnFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0OTMzMTAsImV4cCI6MjEwMTA2OTMxMH0.q52UKEPHxVyAReE6e2UF4EmMKlt86DFwZhEgavxg6eY';

function resolveSupabaseUrl(): string {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  if (typeof envUrl === 'string' && envUrl.trim().startsWith('http')) {
    return envUrl.trim();
  }
  return DEFAULT_SUPABASE_URL;
}

function resolveSupabaseKey(): string {
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (typeof envKey === 'string' && envKey.trim().startsWith('ey') && envKey.trim().length > 50) {
    return envKey.trim();
  }
  return DEFAULT_SUPABASE_ANON_KEY;
}

export const SUPABASE_URL = resolveSupabaseUrl();
export const SUPABASE_ANON_KEY = resolveSupabaseKey();

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export function isSupabaseConfigured(): boolean {
  return true;
}

// ─── Local Storage Helpers (fallback) ────────────────────────────────────────
export function loadLocalData<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(`portal_fam_${key}`);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

export function saveLocalData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(`portal_fam_${key}`, JSON.stringify(data));
  } catch (e) {
    console.warn(`Error saving local data for ${key}:`, e);
  }
}

// ─── Generic Supabase CRUD helpers ───────────────────────────────────────────

// Global diagnostic state for debugging Supabase connection issues
export interface SupabaseStatus {
  url: string;
  lastTable: string;
  lastError: string | null;
  lastRowCount: number | null;
  timestamp: string;
}

let lastStatus: SupabaseStatus = {
  url: SUPABASE_URL,
  lastTable: '',
  lastError: null,
  lastRowCount: null,
  timestamp: ''
};

export function getSupabaseStatus(): SupabaseStatus {
  return lastStatus;
}

/** Fetch all rows from a table, returns [] on error */
export async function sbFetch<T>(table: string): Promise<T[]> {
  lastStatus.lastTable = table;
  lastStatus.timestamp = new Date().toLocaleTimeString();
  try {
    const { data, error } = await supabase.from(table).select('*').order('created_at', { ascending: true });
    if (error) {
      console.warn(`⚠️ sbFetch [${table}] order by created_at error:`, error.message);
      // Fallback query without ordering if created_at column is missing or ordering fails
      const fallback = await supabase.from(table).select('*');
      if (fallback.error) {
        console.error(`❌ sbFetch [${table}]:`, fallback.error.message, fallback.error.details);
        lastStatus.lastError = fallback.error.message;
        lastStatus.lastRowCount = 0;
        return [];
      }
      lastStatus.lastError = null;
      lastStatus.lastRowCount = fallback.data?.length ?? 0;
      return (fallback.data || []) as T[];
    }
    lastStatus.lastError = null;
    lastStatus.lastRowCount = data?.length ?? 0;
    return (data || []) as T[];
  } catch (e: any) {
    console.error(`❌ sbFetch [${table}] exception:`, e);
    lastStatus.lastError = e?.message || String(e);
    lastStatus.lastRowCount = 0;
    return [];
  }
}

/** Upsert a single row (uses 'id' as conflict key) */
export async function sbUpsert(table: string, row: Record<string, unknown>): Promise<void> {
  try {
    const { error } = await supabase.from(table).upsert(row, { onConflict: 'id' });
    if (error) console.error(`❌ sbUpsert [${table}]:`, error.message, error.details);
  } catch (e) {
    console.error(`❌ sbUpsert [${table}] exception:`, e);
  }
}

/** Delete a row by id */
export async function sbDelete(table: string, id: string): Promise<void> {
  try {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) console.error(`❌ sbDelete [${table}] (id=${id}):`, error.message, error.details);
  } catch (e) {
    console.error(`❌ sbDelete [${table}] exception:`, e);
  }
}

/** Upsert multiple rows at once */
export async function sbUpsertMany(table: string, rows: Record<string, unknown>[]): Promise<void> {
  if (!rows.length) return;
  try {
    const { error } = await supabase.from(table).upsert(rows, { onConflict: 'id' });
    if (error) console.error(`❌ sbUpsertMany [${table}]:`, error.message, error.details);
  } catch (e) {
    console.error(`❌ sbUpsertMany [${table}] exception:`, e);
  }
}

/** Fetch a single app_config row by key */
export async function sbGetConfig(key: string): Promise<unknown> {
  try {
    const { data, error } = await supabase.from('app_config').select('value').eq('key', key).single();
    if (error) return null;
    return data?.value ?? null;
  } catch {
    return null;
  }
}

/** Upsert an app_config key/value */
export async function sbSetConfig(key: string, value: unknown): Promise<void> {
  try {
    await supabase.from('app_config').upsert({ key, value }, { onConflict: 'key' });
  } catch (e) {
    console.warn(`sbSetConfig ${key}:`, e);
  }
}

// ─── SQL Setup Script (run once in Supabase SQL editor) ──────────────────────
// This is exported as a constant so it can be shown to the user or auto-run.
export const SUPABASE_SETUP_SQL = `
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── family_members ─────────────────────────────────────────────────────────
create table if not exists family_members (
  id text primary key,
  name text not null,
  role text not null,
  avatar text,
  color text,
  pin_code text default '1234',
  email text,
  birth_date text,
  age integer,
  gender text,
  points integer default 0,
  phone text,
  clothing_sizes jsonb,
  allergies jsonb,
  notes text,
  permissions jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── calendar_events ────────────────────────────────────────────────────────
create table if not exists calendar_events (
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

-- ── tasks ──────────────────────────────────────────────────────────────────
create table if not exists tasks (
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

-- ── shopping_items ─────────────────────────────────────────────────────────
create table if not exists shopping_items (
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

-- ── meal_plans ─────────────────────────────────────────────────────────────
create table if not exists meal_plans (
  id text primary key,
  day_key text unique not null,
  breakfast text,
  lunch text,
  snack text,
  dinner text,
  notes text,
  created_at timestamptz default now()
);

-- ── birthdays ──────────────────────────────────────────────────────────────
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

-- ── sticky_notes ───────────────────────────────────────────────────────────
create table if not exists sticky_notes (
  id text primary key,
  title text,
  content text,
  color text default 'yellow',
  author text,
  pinned boolean default false,
  created_at timestamptz default now()
);

-- ── expenses ───────────────────────────────────────────────────────────────
create table if not exists expenses (
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

-- ── emergency_contacts ─────────────────────────────────────────────────────
create table if not exists emergency_contacts (
  id text primary key,
  name text not null,
  relation_or_type text,
  phone text,
  address text,
  notes text,
  created_at timestamptz default now()
);

-- ── catholic_intentions ────────────────────────────────────────────────────
create table if not exists catholic_intentions (
  id text primary key,
  title text not null,
  date text,
  type text,
  requested_by text,
  completed boolean default false,
  created_at timestamptz default now()
);

-- ── anniversaries ──────────────────────────────────────────────────────────
create table if not exists anniversaries (
  id text primary key,
  title text not null,
  type text default 'Otro',
  date text,
  member_ids jsonb default '[]',
  notes text,
  created_at timestamptz default now()
);

-- ── reward_requests ────────────────────────────────────────────────────────
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

-- ── custom_task_lists ──────────────────────────────────────────────────────
create table if not exists custom_task_lists (
  id text primary key,
  name text not null,
  categories jsonb default '[]',
  created_at timestamptz default now()
);

-- ── app_config ─────────────────────────────────────────────────────────────
-- Key/value store for app-wide settings (family name, dark mode, theme, etc.)
create table if not exists app_config (
  key text primary key,
  value jsonb,
  updated_at timestamptz default now()
);

-- ── RLS: Disable row-level security for all tables (family app, no auth) ──
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
alter table app_config disable row level security;
`;

export type SectionKey =
  | "inicio"
  | "compras"
  | "cumpleanos"
  | "calendario"
  | "tareas"
  | "menu"
  | "familia"
  | "notas";

export interface FamilyMember {
  id: string;
  name: string;
  emoji: string;
  color: string; // tailwind color key, e.g. "rose"
  role?: string;
}

export interface ShoppingItem {
  id: string;
  text: string;
  qty?: string;
  done: boolean;
}

export interface ShoppingList {
  id: string;
  name: string;
  icon: string;
  items: ShoppingItem[];
}

export interface Birthday {
  id: string;
  name: string;
  day: number;
  month: number; // 1-12
  year?: number;
  emoji: string;
  relation?: string;
}

export type EventCategory =
  | "familia"
  | "colegio"
  | "salud"
  | "trabajo"
  | "ocio"
  | "otro";

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // ISO yyyy-MM-dd
  time?: string;
  category: EventCategory;
  notes?: string;
  memberId?: string;
}

export type ChoreFrequency = "una-vez" | "diaria" | "semanal";

export interface ChoreTask {
  id: string;
  text: string;
  done: boolean;
  assignedTo?: string;
  frequency: ChoreFrequency;
  createdAt: string;
}

export interface MealSlot {
  comida: string;
  cena: string;
}

export type MealPlan = Record<number, MealSlot>; // 0=Mon..6=Sun

export interface Note {
  id: string;
  text: string;
  color: string;
  author?: string;
  createdAt: string;
}

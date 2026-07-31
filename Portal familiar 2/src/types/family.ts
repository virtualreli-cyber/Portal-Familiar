export type FamilyRole = 'Papá' | 'Mamá' | 'Hijo/a' | 'Abuelo/a' | 'Mascota' | 'Otro';

export interface FamilyMember {
  id: string;
  name: string;
  role: FamilyRole;
  avatar: string; // Emoji or custom avatar string
  color: string; // Hex or Tailwind color name
  points: number;
}

export type ShoppingCategory = 
  | 'Frutas y Verduras'
  | 'Lácteos y Huevos'
  | 'Carne y Pescado'
  | 'Panadería'
  | 'Despensa'
  | 'Limpieza y Hogar'
  | 'Mascotas'
  | 'Bebidas'
  | 'Varios';

export type PriorityLevel = 'Baja' | 'Media' | 'Alta';

export interface ShoppingItem {
  id: string;
  name: string;
  category: ShoppingCategory;
  quantity: number;
  unit: string;
  completed: boolean;
  assignedMemberId?: string;
  estimatedPrice?: number;
  priority: PriorityLevel;
  notes?: string;
  addedAt: string;
}

export type EventCategory = 
  | 'Cita Médica'
  | 'Escuela y Colegio'
  | 'Deporte'
  | 'Cumpleaños'
  | 'Fiesta y Ocio'
  | 'Mantenimiento Hogar'
  | 'Recordatorio';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  endTime?: string;
  category: EventCategory;
  assignedMemberIds: string[];
  location?: string;
  description?: string;
  color?: string;
}

export interface GiftIdea {
  id: string;
  title: string;
  estimatedPrice?: number;
  status: 'Idea' | 'Reservado' | 'Comprado' | 'Envuelto';
  link?: string;
}

export interface Birthday {
  id: string;
  personName: string;
  relationship: string;
  date: string; // YYYY-MM-DD or MM-DD
  avatar: string;
  giftIdeas: GiftIdea[];
  notes?: string;
}

export type ChoreCategory = 'Diaria' | 'Semanal' | 'Escuela' | 'Mascotas' | 'Proyectos Hogar';

export interface Chore {
  id: string;
  title: string;
  category: ChoreCategory;
  assignedMemberId?: string;
  points: number;
  completed: boolean;
  completedAt?: string;
  dueDate?: string; // YYYY-MM-DD
  recurring: 'Ninguna' | 'Diaria' | 'Semanal' | 'Mensual';
  notes?: string;
}

export interface DailyMeal {
  lunch: string;
  dinner: string;
  lunchNotes?: string;
  dinnerNotes?: string;
}

export interface MealPlan {
  [dayKey: string]: DailyMeal; // 'Lunes', 'Martes', etc.
}

export interface Recipe {
  id: string;
  title: string;
  prepTime: string;
  ingredients: string[];
  category: 'Rápida' | 'Fin de semana' | 'Saludable' | 'Postre';
}

export type BillCategory = 'Servicios' | 'Vivienda' | 'Suscripciones' | 'Educación' | 'Seguros' | 'Otros';

export interface Bill {
  id: string;
  title: string;
  category: BillCategory;
  amount: number;
  dueDateDay: number; // 1 to 31
  status: 'Pendiente' | 'Pagado';
  notes?: string;
}

export interface FridgeNote {
  id: string;
  text: string;
  authorMemberId: string;
  color: 'yellow' | 'pink' | 'blue' | 'green' | 'purple';
  createdAt: string;
  isPinned?: boolean;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  category: 'Médico' | 'Emergencia' | 'Hogar' | 'Mascota' | 'Escuela';
  notes?: string;
}

export interface Reward {
  id: string;
  title: string;
  pointsCost: number;
  description: string;
  icon: string;
  claimsCount: number;
}

export interface FamilyData {
  familyName: string;
  wifiName: string;
  wifiPass: string;
  activeMemberId: string;
  members: FamilyMember[];
  shoppingItems: ShoppingItem[];
  events: CalendarEvent[];
  birthdays: Birthday[];
  chores: Chore[];
  mealPlan: MealPlan;
  recipes: Recipe[];
  bills: Bill[];
  fridgeNotes: FridgeNote[];
  emergencyContacts: EmergencyContact[];
  rewards: Reward[];
}

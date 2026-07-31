export type FamilyRole = 'Papá' | 'Mamá' | 'Hijo' | 'Hija' | 'Abuelo' | 'Abuela' | 'Otro';

export interface FamilyMember {
  id: string;
  name: string;
  role: FamilyRole;
  avatar: string; // URL or emoji
  color: string; // Hex or Tailwind color name
  birthDate: string; // YYYY-MM-DD
  points: number;
  allergies?: string[];
  clothingSizes?: {
    shirt?: string;
    pants?: string;
    shoes?: string;
  };
  notes?: string;
  phone?: string;
}

export type CategoryShopping = 
  | 'Frutas y Verduras'
  | 'Lácteos y Frescos'
  | 'Carnes y Pescados'
  | 'Despensa y Bebidas'
  | 'Limpieza y Hogar'
  | 'Mascotas'
  | 'Otros';

export interface ShoppingItem {
  id: string;
  name: string;
  category: CategoryShopping;
  quantity: string;
  estimatedPrice?: number;
  store?: string; // Mercadona, Carrefour, Lidl, Frutería, etc.
  completed: boolean;
  addedBy: string; // member name
  urgent?: boolean;
  createdAt: string;
}

export type EventCategory = 'Médico' | 'Colegio' | 'Ocio/Fiesta' | 'Deporte' | 'Gestiones' | 'Hogar' | 'Otro';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  endTime?: string;
  category: EventCategory;
  memberId?: string; // assigned member
  location?: string;
  notes?: string;
}

export interface BirthdayItem {
  id: string;
  name: string;
  relationship: string;
  birthDate: string; // YYYY-MM-DD
  avatar: string;
  giftIdeas: {
    id: string;
    title: string;
    estimatedCost?: number;
    bought: boolean;
    assignedTo?: string;
  }[];
  notes?: string;
}

export type Priority = 'Baja' | 'Media' | 'Alta';
export type Frequency = 'Única' | 'Diaria' | 'Semanal' | 'Mensual';

export interface TaskItem {
  id: string;
  title: string;
  category: 'Limpieza' | 'Cocina' | 'Jardín' | 'Estudios' | 'Mascotas' | 'Compras' | 'General';
  assignedToMemberId: string;
  points: number;
  dueDate: string; // YYYY-MM-DD
  completed: boolean;
  completedAt?: string;
  priority: Priority;
  frequency: Frequency;
}

export interface RewardItem {
  id: string;
  title: string;
  costPoints: number;
  description: string;
  icon: string;
  claimedBy?: string[]; // Array of member IDs who claimed
}

export interface DayMeal {
  breakfast: string;
  lunch: string;
  snack: string;
  dinner: string;
}

export interface WeeklyMealPlan {
  [day: string]: DayMeal; // 'lunes', 'martes', etc.
}

export type ExpenseCategory = 'Vivienda' | 'Suministros' | 'Alimentación' | 'Colegio' | 'Transporte' | 'Ocio' | 'Salud' | 'Otros';

export interface ExpenseItem {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  paidBy: string; // member name
  notes?: string;
}

export interface StickyNote {
  id: string;
  title: string;
  content: string;
  color: 'yellow' | 'pink' | 'blue' | 'green' | 'purple';
  author: string;
  createdAt: string;
  pinned: boolean;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationOrType: string; // e.g. "Pediatra", "Seguro Hogar", "Emergencias"
  phone: string;
  address?: string;
  notes?: string;
}

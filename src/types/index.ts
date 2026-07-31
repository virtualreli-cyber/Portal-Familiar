export type FamilyRole = 'Padre' | 'Madre' | 'Hijo' | 'Hija' | 'Abuelo' | 'Abuela' | 'Otro';

export interface RolePermissions {
  canManageUsers: boolean;
  canManageFinances: boolean;
  canManageTasks: boolean;
  canManageCalendar: boolean;
  canManageShopping: boolean;
  canManageMeals: boolean;
  canManageCatholic: boolean;
  canRedeemRewards: boolean;
}

export interface FamilyMember {
  id: string;
  name: string;
  role: FamilyRole;
  avatar: string; // Unique Emoji or Icon
  color: string; // Unique Tailwind color class (e.g. bg-indigo-600)
  pinCode?: string; // e.g. "1234"
  email?: string;
  birthDate: string; // YYYY-MM-DD
  age?: number;
  gender?: 'Masculino' | 'Femenino';
  points: number;
  clothingSizes?: {
    shirt?: string;
    pants?: string;
    shoes?: string;
  };
  allergies?: string[];
  notes?: string;
  phone?: string;
  permissions?: RolePermissions; // Per-member custom permissions override
}

export interface AnniversaryItem {
  id: string;
  memberIds: string[];
  title: string; // e.g. "Aniversario de Boda", "Santo de Carlos"
  type: 'Boda' | 'Santo' | 'Otro';
  date: string; // YYYY-MM-DD
  notes?: string;
}

export type CategoryShopping = string;

export interface ShoppingItem {
  id: string;
  name: string;
  category: CategoryShopping;
  quantity: string;
  estimatedPrice?: number;
  store?: string;
  completed: boolean;
  addedBy: string;
  urgent?: boolean;
  createdAt: string;
}

export type EventCategory = string;

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  endTime?: string;
  category: EventCategory;
  assignedMemberIds: string[];
  location?: string;
  notes?: string;
}

export type Priority = 'Baja' | 'Media' | 'Alta';
export type Frequency = 'Única' | 'Diaria' | 'Semanal' | 'Mensual';

export interface TaskItem {
  id: string;
  title: string;
  category: string;
  assignedMemberId?: string;
  points: number;
  dueDate: string; // YYYY-MM-DD
  completed: boolean;
  completedAt?: string;
  priority: Priority;
  frequency: Frequency;
  listId?: string;
  validationStatus?: 'none' | 'pending_approval' | 'approved' | 'rejected';
  requestedByMemberId?: string;
}

export interface RewardRequest {
  id: string;
  rewardId: string;
  rewardTitle: string;
  pointsCost: number;
  memberId: string;
  memberName: string;
  status: 'requested' | 'approved' | 'enjoyed' | 'rejected' | 'revoked';
  requestedAt: string;
  approvedAt?: string;
}

export interface RewardItem {
  id: string;
  title: string;
  pointsCost: number;
  description: string;
  icon: string;
  claimedBy?: string[];
}

export interface CustomTaskList {
  id: string;
  name: string;
  categories: string[];
}

export interface WeddingNote {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
}

export interface DayMeal {
  breakfast: string;
  lunch: string;
  snack: string;
  dinner: string;
  notes?: string;
}

export interface WeeklyMealPlan {
  [dayKey: string]: DayMeal;
}

export interface GiftIdea {
  id: string;
  title: string;
  estimatedCost?: number;
  status: 'Idea' | 'Reservado' | 'Comprado';
  assignedTo?: string;
}

export interface BirthdayItem {
  id: string;
  name: string;
  relationship: string;
  birthDate: string; // YYYY-MM-DD
  avatar: string;
  giftIdeas: GiftIdea[];
  notes?: string;
}

export interface StickyNote {
  id: string;
  title: string;
  content: string;
  color: 'yellow' | 'pink' | 'blue' | 'purple' | 'green';
  author: string;
  createdAt: string;
  pinned: boolean;
}

export type ExpenseCategory = string;

export interface ExpenseItem {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  dueDateDay?: number;
  paid: boolean;
  paidBy?: string;
  date: string;
  notes?: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationOrType: string;
  phone: string;
  address?: string;
  notes?: string;
}

export interface CatholicIntention {
  id: string;
  title: string;
  date: string;
  type: 'Misa' | 'Rosario' | 'Ofrecimiento' | 'Novena';
  requestedBy: string;
  completed: boolean;
}

export interface SaintOfDay {
  name: string;
  title: string;
  bio: string;
  liturgicalColor: string;
  season: string;
  quote: string;
}

export interface ActiveSection {
  id: string;
  title: string;
  icon: string;
  type: 'todo_list' | 'text_note';
  items: { id: string; text: string; done: boolean }[];
  visible: boolean;
}

export type ActiveTab = 
  | 'dashboard'
  | 'tasks'
  | 'shopping'
  | 'calendar'
  | 'notes'
  | 'meals'
  | 'catholic'
  | 'contacts'
  | 'birthdays'
  | 'finances'
  | 'wedding'
  | 'admin';

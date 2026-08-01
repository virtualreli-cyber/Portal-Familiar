import { 
  FamilyMember, 
  CalendarEvent, 
  TaskItem, 
  ShoppingItem, 
  WeeklyMealPlan, 
  BirthdayItem, 
  StickyNote, 
  ExpenseItem, 
  EmergencyContact, 
  CatholicIntention,
  RewardItem,
  RolePermissions
} from '../types';

export const DEFAULT_ROLE_PERMISSIONS: Record<string, RolePermissions> = {
  Padre: {
    canManageUsers: true,
    canManageFinances: true,
    canManageTasks: true,
    canManageCalendar: true,
    canManageShopping: true,
    canManageMeals: true,
    canManageCatholic: true,
    canRedeemRewards: true,
  },
  Madre: {
    canManageUsers: true,
    canManageFinances: true,
    canManageTasks: true,
    canManageCalendar: true,
    canManageShopping: true,
    canManageMeals: true,
    canManageCatholic: true,
    canRedeemRewards: true,
  },
  Hijo: {
    canManageUsers: false,
    canManageFinances: false,
    canManageTasks: true,
    canManageCalendar: true,
    canManageShopping: true,
    canManageMeals: false,
    canManageCatholic: true,
    canRedeemRewards: true,
  },
  Hija: {
    canManageUsers: false,
    canManageFinances: false,
    canManageTasks: true,
    canManageCalendar: true,
    canManageShopping: true,
    canManageMeals: false,
    canManageCatholic: true,
    canRedeemRewards: true,
  },
  Abuelo: {
    canManageUsers: false,
    canManageFinances: false,
    canManageTasks: true,
    canManageCalendar: true,
    canManageShopping: true,
    canManageMeals: false,
    canManageCatholic: true,
    canRedeemRewards: true,
  },
  Abuela: {
    canManageUsers: false,
    canManageFinances: false,
    canManageTasks: true,
    canManageCalendar: true,
    canManageShopping: true,
    canManageMeals: true,
    canManageCatholic: true,
    canRedeemRewards: true,
  },
};

export const INITIAL_MEMBERS: FamilyMember[] = [
  {
    id: 'm1',
    name: 'Carlos Santos (Papá)',
    role: 'Padre',
    avatar: '👨‍💼',
    color: 'bg-indigo-600 text-white',
    pinCode: '1234',
    email: 'padre@familia.com',
    birthDate: '1984-06-15',
    age: 42,
    gender: 'Masculino',
    points: 350,
    phone: '+34 600 111 222',
    clothingSizes: { shirt: 'L', pants: '42', shoes: '43' },
    allergies: [],
    notes: 'Administrador principal del hogar'
  },
  {
    id: 'm2',
    name: 'María González (Mamá)',
    role: 'Madre',
    avatar: '👩‍🏫',
    color: 'bg-rose-600 text-white',
    pinCode: '1234',
    email: 'mama@familia.com',
    birthDate: '1986-09-20',
    age: 40,
    gender: 'Femenino',
    points: 420,
    phone: '+34 600 333 444',
    clothingSizes: { shirt: 'M', pants: '38', shoes: '38' },
    allergies: [],
    notes: 'Coordinadora de actividades'
  },
  {
    id: 'm3',
    name: 'Mateo Santos',
    role: 'Hijo',
    avatar: '👦',
    color: 'bg-amber-500 text-white',
    pinCode: '1234',
    email: 'mateo@familia.com',
    birthDate: '2014-03-10',
    age: 12,
    gender: 'Masculino',
    points: 120,
    clothingSizes: { shirt: '12 años', pants: '12 años', shoes: '36' },
    allergies: ['Melocotón'],
    notes: 'Fútbol y robótica'
  },
  {
    id: 'm4',
    name: 'Sofía Santos',
    role: 'Hija',
    avatar: '👧',
    color: 'bg-emerald-500 text-white',
    pinCode: '1234',
    email: 'sofia@familia.com',
    birthDate: '2017-11-05',
    age: 9,
    gender: 'Femenino',
    points: 95,
    clothingSizes: { shirt: '9 años', pants: '9 años', shoes: '33' },
    allergies: ['Frutos secos'],
    notes: 'Violín y catequesis'
  },
  {
    id: 'm5',
    name: 'Abuela Carmen',
    role: 'Abuela',
    avatar: '👵',
    color: 'bg-purple-600 text-white',
    pinCode: '1234',
    email: 'abuela@familia.com',
    birthDate: '1958-07-16',
    age: 68,
    gender: 'Femenino',
    points: 500,
    phone: '+34 600 555 666',
    clothingSizes: { shirt: 'XL', pants: '44', shoes: '39' },
    allergies: ['Lactosa'],
    notes: 'Reza el Rosario diario por la familia'
  }
];

export const INITIAL_SHOPPING_ITEMS: ShoppingItem[] = [];
export const INITIAL_EVENTS: CalendarEvent[] = [];
export const INITIAL_TASKS: TaskItem[] = [];
export const INITIAL_BIRTHDAYS: BirthdayItem[] = [];
export const INITIAL_NOTES: StickyNote[] = [];
export const INITIAL_EXPENSES: ExpenseItem[] = [];
export const INITIAL_EMERGENCY_CONTACTS: EmergencyContact[] = [];
export const INITIAL_INTENTIONS: CatholicIntention[] = [];

export const INITIAL_REWARDS: RewardItem[] = [
  {
    id: 'r1',
    title: 'Tarde de Cine con Palomitas',
    pointsCost: 150,
    description: 'Elegir la película del fin de semana y palomitas en familia.',
    icon: '🎬'
  },
  {
    id: 'r2',
    title: 'Excursión al Parque de Atracciones',
    pointsCost: 300,
    description: 'Día especial de aventura de fin de semana.',
    icon: '🎢'
  },
  {
    id: 'r3',
    title: 'Helado Especial en la Heladería Favorita',
    pointsCost: 80,
    description: 'Dos bolas de helado con toppings de elección.',
    icon: '🍦'
  },
  {
    id: 'r4',
    title: '30 min Extra de Juego / Tiempo Libre',
    pointsCost: 50,
    description: 'Tiempo libre adicional antes de cenar.',
    icon: '🎮'
  }
];

export const INITIAL_MEAL_PLAN: WeeklyMealPlan = {};

import { 
  FamilyMember, 
  ShoppingItem, 
  CalendarEvent, 
  TaskItem, 
  RewardItem, 
  WeeklyMealPlan, 
  BirthdayItem, 
  StickyNote, 
  ExpenseItem, 
  EmergencyContact, 
  CatholicIntention,
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
    canManageCalendar: false,
    canManageShopping: true,
    canManageMeals: false,
    canManageCatholic: true,
    canRedeemRewards: true,
  },
  Hija: {
    canManageUsers: false,
    canManageFinances: false,
    canManageTasks: true,
    canManageCalendar: false,
    canManageShopping: true,
    canManageMeals: false,
    canManageCatholic: true,
    canRedeemRewards: true,
  },
  Abuelo: {
    canManageUsers: false,
    canManageFinances: false,
    canManageTasks: false,
    canManageCalendar: true,
    canManageShopping: true,
    canManageMeals: true,
    canManageCatholic: true,
    canRedeemRewards: false,
  },
  Abuela: {
    canManageUsers: false,
    canManageFinances: false,
    canManageTasks: false,
    canManageCalendar: true,
    canManageShopping: true,
    canManageMeals: true,
    canManageCatholic: true,
    canRedeemRewards: false,
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
    allergies: ['Polen'],
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
    notes: 'Coordinadora de actividades y compras'
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
    notes: 'Le encantan el fútbol y los robots'
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
    notes: 'Clases de violín y catequesis'
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

export const INITIAL_SHOPPING_ITEMS: ShoppingItem[] = [
  {
    id: 's1',
    name: 'Aceite de Oliva Virgen Extra',
    category: 'Despensa y Bebidas',
    quantity: '2 botellas (1L)',
    estimatedPrice: 18.5,
    store: 'Mercadona',
    completed: false,
    addedBy: 'María González (Mamá)',
    urgent: true,
    createdAt: '2026-07-30'
  },
  {
    id: 's2',
    name: 'Manzanas Golden y Plátanos',
    category: 'Frutas y Verduras',
    quantity: '2 kg',
    estimatedPrice: 4.8,
    store: 'Frutería local',
    completed: false,
    addedBy: 'Carlos Santos (Papá)',
    urgent: false,
    createdAt: '2026-07-31'
  },
  {
    id: 's3',
    name: 'Leche Entera y Yogures',
    category: 'Lácteos y Frescos',
    quantity: '6 packs',
    estimatedPrice: 6.2,
    store: 'Mercadona',
    completed: true,
    addedBy: 'María González (Mamá)',
    urgent: false,
    createdAt: '2026-07-29'
  },
  {
    id: 's4',
    name: 'Pechuga de Pollo Corral',
    category: 'Carnes y Pescados',
    quantity: '1 kg',
    estimatedPrice: 8.9,
    store: 'Carrefour',
    completed: false,
    addedBy: 'Abuela Carmen',
    urgent: true,
    createdAt: '2026-07-31'
  },
  {
    id: 's5',
    name: 'Detergente para Ropa y Suavizante',
    category: 'Limpieza y Hogar',
    quantity: '1 brik grande',
    estimatedPrice: 9.5,
    store: 'Lidl',
    completed: false,
    addedBy: 'María González (Mamá)',
    urgent: false,
    createdAt: '2026-07-30'
  }
];

const todayISO = new Date().toISOString().split('T')[0];

export const INITIAL_EVENTS: CalendarEvent[] = [
  {
    id: 'e1',
    title: 'Misa Dominical en Parroquia San José',
    date: todayISO,
    time: '12:00',
    endTime: '13:00',
    category: 'Misa/Liturgia',
    assignedMemberIds: ['m1', 'm2', 'm3', 'm4', 'm5'],
    location: 'Parroquia San José, Calle Mayor 12',
    notes: 'Llevar la colecta para Cáritas y llegar 10 min antes.'
  },
  {
    id: 'e2',
    title: 'Pediatra - Revisión de Sofía',
    date: todayISO,
    time: '17:30',
    category: 'Médico',
    assignedMemberIds: ['m2', 'm4'],
    location: 'Centro de Salud Norte',
    notes: 'Llevar cartilla de vacunación y tarjeta sanitaria.'
  },
  {
    id: 'e3',
    title: 'Entrenamiento de Fútbol Mateo',
    date: '2026-08-01',
    time: '18:00',
    category: 'Deporte',
    assignedMemberIds: ['m1', 'm3'],
    location: 'Campo de Deportes Municipal',
    notes: 'Llevar botas y cantimplora.'
  },
  {
    id: 'e4',
    title: 'Reunión de Padres del Colegio',
    date: '2026-08-03',
    time: '19:00',
    category: 'Colegio',
    assignedMemberIds: ['m1', 'm2'],
    location: 'Salón de Actos Colegio Montealto',
    notes: 'Tratar excursión de inicio de curso.'
  },
  {
    id: 'e5',
    title: 'Cumpleaños Abuela Carmen',
    date: '2026-08-05',
    time: '14:00',
    category: 'Ocio/Fiesta',
    assignedMemberIds: ['m1', 'm2', 'm3', 'm4', 'm5'],
    location: 'Casa Familiar / Comida especial',
    notes: 'Comida sorpresa con tarta de manzana.'
  }
];

export const INITIAL_TASKS: TaskItem[] = [
  {
    id: 't1',
    title: 'Ordenar habitación y hacer la cama',
    category: 'Limpieza',
    assignedMemberId: 'm3',
    points: 15,
    dueDate: todayISO,
    completed: false,
    priority: 'Media',
    frequency: 'Diaria'
  },
  {
    id: 't2',
    title: 'Poner y recoger la mesa de la cena',
    category: 'Cocina',
    assignedMemberId: 'm4',
    points: 10,
    dueDate: todayISO,
    completed: true,
    completedAt: todayISO,
    priority: 'Alta',
    frequency: 'Diaria'
  },
  {
    id: 't3',
    title: 'Rezar el Santo Rosario en familia',
    category: 'Oración',
    assignedMemberId: 'm5',
    points: 25,
    dueDate: todayISO,
    completed: false,
    priority: 'Alta',
    frequency: 'Diaria'
  },
  {
    id: 't4',
    title: 'Sacar la basura y separar reciclaje',
    category: 'General',
    assignedMemberId: 'm3',
    points: 15,
    dueDate: todayISO,
    completed: false,
    priority: 'Media',
    frequency: 'Diaria'
  },
  {
    id: 't5',
    title: 'Revisar deberes de verano y lectura',
    category: 'Estudios',
    assignedMemberId: 'm4',
    points: 20,
    dueDate: '2026-08-01',
    completed: false,
    priority: 'Media',
    frequency: 'Semanal'
  }
];

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
    title: 'Excursión al Parque de Atracciones / Acuático',
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

export const INITIAL_MEAL_PLAN: WeeklyMealPlan = {
  lunes: {
    breakfast: 'Tostadas de pan integral con aceite y tomate, zumo de naranja.',
    lunch: 'Lentejas estofadas con verduras y lomo a la plancha.',
    snack: 'Fruta fresca y puñado de almendras.',
    dinner: 'Crema de calabacín y tortilla española de patatas.',
    notes: 'Dejar lentejas en remojo el domingo por la noche.'
  },
  martes: {
    breakfast: 'Leche con cacao / café y galletería casera.',
    lunch: 'Arroz a la cubana con huevo frito y plátano.',
    snack: 'Yogur con miel y copos de avena.',
    dinner: 'Pescado blanco (Merluza al horno) con ensalada mixta.',
    notes: 'Comprar pescado fresco por la mañana.'
  },
  miércoles: {
    breakfast: 'Tostadas con mantequilla y mermelada / Zumo.',
    lunch: 'Macarrones boloñesa con queso gratinado.',
    snack: 'Bocadillo de jamón serrano.',
    dinner: 'Sopa de picadillo y verduras al vapor con aliño.',
    notes: 'Día favorito de los niños.'
  },
  jueves: {
    breakfast: 'Smoothie de plátano y fresa con tostada.',
    lunch: 'Pollo asado con patatas al romero.',
    snack: 'Fruta variada y galletas maría.',
    dinner: 'Pizza casera de verduras y atún.',
    notes: 'Hacer la masa de la pizza con los niños.'
  },
  viernes: {
    breakfast: 'Churros o tostadas con tomate.',
    lunch: 'Garbanzos con espinacas y bacalao (Plato tradicional).',
    snack: 'Batido de leche y fruta.',
    dinner: 'Empanada gallega y ensalada verde.',
    notes: 'Día de abstinencia de carne si aplica por calendario.'
  },
  sábado: {
    breakfast: 'Desayuno especial de tortitas en familia.',
    lunch: 'Paella / Arroz familiar de verduras y marisco.',
    snack: 'Helado o merienda festiva.',
    dinner: 'Hamburguesas caseras completas.',
    notes: 'Comida familiar con la abuela.'
  },
  domingo: {
    breakfast: 'Tostadas, café recién hecho y fruta.',
    lunch: 'Asado de ternera o carne en salsa con puré de patatas.',
    snack: 'Bizcocho casero.',
    dinner: 'Cena ligera: Sopa de estrellas y fruta.',
    notes: 'Revisión del menú de la semana siguiente.'
  }
};

export const INITIAL_BIRTHDAYS: BirthdayItem[] = [
  {
    id: 'b1',
    name: 'Abuela Carmen',
    relationship: 'Abuela materna',
    birthDate: '1958-08-05',
    avatar: '👵',
    notes: 'Cumple 68 años. Le encantan los libros de historia y los devocionarios.',
    giftIdeas: [
      { id: 'g1', title: 'Libro de Oraciones e Historia Sacra', estimatedCost: 22, status: 'Reservado', assignedTo: 'María González (Mamá)' },
      { id: 'g2', title: 'Manta suave para el salón', estimatedCost: 35, status: 'Idea' }
    ]
  },
  {
    id: 'b2',
    name: 'Mateo',
    relationship: 'Hijo',
    birthDate: '2014-03-10',
    avatar: '👦',
    notes: 'Cumple 13 años pronto.',
    giftIdeas: [
      { id: 'g3', title: 'Balón de fútbol oficial', estimatedCost: 30, status: 'Comprado', assignedTo: 'Carlos Santos (Papá)' },
      { id: 'g4', title: 'Juego de construcción de robótica', estimatedCost: 45, status: 'Idea' }
    ]
  },
  {
    id: 'b3',
    name: 'Sofía',
    relationship: 'Hija',
    birthDate: '2017-11-05',
    avatar: '👧',
    notes: 'Cumple 9 años.',
    giftIdeas: [
      { id: 'g5', title: 'Atril y partituras para violín', estimatedCost: 25, status: 'Idea' }
    ]
  }
];

export const INITIAL_NOTES: StickyNote[] = [
  {
    id: 'n1',
    title: '📌 Recordatorio Misa de San Ignacio',
    content: 'Recordar llevar la colecta especial para las misiones y felicitar a los tíos que celebran San Ignacio.',
    color: 'yellow',
    author: 'María González (Mamá)',
    createdAt: '2026-07-31',
    pinned: true
  },
  {
    id: 'n2',
    title: '🔑 Wi-Fi de la Casa',
    content: 'Red: FamiliaSantos_5G | Clave: PazYBien2026',
    color: 'blue',
    author: 'Carlos Santos (Papá)',
    createdAt: '2026-07-25',
    pinned: true
  },
  {
    id: 'n3',
    title: '🍰 Tarta para el sábado',
    content: 'Comprar harina, levadura y manzanas para el bizcocho del sábado con la abuela.',
    color: 'pink',
    author: 'Abuela Carmen',
    createdAt: '2026-07-30',
    pinned: false
  }
];

export const INITIAL_EXPENSES: ExpenseItem[] = [
  {
    id: 'ex1',
    title: 'Hipoteca / Alquiler del Hogar',
    amount: 780.00,
    category: 'Vivienda',
    dueDateDay: 1,
    paid: true,
    paidBy: 'Carlos Santos (Papá)',
    date: '2026-07-01',
    notes: 'Pago mensual por transferencia autom.'
  },
  {
    id: 'ex2',
    title: 'Recibo Luz y Gas (Naturgy)',
    amount: 112.40,
    category: 'Suministros',
    dueDateDay: 10,
    paid: true,
    paidBy: 'María González (Mamá)',
    date: '2026-07-10',
    notes: 'Suministros de verano'
  },
  {
    id: 'ex3',
    title: 'Cuotas Colegios e Inglés',
    amount: 240.00,
    category: 'Colegio',
    dueDateDay: 5,
    paid: true,
    paidBy: 'Carlos Santos (Papá)',
    date: '2026-07-05',
    notes: 'Mateo y Sofía'
  },
  {
    id: 'ex4',
    title: 'Seguro Médico Familiar (Sanitas)',
    amount: 145.00,
    category: 'Salud',
    dueDateDay: 20,
    paid: false,
    date: '2026-08-20',
    notes: 'Cobertura completa 5 miembros'
  }
];

export const INITIAL_EMERGENCY_CONTACTS: EmergencyContact[] = [
  {
    id: 'c1',
    name: 'Parroquia San José (Párroco D. Fernando)',
    relationOrType: 'Parroquia / Sacerdote',
    phone: '+34 912 345 678',
    address: 'Calle Mayor 12, Madrid',
    notes: 'Para avisos de confesión, misas e intenciones.'
  },
  {
    id: 'c2',
    name: 'Dra. Elena Ruiz (Pediatra)',
    relationOrType: 'Centro de Salud Norte',
    phone: '+34 912 999 888',
    address: 'Av. de la Salud 45',
    notes: 'Urgencias pediátricas hasta las 20:00h.'
  },
  {
    id: 'c3',
    name: 'Urgencias Médicas General',
    relationOrType: 'Emergencias 112',
    phone: '112',
    notes: 'Ambulancias y emergencias 24h.'
  },
  {
    id: 'c4',
    name: 'Asistencia Seguros Hogar (Mapfre)',
    relationOrType: 'Seguro de Casa / Fontanería',
    phone: '+34 900 101 010',
    notes: 'Nº Póliza: 987654321-HOG'
  }
];

export const INITIAL_INTENTIONS: CatholicIntention[] = [
  {
    id: 'i1',
    title: 'Por la salud y buena recuperación del abuelo',
    date: todayISO,
    type: 'Misa',
    requestedBy: 'Abuela Carmen',
    completed: false
  },
  {
    id: 'i2',
    title: 'Rosario por la paz en las familias y el mundo',
    date: todayISO,
    type: 'Rosario',
    requestedBy: 'María González (Mamá)',
    completed: true
  },
  {
    id: 'i3',
    title: 'Acción de gracias por el fin de curso escolar',
    date: '2026-08-01',
    type: 'Ofrecimiento',
    requestedBy: 'Carlos Santos (Papá)',
    completed: false
  }
];

import { 
  FamilyMember, 
  ShoppingItem, 
  CalendarEvent, 
  BirthdayItem, 
  TaskItem, 
  RewardItem, 
  WeeklyMealPlan, 
  ExpenseItem, 
  StickyNote, 
  EmergencyContact 
} from '../types';

// Helper to calculate current year/month dates
const today = new Date();
const currentYear = today.getFullYear();

const formatDate = (daysOffset: number = 0) => {
  const d = new Date(today);
  d.setDate(d.getDate() + daysOffset);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export const INITIAL_MEMBERS: FamilyMember[] = [
  {
    id: 'm1',
    name: 'Carlos',
    role: 'Papá',
    avatar: '👨‍💼',
    color: '#3b82f6', // blue
    birthDate: '1984-05-14',
    points: 120,
    allergies: ['Melocotón'],
    clothingSizes: { shirt: 'L', pants: '42', shoes: '43' },
    phone: '612 345 678',
    notes: 'Alergia al polen en primavera. Grupo sanguíneo A+'
  },
  {
    id: 'm2',
    name: 'Elena',
    role: 'Mamá',
    avatar: '👩‍🏫',
    color: '#ec4899', // pink
    birthDate: '1986-11-22',
    points: 150,
    allergies: ['Ninguna'],
    clothingSizes: { shirt: 'M', pants: '38', shoes: '38' },
    phone: '623 456 789',
    notes: 'Seguro médico Sanitas'
  },
  {
    id: 'm3',
    name: 'Lucas',
    role: 'Hijo',
    avatar: '👦',
    color: '#10b981', // emerald
    birthDate: '2014-08-09',
    points: 85,
    allergies: ['Frutos Secos (trazas)'],
    clothingSizes: { shirt: '12-14 años', pants: '12 años', shoes: '36' },
    notes: 'Le encanta el fútbol y las matemáticas'
  },
  {
    id: 'm4',
    name: 'Sofía',
    role: 'Hija',
    avatar: '👧',
    color: '#f59e0b', // amber
    birthDate: '2017-03-28',
    points: 95,
    allergies: ['Lactosa (leve)'],
    clothingSizes: { shirt: '8-10 años', pants: '8 años', shoes: '31' },
    notes: 'Clases de pintura y gimnasia'
  },
  {
    id: 'm5',
    name: 'Abuela Carmen',
    role: 'Abuela',
    avatar: '👵',
    color: '#8b5cf6', // purple
    birthDate: '1955-01-18',
    points: 200,
    phone: '634 567 890',
    notes: 'Toma tensión por las mañanas'
  }
];

export const INITIAL_SHOPPING: ShoppingItem[] = [
  {
    id: 's1',
    name: 'Leche entera sin lactosa (Pack 6)',
    category: 'Lácteos y Frescos',
    quantity: '2 packs',
    estimatedPrice: 6.50,
    store: 'Mercadona',
    completed: false,
    addedBy: 'Elena',
    urgent: true,
    createdAt: formatDate(0)
  },
  {
    id: 's2',
    name: 'Aceite de Oliva Virgen Extra',
    category: 'Despensa y Bebidas',
    quantity: '1 garrafa 5L',
    estimatedPrice: 28.90,
    store: 'Mercadona',
    completed: false,
    addedBy: 'Carlos',
    urgent: true,
    createdAt: formatDate(-1)
  },
  {
    id: 's3',
    name: 'Plátanos de Canarias',
    category: 'Frutas y Verduras',
    quantity: '1.5 kg',
    estimatedPrice: 2.80,
    store: 'Frutería del barrio',
    completed: true,
    addedBy: 'Elena',
    urgent: false,
    createdAt: formatDate(-2)
  },
  {
    id: 's4',
    name: 'Pechugas de pollo fileteadas',
    category: 'Carnes y Pescados',
    quantity: '1 kg',
    estimatedPrice: 7.20,
    store: 'Carnicería',
    completed: false,
    addedBy: 'Carlos',
    urgent: false,
    createdAt: formatDate(0)
  },
  {
    id: 's5',
    name: 'Detergente lavadora gel',
    category: 'Limpieza y Hogar',
    quantity: '1 botella',
    estimatedPrice: 8.50,
    store: 'Carrefour',
    completed: false,
    addedBy: 'Elena',
    urgent: false,
    createdAt: formatDate(-1)
  },
  {
    id: 's6',
    name: 'Pan de molde integral',
    category: 'Despensa y Bebidas',
    quantity: '2 paquetes',
    estimatedPrice: 2.30,
    store: 'Mercadona',
    completed: true,
    addedBy: 'Lucas',
    urgent: false,
    createdAt: formatDate(-2)
  },
  {
    id: 's7',
    name: 'Huevos camperos (Docena)',
    category: 'Lácteos y Frescos',
    quantity: '1 docena',
    estimatedPrice: 2.95,
    store: 'Mercadona',
    completed: false,
    addedBy: 'Elena',
    urgent: true,
    createdAt: formatDate(0)
  }
];

export const INITIAL_EVENTS: CalendarEvent[] = [
  {
    id: 'e1',
    title: 'Revisión Pediatra - Sofía',
    date: formatDate(1),
    time: '17:30',
    category: 'Médico',
    memberId: 'm4',
    location: 'Centro de Salud Norte',
    notes: 'Llevar la libreta de vacunación'
  },
  {
    id: 'e2',
    title: 'Reunión de padres - Colegio Lucas',
    date: formatDate(3),
    time: '18:00',
    category: 'Colegio',
    memberId: 'm3',
    location: 'Aula 5B - Colegio Cervantes',
    notes: 'Hablar sobre la excursión de primavera'
  },
  {
    id: 'e3',
    title: 'Partido de Fútbol de Lucas',
    date: formatDate(5),
    time: '11:00',
    category: 'Deporte',
    memberId: 'm3',
    location: 'Polideportivo Municipal',
    notes: 'Llevar camiseta verde de repuesto'
  },
  {
    id: 'e4',
    title: 'Cena familiar de Fin de Mes',
    date: formatDate(8),
    time: '21:00',
    category: 'Ocio/Fiesta',
    memberId: 'm1',
    location: 'Restaurante Pizzería La Piazza',
    notes: 'Reserva a nombre de Carlos'
  },
  {
    id: 'e5',
    title: 'Revision ITV del coche',
    date: formatDate(12),
    time: '09:15',
    category: 'Gestiones',
    memberId: 'm1',
    location: 'Estación ITV Valdemoro',
    notes: 'Revisar presiones de neumáticos antes'
  }
];

export const INITIAL_BIRTHDAYS: BirthdayItem[] = [
  {
    id: 'b1',
    name: 'Sofía',
    relationship: 'Hija',
    birthDate: `${currentYear}-03-28`,
    avatar: '👧',
    giftIdeas: [
      { id: 'g1', title: 'Bicicleta de paseo con cesta', estimatedCost: 120, bought: true, assignedTo: 'Papá y Mamá' },
      { id: 'g2', title: 'Set de pinturas acuarela profesionales', estimatedCost: 25, bought: false, assignedTo: 'Abuela Carmen' },
      { id: 'g3', title: 'Libro de cuentos ilustrados', estimatedCost: 15, bought: true, assignedTo: 'Lucas' }
    ],
    notes: 'Quiere temática de unicornios para la tarta de cumpleaños'
  },
  {
    id: 'b2',
    name: 'Carlos',
    relationship: 'Papá',
    birthDate: `${currentYear}-05-14`,
    avatar: '👨‍💼',
    giftIdeas: [
      { id: 'g4', title: 'Reloj deportivo GPS', estimatedCost: 140, bought: false, assignedTo: 'Elena' },
      { id: 'g5', title: 'Auriculares inalámbricos', estimatedCost: 60, bought: false }
    ],
    notes: 'Le gusta la tecnología y salir a correr'
  },
  {
    id: 'b3',
    name: 'Lucas',
    relationship: 'Hijo',
    birthDate: `${currentYear}-08-09`,
    avatar: '👦',
    giftIdeas: [
      { id: 'g6', title: 'Videojuego Nintendo Switch', estimatedCost: 55, bought: false },
      { id: 'g7', title: 'Zapatillas de fútbol con tacos', estimatedCost: 45, bought: false }
    ],
    notes: 'Talla 36 de pie'
  },
  {
    id: 'b4',
    name: 'Abuela Carmen',
    relationship: 'Abuela',
    birthDate: `${currentYear}-01-18`,
    avatar: '👵',
    giftIdeas: [
      { id: 'g8', title: 'E-reader Kobo/Kindle fuente grande', estimatedCost: 110, bought: true, assignedTo: 'Carlos y Elena' }
    ],
    notes: 'Le gusta leer novela histórica'
  }
];

export const INITIAL_TASKS: TaskItem[] = [
  {
    id: 't1',
    title: 'Recoger los juguetes del salón',
    category: 'Limpieza',
    assignedToMemberId: 'm4', // Sofía
    points: 15,
    dueDate: formatDate(0),
    completed: false,
    priority: 'Media',
    frequency: 'Diaria'
  },
  {
    id: 't2',
    title: 'Poner y recoger el lavavajillas',
    category: 'Cocina',
    assignedToMemberId: 'm3', // Lucas
    points: 20,
    dueDate: formatDate(0),
    completed: true,
    completedAt: formatDate(0),
    priority: 'Alta',
    frequency: 'Diaria'
  },
  {
    id: 't3',
    title: 'Regar las plantas de la terraza',
    category: 'Jardín',
    assignedToMemberId: 'm3', // Lucas
    points: 10,
    dueDate: formatDate(1),
    completed: false,
    priority: 'Baja',
    frequency: 'Semanal'
  },
  {
    id: 't4',
    title: 'Sacar a pasear a Toby (Perro)',
    category: 'Mascotas',
    assignedToMemberId: 'm1', // Carlos
    points: 15,
    dueDate: formatDate(0),
    completed: true,
    completedAt: formatDate(0),
    priority: 'Alta',
    frequency: 'Diaria'
  },
  {
    id: 't5',
    title: 'Repasar los deberes de Matemáticas',
    category: 'Estudios',
    assignedToMemberId: 'm3', // Lucas
    points: 25,
    dueDate: formatDate(0),
    completed: false,
    priority: 'Alta',
    frequency: 'Diaria'
  },
  {
    id: 't6',
    title: 'Doblar la ropa limpia y guardarla',
    category: 'Limpieza',
    assignedToMemberId: 'm2', // Elena
    points: 20,
    dueDate: formatDate(1),
    completed: false,
    priority: 'Media',
    frequency: 'Semanal'
  }
];

export const INITIAL_REWARDS: RewardItem[] = [
  {
    id: 'r1',
    title: '30 Minutos extra de consola/tablet',
    costPoints: 50,
    description: 'Tiempo extra para jugar después de cenar o el fin de semana.',
    icon: '🎮'
  },
  {
    id: 'r2',
    title: 'Elegir la película del viernes por la noche',
    costPoints: 70,
    description: 'Eliges qué ver toda la familia con palomitas caseras.',
    icon: '🍿'
  },
  {
    id: 'r3',
    title: 'Elegir la cena especial de un día',
    costPoints: 100,
    description: 'Pizza casera, hamburguesas o sushi en casa.',
    icon: '🍕'
  },
  {
    id: 'r4',
    title: 'Ir a las camas elásticas o parque de atracciones',
    costPoints: 200,
    description: 'Salida de fin de semana al parque temático o salto urbano.',
    icon: '🎟️'
  }
];

export const INITIAL_MEAL_PLAN: WeeklyMealPlan = {
  lunes: {
    breakfast: 'Tostadas con tomate y aceite, leche con cacao / café',
    lunch: 'Lentejas estofadas con verdura y arroz + fruta',
    snack: 'Bocadillo de jamón cocido',
    dinner: 'Tortilla francesa con ensalada verde'
  },
  martes: {
    breakfast: 'Cereales integrales con yogur y Plátano',
    lunch: 'Pechugas de pollo a la plancha con puré de patatas',
    snack: 'Fruta fresca variada y puñado de nueces',
    dinner: 'Crema de calabacín y filete de merluza al horno'
  },
  miercoles: {
    breakfast: 'Tostadas de pan integral con queso fresco y mermelada',
    lunch: 'Macarrones con boloñesa de pavo y queso rallado',
    snack: 'Yogur con avena y miel',
    dinner: 'Ensalada completa con atún, huevo duro y espárragos'
  },
  jueves: {
    breakfast: 'Batido casero de fruta y galletas integrales',
    lunch: 'Garbanzos salteados con espinacas y bacalao',
    snack: 'Sándwich de queso y pavo',
    dinner: 'Sopa de fideos y hamburguesa de ternera a la plancha'
  },
  viernes: {
    breakfast: 'Tostadas con tomate y jamón ibérico',
    lunch: 'Arroz al horno tradicional / Paella de verduras',
    snack: 'Fruta de temporada y tazón de leche',
    dinner: 'Noche de Pizza Casera o Quesadillas en familia'
  },
  sabado: {
    breakfast: 'Tortitas caseras con plátano y sirope / miel',
    lunch: 'Solomillo de cerdo con patatas gajo al horno',
    snack: 'Helado casero o tostadas',
    dinner: 'Tacos de pollo con guacamole y ensalada'
  },
  domingo: {
    breakfast: 'Churros o tostadas con zumo de naranja natural',
    lunch: 'Cocido madrileño completo (sopa + carnes + garbanzos)',
    snack: 'Bizcocho casero de yogur',
    dinner: 'Cena ligera: Gazpacho/salmorejo y san jacobos caseros'
  }
};

export const INITIAL_EXPENSES: ExpenseItem[] = [
  {
    id: 'ex1',
    title: 'Suministro Eléctrico (Luz)',
    amount: 85.40,
    category: 'Suministros',
    date: formatDate(-5),
    paidBy: 'Carlos',
    notes: 'Factura mensual Endesa'
  },
  {
    id: 'ex2',
    title: 'Compra semanal supermercado',
    amount: 142.60,
    category: 'Alimentación',
    date: formatDate(-3),
    paidBy: 'Elena',
    notes: 'Mercadona'
  },
  {
    id: 'ex3',
    title: 'Comedor escolar Lucas y Sofía',
    amount: 190.00,
    category: 'Colegio',
    date: formatDate(-10),
    paidBy: 'Elena',
    notes: 'Mes en curso'
  },
  {
    id: 'ex4',
    title: 'Cine y merienda del domingo',
    amount: 45.50,
    category: 'Ocio',
    date: formatDate(-2),
    paidBy: 'Carlos',
    notes: 'Entradas familiares + palomitas'
  },
  {
    id: 'ex5',
    title: 'Gasolina Coche familiar',
    amount: 65.00,
    category: 'Transporte',
    date: formatDate(-4),
    paidBy: 'Carlos',
    notes: 'Depósito lleno'
  }
];

export const INITIAL_STICKY_NOTES: StickyNote[] = [
  {
    id: 'n1',
    title: '📶 Clave del WiFi de Casa',
    content: 'Red: HogarGarcia_5G\nClave: FamiliaFeliz2026!',
    color: 'yellow',
    author: 'Carlos',
    createdAt: formatDate(-10),
    pinned: true
  },
  {
    id: 'n2',
    title: '🔧 Fontanero para el grifo',
    content: 'Manolo Fontanería: 655 44 33 22.\nViene el jueves a las 11:00 am.',
    color: 'pink',
    author: 'Elena',
    createdAt: formatDate(-2),
    pinned: true
  },
  {
    id: 'n3',
    title: '🐶 Vacunas de Toby',
    content: 'Toca desparasitar a Toby a mitad de mes. Comprar pastilla en la clínica.',
    color: 'green',
    author: 'Carlos',
    createdAt: formatDate(-5),
    pinned: false
  },
  {
    id: 'n4',
    title: '🎂 Tarta de Sofía',
    content: 'Avisar a la pastelería antes del viernes con el dibujo que eligió.',
    color: 'purple',
    author: 'Elena',
    createdAt: formatDate(-1),
    pinned: false
  }
];

export const INITIAL_EMERGENCY_CONTACTS: EmergencyContact[] = [
  {
    id: 'ec1',
    name: 'Emergencias Generales',
    relationOrType: 'Urgencias 112',
    phone: '112',
    notes: 'Servicio gratuito de emergencias sanitarias, policía y bomberos.'
  },
  {
    id: 'ec2',
    name: 'Centro de Salud Norte (Pediatría)',
    relationOrType: 'Médico de Familia / Pediatra',
    phone: '918 55 44 33',
    address: 'Calle Mayor 45, Valdemoro',
    notes: 'Pediatra Dr. Martínez. Cita previa por app o teléfono.'
  },
  {
    id: 'ec3',
    name: 'Seguro del Hogar (Asistencia 24h)',
    relationOrType: 'Seguro Mapfre',
    phone: '900 100 200',
    notes: 'Póliza Nº: 987654321 - Cobertura cristales y fontanería urgente.'
  },
  {
    id: 'ec4',
    name: 'Colegio Cervantes',
    relationOrType: 'Escuela Lucas y Sofía',
    phone: '918 22 11 00',
    address: 'Av. de la Educación 12',
    notes: 'Horario de secretaría: 9:00 a 14:00'
  },
  {
    id: 'ec5',
    name: 'Abuela Carmen',
    relationOrType: 'Contacto Familiar Cercano',
    phone: '634 567 890',
    notes: 'Tiene copia de las llaves de casa.'
  }
];

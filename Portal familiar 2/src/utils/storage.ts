import { FamilyData, FamilyMember, ShoppingItem, CalendarEvent, Birthday, Chore, MealPlan, Bill, FridgeNote, EmergencyContact, Reward, Recipe } from '../types/family';

const STORAGE_KEY = 'hogarsync_family_dashboard_v1';

// Get current year and month for dynamic initial data
const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
const todayDay = now.getDate();

const formatDate = (dayOffset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const INITIAL_MEMBERS: FamilyMember[] = [
  { id: 'm-1', name: 'Carlos', role: 'Papá', avatar: '👨‍💼', color: '#3B82F6', points: 120 },
  { id: 'm-2', name: 'Elena', role: 'Mamá', avatar: '👩‍⚕️', color: '#EC4899', points: 150 },
  { id: 'm-3', name: 'Mateo', role: 'Hijo/a', avatar: '👦', color: '#10B981', points: 85 },
  { id: 'm-4', name: 'Sofía', role: 'Hijo/a', avatar: '👧', color: '#F59E0B', points: 95 },
  { id: 'm-5', name: 'Abuela María', role: 'Abuelo/a', avatar: '👵', color: '#8B5CF6', points: 200 },
  { id: 'm-6', name: 'Toby', role: 'Mascota', avatar: '🐶', color: '#6366F1', points: 50 },
];

export const INITIAL_SHOPPING: ShoppingItem[] = [
  { id: 's-1', name: 'Leche entera 6L', category: 'Lácteos y Huevos', quantity: 1, unit: 'pack', completed: false, priority: 'Alta', estimatedPrice: 5.40, addedAt: formatDate(0) },
  { id: 's-2', name: 'Pan de molde artesanal', category: 'Panadería', quantity: 2, unit: 'uds', completed: false, priority: 'Media', estimatedPrice: 3.20, addedAt: formatDate(0) },
  { id: 's-3', name: 'Manzanas Fuji & plátanos', category: 'Frutas y Verduras', quantity: 2, unit: 'kg', completed: false, priority: 'Media', estimatedPrice: 4.50, addedAt: formatDate(-1) },
  { id: 's-4', name: 'Pechuga de pollo fileteada', category: 'Carne y Pescado', quantity: 1, unit: 'kg', completed: true, priority: 'Alta', estimatedPrice: 7.90, addedAt: formatDate(-2) },
  { id: 's-5', name: 'Detergente para lavadora', category: 'Limpieza y Hogar', quantity: 1, unit: 'botella', completed: false, priority: 'Alta', estimatedPrice: 8.50, addedAt: formatDate(-1) },
  { id: 's-6', name: 'Pienso para Toby (Salmón)', category: 'Mascotas', quantity: 1, unit: 'saco 5kg', completed: false, priority: 'Media', estimatedPrice: 18.00, addedAt: formatDate(0) },
  { id: 's-7', name: 'Aceite de oliva virgen extra', category: 'Despensa', quantity: 2, unit: 'litros', completed: true, priority: 'Baja', estimatedPrice: 16.00, addedAt: formatDate(-3) },
];

export const INITIAL_EVENTS: CalendarEvent[] = [
  { id: 'e-1', title: 'Cita Pediatra Sofía (Vacunas)', date: formatDate(1), time: '10:30', category: 'Cita Médica', assignedMemberIds: ['m-2', 'm-4'], location: 'Centro de Salud Norte', description: 'Llevar la cartilla de vacunación.', color: '#EF4444' },
  { id: 'e-2', title: 'Reunión de Padres - Colegio Mateo', date: formatDate(3), time: '17:00', category: 'Escuela y Colegio', assignedMemberIds: ['m-1', 'm-2'], location: 'Aula 4B', description: 'Hablar sobre la excursión de fin de curso.', color: '#3B82F6' },
  { id: 'e-3', title: 'Partido de Fútbol Mateo', date: formatDate(5), time: '11:00', category: 'Deporte', assignedMemberIds: ['m-1', 'm-3'], location: 'Polideportivo Municipal', description: 'Traer la equipación roja.', color: '#10B981' },
  { id: 'e-4', title: 'Cena Familiar de Fin de Semana', date: formatDate(6), time: '21:00', category: 'Fiesta y Ocio', assignedMemberIds: ['m-1', 'm-2', 'm-3', 'm-4', 'm-5'], location: 'Casa de los Abuelos', description: '¡La abuela cocina paella!', color: '#F59E0B' },
  { id: 'e-5', title: 'Revisión Anual de la Caldera', date: formatDate(8), time: '09:30', category: 'Mantenimiento Hogar', assignedMemberIds: ['m-1'], location: 'En Casa', description: 'Técnico de la caldera.', color: '#8B5CF6' },
];

export const INITIAL_BIRTHDAYS: Birthday[] = [
  {
    id: 'b-1',
    personName: 'Sofía',
    relationship: 'Hija (Cumple 8 años)',
    date: `${currentYear}-${currentMonth}-${String(Math.min(todayDay + 4, 28)).padStart(2, '0')}`,
    avatar: '👧',
    notes: '¡Le encantan las acuarelas y los libros de magia!',
    giftIdeas: [
      { id: 'g-1', title: 'Set de Pintura Acuarela Profesional', estimatedPrice: 22, status: 'Comprado' },
      { id: 'g-2', title: 'Libro "El Diario de una Bruja"', estimatedPrice: 14, status: 'Idea' },
      { id: 'g-3', title: 'Tarta de Chocolate con Fresas', estimatedPrice: 25, status: 'Reservado' },
    ]
  },
  {
    id: 'b-2',
    personName: 'Carlos (Papá)',
    relationship: 'Papá',
    date: `${currentYear}-${String((now.getMonth() + 2) > 12 ? 1 : now.getMonth() + 2).padStart(2, '0')}-15`,
    avatar: '👨‍💼',
    notes: 'Acompañar con un buen vino tinto.',
    giftIdeas: [
      { id: 'g-4', title: 'Reloj Deportivo con GPS', estimatedPrice: 110, status: 'Idea' },
      { id: 'g-5', title: 'Auriculares Inalámbricos', estimatedPrice: 45, status: 'Idea' },
    ]
  },
  {
    id: 'b-3',
    personName: 'Abuela María',
    relationship: 'Abuela',
    date: `${currentYear}-${String((now.getMonth() + 3) > 12 ? 1 : now.getMonth() + 3).padStart(2, '0')}-02`,
    avatar: '👵',
    notes: 'Organizar una merienda sorpresa con toda la familia.',
    giftIdeas: [
      { id: 'g-6', title: 'Álbum Fotográfico Familiar Digital', estimatedPrice: 35, status: 'Idea' },
    ]
  }
];

export const INITIAL_CHORES: Chore[] = [
  { id: 'c-1', title: 'Sacar a pasear a Toby por la mañana', category: 'Mascotas', assignedMemberId: 'm-3', points: 15, completed: false, dueDate: formatDate(0), recurring: 'Diaria' },
  { id: 'c-2', title: 'Poner y recoger el lavavajillas', category: 'Diaria', assignedMemberId: 'm-4', points: 10, completed: true, dueDate: formatDate(0), recurring: 'Diaria' },
  { id: 'c-3', title: 'Regar las plantas de la terraza', category: 'Diaria', assignedMemberId: 'm-5', points: 10, completed: false, dueDate: formatDate(0), recurring: 'Diaria' },
  { id: 'c-4', title: 'Hacer deberes de Matemáticas e Inglés', category: 'Escuela', assignedMemberId: 'm-3', points: 20, completed: false, dueDate: formatDate(0), recurring: 'Diaria' },
  { id: 'c-5', title: 'Limpiar y ordenar los juguetes de la sala', category: 'Diaria', assignedMemberId: 'm-4', points: 15, completed: false, dueDate: formatDate(0), recurring: 'Diaria' },
  { id: 'c-6', title: 'Bajar la basura de reciclaje (Plástico y Papel)', category: 'Diaria', assignedMemberId: 'm-1', points: 10, completed: true, dueDate: formatDate(0), recurring: 'Diaria' },
  { id: 'c-7', title: 'Organizar armario del pasillo', category: 'Proyectos Hogar', assignedMemberId: 'm-2', points: 40, completed: false, dueDate: formatDate(3), recurring: 'Ninguna' },
];

export const INITIAL_MEALS: MealPlan = {
  Lunes: { lunch: 'Lentejas estofadas con verduras', dinner: 'Tortilla de patatas con ensalada mixta', lunchNotes: 'Dejar lentejas en remojo el domingo', dinnerNotes: 'Acompañar con pan fresco' },
  Martes: { lunch: 'Pechuga de pollo a la plancha con arroz integral', dinner: 'Crema de calabacín y picatostes', lunchNotes: '', dinnerNotes: 'Sofreír cebollita antes' },
  Miércoles: { lunch: 'Macarrones con boloñesa de pavo', dinner: 'Pescado blanco al horno con patatas', lunchNotes: 'Queso rallado por encima', dinnerNotes: '' },
  Jueves: { lunch: 'Garbanzos cocidos con espinacas y huevo duro', dinner: 'Sándwiches vegetales mixtos y fruta', lunchNotes: '', dinnerNotes: 'Noche rápida de cena' },
  Viernes: { lunch: 'Albondigas caseras en salsa con arroz', dinner: '🍕 Noche de Pizza Casera Familiar', lunchNotes: '', dinnerNotes: '¡Los niños ayudan a poner los ingredientes!' },
  Sábado: { lunch: 'Paella valenciana mixta de la Abuela', dinner: 'Hamburguesas caseras completas', lunchNotes: 'Comida especial familiar', dinnerNotes: '' },
  Domingo: { lunch: 'Asado de pollo con verduras al horno', dinner: 'Sopa de picadillo suave con picatostes', lunchNotes: '', dinnerNotes: 'Cena ligera para empezar bien la semana' },
};

export const INITIAL_RECIPES: Recipe[] = [
  { id: 'r-1', title: 'Lentejas Tradicionales', prepTime: '45 min', ingredients: ['Lentejas', 'Zanahorias', 'Patata', 'Cebolla', 'Laurel', 'Ajo'], category: 'Saludable' },
  { id: 'r-2', title: 'Pizza Casera de Fin de Semana', prepTime: '30 min', ingredients: ['Masa de pizza', 'Tomate frito', 'Queso mozzarella', 'Jamón cocido', 'Champiñones', 'Orégano'], category: 'Fin de semana' },
  { id: 'r-3', title: 'Crema de Calabacín Suave', prepTime: '25 min', ingredients: ['Calabacines', 'Patata', 'Cebolla', 'Quesitos o nata', 'Aceite de oliva'], category: 'Rápida' },
];

export const INITIAL_BILLS: Bill[] = [
  { id: 'b-1', title: 'Luz y Electricidad (Iberdrola)', category: 'Servicios', amount: 84.50, dueDateDay: 10, status: 'Pagado', notes: 'Factura bimestral' },
  { id: 'b-2', title: 'Internet Fibra 1Gbps + Móviles', category: 'Servicios', amount: 49.90, dueDateDay: 5, status: 'Pagado', notes: 'Descuento aplicado por fidelidad' },
  { id: 'b-3', title: 'Seguro del Coche', category: 'Seguros', amount: 35.00, dueDateDay: 18, status: 'Pendiente', notes: 'Cuota mensual' },
  { id: 'b-4', title: 'Comedor Escolar Mateo y Sofía', category: 'Educación', amount: 160.00, dueDateDay: 25, status: 'Pendiente', notes: 'Mes en curso' },
  { id: 'b-5', title: 'Netflix & Disney+ Familiar', category: 'Suscripciones', amount: 21.98, dueDateDay: 12, status: 'Pagado', notes: 'Cobro automático' },
];

export const INITIAL_NOTES: FridgeNote[] = [
  { id: 'fn-1', text: '❤️ ¡Que tengáis un gran día todos! La comida está guardada en el frigorífico.', authorMemberId: 'm-2', color: 'pink', createdAt: formatDate(0), isPinned: true },
  { id: 'fn-2', text: '🔑 ¡No olvidar cerrar la puerta del patio al salir!', authorMemberId: 'm-1', color: 'yellow', createdAt: formatDate(-1), isPinned: true },
  { id: 'fn-3', text: '🐶 Sacar la correa verde para la excursión del perro.', authorMemberId: 'm-3', color: 'green', createdAt: formatDate(-2) },
  { id: 'fn-4', text: '📱 Clave del Wi-Fi de casa anotada en el panel desplegable superior.', authorMemberId: 'm-1', color: 'blue', createdAt: formatDate(-3) },
];

export const INITIAL_CONTACTS: EmergencyContact[] = [
  { id: 'ec-1', name: 'Urgencias Médicas / Centro de Salud', phone: '112 / 91 123 45 67', category: 'Médico', notes: 'Nº de Historial en la carpeta roja' },
  { id: 'ec-2', name: 'Dr. López (Pediatra)', phone: '654 321 098', category: 'Médico', notes: 'Citas de 16:00 a 19:00' },
  { id: 'ec-3', name: 'Fontanero de Confianza (Paco)', phone: '612 345 678', category: 'Hogar', notes: 'Urgencias 24h' },
  { id: 'ec-4', name: 'Veterinario San Bernardo', phone: '91 987 65 43', category: 'Mascota', notes: 'Historial de vacunas de Toby' },
  { id: 'ec-5', name: 'Secretaría Colegio Montealto', phone: '91 555 12 34', category: 'Escuela', notes: 'Horario atención 9:00 - 14:00' },
];

export const INITIAL_REWARDS: Reward[] = [
  { id: 'rew-1', title: 'Elegir Película para el Noche de Cine', pointsCost: 50, description: 'Tú escoges la película y las palomitas del viernes por la noche.', icon: '🍿', claimsCount: 4 },
  { id: 'rew-2', title: '30 Minutos Extra de Videojuegos / Consola', pointsCost: 40, description: 'Validez para el fin de semana.', icon: '🎮', claimsCount: 8 },
  { id: 'rew-3', title: 'Elegir el Menú de la Cena Favorita', pointsCost: 60, description: 'Hamburguesa, tacos, o lo que más te apetezca.', icon: '🍔', claimsCount: 2 },
  { id: 'rew-4', title: 'Excursión Especial el Fin de Semana', pointsCost: 150, description: 'Visita al parque de atracciones, zoo, o cine en pantalla gigante.', icon: '🎟️', claimsCount: 1 },
];

export const INITIAL_FAMILY_DATA: FamilyData = {
  familyName: 'Familia García López',
  wifiName: 'MiCasa_5G_Familia',
  wifiPass: 'HogarSeguro2025!',
  activeMemberId: 'm-1',
  members: INITIAL_MEMBERS,
  shoppingItems: INITIAL_SHOPPING,
  events: INITIAL_EVENTS,
  birthdays: INITIAL_BIRTHDAYS,
  chores: INITIAL_CHORES,
  mealPlan: INITIAL_MEALS,
  recipes: INITIAL_RECIPES,
  bills: INITIAL_BILLS,
  fridgeNotes: INITIAL_NOTES,
  emergencyContacts: INITIAL_CONTACTS,
  rewards: INITIAL_REWARDS,
};

export const loadFamilyData = (): FamilyData => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      // Ensure all keys exist
      return {
        ...INITIAL_FAMILY_DATA,
        ...parsed,
      };
    }
  } catch (e) {
    console.error('Error reading localStorage:', e);
  }
  return INITIAL_FAMILY_DATA;
};

export const saveFamilyData = (data: FamilyData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving to localStorage:', e);
  }
};

export const resetToDefaultData = (): FamilyData => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_FAMILY_DATA));
  return INITIAL_FAMILY_DATA;
};

// Date Helpers
export const getDaysUntil = (dateStr: string): number => {
  if (!dateStr) return 999;
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // Handle YYYY-MM-DD or MM-DD or dynamic dates
  let target: Date;
  if (dateStr.length === 5) { // MM-DD
    const [m, d] = dateStr.split('-').map(Number);
    target = new Date(now.getFullYear(), m - 1, d);
    if (target < now) {
      target.setFullYear(now.getFullYear() + 1);
    }
  } else {
    const [y, m, d] = dateStr.split('-').map(Number);
    target = new Date(y, m - 1, d);
    // If it's a birthday (past year), adjust to upcoming occurrence this year or next year
    if (target < now && (now.getFullYear() - y > 1)) {
      target.setFullYear(now.getFullYear());
      if (target < now) {
        target.setFullYear(now.getFullYear() + 1);
      }
    }
  }
  
  const diffTime = target.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const formatDateSpanish = (dateStr: string): string => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length < 2) return dateStr;
  
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  
  if (parts.length === 3) {
    const day = parseInt(parts[2], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parts[0];
    return `${day} de ${monthNames[month]} (${year})`;
  } else {
    const day = parseInt(parts[1], 10);
    const month = parseInt(parts[0], 10) - 1;
    return `${day} de ${monthNames[month]}`;
  }
};

export const getZodiacSign = (dateStr: string): string => {
  const parts = dateStr.split('-');
  if (parts.length < 2) return '⭐';
  const month = parseInt(parts[parts.length - 2], 10);
  const day = parseInt(parts[parts.length - 1], 10);

  if ((month == 1 && day >= 20) || (month == 2 && day <= 18)) return '♒ Acuario';
  if ((month == 2 && day >= 19) || (month == 3 && day <= 20)) return '♓ Piscis';
  if ((month == 3 && day >= 21) || (month == 4 && day <= 19)) return '♈ Aries';
  if ((month == 4 && day >= 20) || (month == 5 && day <= 20)) return '♉ Tauro';
  if ((month == 5 && day >= 21) || (month == 6 && day <= 20)) return '♊ Géminis';
  if ((month == 6 && day >= 21) || (month == 7 && day <= 22)) return '♋ Cáncer';
  if ((month == 7 && day >= 23) || (month == 8 && day <= 22)) return '♌ Leo';
  if ((month == 8 && day >= 23) || (month == 9 && day <= 22)) return '♍ Virgo';
  if ((month == 9 && day >= 23) || (month == 10 && day <= 22)) return '♎ Libra';
  if ((month == 10 && day >= 23) || (month == 11 && day <= 21)) return '♏ Escorpio';
  if ((month == 11 && day >= 22) || (month == 12 && day <= 21)) return '♐ Sagitario';
  return '♑ Capricornio';
};

export const getCategoryColor = (category: string): string => {
  switch (category) {
    case 'Cita Médica': return 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/40 dark:text-rose-300';
    case 'Escuela y Colegio': return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/40 dark:text-blue-300';
    case 'Deporte': return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-300';
    case 'Cumpleaños': return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300';
    case 'Fiesta y Ocio': return 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/40 dark:text-purple-300';
    case 'Mantenimiento Hogar': return 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300';
    default: return 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-900/40 dark:text-indigo-300';
  }
};

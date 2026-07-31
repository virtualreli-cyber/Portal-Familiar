import { generateId } from "../lib/id";
import type {
  Birthday,
  CalendarEvent,
  ChoreTask,
  FamilyMember,
  MealPlan,
  Note,
  ShoppingList,
} from "../types";

const today = new Date();
const iso = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (n: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + n);
  return d;
};

export const seedMembers: FamilyMember[] = [
  { id: generateId(), name: "Mamá", emoji: "👩", color: "rose", role: "Madre" },
  { id: generateId(), name: "Papá", emoji: "👨", color: "sky", role: "Padre" },
  { id: generateId(), name: "Lucía", emoji: "👧", color: "violet", role: "Hija" },
  { id: generateId(), name: "Martín", emoji: "👦", color: "amber", role: "Hijo" },
];

export const seedShoppingLists: ShoppingList[] = [
  {
    id: generateId(),
    name: "Supermercado",
    icon: "🛒",
    items: [
      { id: generateId(), text: "Leche", qty: "2L", done: false },
      { id: generateId(), text: "Huevos", qty: "12", done: false },
      { id: generateId(), text: "Pan", done: true },
      { id: generateId(), text: "Fruta variada", done: false },
      { id: generateId(), text: "Pasta", qty: "2 paq.", done: false },
    ],
  },
  {
    id: generateId(),
    name: "Farmacia",
    icon: "💊",
    items: [
      { id: generateId(), text: "Paracetamol", done: false },
      { id: generateId(), text: "Tiritas", done: false },
    ],
  },
  {
    id: generateId(),
    name: "Bricolaje",
    icon: "🔧",
    items: [{ id: generateId(), text: "Bombillas LED", qty: "4", done: false }],
  },
];

export const seedBirthdays: Birthday[] = [
  { id: generateId(), name: "Lucía", day: today.getDate(), month: today.getMonth() + 1, year: 2016, emoji: "🎀", relation: "Hija" },
  { id: generateId(), name: "Abuela Carmen", day: addDays(9).getDate(), month: addDays(9).getMonth() + 1, year: 1954, emoji: "👵", relation: "Abuela" },
  { id: generateId(), name: "Martín", day: addDays(24).getDate(), month: addDays(24).getMonth() + 1, year: 2019, emoji: "🚀", relation: "Hijo" },
  { id: generateId(), name: "Tío Javier", day: addDays(50).getDate(), month: addDays(50).getMonth() + 1, year: 1985, emoji: "🎸", relation: "Tío" },
];

export const seedEvents: CalendarEvent[] = [
  {
    id: generateId(),
    title: "Revisión pediatra",
    date: iso(addDays(2)),
    time: "10:30",
    category: "salud",
    notes: "Llevar cartilla de vacunación",
  },
  {
    id: generateId(),
    title: "Reunión de padres",
    date: iso(addDays(5)),
    time: "17:00",
    category: "colegio",
  },
  {
    id: generateId(),
    title: "Cena familiar",
    date: iso(addDays(7)),
    time: "21:00",
    category: "familia",
  },
  {
    id: generateId(),
    title: "Cine en familia",
    date: iso(addDays(1)),
    time: "19:30",
    category: "ocio",
  },
];

export const seedChores: ChoreTask[] = [
  { id: generateId(), text: "Sacar la basura", done: false, frequency: "diaria", createdAt: iso(today) },
  { id: generateId(), text: "Poner lavadora", done: false, frequency: "semanal", createdAt: iso(today) },
  { id: generateId(), text: "Preparar mochilas del cole", done: true, frequency: "diaria", createdAt: iso(today) },
  { id: generateId(), text: "Regar las plantas", done: false, frequency: "semanal", createdAt: iso(today) },
];

export const seedMealPlan: MealPlan = {
  0: { comida: "Lentejas", cena: "Tortilla de patatas" },
  1: { comida: "Arroz con pollo", cena: "Ensalada César" },
  2: { comida: "Macarrones", cena: "Pescado al horno" },
  3: { comida: "", cena: "" },
  4: { comida: "Pizza casera", cena: "Crema de calabaza" },
  5: { comida: "Paella", cena: "" },
  6: { comida: "Asado en familia", cena: "Sándwiches" },
};

export const seedNotes: Note[] = [
  {
    id: generateId(),
    text: "¡No olvidar felicitar a la abuela por videollamada! 📞",
    color: "amber",
    author: "Mamá",
    createdAt: iso(today),
  },
  {
    id: generateId(),
    text: "Llevar el coche al taller esta semana 🚗",
    color: "sky",
    author: "Papá",
    createdAt: iso(today),
  },
];

import { createContext, useContext, type ReactNode } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import {
  seedBirthdays,
  seedChores,
  seedEvents,
  seedMealPlan,
  seedMembers,
  seedNotes,
  seedShoppingLists,
} from "../data/seed";
import type {
  Birthday,
  CalendarEvent,
  ChoreTask,
  FamilyMember,
  MealPlan,
  Note,
  ShoppingList,
} from "../types";

interface FamilyDataContextValue {
  familyName: string;
  setFamilyName: (name: string) => void;
  members: FamilyMember[];
  setMembers: React.Dispatch<React.SetStateAction<FamilyMember[]>>;
  shoppingLists: ShoppingList[];
  setShoppingLists: React.Dispatch<React.SetStateAction<ShoppingList[]>>;
  birthdays: Birthday[];
  setBirthdays: React.Dispatch<React.SetStateAction<Birthday[]>>;
  events: CalendarEvent[];
  setEvents: React.Dispatch<React.SetStateAction<CalendarEvent[]>>;
  chores: ChoreTask[];
  setChores: React.Dispatch<React.SetStateAction<ChoreTask[]>>;
  mealPlan: MealPlan;
  setMealPlan: React.Dispatch<React.SetStateAction<MealPlan>>;
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
}

const FamilyDataContext = createContext<FamilyDataContextValue | null>(null);

const STORAGE_PREFIX = "familyhub";

export function FamilyDataProvider({ children }: { children: ReactNode }) {
  const [familyName, setFamilyName] = useLocalStorage<string>(
    `${STORAGE_PREFIX}:familyName`,
    "Familia García",
  );
  const [members, setMembers] = useLocalStorage<FamilyMember[]>(
    `${STORAGE_PREFIX}:members`,
    seedMembers,
  );
  const [shoppingLists, setShoppingLists] = useLocalStorage<ShoppingList[]>(
    `${STORAGE_PREFIX}:shoppingLists`,
    seedShoppingLists,
  );
  const [birthdays, setBirthdays] = useLocalStorage<Birthday[]>(
    `${STORAGE_PREFIX}:birthdays`,
    seedBirthdays,
  );
  const [events, setEvents] = useLocalStorage<CalendarEvent[]>(
    `${STORAGE_PREFIX}:events`,
    seedEvents,
  );
  const [chores, setChores] = useLocalStorage<ChoreTask[]>(
    `${STORAGE_PREFIX}:chores`,
    seedChores,
  );
  const [mealPlan, setMealPlan] = useLocalStorage<MealPlan>(
    `${STORAGE_PREFIX}:mealPlan`,
    seedMealPlan,
  );
  const [notes, setNotes] = useLocalStorage<Note[]>(
    `${STORAGE_PREFIX}:notes`,
    seedNotes,
  );

  const value: FamilyDataContextValue = {
    familyName,
    setFamilyName,
    members,
    setMembers,
    shoppingLists,
    setShoppingLists,
    birthdays,
    setBirthdays,
    events,
    setEvents,
    chores,
    setChores,
    mealPlan,
    setMealPlan,
    notes,
    setNotes,
  };

  return (
    <FamilyDataContext.Provider value={value}>
      {children}
    </FamilyDataContext.Provider>
  );
}

export function useFamilyData() {
  const ctx = useContext(FamilyDataContext);
  if (!ctx) {
    throw new Error("useFamilyData debe usarse dentro de FamilyDataProvider");
  }
  return ctx;
}

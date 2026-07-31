import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
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
  GiftIdea,
  ActiveTab,
  RewardRequest,
  CustomTaskList,
  AnniversaryItem
} from '../types';
import { 
  INITIAL_EVENTS, 
  INITIAL_TASKS, 
  INITIAL_SHOPPING_ITEMS, 
  INITIAL_MEAL_PLAN, 
  INITIAL_BIRTHDAYS, 
  INITIAL_NOTES, 
  INITIAL_EXPENSES, 
  INITIAL_EMERGENCY_CONTACTS, 
  INITIAL_INTENTIONS,
  INITIAL_REWARDS
} from '../data/mockData';
import { loadLocalData, saveLocalData, supabase, sbUpsert, sbDelete, sbUpsertMany, sbFetch, sbGetConfig, sbSetConfig } from '../lib/supabase';
import { useAuth } from './AuthContext';

// ─── Defaults ────────────────────────────────────────────────────────────────

const DEFAULT_SECTION_VISIBILITY: Record<ActiveTab, boolean> = {
  dashboard: true, tasks: true, shopping: true, calendar: true,
  notes: true, meals: true, catholic: true, contacts: true,
  birthdays: true, finances: true, wedding: true, admin: true
};

const DEFAULT_MENU_ORDER: ActiveTab[] = [
  'dashboard','tasks','shopping','calendar','notes',
  'meals','catholic','contacts','birthdays','finances','wedding'
];

const DEFAULT_CATEGORIES = {
  tasks: ['Limpieza','Cocina','Estudios','Oración','Mascotas','General'],
  shopping: ['Frutas y Verduras','Lácteos y Frescos','Carnes y Pescados','Panadería y Cereales','Despensa y Bebidas','Limpieza y Hogar','Mascotas','Otros'],
  events: ['Médico','Colegio','Misa/Liturgia','Ocio/Fiesta','Deporte','Gestiones','Hogar','Otro']
};

// ─── Context Type ─────────────────────────────────────────────────────────────

interface FamilyContextType {
  familyName: string;
  updateFamilyName: (name: string) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  themeColor: string;
  setThemeColor: (color: string) => void;

  events: CalendarEvent[];
  tasks: TaskItem[];
  shoppingItems: ShoppingItem[];
  mealPlan: WeeklyMealPlan;
  birthdays: BirthdayItem[];
  stickyNotes: StickyNote[];
  expenses: ExpenseItem[];
  emergencyContacts: EmergencyContact[];
  intentions: CatholicIntention[];
  anniversaries: AnniversaryItem[];
  rewards: RewardItem[];
  rewardRequests: RewardRequest[];
  customTaskLists: CustomTaskList[];
  sectionVisibility: Record<ActiveTab, boolean>;
  customCategories: typeof DEFAULT_CATEGORIES;
  menuOrder: ActiveTab[];

  addAnniversary: (anniversary: Omit<AnniversaryItem, 'id'>) => void;
  deleteAnniversary: (id: string) => void;

  reorderMenuSections: (newOrder: ActiveTab[]) => void;
  updateSectionVisibility: (tab: ActiveTab, visible: boolean) => void;
  updateCategories: (type: 'tasks' | 'shopping' | 'events', newCategories: string[]) => void;
  addCategory: (type: 'tasks' | 'shopping' | 'events', categoryName: string) => void;
  deleteCategory: (type: 'tasks' | 'shopping' | 'events', categoryName: string) => void;
  reorderCategories: (type: 'tasks' | 'shopping' | 'events', newOrderedCategories: string[]) => void;

  addCustomTaskList: (name: string, categories: string[]) => void;
  deleteCustomTaskList: (id: string) => void;

  addEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  editEvent: (id: string, updated: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;

  addTask: (task: Omit<TaskItem, 'id' | 'completed'>) => void;
  editTask: (id: string, updated: Partial<TaskItem>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  requestTaskValidation: (taskId: string, memberId: string) => void;
  approveTaskValidation: (taskId: string) => void;
  rejectTaskValidation: (taskId: string) => void;

  claimReward: (rewardId: string, memberId: string) => void;
  requestReward: (rewardId: string, memberId: string, memberName: string) => void;
  approveRewardRequest: (requestId: string) => void;
  rejectRewardRequest: (requestId: string) => void;
  enjoyReward: (requestId: string) => void;
  revokeRewardRequest: (requestId: string) => void;

  addShoppingItem: (item: Omit<ShoppingItem, 'id' | 'completed' | 'createdAt'>) => void;
  editShoppingItem: (id: string, updated: Partial<ShoppingItem>) => void;
  toggleShoppingItem: (id: string) => void;
  deleteShoppingItem: (id: string) => void;
  clearCompletedShopping: () => void;

  updateMealPlanDay: (dayKey: string, meals: Partial<WeeklyMealPlan[string]>) => void;

  addBirthday: (birthday: Omit<BirthdayItem, 'id' | 'giftIdeas'>) => void;
  deleteBirthday: (id: string) => void;
  addGiftIdea: (birthdayId: string, titleOrObj: string | Omit<GiftIdea, 'id'>, cost?: number) => void;
  updateGiftIdeaStatus: (birthdayId: string, giftId: string, status: GiftIdea['status']) => void;
  toggleGiftStatus: (birthdayId: string, giftId: string) => void;

  addStickyNote: (note: Omit<StickyNote, 'id' | 'createdAt'>) => void;
  editStickyNote: (id: string, updated: Partial<StickyNote>) => void;
  togglePinNote: (id: string) => void;
  deleteStickyNote: (id: string) => void;

  addExpense: (expense: Omit<ExpenseItem, 'id'>) => void;
  toggleExpensePaid: (id: string) => void;
  deleteExpense: (id: string) => void;

  addEmergencyContact: (contact: Omit<EmergencyContact, 'id'>) => void;
  deleteEmergencyContact: (id: string) => void;

  addIntention: (intention: Omit<CatholicIntention, 'id' | 'completed'>) => void;
  toggleIntention: (id: string) => void;
  deleteIntention: (id: string) => void;

  resetToMockData: () => void;
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

// ─── Supabase row converters ──────────────────────────────────────────────────

const toEventRow = (e: CalendarEvent) => ({
  id: e.id, title: e.title, date: e.date, time: e.time,
  end_time: e.endTime, category: e.category,
  assigned_member_ids: e.assignedMemberIds, location: e.location, notes: e.notes
});
const fromEventRow = (r: Record<string,unknown>): CalendarEvent => ({
  id: r.id as string, title: r.title as string, date: r.date as string,
  time: r.time as string|undefined, endTime: r.end_time as string|undefined,
  category: (r.category as string)||'', assignedMemberIds: (r.assigned_member_ids as string[])||[],
  location: r.location as string|undefined, notes: r.notes as string|undefined
});

const toTaskRow = (t: TaskItem) => ({
  id: t.id, title: t.title, category: t.category,
  assigned_member_id: t.assignedMemberId, points: t.points,
  due_date: t.dueDate, completed: t.completed, completed_at: t.completedAt,
  priority: t.priority, frequency: t.frequency, list_id: t.listId,
  validation_status: t.validationStatus, requested_by_member_id: t.requestedByMemberId
});
const fromTaskRow = (r: Record<string,unknown>): TaskItem => ({
  id: r.id as string, title: r.title as string, category: (r.category as string)||'',
  assignedMemberId: r.assigned_member_id as string|undefined,
  points: (r.points as number)||0, dueDate: (r.due_date as string)||'',
  completed: (r.completed as boolean)||false, completedAt: r.completed_at as string|undefined,
  priority: (r.priority as TaskItem['priority'])||'Media',
  frequency: (r.frequency as TaskItem['frequency'])||'Única',
  listId: r.list_id as string|undefined,
  validationStatus: (r.validation_status as TaskItem['validationStatus'])||'none',
  requestedByMemberId: r.requested_by_member_id as string|undefined
});

const toShopRow = (s: ShoppingItem) => ({
  id: s.id, name: s.name, category: s.category, quantity: s.quantity,
  estimated_price: s.estimatedPrice, store: s.store, completed: s.completed,
  added_by: s.addedBy, urgent: s.urgent, created_at: s.createdAt
});
const fromShopRow = (r: Record<string,unknown>): ShoppingItem => ({
  id: r.id as string, name: r.name as string, category: (r.category as string)||'',
  quantity: (r.quantity as string)||'', estimatedPrice: r.estimated_price as number|undefined,
  store: r.store as string|undefined, completed: (r.completed as boolean)||false,
  addedBy: (r.added_by as string)||'', urgent: (r.urgent as boolean)||false,
  createdAt: (r.created_at as string)||new Date().toISOString()
});

const toNoteRow = (n: StickyNote) => ({
  id: n.id, title: n.title, content: n.content, color: n.color,
  author: n.author, pinned: n.pinned, created_at: n.createdAt
});
const fromNoteRow = (r: Record<string,unknown>): StickyNote => ({
  id: r.id as string, title: (r.title as string)||'', content: (r.content as string)||'',
  color: (r.color as StickyNote['color'])||'yellow', author: (r.author as string)||'',
  createdAt: (r.created_at as string)||new Date().toISOString(), pinned: (r.pinned as boolean)||false
});

const toExpenseRow = (e: ExpenseItem) => ({
  id: e.id, title: e.title, amount: e.amount, category: e.category,
  due_date_day: e.dueDateDay, paid: e.paid, paid_by: e.paidBy,
  date: e.date, notes: e.notes
});
const fromExpenseRow = (r: Record<string,unknown>): ExpenseItem => ({
  id: r.id as string, title: r.title as string, amount: (r.amount as number)||0,
  category: (r.category as string)||'', dueDateDay: r.due_date_day as number|undefined,
  paid: (r.paid as boolean)||false, paidBy: r.paid_by as string|undefined,
  date: (r.date as string)||'', notes: r.notes as string|undefined
});

const toContactRow = (c: EmergencyContact) => ({
  id: c.id, name: c.name, relation_or_type: c.relationOrType,
  phone: c.phone, address: c.address, notes: c.notes
});
const fromContactRow = (r: Record<string,unknown>): EmergencyContact => ({
  id: r.id as string, name: r.name as string,
  relationOrType: (r.relation_or_type as string)||'',
  phone: (r.phone as string)||'', address: r.address as string|undefined,
  notes: r.notes as string|undefined
});

const toIntentionRow = (i: CatholicIntention) => ({
  id: i.id, title: i.title, date: i.date, type: i.type,
  requested_by: i.requestedBy, completed: i.completed
});
const fromIntentionRow = (r: Record<string,unknown>): CatholicIntention => ({
  id: r.id as string, title: r.title as string, date: (r.date as string)||'',
  type: (r.type as CatholicIntention['type'])||'Misa',
  requestedBy: (r.requested_by as string)||'', completed: (r.completed as boolean)||false
});

const toAnniversaryRow = (a: AnniversaryItem) => ({
  id: a.id, title: a.title, type: a.type, date: a.date,
  member_ids: a.memberIds, notes: a.notes
});
const fromAnniversaryRow = (r: Record<string,unknown>): AnniversaryItem => ({
  id: r.id as string, title: r.title as string,
  type: (r.type as AnniversaryItem['type'])||'Otro',
  date: (r.date as string)||'', memberIds: (r.member_ids as string[])||[],
  notes: r.notes as string|undefined
});

const toBirthdayRow = (b: BirthdayItem) => ({
  id: b.id, name: b.name, relationship: b.relationship,
  birth_date: b.birthDate, avatar: b.avatar, gift_ideas: b.giftIdeas, notes: b.notes
});
const fromBirthdayRow = (r: Record<string,unknown>): BirthdayItem => ({
  id: r.id as string, name: r.name as string,
  relationship: (r.relationship as string)||'',
  birthDate: (r.birth_date as string)||'', avatar: (r.avatar as string)||'🎂',
  giftIdeas: (r.gift_ideas as GiftIdea[])||[], notes: r.notes as string|undefined
});

const toRewardRequestRow = (r: RewardRequest) => ({
  id: r.id, reward_id: r.rewardId, reward_title: r.rewardTitle,
  points_cost: r.pointsCost, member_id: r.memberId, member_name: r.memberName,
  status: r.status, requested_at: r.requestedAt, approved_at: r.approvedAt
});
const fromRewardRequestRow = (r: Record<string,unknown>): RewardRequest => ({
  id: r.id as string, rewardId: r.reward_id as string,
  rewardTitle: r.reward_title as string, pointsCost: (r.points_cost as number)||0,
  memberId: r.member_id as string, memberName: (r.member_name as string)||'',
  status: (r.status as RewardRequest['status'])||'requested',
  requestedAt: (r.requested_at as string)||'', approvedAt: r.approved_at as string|undefined
});

const toTaskListRow = (l: CustomTaskList) => ({
  id: l.id, name: l.name, categories: l.categories
});
const fromTaskListRow = (r: Record<string,unknown>): CustomTaskList => ({
  id: r.id as string, name: r.name as string, categories: (r.categories as string[])||[]
});

// ─── Provider ─────────────────────────────────────────────────────────────────

export const FamilyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { allMembers, updateMemberDetails } = useAuth();

  // ── State ─────────────────────────────────────────────────────────────────
  const [familyName, setFamilyNameState] = useState<string>(() => loadLocalData('fam_name', 'Familia Santos'));
  const [darkMode, setDarkModeState] = useState<boolean>(() => loadLocalData('fam_dark_mode', false));
  const [themeColor, setThemeColorState] = useState<string>(() => loadLocalData('fam_theme_color', 'indigo'));

  const [events, setEvents] = useState<CalendarEvent[]>(() => loadLocalData('events', INITIAL_EVENTS));
  const [tasks, setTasks] = useState<TaskItem[]>(() => loadLocalData('tasks', INITIAL_TASKS));
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>(() => loadLocalData('shopping', INITIAL_SHOPPING_ITEMS));
  const [mealPlan, setMealPlan] = useState<WeeklyMealPlan>(() => loadLocalData('meals', INITIAL_MEAL_PLAN));
  const [birthdays, setBirthdays] = useState<BirthdayItem[]>(() => loadLocalData('birthdays', INITIAL_BIRTHDAYS));
  const [stickyNotes, setStickyNotes] = useState<StickyNote[]>(() => loadLocalData('notes', INITIAL_NOTES));
  const [expenses, setExpenses] = useState<ExpenseItem[]>(() => loadLocalData('expenses', INITIAL_EXPENSES));
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>(() => loadLocalData('contacts', INITIAL_EMERGENCY_CONTACTS));
  const [intentions, setIntentions] = useState<CatholicIntention[]>(() => loadLocalData('intentions', INITIAL_INTENTIONS));
  const [rewards] = useState<RewardItem[]>(INITIAL_REWARDS);
  const [rewardRequests, setRewardRequests] = useState<RewardRequest[]>(() => loadLocalData('reward_requests', []));
  const [customTaskLists, setCustomTaskLists] = useState<CustomTaskList[]>(() =>
    loadLocalData('custom_task_lists', [{ id: 'general', name: 'Tareas del Hogar', categories: DEFAULT_CATEGORIES.tasks }])
  );
  const [anniversaries, setAnniversaries] = useState<AnniversaryItem[]>(() => loadLocalData('anniversaries', [
    { id: 'ann_1', memberIds: [], title: 'Aniversario de Boda', type: 'Boda', date: '2012-08-15' },
  ]));
  const [sectionVisibility, setSectionVisibility] = useState<Record<ActiveTab, boolean>>(() =>
    loadLocalData('section_visibility', DEFAULT_SECTION_VISIBILITY)
  );
  const [customCategories, setCustomCategories] = useState(() =>
    loadLocalData('custom_categories', DEFAULT_CATEGORIES)
  );
  const [menuOrder, setMenuOrderState] = useState<ActiveTab[]>(() =>
    loadLocalData('menu_order', DEFAULT_MENU_ORDER)
  );

  // ── Load ALL data from Supabase on mount ─────────────────────────────────
  useEffect(() => {
    async function loadAllFromSupabase() {
      try {
        const [
          evRows, taskRows, shopRows, noteRows, expRows, contactRows,
          intentionRows, annRows, bdayRows, rrRows, listRows
        ] = await Promise.all([
          sbFetch<Record<string,unknown>>('calendar_events'),
          sbFetch<Record<string,unknown>>('tasks'),
          sbFetch<Record<string,unknown>>('shopping_items'),
          sbFetch<Record<string,unknown>>('sticky_notes'),
          sbFetch<Record<string,unknown>>('expenses'),
          sbFetch<Record<string,unknown>>('emergency_contacts'),
          sbFetch<Record<string,unknown>>('catholic_intentions'),
          sbFetch<Record<string,unknown>>('anniversaries'),
          sbFetch<Record<string,unknown>>('birthdays'),
          sbFetch<Record<string,unknown>>('reward_requests'),
          sbFetch<Record<string,unknown>>('custom_task_lists'),
        ]);

        if (evRows.length > 0) { const d = evRows.map(fromEventRow); setEvents(d); saveLocalData('events', d); }
        else { sbUpsertMany('calendar_events', INITIAL_EVENTS.map(toEventRow as any)); }

        if (taskRows.length > 0) { const d = taskRows.map(fromTaskRow); setTasks(d); saveLocalData('tasks', d); }
        else { sbUpsertMany('tasks', INITIAL_TASKS.map(toTaskRow as any)); }

        if (shopRows.length > 0) { const d = shopRows.map(fromShopRow); setShoppingItems(d); saveLocalData('shopping', d); }
        else { sbUpsertMany('shopping_items', INITIAL_SHOPPING_ITEMS.map(toShopRow as any)); }

        if (noteRows.length > 0) { const d = noteRows.map(fromNoteRow); setStickyNotes(d); saveLocalData('notes', d); }
        else { sbUpsertMany('sticky_notes', INITIAL_NOTES.map(toNoteRow as any)); }

        if (expRows.length > 0) { const d = expRows.map(fromExpenseRow); setExpenses(d); saveLocalData('expenses', d); }
        else { sbUpsertMany('expenses', INITIAL_EXPENSES.map(toExpenseRow as any)); }

        if (contactRows.length > 0) { const d = contactRows.map(fromContactRow); setEmergencyContacts(d); saveLocalData('contacts', d); }
        else { sbUpsertMany('emergency_contacts', INITIAL_EMERGENCY_CONTACTS.map(toContactRow as any)); }

        if (intentionRows.length > 0) { const d = intentionRows.map(fromIntentionRow); setIntentions(d); saveLocalData('intentions', d); }
        else { sbUpsertMany('catholic_intentions', INITIAL_INTENTIONS.map(toIntentionRow as any)); }

        if (annRows.length > 0) { const d = annRows.map(fromAnniversaryRow); setAnniversaries(d); saveLocalData('anniversaries', d); }

        if (bdayRows.length > 0) { const d = bdayRows.map(fromBirthdayRow); setBirthdays(d); saveLocalData('birthdays', d); }
        else { sbUpsertMany('birthdays', INITIAL_BIRTHDAYS.map(toBirthdayRow as any)); }

        if (rrRows.length > 0) { const d = rrRows.map(fromRewardRequestRow); setRewardRequests(d); saveLocalData('reward_requests', d); }

        if (listRows.length > 0) { const d = listRows.map(fromTaskListRow); setCustomTaskLists(d); saveLocalData('custom_task_lists', d); }

        // App config
        const [cfgFamName, cfgDark, cfgTheme, cfgCats, cfgVis, cfgMenuOrder] = await Promise.all([
          sbGetConfig('fam_name'),
          sbGetConfig('fam_dark_mode'),
          sbGetConfig('fam_theme_color'),
          sbGetConfig('custom_categories'),
          sbGetConfig('section_visibility'),
          sbGetConfig('menu_order'),
        ]);
        if (cfgFamName) { setFamilyNameState(cfgFamName as string); saveLocalData('fam_name', cfgFamName); }
        if (cfgDark !== null) { setDarkModeState(cfgDark as boolean); }
        if (cfgTheme) { setThemeColorState(cfgTheme as string); }
        if (cfgCats) { setCustomCategories(cfgCats as typeof DEFAULT_CATEGORIES); }
        if (cfgVis) { setSectionVisibility(cfgVis as Record<ActiveTab, boolean>); }
        if (cfgMenuOrder) { setMenuOrderState(cfgMenuOrder as ActiveTab[]); }

        // Meal plan
        const mealRows = await sbFetch<Record<string,unknown>>('meal_plans');
        if (mealRows.length > 0) {
          const plan: WeeklyMealPlan = {};
          mealRows.forEach(r => {
            plan[r.day_key as string] = {
              breakfast: (r.breakfast as string)||'', lunch: (r.lunch as string)||'',
              snack: (r.snack as string)||'', dinner: (r.dinner as string)||'',
              notes: r.notes as string|undefined
            };
          });
          setMealPlan(plan);
          saveLocalData('meals', plan);
        } else {
          const rows = Object.entries(INITIAL_MEAL_PLAN).map(([day_key, meal]) => ({
            id: `meal_${day_key}`, day_key,
            breakfast: meal.breakfast, lunch: meal.lunch,
            snack: meal.snack, dinner: meal.dinner, notes: meal.notes
          }));
          sbUpsertMany('meal_plans', rows as any);
        }
      } catch (e) {
        console.warn('Error loading from Supabase, using local fallback:', e);
      }
    }

    loadAllFromSupabase();
  }, []);

  // ── Dark Mode Sync ────────────────────────────────────────────────────────
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    saveLocalData('fam_dark_mode', darkMode);
    sbSetConfig('fam_dark_mode', darkMode);
  }, [darkMode]);

  // ── Helpers: sync local + remote ─────────────────────────────────────────
  const syncConfig = useCallback((key: string, value: unknown) => {
    saveLocalData(key, value);
    sbSetConfig(key, value);
  }, []);

  // ── Family name ───────────────────────────────────────────────────────────
  const updateFamilyName = (name: string) => {
    setFamilyNameState(name);
    syncConfig('fam_name', name);
  };
  const toggleDarkMode = () => setDarkModeState(prev => !prev);
  const setThemeColor = (color: string) => {
    setThemeColorState(color);
    syncConfig('fam_theme_color', color);
  };

  // ── Visibility & Menu Order ───────────────────────────────────────────────
  const updateSectionVisibility = (tab: ActiveTab, visible: boolean) => {
    setSectionVisibility(prev => {
      const updated = { ...prev, [tab]: visible };
      syncConfig('section_visibility', updated);
      return updated;
    });
  };
  const reorderMenuSections = (newOrder: ActiveTab[]) => {
    setMenuOrderState(newOrder);
    syncConfig('menu_order', newOrder);
  };

  // ── Categories ────────────────────────────────────────────────────────────
  const updateCategories = (type: 'tasks'|'shopping'|'events', cats: string[]) => {
    setCustomCategories(prev => {
      const updated = { ...prev, [type]: cats };
      syncConfig('custom_categories', updated);
      return updated;
    });
  };
  const addCategory = (type: 'tasks'|'shopping'|'events', name: string) => {
    if (!name.trim() || customCategories[type].includes(name.trim())) return;
    updateCategories(type, [...customCategories[type], name.trim()]);
  };
  const deleteCategory = (type: 'tasks'|'shopping'|'events', name: string) => {
    updateCategories(type, customCategories[type].filter(c => c !== name));
  };
  const reorderCategories = (type: 'tasks'|'shopping'|'events', ordered: string[]) => {
    updateCategories(type, ordered);
  };

  // ── Custom Task Lists ─────────────────────────────────────────────────────
  const addCustomTaskList = (name: string, categories: string[]) => {
    if (!name.trim()) return;
    const newList: CustomTaskList = {
      id: `ctl_${Date.now()}`, name: name.trim(),
      categories: categories.length ? categories : DEFAULT_CATEGORIES.tasks
    };
    setCustomTaskLists(prev => {
      const updated = [...prev, newList];
      saveLocalData('custom_task_lists', updated);
      return updated;
    });
    sbUpsert('custom_task_lists', toTaskListRow(newList));
  };
  const deleteCustomTaskList = (id: string) => {
    setCustomTaskLists(prev => {
      const updated = prev.filter(l => l.id !== id);
      saveLocalData('custom_task_lists', updated);
      return updated;
    });
    sbDelete('custom_task_lists', id);
  };

  // ── Anniversaries ─────────────────────────────────────────────────────────
  const addAnniversary = (ann: Omit<AnniversaryItem,'id'>) => {
    const newAnn: AnniversaryItem = { ...ann, id: `ann_${Date.now()}` };
    setAnniversaries(prev => {
      const updated = [...prev, newAnn];
      saveLocalData('anniversaries', updated);
      return updated;
    });
    sbUpsert('anniversaries', toAnniversaryRow(newAnn));
  };
  const deleteAnniversary = (id: string) => {
    setAnniversaries(prev => {
      const updated = prev.filter(a => a.id !== id);
      saveLocalData('anniversaries', updated);
      return updated;
    });
    sbDelete('anniversaries', id);
  };

  // ── Events ────────────────────────────────────────────────────────────────
  const addEvent = (event: Omit<CalendarEvent,'id'>) => {
    const newEvent: CalendarEvent = { ...event, id: `ev_${Date.now()}` };
    setEvents(prev => { const d = [...prev, newEvent]; saveLocalData('events', d); return d; });
    sbUpsert('calendar_events', toEventRow(newEvent));
  };
  const editEvent = (id: string, updated: Partial<CalendarEvent>) => {
    setEvents(prev => {
      const d = prev.map(e => e.id === id ? { ...e, ...updated } : e);
      saveLocalData('events', d);
      const found = d.find(e => e.id === id);
      if (found) sbUpsert('calendar_events', toEventRow(found));
      return d;
    });
  };
  const deleteEvent = (id: string) => {
    setEvents(prev => { const d = prev.filter(e => e.id !== id); saveLocalData('events', d); return d; });
    sbDelete('calendar_events', id);
  };

  // ── Tasks ─────────────────────────────────────────────────────────────────
  const addTask = (task: Omit<TaskItem,'id'|'completed'>) => {
    const newTask: TaskItem = { ...task, id: `task_${Date.now()}`, completed: false, validationStatus: 'none' };
    setTasks(prev => { const d = [...prev, newTask]; saveLocalData('tasks', d); return d; });
    sbUpsert('tasks', toTaskRow(newTask));
  };
  const editTask = (id: string, updated: Partial<TaskItem>) => {
    setTasks(prev => {
      const d = prev.map(t => t.id === id ? { ...t, ...updated } : t);
      saveLocalData('tasks', d);
      const found = d.find(t => t.id === id);
      if (found) sbUpsert('tasks', toTaskRow(found));
      return d;
    });
  };
  const toggleTask = (id: string) => {
    setTasks(prev => {
      const d = prev.map(t => {
        if (t.id === id) {
          const nextState = !t.completed;
          if (nextState && t.assignedMemberId) {
            const member = allMembers.find(m => m.id === t.assignedMemberId);
            if (member) {
              updateMemberDetails(member.id, { points: member.points + t.points });
              confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
            }
          }
          const updated = { ...t, completed: nextState, completedAt: nextState ? new Date().toISOString() : undefined, validationStatus: nextState ? 'approved' : 'none' as TaskItem['validationStatus'] };
          sbUpsert('tasks', toTaskRow(updated));
          return updated;
        }
        return t;
      });
      saveLocalData('tasks', d);
      return d;
    });
  };
  const requestTaskValidation = (taskId: string, memberId: string) => {
    setTasks(prev => {
      const d = prev.map(t => {
        if (t.id === taskId) {
          const updated = { ...t, validationStatus: 'pending_approval' as TaskItem['validationStatus'], requestedByMemberId: memberId };
          sbUpsert('tasks', toTaskRow(updated));
          return updated;
        }
        return t;
      });
      saveLocalData('tasks', d);
      return d;
    });
  };
  const approveTaskValidation = (taskId: string) => {
    setTasks(prev => {
      const d = prev.map(t => {
        if (t.id === taskId) {
          const targetMemberId = t.requestedByMemberId || t.assignedMemberId;
          if (targetMemberId) {
            const member = allMembers.find(m => m.id === targetMemberId);
            if (member) {
              updateMemberDetails(member.id, { points: member.points + t.points });
              confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });
            }
          }
          const updated = { ...t, completed: true, completedAt: new Date().toISOString(), validationStatus: 'approved' as TaskItem['validationStatus'] };
          sbUpsert('tasks', toTaskRow(updated));
          return updated;
        }
        return t;
      });
      saveLocalData('tasks', d);
      return d;
    });
  };
  const rejectTaskValidation = (taskId: string) => {
    setTasks(prev => {
      const d = prev.map(t => {
        if (t.id === taskId) {
          const updated = { ...t, validationStatus: 'rejected' as TaskItem['validationStatus'] };
          sbUpsert('tasks', toTaskRow(updated));
          return updated;
        }
        return t;
      });
      saveLocalData('tasks', d);
      return d;
    });
  };
  const deleteTask = (id: string) => {
    setTasks(prev => { const d = prev.filter(t => t.id !== id); saveLocalData('tasks', d); return d; });
    sbDelete('tasks', id);
  };

  // ── Rewards ───────────────────────────────────────────────────────────────
  const claimReward = (rewardId: string, memberId: string) => {
    const reward = rewards.find(r => r.id === rewardId);
    const member = allMembers.find(m => m.id === memberId);
    if (!reward || !member || member.points < reward.pointsCost) return;
    updateMemberDetails(member.id, { points: member.points - reward.pointsCost });
    confetti({ particleCount: 70, spread: 70 });
  };
  const requestReward = (rewardId: string, memberId: string, memberName: string) => {
    const reward = rewards.find(r => r.id === rewardId);
    if (!reward) return;
    const newReq: RewardRequest = {
      id: `rr_${Date.now()}`, rewardId, rewardTitle: reward.title,
      pointsCost: reward.pointsCost, memberId, memberName,
      status: 'requested', requestedAt: new Date().toISOString().split('T')[0]
    };
    setRewardRequests(prev => {
      const d = [newReq, ...prev];
      saveLocalData('reward_requests', d);
      return d;
    });
    sbUpsert('reward_requests', toRewardRequestRow(newReq));
  };
  const updateRewardRequest = (requestId: string, patch: Partial<RewardRequest>) => {
    setRewardRequests(prev => {
      const d = prev.map(r => {
        if (r.id === requestId) {
          const updated = { ...r, ...patch };
          sbUpsert('reward_requests', toRewardRequestRow(updated));
          return updated;
        }
        return r;
      });
      saveLocalData('reward_requests', d);
      return d;
    });
  };
  const approveRewardRequest = (requestId: string) => {
    setRewardRequests(prev => {
      const req = prev.find(r => r.id === requestId);
      if (req) {
        const member = allMembers.find(m => m.id === req.memberId);
        if (member && member.points >= req.pointsCost) {
          updateMemberDetails(member.id, { points: member.points - req.pointsCost });
          confetti({ particleCount: 100, spread: 90 });
        }
      }
      const d = prev.map(r => r.id === requestId ? { ...r, status: 'approved' as RewardRequest['status'], approvedAt: new Date().toISOString().split('T')[0] } : r);
      saveLocalData('reward_requests', d);
      const found = d.find(r => r.id === requestId);
      if (found) sbUpsert('reward_requests', toRewardRequestRow(found));
      return d;
    });
  };
  const rejectRewardRequest = (id: string) => updateRewardRequest(id, { status: 'rejected' });
  const enjoyReward = (id: string) => updateRewardRequest(id, { status: 'enjoyed' });
  const revokeRewardRequest = (id: string) => updateRewardRequest(id, { status: 'revoked' });

  // ── Shopping ──────────────────────────────────────────────────────────────
  const addShoppingItem = (item: Omit<ShoppingItem,'id'|'completed'|'createdAt'>) => {
    const newItem: ShoppingItem = { ...item, id: `shop_${Date.now()}`, completed: false, createdAt: new Date().toISOString() };
    setShoppingItems(prev => { const d = [newItem, ...prev]; saveLocalData('shopping', d); return d; });
    sbUpsert('shopping_items', toShopRow(newItem));
  };
  const editShoppingItem = (id: string, updated: Partial<ShoppingItem>) => {
    setShoppingItems(prev => {
      const d = prev.map(s => s.id === id ? { ...s, ...updated } : s);
      saveLocalData('shopping', d);
      const found = d.find(s => s.id === id);
      if (found) sbUpsert('shopping_items', toShopRow(found));
      return d;
    });
  };
  const toggleShoppingItem = (id: string) => {
    setShoppingItems(prev => {
      const d = prev.map(s => s.id === id ? { ...s, completed: !s.completed } : s);
      saveLocalData('shopping', d);
      const found = d.find(s => s.id === id);
      if (found) sbUpsert('shopping_items', toShopRow(found));
      return d;
    });
  };
  const deleteShoppingItem = (id: string) => {
    setShoppingItems(prev => { const d = prev.filter(s => s.id !== id); saveLocalData('shopping', d); return d; });
    sbDelete('shopping_items', id);
  };
  const clearCompletedShopping = () => {
    setShoppingItems(prev => {
      const toDelete = prev.filter(s => s.completed);
      const d = prev.filter(s => !s.completed);
      saveLocalData('shopping', d);
      toDelete.forEach(s => sbDelete('shopping_items', s.id));
      return d;
    });
  };

  // ── Meal Plan ─────────────────────────────────────────────────────────────
  const updateMealPlanDay = (dayKey: string, meals: Partial<WeeklyMealPlan[string]>) => {
    setMealPlan(prev => {
      const updated = { ...prev, [dayKey]: { ...prev[dayKey], ...meals } };
      saveLocalData('meals', updated);
      const dayMeal = updated[dayKey];
      sbUpsert('meal_plans', { id: `meal_${dayKey}`, day_key: dayKey, ...dayMeal });
      return updated;
    });
  };

  // ── Birthdays ─────────────────────────────────────────────────────────────
  const addBirthday = (bday: Omit<BirthdayItem,'id'|'giftIdeas'>) => {
    const newBday: BirthdayItem = { ...bday, id: `bday_${Date.now()}`, giftIdeas: [] };
    setBirthdays(prev => { const d = [...prev, newBday]; saveLocalData('birthdays', d); return d; });
    sbUpsert('birthdays', toBirthdayRow(newBday));
  };
  const deleteBirthday = (id: string) => {
    setBirthdays(prev => { const d = prev.filter(b => b.id !== id); saveLocalData('birthdays', d); return d; });
    sbDelete('birthdays', id);
  };
  const updateBirthdayById = (id: string, patch: Partial<BirthdayItem>) => {
    setBirthdays(prev => {
      const d = prev.map(b => b.id === id ? { ...b, ...patch } : b);
      saveLocalData('birthdays', d);
      const found = d.find(b => b.id === id);
      if (found) sbUpsert('birthdays', toBirthdayRow(found));
      return d;
    });
  };
  const addGiftIdea = (birthdayId: string, titleOrObj: string | Omit<GiftIdea,'id'>, cost?: number) => {
    const titleStr = typeof titleOrObj === 'string' ? titleOrObj : titleOrObj.title;
    const costVal = typeof titleOrObj === 'string' ? cost : titleOrObj.estimatedCost;
    const statusVal = typeof titleOrObj === 'string' ? 'Idea' : (titleOrObj.status || 'Idea');
    const newIdea: GiftIdea = { id: `gift_${Date.now()}`, title: titleStr, estimatedCost: costVal, status: statusVal };
    setBirthdays(prev => {
      const d = prev.map(b => b.id === birthdayId ? { ...b, giftIdeas: [...b.giftIdeas, newIdea] } : b);
      saveLocalData('birthdays', d);
      const found = d.find(b => b.id === birthdayId);
      if (found) sbUpsert('birthdays', toBirthdayRow(found));
      return d;
    });
  };
  const updateGiftIdeaStatus = (birthdayId: string, giftId: string, status: GiftIdea['status']) => {
    setBirthdays(prev => {
      const d = prev.map(b => b.id === birthdayId
        ? { ...b, giftIdeas: b.giftIdeas.map(g => g.id === giftId ? { ...g, status } : g) }
        : b);
      saveLocalData('birthdays', d);
      const found = d.find(b => b.id === birthdayId);
      if (found) sbUpsert('birthdays', toBirthdayRow(found));
      return d;
    });
  };
  const toggleGiftStatus = (birthdayId: string, giftId: string) => {
    setBirthdays(prev => {
      const d = prev.map(b => b.id === birthdayId
        ? {
            ...b, giftIdeas: b.giftIdeas.map(g => {
              if (g.id !== giftId) return g;
              const next: GiftIdea['status'] = g.status === 'Idea' ? 'Reservado' : g.status === 'Reservado' ? 'Comprado' : 'Idea';
              return { ...g, status: next };
            })
          }
        : b);
      saveLocalData('birthdays', d);
      const found = d.find(b => b.id === birthdayId);
      if (found) sbUpsert('birthdays', toBirthdayRow(found));
      return d;
    });
  };

  // ── Sticky Notes ──────────────────────────────────────────────────────────
  const addStickyNote = (note: Omit<StickyNote,'id'|'createdAt'>) => {
    const newNote: StickyNote = { ...note, id: `note_${Date.now()}`, createdAt: new Date().toISOString() };
    setStickyNotes(prev => { const d = [newNote, ...prev]; saveLocalData('notes', d); return d; });
    sbUpsert('sticky_notes', toNoteRow(newNote));
  };
  const editStickyNote = (id: string, updated: Partial<StickyNote>) => {
    setStickyNotes(prev => {
      const d = prev.map(n => n.id === id ? { ...n, ...updated } : n);
      saveLocalData('notes', d);
      const found = d.find(n => n.id === id);
      if (found) sbUpsert('sticky_notes', toNoteRow(found));
      return d;
    });
  };
  const togglePinNote = (id: string) => {
    setStickyNotes(prev => {
      const d = prev.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n);
      saveLocalData('notes', d);
      const found = d.find(n => n.id === id);
      if (found) sbUpsert('sticky_notes', toNoteRow(found));
      return d;
    });
  };
  const deleteStickyNote = (id: string) => {
    setStickyNotes(prev => { const d = prev.filter(n => n.id !== id); saveLocalData('notes', d); return d; });
    sbDelete('sticky_notes', id);
  };

  // ── Expenses ──────────────────────────────────────────────────────────────
  const addExpense = (expense: Omit<ExpenseItem,'id'>) => {
    const newExp: ExpenseItem = { ...expense, id: `exp_${Date.now()}` };
    setExpenses(prev => { const d = [...prev, newExp]; saveLocalData('expenses', d); return d; });
    sbUpsert('expenses', toExpenseRow(newExp));
  };
  const toggleExpensePaid = (id: string) => {
    setExpenses(prev => {
      const d = prev.map(e => e.id === id ? { ...e, paid: !e.paid } : e);
      saveLocalData('expenses', d);
      const found = d.find(e => e.id === id);
      if (found) sbUpsert('expenses', toExpenseRow(found));
      return d;
    });
  };
  const deleteExpense = (id: string) => {
    setExpenses(prev => { const d = prev.filter(e => e.id !== id); saveLocalData('expenses', d); return d; });
    sbDelete('expenses', id);
  };

  // ── Emergency Contacts ────────────────────────────────────────────────────
  const addEmergencyContact = (contact: Omit<EmergencyContact,'id'>) => {
    const newC: EmergencyContact = { ...contact, id: `contact_${Date.now()}` };
    setEmergencyContacts(prev => { const d = [...prev, newC]; saveLocalData('contacts', d); return d; });
    sbUpsert('emergency_contacts', toContactRow(newC));
  };
  const deleteEmergencyContact = (id: string) => {
    setEmergencyContacts(prev => { const d = prev.filter(c => c.id !== id); saveLocalData('contacts', d); return d; });
    sbDelete('emergency_contacts', id);
  };

  // ── Catholic Intentions ───────────────────────────────────────────────────
  const addIntention = (intention: Omit<CatholicIntention,'id'|'completed'>) => {
    const newInt: CatholicIntention = { ...intention, id: `int_${Date.now()}`, completed: false };
    setIntentions(prev => { const d = [...prev, newInt]; saveLocalData('intentions', d); return d; });
    sbUpsert('catholic_intentions', toIntentionRow(newInt));
  };
  const toggleIntention = (id: string) => {
    setIntentions(prev => {
      const d = prev.map(i => i.id === id ? { ...i, completed: !i.completed } : i);
      saveLocalData('intentions', d);
      const found = d.find(i => i.id === id);
      if (found) sbUpsert('catholic_intentions', toIntentionRow(found));
      return d;
    });
  };
  const deleteIntention = (id: string) => {
    setIntentions(prev => { const d = prev.filter(i => i.id !== id); saveLocalData('intentions', d); return d; });
    sbDelete('catholic_intentions', id);
  };

  // ── Reset ─────────────────────────────────────────────────────────────────
  const resetToMockData = () => {
    setEvents(INITIAL_EVENTS);
    setTasks(INITIAL_TASKS);
    setShoppingItems(INITIAL_SHOPPING_ITEMS);
    setMealPlan(INITIAL_MEAL_PLAN);
    setBirthdays(INITIAL_BIRTHDAYS);
    setStickyNotes(INITIAL_NOTES);
    setExpenses(INITIAL_EXPENSES);
    setEmergencyContacts(INITIAL_EMERGENCY_CONTACTS);
    setIntentions(INITIAL_INTENTIONS);
    setCustomCategories(DEFAULT_CATEGORIES);
  };

  // ── Provider ──────────────────────────────────────────────────────────────
  return (
    <FamilyContext.Provider value={{
      familyName, updateFamilyName,
      darkMode, toggleDarkMode,
      themeColor, setThemeColor,
      events, tasks, shoppingItems, mealPlan, birthdays,
      stickyNotes, expenses, emergencyContacts, intentions,
      anniversaries, rewards, rewardRequests, customTaskLists,
      sectionVisibility, customCategories, menuOrder,
      addAnniversary, deleteAnniversary,
      reorderMenuSections,
      updateSectionVisibility,
      updateCategories, addCategory, deleteCategory, reorderCategories,
      addCustomTaskList, deleteCustomTaskList,
      addEvent, editEvent, deleteEvent,
      addTask, editTask, toggleTask, deleteTask,
      requestTaskValidation, approveTaskValidation, rejectTaskValidation,
      claimReward, requestReward, approveRewardRequest, rejectRewardRequest, enjoyReward, revokeRewardRequest,
      addShoppingItem, editShoppingItem, toggleShoppingItem, deleteShoppingItem, clearCompletedShopping,
      updateMealPlanDay,
      addBirthday, deleteBirthday, addGiftIdea, updateGiftIdeaStatus, toggleGiftStatus,
      addStickyNote, editStickyNote, togglePinNote, deleteStickyNote,
      addExpense, toggleExpensePaid, deleteExpense,
      addEmergencyContact, deleteEmergencyContact,
      addIntention, toggleIntention, deleteIntention,
      resetToMockData,
    }}>
      {children}
    </FamilyContext.Provider>
  );
};

export const useFamily = () => {
  const context = useContext(FamilyContext);
  if (!context) throw new Error('useFamily must be used within FamilyProvider');
  return context;
};

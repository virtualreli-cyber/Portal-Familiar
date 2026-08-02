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
  DashboardCardId,
  RewardRequest,
  CustomTaskList,
  AnniversaryItem,
  WeddingTask,
  WeddingNote
} from '../types';
import { INITIAL_REWARDS } from '../data/mockData';
import { supabase, sbUpsert, sbDelete, sbFetch, sbGetConfig, sbSetConfig, loadLocalData, saveLocalData } from '../lib/supabase';
import { subscribeRealtime, broadcastRealtime } from '../lib/realtimeSync';
import { useAuth } from './AuthContext';
import { getUserPreferences, saveUserPreferences } from '../lib/userPreferences';

// ─── Defaults ────────────────────────────────────────────────────────────────

const DEFAULT_SECTION_VISIBILITY: Record<ActiveTab, boolean> = {
  dashboard: true, tasks: true, shopping: true, calendar: true,
  notes: true, meals: true, catholic: true, contacts: true,
  birthdays: true, finances: true, wedding: true, admin: true
};

export const DEFAULT_DASHBOARD_CARDS_VISIBILITY: Record<DashboardCardId, boolean> = {
  welcome_card: true,
  wedding_banner: true,
  parent_approvals: true,
  fridge_notes: true,
  catholic_intentions: true,
  birthdays_anniversaries: true,
  summary_sections: true
};

const DEFAULT_MENU_ORDER: ActiveTab[] = [
  'dashboard','tasks','shopping','calendar','notes',
  'meals','catholic','contacts','birthdays','finances','wedding'
];

const DEFAULT_CATEGORIES = {
  tasks: ['Limpieza','Cocina','Estudios','Oración','Mascotas','General'],
  shopping: ['Frutas y Verduras','Lácteos y Frescos','Carnes y Pescados','Panadería y Cereales','Despensa y Bebidas','Limpieza y Hogar','Mascotas','Otros'],
  events: ['Médico','Colegio','Misa/Liturgia','Ocio/Fiesta','Deporte','Gestiones','Hogar','Otro'],
  anniversaries: ['Boda', 'Santo', 'Bautizo', 'Comunión', 'Empresa/Trabajo', 'Otro']
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
  weddingTasks: WeddingTask[];
  weddingNotes: WeddingNote[];
  sectionVisibility: Record<ActiveTab, boolean>;
  dashboardCardsVisibility: Record<DashboardCardId, boolean>;
  customCategories: typeof DEFAULT_CATEGORIES;
  menuOrder: ActiveTab[];

  // WiFi (stored in app_config)
  wifiSSID: string;
  wifiPass: string;
  updateWifi: (ssid: string, pass: string) => void;

  // Data loaded flag
  dataLoaded: boolean;

  addAnniversary: (anniversary: Omit<AnniversaryItem, 'id'>) => void;
  deleteAnniversary: (id: string) => void;

  addWeddingTask: (task: Omit<WeddingTask, 'id' | 'completed'>) => void;
  toggleWeddingTask: (id: string) => void;
  editWeddingTask: (id: string, updated: Partial<WeddingTask>) => void;
  deleteWeddingTask: (id: string) => void;
  addWeddingNote: (note: Omit<WeddingNote, 'id'>) => void;
  editWeddingNote: (id: string, updated: Partial<WeddingNote>) => void;
  deleteWeddingNote: (id: string) => void;

  reorderMenuSections: (newOrder: ActiveTab[]) => void;
  updateSectionVisibility: (tab: ActiveTab, visible: boolean) => void;
  updateDashboardCardVisibility: (cardId: DashboardCardId, visible: boolean) => void;
  updateCategories: (type: 'tasks' | 'shopping' | 'events' | 'anniversaries', newCategories: string[]) => void;
  addCategory: (type: 'tasks' | 'shopping' | 'events' | 'anniversaries', categoryName: string) => void;
  deleteCategory: (type: 'tasks' | 'shopping' | 'events' | 'anniversaries', categoryName: string) => void;
  reorderCategories: (type: 'tasks' | 'shopping' | 'events' | 'anniversaries', newOrderedCategories: string[]) => void;

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

  addBirthday: (bday: Omit<BirthdayItem, 'id' | 'giftIdeas'>) => void;
  deleteBirthday: (id: string) => void;
  updateBirthdayById: (id: string, patch: Partial<BirthdayItem>) => void;
  addGiftIdea: (birthdayId: string, titleOrObj: string | Omit<GiftIdea, 'id'>, cost?: number) => void;
  editGiftIdea: (birthdayId: string, giftId: string, updated: Partial<GiftIdea>) => void;
  deleteGiftIdea: (birthdayId: string, giftId: string) => void;
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

const toWeddingTaskRow = (t: WeddingTask) => ({
  id: t.id, title: t.title, category: t.category, completed: t.completed
});
const fromWeddingTaskRow = (r: Record<string,unknown>): WeddingTask => ({
  id: r.id as string, title: r.title as string,
  category: (r.category as string)||'General', completed: (r.completed as boolean)||false
});

const toWeddingNoteRow = (n: WeddingNote) => ({
  id: n.id, title: n.title, content: n.content, author: n.author, date: n.date
});
const fromWeddingNoteRow = (r: Record<string,unknown>): WeddingNote => ({
  id: r.id as string, title: (r.title as string)||'Nota de Boda',
  content: (r.content as string)||'', author: (r.author as string)||'',
  date: (r.date as string)||''
});

// ─── Provider ─────────────────────────────────────────────────────────────────

export const FamilyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentMember, allMembers, updateMemberDetails } = useAuth();

  // ── State — All start empty; Supabase is the single source of truth ────────
  const [familyName, setFamilyNameState] = useState<string>('');
  const [darkMode, setDarkModeState] = useState<boolean>(false);
  const [themeColor, setThemeColorState] = useState<string>('indigo');

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  const [mealPlan, setMealPlan] = useState<WeeklyMealPlan>({});
  const [birthdays, setBirthdays] = useState<BirthdayItem[]>([]);
  const [stickyNotes, setStickyNotes] = useState<StickyNote[]>([]);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [intentions, setIntentions] = useState<CatholicIntention[]>([]);
  const [rewards] = useState<RewardItem[]>(INITIAL_REWARDS);
  const [rewardRequests, setRewardRequests] = useState<RewardRequest[]>([]);
  const [customTaskLists, setCustomTaskLists] = useState<CustomTaskList[]>([]);
  const [anniversaries, setAnniversaries] = useState<AnniversaryItem[]>([]);
  const [weddingTasks, setWeddingTasks] = useState<WeddingTask[]>([]);
  const [weddingNotes, setWeddingNotes] = useState<WeddingNote[]>([]);
  const [sectionVisibility, setSectionVisibility] = useState<Record<ActiveTab, boolean>>(DEFAULT_SECTION_VISIBILITY);
  const [dashboardCardsVisibility, setDashboardCardsVisibilityState] = useState<Record<DashboardCardId, boolean>>(DEFAULT_DASHBOARD_CARDS_VISIBILITY);
  const [customCategories, setCustomCategories] = useState(DEFAULT_CATEGORIES);
  const [menuOrder, setMenuOrderState] = useState<ActiveTab[]>(DEFAULT_MENU_ORDER);
  const [wifiSSID, setWifiSSID] = useState<string>('');
  const [wifiPass, setWifiPass] = useState<string>('');
  const [dataLoaded, setDataLoaded] = useState(false);

  // ── Load ALL data from Supabase ──────────────────────────────────────────
  const loadAllFromSupabase = useCallback(async () => {
    try {
      const [
        evRows, taskRows, shopRows, noteRows, expRows, contactRows,
        intentionRows, annRows, bdayRows, rrRows, listRows, wTaskRows, wNoteRows
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
        sbFetch<Record<string,unknown>>('wedding_tasks'),
        sbFetch<Record<string,unknown>>('wedding_notes'),
      ]);

      // Set state from Supabase — if table is empty, state becomes empty array []
      setEvents(evRows.map(fromEventRow));
      setTasks(taskRows.map(fromTaskRow));
      setShoppingItems(shopRows.map(fromShopRow));
      setStickyNotes(noteRows.map(fromNoteRow));
      setExpenses(expRows.map(fromExpenseRow));
      setEmergencyContacts(contactRows.map(fromContactRow));
      setIntentions(intentionRows.map(fromIntentionRow));
      setAnniversaries(annRows.map(fromAnniversaryRow));
      setBirthdays(bdayRows.map(fromBirthdayRow));
      setRewardRequests(rrRows.map(fromRewardRequestRow));
      setCustomTaskLists(listRows.map(fromTaskListRow));
      setWeddingTasks(wTaskRows.map(fromWeddingTaskRow));
      setWeddingNotes(wNoteRows.map(fromWeddingNoteRow));

      // App config
      const [cfgFamName, cfgDark, cfgTheme, cfgCats, cfgVis, cfgDashVis, cfgMenuOrder, cfgWifiSSID, cfgWifiPass] = await Promise.all([
        sbGetConfig('fam_name'),
        sbGetConfig('fam_dark_mode'),
        sbGetConfig('fam_theme_color'),
        sbGetConfig('custom_categories'),
        sbGetConfig('section_visibility'),
        sbGetConfig('dashboard_cards_visibility'),
        sbGetConfig('menu_order'),
        sbGetConfig('wifi_ssid'),
        sbGetConfig('wifi_pass'),
      ]);
      if (cfgFamName) setFamilyNameState(cfgFamName as string);
      if (cfgDark !== null) setDarkModeState(cfgDark as boolean);
      if (cfgTheme) setThemeColorState(cfgTheme as string);
      if (cfgCats) setCustomCategories(cfgCats as typeof DEFAULT_CATEGORIES);
      if (cfgVis) setSectionVisibility(cfgVis as Record<ActiveTab, boolean>);
      if (cfgDashVis) setDashboardCardsVisibilityState(cfgDashVis as Record<DashboardCardId, boolean>);
      if (cfgMenuOrder) setMenuOrderState(cfgMenuOrder as ActiveTab[]);
      if (cfgWifiSSID) setWifiSSID(cfgWifiSSID as string);
      if (cfgWifiPass) setWifiPass(cfgWifiPass as string);

      // Meal plan
      const mealRows = await sbFetch<Record<string,unknown>>('meal_plans');
      const plan: WeeklyMealPlan = {};
      mealRows.forEach(r => {
        plan[r.day_key as string] = {
          breakfast: (r.breakfast as string)||'', lunch: (r.lunch as string)||'',
          snack: (r.snack as string)||'', dinner: (r.dinner as string)||'',
          notes: r.notes as string|undefined
        };
      });
      setMealPlan(plan);
    } catch (e) {
      console.warn('Error loading from Supabase:', e);
    } finally {
      setDataLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadAllFromSupabase();

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        loadAllFromSupabase();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
    };
  }, [loadAllFromSupabase]);

  // ── Realtime Subscriptions — Full sync across all devices ─────────────────
  useEffect(() => {
    const handlePayload = (table: string, eventType: string, newRow?: Record<string, unknown>, oldRow?: Record<string, unknown>) => {
      switch (table) {
        case 'calendar_events':
          if ((eventType === 'INSERT' || eventType === 'UPDATE') && newRow) {
            const item = fromEventRow(newRow);
            setEvents(prev => {
              const idx = prev.findIndex(e => e.id === item.id);
              return idx >= 0 ? prev.map(e => e.id === item.id ? item : e) : [...prev, item];
            });
          } else if (eventType === 'DELETE' && oldRow?.id) {
            setEvents(prev => prev.filter(e => e.id !== oldRow.id));
          }
          break;
        case 'tasks':
          if ((eventType === 'INSERT' || eventType === 'UPDATE') && newRow) {
            const item = fromTaskRow(newRow);
            setTasks(prev => {
              const idx = prev.findIndex(t => t.id === item.id);
              return idx >= 0 ? prev.map(t => t.id === item.id ? item : t) : [...prev, item];
            });
          } else if (eventType === 'DELETE' && oldRow?.id) {
            setTasks(prev => prev.filter(t => t.id !== oldRow.id));
          }
          break;
        case 'shopping_items':
          if ((eventType === 'INSERT' || eventType === 'UPDATE') && newRow) {
            const item = fromShopRow(newRow);
            setShoppingItems(prev => {
              const idx = prev.findIndex(s => s.id === item.id);
              return idx >= 0 ? prev.map(s => s.id === item.id ? item : s) : [item, ...prev];
            });
          } else if (eventType === 'DELETE' && oldRow?.id) {
            setShoppingItems(prev => prev.filter(s => s.id !== oldRow.id));
          }
          break;
        case 'sticky_notes':
          if ((eventType === 'INSERT' || eventType === 'UPDATE') && newRow) {
            const item = fromNoteRow(newRow);
            setStickyNotes(prev => {
              const idx = prev.findIndex(n => n.id === item.id);
              return idx >= 0 ? prev.map(n => n.id === item.id ? item : n) : [item, ...prev];
            });
          } else if (eventType === 'DELETE' && oldRow?.id) {
            setStickyNotes(prev => prev.filter(n => n.id !== oldRow.id));
          }
          break;
        case 'expenses':
          if ((eventType === 'INSERT' || eventType === 'UPDATE') && newRow) {
            const item = fromExpenseRow(newRow);
            setExpenses(prev => {
              const idx = prev.findIndex(e => e.id === item.id);
              return idx >= 0 ? prev.map(e => e.id === item.id ? item : e) : [...prev, item];
            });
          } else if (eventType === 'DELETE' && oldRow?.id) {
            setExpenses(prev => prev.filter(e => e.id !== oldRow.id));
          }
          break;
        case 'emergency_contacts':
          if ((eventType === 'INSERT' || eventType === 'UPDATE') && newRow) {
            const item = fromContactRow(newRow);
            setEmergencyContacts(prev => {
              const idx = prev.findIndex(c => c.id === item.id);
              return idx >= 0 ? prev.map(c => c.id === item.id ? item : c) : [...prev, item];
            });
          } else if (eventType === 'DELETE' && oldRow?.id) {
            setEmergencyContacts(prev => prev.filter(c => c.id !== oldRow.id));
          }
          break;
        case 'catholic_intentions':
          if ((eventType === 'INSERT' || eventType === 'UPDATE') && newRow) {
            const item = fromIntentionRow(newRow);
            setIntentions(prev => {
              const idx = prev.findIndex(i => i.id === item.id);
              return idx >= 0 ? prev.map(i => i.id === item.id ? item : i) : [...prev, item];
            });
          } else if (eventType === 'DELETE' && oldRow?.id) {
            setIntentions(prev => prev.filter(i => i.id !== oldRow.id));
          }
          break;
        case 'anniversaries':
          if ((eventType === 'INSERT' || eventType === 'UPDATE') && newRow) {
            const item = fromAnniversaryRow(newRow);
            setAnniversaries(prev => {
              const idx = prev.findIndex(a => a.id === item.id);
              return idx >= 0 ? prev.map(a => a.id === item.id ? item : a) : [...prev, item];
            });
          } else if (eventType === 'DELETE' && oldRow?.id) {
            setAnniversaries(prev => prev.filter(a => a.id !== oldRow.id));
          }
          break;
        case 'birthdays':
          if ((eventType === 'INSERT' || eventType === 'UPDATE') && newRow) {
            const item = fromBirthdayRow(newRow);
            setBirthdays(prev => {
              const idx = prev.findIndex(b => b.id === item.id);
              return idx >= 0 ? prev.map(b => b.id === item.id ? item : b) : [...prev, item];
            });
          } else if (eventType === 'DELETE' && oldRow?.id) {
            setBirthdays(prev => prev.filter(b => b.id !== oldRow.id));
          }
          break;
        case 'reward_requests':
          if ((eventType === 'INSERT' || eventType === 'UPDATE') && newRow) {
            const item = fromRewardRequestRow(newRow);
            setRewardRequests(prev => {
              const idx = prev.findIndex(r => r.id === item.id);
              return idx >= 0 ? prev.map(r => r.id === item.id ? item : r) : [item, ...prev];
            });
          } else if (eventType === 'DELETE' && oldRow?.id) {
            setRewardRequests(prev => prev.filter(r => r.id !== oldRow.id));
          }
          break;
        case 'custom_task_lists':
          if ((eventType === 'INSERT' || eventType === 'UPDATE') && newRow) {
            const item = fromTaskListRow(newRow);
            setCustomTaskLists(prev => {
              const idx = prev.findIndex(l => l.id === item.id);
              return idx >= 0 ? prev.map(l => l.id === item.id ? item : l) : [...prev, item];
            });
          } else if (eventType === 'DELETE' && oldRow?.id) {
            setCustomTaskLists(prev => prev.filter(l => l.id !== oldRow.id));
          }
          break;
        case 'wedding_tasks':
          if ((eventType === 'INSERT' || eventType === 'UPDATE') && newRow) {
            const item = fromWeddingTaskRow(newRow);
            setWeddingTasks(prev => {
              const idx = prev.findIndex(t => t.id === item.id);
              return idx >= 0 ? prev.map(t => t.id === item.id ? item : t) : [item, ...prev];
            });
          } else if (eventType === 'DELETE' && oldRow?.id) {
            setWeddingTasks(prev => prev.filter(t => t.id !== oldRow.id));
          }
          break;
        case 'wedding_notes':
          if ((eventType === 'INSERT' || eventType === 'UPDATE') && newRow) {
            const item = fromWeddingNoteRow(newRow);
            setWeddingNotes(prev => {
              const idx = prev.findIndex(n => n.id === item.id);
              return idx >= 0 ? prev.map(n => n.id === item.id ? item : n) : [item, ...prev];
            });
          } else if (eventType === 'DELETE' && oldRow?.id) {
            setWeddingNotes(prev => prev.filter(n => n.id !== oldRow.id));
          }
          break;
        case 'meal_plans': {
          if ((eventType === 'INSERT' || eventType === 'UPDATE') && newRow) {
            const r = newRow;
            setMealPlan(prev => ({
              ...prev,
              [r.day_key as string]: {
                breakfast: (r.breakfast as string)||'',
                lunch: (r.lunch as string)||'',
                snack: (r.snack as string)||'',
                dinner: (r.dinner as string)||'',
                notes: r.notes as string|undefined
              }
            }));
          }
          break;
        }
        case 'app_config': {
          const cfg = newRow as Record<string, unknown> | null;
          if (cfg?.key === 'fam_name' && cfg?.value) setFamilyNameState(cfg.value as string);
          if (cfg?.key === 'fam_dark_mode' && cfg?.value !== undefined) setDarkModeState(cfg.value as boolean);
          if (cfg?.key === 'fam_theme_color' && cfg?.value) setThemeColorState(cfg.value as string);
          if (cfg?.key === 'custom_categories' && cfg?.value) setCustomCategories(cfg.value as typeof DEFAULT_CATEGORIES);
          if (cfg?.key === 'section_visibility' && cfg?.value) setSectionVisibility(cfg.value as Record<ActiveTab, boolean>);
          if (cfg?.key === 'menu_order' && cfg?.value) setMenuOrderState(cfg.value as ActiveTab[]);
          if (cfg?.key === 'wifi_ssid') setWifiSSID((cfg.value as string)||'');
          if (cfg?.key === 'wifi_pass') setWifiPass((cfg.value as string)||'');
          break;
        }
      }
    };

    // 1. Local SSE & BroadcastChannel Subscription
    const unsubscribeLocal = subscribeRealtime((msg) => {
      handlePayload(msg.table, msg.eventType, msg.newRow, msg.oldRow);
    });

    // 2. Supabase Realtime Subscription (if available)
    let channel: ReturnType<typeof supabase.channel> | null = null;
    try {
      channel = supabase
        .channel('portal_fam_realtime_channel')
        .on('postgres_changes', { event: '*', schema: 'public', table: '*' }, (payload) => {
          handlePayload(payload.table, payload.eventType, payload.new as Record<string, unknown>, payload.old as Record<string, unknown>);
        })
        .subscribe();
    } catch (e) {
      console.warn('Supabase Realtime not available:', e);
    }

    return () => {
      unsubscribeLocal();
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  // ── Dark Mode Sync ────────────────────────────────────────────────────────
  useEffect(() => {
    if (currentMember?.id) {
      const prefs = getUserPreferences(currentMember.id);
      if (typeof prefs.darkMode === 'boolean') {
        setDarkModeState(prefs.darkMode);
      }
    }
  }, [currentMember?.id]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    sbSetConfig('fam_dark_mode', darkMode);
  }, [darkMode]);

  // ── Family name ───────────────────────────────────────────────────────────
  const updateFamilyName = (name: string) => {
    setFamilyNameState(name);
    sbSetConfig('fam_name', name);
  };
  const toggleDarkMode = () => {
    setDarkModeState(prev => {
      const next = !prev;
      if (currentMember?.id) {
        saveUserPreferences(currentMember.id, { darkMode: next });
      }
      return next;
    });
  };
  const setThemeColor = (color: string) => {
    setThemeColorState(color);
    sbSetConfig('fam_theme_color', color);
  };

  // ── WiFi ──────────────────────────────────────────────────────────────────
  const updateWifi = useCallback((ssid: string, pass: string) => {
    setWifiSSID(ssid);
    setWifiPass(pass);
    sbSetConfig('wifi_ssid', ssid);
    sbSetConfig('wifi_pass', pass);
  }, []);

  // ── Visibility & Menu Order ───────────────────────────────────────────────
  const updateSectionVisibility = (tab: ActiveTab, visible: boolean) => {
    setSectionVisibility(prev => {
      const updated = { ...prev, [tab]: visible };
      sbSetConfig('section_visibility', updated);
      return updated;
    });
  };
  const updateDashboardCardVisibility = (cardId: DashboardCardId, visible: boolean) => {
    setDashboardCardsVisibilityState(prev => {
      const updated = { ...prev, [cardId]: visible };
      sbSetConfig('dashboard_cards_visibility', updated);
      return updated;
    });
  };
  const reorderMenuSections = (newOrder: ActiveTab[]) => {
    setMenuOrderState(newOrder);
    sbSetConfig('menu_order', newOrder);
  };

  // ── Categories ────────────────────────────────────────────────────────────
  const updateCategories = (type: 'tasks'|'shopping'|'events'|'anniversaries', cats: string[]) => {
    setCustomCategories(prev => {
      const updated = { ...prev, [type]: cats };
      sbSetConfig('custom_categories', updated);
      return updated;
    });
  };
  const addCategory = (type: 'tasks'|'shopping'|'events'|'anniversaries', name: string) => {
    if (!name.trim() || customCategories[type]?.includes(name.trim())) return;
    updateCategories(type, [...(customCategories[type] || []), name.trim()]);
  };
  const deleteCategory = (type: 'tasks'|'shopping'|'events'|'anniversaries', name: string) => {
    updateCategories(type, (customCategories[type] || []).filter(c => c !== name));
  };
  const reorderCategories = (type: 'tasks'|'shopping'|'events'|'anniversaries', ordered: string[]) => {
    updateCategories(type, ordered);
  };

const generateId = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`);

  // ── Custom Task Lists ─────────────────────────────────────────────────────
  const addCustomTaskList = (name: string, categories: string[]) => {
    if (!name.trim()) return;
    const newList: CustomTaskList = {
      id: generateId(), name: name.trim(),
      categories: categories.length ? categories : DEFAULT_CATEGORIES.tasks
    };
    setCustomTaskLists(prev => [...prev, newList]);
    sbUpsert('custom_task_lists', toTaskListRow(newList));
  };
  const deleteCustomTaskList = (id: string) => {
    setCustomTaskLists(prev => prev.filter(l => l.id !== id));
    sbDelete('custom_task_lists', id);
  };

  // ── Anniversaries ─────────────────────────────────────────────────────────
  const addAnniversary = (ann: Omit<AnniversaryItem,'id'>) => {
    const newAnn: AnniversaryItem = { ...ann, id: generateId() };
    setAnniversaries(prev => [...prev, newAnn]);
    sbUpsert('anniversaries', toAnniversaryRow(newAnn));
  };
  const deleteAnniversary = (id: string) => {
    setAnniversaries(prev => prev.filter(a => a.id !== id));
    sbDelete('anniversaries', id);
  };

  // ── Wedding Tasks & Notes ──────────────────────────────────────────────────
  const addWeddingTask = (task: Omit<WeddingTask, 'id' | 'completed'>) => {
    const newT: WeddingTask = { ...task, id: generateId(), completed: false };
    setWeddingTasks(prev => [newT, ...prev]);
    sbUpsert('wedding_tasks', toWeddingTaskRow(newT));
  };
  const toggleWeddingTask = (id: string) => {
    setWeddingTasks(prev => prev.map(t => {
      if (t.id === id) {
        const updated = { ...t, completed: !t.completed };
        sbUpsert('wedding_tasks', toWeddingTaskRow(updated));
        return updated;
      }
      return t;
    }));
  };
  const editWeddingTask = (id: string, updated: Partial<WeddingTask>) => {
    setWeddingTasks(prev => prev.map(t => {
      if (t.id === id) {
        const updatedT = { ...t, ...updated };
        sbUpsert('wedding_tasks', toWeddingTaskRow(updatedT));
        return updatedT;
      }
      return t;
    }));
  };
  const deleteWeddingTask = (id: string) => {
    setWeddingTasks(prev => prev.filter(t => t.id !== id));
    sbDelete('wedding_tasks', id);
  };

  const addWeddingNote = (note: Omit<WeddingNote, 'id'>) => {
    const newN: WeddingNote = { ...note, id: generateId() };
    setWeddingNotes(prev => [newN, ...prev]);
    sbUpsert('wedding_notes', toWeddingNoteRow(newN));
  };
  const editWeddingNote = (id: string, updated: Partial<WeddingNote>) => {
    setWeddingNotes(prev => prev.map(n => {
      if (n.id === id) {
        const updatedN = { ...n, ...updated };
        sbUpsert('wedding_notes', toWeddingNoteRow(updatedN));
        return updatedN;
      }
      return n;
    }));
  };
  const deleteWeddingNote = (id: string) => {
    setWeddingNotes(prev => prev.filter(n => n.id !== id));
    sbDelete('wedding_notes', id);
  };

  // ── Events ────────────────────────────────────────────────────────────────
  const addEvent = (event: Omit<CalendarEvent,'id'>) => {
    const newEvent: CalendarEvent = { ...event, id: generateId() };
    const row = toEventRow(newEvent);
    setEvents(prev => [...prev, newEvent]);
    sbUpsert('calendar_events', row);
    broadcastRealtime({ table: 'calendar_events', eventType: 'INSERT', newRow: row });
  };
  const editEvent = (id: string, updated: Partial<CalendarEvent>) => {
    setEvents(prev => {
      const d = prev.map(e => e.id === id ? { ...e, ...updated } : e);
      const found = d.find(e => e.id === id);
      if (found) {
        const row = toEventRow(found);
        sbUpsert('calendar_events', row);
        broadcastRealtime({ table: 'calendar_events', eventType: 'UPDATE', newRow: row });
      }
      return d;
    });
  };
  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    sbDelete('calendar_events', id);
    broadcastRealtime({ table: 'calendar_events', eventType: 'DELETE', oldRow: { id } });
  };

  // ── Tasks ─────────────────────────────────────────────────────────────────
  const addTask = (task: Omit<TaskItem,'id'|'completed'>) => {
    const newTask: TaskItem = { ...task, id: generateId(), completed: false, validationStatus: 'none' };
    const row = toTaskRow(newTask);
    setTasks(prev => [...prev, newTask]);
    sbUpsert('tasks', row);
    broadcastRealtime({ table: 'tasks', eventType: 'INSERT', newRow: row });
  };
  const editTask = (id: string, updated: Partial<TaskItem>) => {
    setTasks(prev => {
      const d = prev.map(t => t.id === id ? { ...t, ...updated } : t);
      const found = d.find(t => t.id === id);
      if (found) {
        const row = toTaskRow(found);
        sbUpsert('tasks', row);
        broadcastRealtime({ table: 'tasks', eventType: 'UPDATE', newRow: row });
      }
      return d;
    });
  };
  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => {
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
        const row = toTaskRow(updated);
        sbUpsert('tasks', row);
        broadcastRealtime({ table: 'tasks', eventType: 'UPDATE', newRow: row });
        return updated;
      }
      return t;
    }));
  };
  const requestTaskValidation = (taskId: string, memberId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const updated = { ...t, validationStatus: 'pending_approval' as TaskItem['validationStatus'], requestedByMemberId: memberId };
        const row = toTaskRow(updated);
        sbUpsert('tasks', row);
        broadcastRealtime({ table: 'tasks', eventType: 'UPDATE', newRow: row });
        return updated;
      }
      return t;
    }));
  };
  const approveTaskValidation = (taskId: string) => {
    setTasks(prev => prev.map(t => {
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
        const row = toTaskRow(updated);
        sbUpsert('tasks', row);
        broadcastRealtime({ table: 'tasks', eventType: 'UPDATE', newRow: row });
        return updated;
      }
      return t;
    }));
  };
  const rejectTaskValidation = (taskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const updated = { ...t, validationStatus: 'rejected' as TaskItem['validationStatus'] };
        const row = toTaskRow(updated);
        sbUpsert('tasks', row);
        broadcastRealtime({ table: 'tasks', eventType: 'UPDATE', newRow: row });
        return updated;
      }
      return t;
    }));
  };
  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    sbDelete('tasks', id);
    broadcastRealtime({ table: 'tasks', eventType: 'DELETE', oldRow: { id } });
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
      id: generateId(), rewardId, rewardTitle: reward.title,
      pointsCost: reward.pointsCost, memberId, memberName,
      status: 'requested', requestedAt: new Date().toISOString().split('T')[0]
    };
    const row = toRewardRequestRow(newReq);
    setRewardRequests(prev => [newReq, ...prev]);
    sbUpsert('reward_requests', row);
    broadcastRealtime({ table: 'reward_requests', eventType: 'INSERT', newRow: row });
  };
  const updateRewardRequest = (requestId: string, patch: Partial<RewardRequest>) => {
    setRewardRequests(prev => prev.map(r => {
      if (r.id === requestId) {
        const updated = { ...r, ...patch };
        const row = toRewardRequestRow(updated);
        sbUpsert('reward_requests', row);
        broadcastRealtime({ table: 'reward_requests', eventType: 'UPDATE', newRow: row });
        return updated;
      }
      return r;
    }));
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
      const found = d.find(r => r.id === requestId);
      if (found) {
        const row = toRewardRequestRow(found);
        sbUpsert('reward_requests', row);
        broadcastRealtime({ table: 'reward_requests', eventType: 'UPDATE', newRow: row });
      }
      return d;
    });
  };
  const rejectRewardRequest = (id: string) => updateRewardRequest(id, { status: 'rejected' });
  const enjoyReward = (id: string) => updateRewardRequest(id, { status: 'enjoyed' });
  const revokeRewardRequest = (id: string) => updateRewardRequest(id, { status: 'revoked' });

  // ── Shopping ──────────────────────────────────────────────────────────────
  const addShoppingItem = (item: Omit<ShoppingItem,'id'|'completed'|'createdAt'>) => {
    const newItem: ShoppingItem = { ...item, id: generateId(), completed: false, createdAt: new Date().toISOString() };
    const row = toShopRow(newItem);
    setShoppingItems(prev => [newItem, ...prev]);
    sbUpsert('shopping_items', row);
    broadcastRealtime({ table: 'shopping_items', eventType: 'INSERT', newRow: row });
  };
  const editShoppingItem = (id: string, updated: Partial<ShoppingItem>) => {
    setShoppingItems(prev => {
      const d = prev.map(s => s.id === id ? { ...s, ...updated } : s);
      const found = d.find(s => s.id === id);
      if (found) {
        const row = toShopRow(found);
        sbUpsert('shopping_items', row);
        broadcastRealtime({ table: 'shopping_items', eventType: 'UPDATE', newRow: row });
      }
      return d;
    });
  };
  const toggleShoppingItem = (id: string) => {
    setShoppingItems(prev => {
      const d = prev.map(s => s.id === id ? { ...s, completed: !s.completed } : s);
      const found = d.find(s => s.id === id);
      if (found) {
        const row = toShopRow(found);
        sbUpsert('shopping_items', row);
        broadcastRealtime({ table: 'shopping_items', eventType: 'UPDATE', newRow: row });
      }
      return d;
    });
  };
  const deleteShoppingItem = (id: string) => {
    setShoppingItems(prev => prev.filter(s => s.id !== id));
    sbDelete('shopping_items', id);
    broadcastRealtime({ table: 'shopping_items', eventType: 'DELETE', oldRow: { id } });
  };
  const clearCompletedShopping = () => {
    setShoppingItems(prev => {
      const toDelete = prev.filter(s => s.completed);
      toDelete.forEach(s => {
        sbDelete('shopping_items', s.id);
        broadcastRealtime({ table: 'shopping_items', eventType: 'DELETE', oldRow: { id: s.id } });
      });
      return prev.filter(s => !s.completed);
    });
  };

  // ── Meal Plan ─────────────────────────────────────────────────────────────
  const updateMealPlanDay = (dayKey: string, meals: Partial<WeeklyMealPlan[string]>) => {
    setMealPlan(prev => {
      const updated = { ...prev, [dayKey]: { ...prev[dayKey], ...meals } };
      const dayMeal = updated[dayKey];
      const row = { id: `meal_${dayKey}`, day_key: dayKey, ...dayMeal };
      sbUpsert('meal_plans', row);
      broadcastRealtime({ table: 'meal_plans', eventType: 'UPDATE', newRow: row });
      return updated;
    });
  };

  // ── Birthdays ─────────────────────────────────────────────────────────────
  const addBirthday = (bday: Omit<BirthdayItem,'id'|'giftIdeas'>) => {
    const newBday: BirthdayItem = { ...bday, id: generateId(), giftIdeas: [] };
    const row = toBirthdayRow(newBday);
    setBirthdays(prev => [...prev, newBday]);
    sbUpsert('birthdays', row);
    broadcastRealtime({ table: 'birthdays', eventType: 'INSERT', newRow: row });
  };
  const deleteBirthday = (id: string) => {
    setBirthdays(prev => prev.filter(b => b.id !== id));
    sbDelete('birthdays', id);
    broadcastRealtime({ table: 'birthdays', eventType: 'DELETE', oldRow: { id } });
  };
  const updateBirthdayById = (id: string, patch: Partial<BirthdayItem>) => {
    setBirthdays(prev => {
      const d = prev.map(b => b.id === id ? { ...b, ...patch } : b);
      const found = d.find(b => b.id === id);
      if (found) {
        const row = toBirthdayRow(found);
        sbUpsert('birthdays', row);
        broadcastRealtime({ table: 'birthdays', eventType: 'UPDATE', newRow: row });
      }
      return d;
    });
  };
  const addGiftIdea = (birthdayId: string, titleOrObj: string | Omit<GiftIdea,'id'>, cost?: number) => {
    const titleStr = typeof titleOrObj === 'string' ? titleOrObj : titleOrObj.title;
    const costVal = typeof titleOrObj === 'string' ? cost : titleOrObj.estimatedCost;
    const statusVal = typeof titleOrObj === 'string' ? 'Idea' : (titleOrObj.status || 'Idea');
    const newIdea: GiftIdea = { id: generateId(), title: titleStr, estimatedCost: costVal, status: statusVal };
    setBirthdays(prev => {
      const exists = prev.some(b => b.id === birthdayId);
      let updatedList: BirthdayItem[];
      if (exists) {
        updatedList = prev.map(b => b.id === birthdayId ? { ...b, giftIdeas: [...b.giftIdeas, newIdea] } : b);
      } else {
        const targetMember = allMembers.find(m => m.id === birthdayId);
        const targetAnn = anniversaries.find(a => a.id === birthdayId);
        const newBdayItem: BirthdayItem = {
          id: birthdayId,
          name: targetMember?.name || targetAnn?.title || 'Persona/Celebración',
          relationship: targetMember ? 'Cumpleaños' : (targetAnn?.type || 'Familia'),
          birthDate: targetMember?.birthDate || targetAnn?.date || '',
          avatar: targetMember?.avatar || '🎉',
          giftIdeas: [newIdea],
          notes: targetMember?.notes || targetAnn?.notes
        };
        updatedList = [...prev, newBdayItem];
      }
      const targetItem = updatedList.find(b => b.id === birthdayId);
      if (targetItem) {
        const row = toBirthdayRow(targetItem);
        sbUpsert('birthdays', row);
        broadcastRealtime({ table: 'birthdays', eventType: 'UPDATE', newRow: row });
      }
      return updatedList;
    });
  };
  const updateGiftIdeaStatus = (birthdayId: string, giftId: string, status: GiftIdea['status']) => {
    setBirthdays(prev => {
      const d = prev.map(b => b.id === birthdayId
        ? { ...b, giftIdeas: b.giftIdeas.map(g => g.id === giftId ? { ...g, status } : g) }
        : b);
      const found = d.find(b => b.id === birthdayId);
      if (found) {
        const row = toBirthdayRow(found);
        sbUpsert('birthdays', row);
        broadcastRealtime({ table: 'birthdays', eventType: 'UPDATE', newRow: row });
      }
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
      const found = d.find(b => b.id === birthdayId);
      if (found) {
        const row = toBirthdayRow(found);
        sbUpsert('birthdays', row);
        broadcastRealtime({ table: 'birthdays', eventType: 'UPDATE', newRow: row });
      }
      return d;
    });
  };
  const editGiftIdea = (birthdayId: string, giftId: string, updated: Partial<GiftIdea>) => {
    setBirthdays(prev => {
      const d = prev.map(b => b.id === birthdayId
        ? { ...b, giftIdeas: b.giftIdeas.map(g => g.id === giftId ? { ...g, ...updated } : g) }
        : b);
      const found = d.find(b => b.id === birthdayId);
      if (found) {
        const row = toBirthdayRow(found);
        sbUpsert('birthdays', row);
        broadcastRealtime({ table: 'birthdays', eventType: 'UPDATE', newRow: row });
      }
      return d;
    });
  };
  const deleteGiftIdea = (birthdayId: string, giftId: string) => {
    setBirthdays(prev => {
      const d = prev.map(b => b.id === birthdayId
        ? { ...b, giftIdeas: b.giftIdeas.filter(g => g.id !== giftId) }
        : b);
      const found = d.find(b => b.id === birthdayId);
      if (found) {
        const row = toBirthdayRow(found);
        sbUpsert('birthdays', row);
        broadcastRealtime({ table: 'birthdays', eventType: 'UPDATE', newRow: row });
      }
      return d;
    });
  };

  // ── Sticky Notes ──────────────────────────────────────────────────────────
  const addStickyNote = (note: Omit<StickyNote,'id'|'createdAt'>) => {
    const newNote: StickyNote = { ...note, id: generateId(), createdAt: new Date().toISOString() };
    const row = toNoteRow(newNote);
    setStickyNotes(prev => [newNote, ...prev]);
    sbUpsert('sticky_notes', row);
    broadcastRealtime({ table: 'sticky_notes', eventType: 'INSERT', newRow: row });
  };
  const editStickyNote = (id: string, updated: Partial<StickyNote>) => {
    setStickyNotes(prev => {
      const d = prev.map(n => n.id === id ? { ...n, ...updated } : n);
      const found = d.find(n => n.id === id);
      if (found) {
        const row = toNoteRow(found);
        sbUpsert('sticky_notes', row);
        broadcastRealtime({ table: 'sticky_notes', eventType: 'UPDATE', newRow: row });
      }
      return d;
    });
  };
  const togglePinNote = (id: string) => {
    setStickyNotes(prev => {
      const d = prev.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n);
      const found = d.find(n => n.id === id);
      if (found) {
        const row = toNoteRow(found);
        sbUpsert('sticky_notes', row);
        broadcastRealtime({ table: 'sticky_notes', eventType: 'UPDATE', newRow: row });
      }
      return d;
    });
  };
  const deleteStickyNote = (id: string) => {
    setStickyNotes(prev => prev.filter(n => n.id !== id));
    sbDelete('sticky_notes', id);
    broadcastRealtime({ table: 'sticky_notes', eventType: 'DELETE', oldRow: { id } });
  };

  // ── Expenses ──────────────────────────────────────────────────────────────
  const addExpense = (expense: Omit<ExpenseItem,'id'>) => {
    const newExp: ExpenseItem = { ...expense, id: generateId() };
    const row = toExpenseRow(newExp);
    setExpenses(prev => [...prev, newExp]);
    sbUpsert('expenses', row);
    broadcastRealtime({ table: 'expenses', eventType: 'INSERT', newRow: row });
  };
  const toggleExpensePaid = (id: string) => {
    setExpenses(prev => {
      const d = prev.map(e => e.id === id ? { ...e, paid: !e.paid } : e);
      const found = d.find(e => e.id === id);
      if (found) {
        const row = toExpenseRow(found);
        sbUpsert('expenses', row);
        broadcastRealtime({ table: 'expenses', eventType: 'UPDATE', newRow: row });
      }
      return d;
    });
  };
  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    sbDelete('expenses', id);
    broadcastRealtime({ table: 'expenses', eventType: 'DELETE', oldRow: { id } });
  };

  // ── Emergency Contacts ────────────────────────────────────────────────────
  const addEmergencyContact = (contact: Omit<EmergencyContact,'id'>) => {
    const newC: EmergencyContact = { ...contact, id: generateId() };
    const row = toContactRow(newC);
    setEmergencyContacts(prev => [...prev, newC]);
    sbUpsert('emergency_contacts', row);
    broadcastRealtime({ table: 'emergency_contacts', eventType: 'INSERT', newRow: row });
  };
  const deleteEmergencyContact = (id: string) => {
    setEmergencyContacts(prev => prev.filter(c => c.id !== id));
    sbDelete('emergency_contacts', id);
    broadcastRealtime({ table: 'emergency_contacts', eventType: 'DELETE', oldRow: { id } });
  };

  // ── Catholic Intentions ───────────────────────────────────────────────────
  const addIntention = (intention: Omit<CatholicIntention,'id'|'completed'>) => {
    const newInt: CatholicIntention = { ...intention, id: generateId(), completed: false };
    const row = toIntentionRow(newInt);
    setIntentions(prev => [...prev, newInt]);
    sbUpsert('catholic_intentions', row);
    broadcastRealtime({ table: 'catholic_intentions', eventType: 'INSERT', newRow: row });
  };
  const toggleIntention = (id: string) => {
    setIntentions(prev => {
      const d = prev.map(i => i.id === id ? { ...i, completed: !i.completed } : i);
      const found = d.find(i => i.id === id);
      if (found) {
        const row = toIntentionRow(found);
        sbUpsert('catholic_intentions', row);
        broadcastRealtime({ table: 'catholic_intentions', eventType: 'UPDATE', newRow: row });
      }
      return d;
    });
  };
  const deleteIntention = (id: string) => {
    setIntentions(prev => prev.filter(i => i.id !== id));
    sbDelete('catholic_intentions', id);
    broadcastRealtime({ table: 'catholic_intentions', eventType: 'DELETE', oldRow: { id } });
  };

  // ── Reset (admin only — clears all local state, Supabase untouched) ───────
  const resetToMockData = () => {
    setEvents([]);
    setTasks([]);
    setShoppingItems([]);
    setMealPlan({});
    setBirthdays([]);
    setStickyNotes([]);
    setExpenses([]);
    setEmergencyContacts([]);
    setIntentions([]);
    setWeddingTasks([]);
    setWeddingNotes([]);
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
      weddingTasks, weddingNotes,
      sectionVisibility, dashboardCardsVisibility, customCategories, menuOrder,
      wifiSSID, wifiPass, updateWifi,
      dataLoaded,
      addAnniversary, deleteAnniversary,
      addWeddingTask, toggleWeddingTask, editWeddingTask, deleteWeddingTask,
      addWeddingNote, editWeddingNote, deleteWeddingNote,
      reorderMenuSections,
      updateSectionVisibility, updateDashboardCardVisibility,
      updateCategories, addCategory, deleteCategory, reorderCategories,
      addCustomTaskList, deleteCustomTaskList,
      addEvent, editEvent, deleteEvent,
      addTask, editTask, toggleTask, deleteTask,
      requestTaskValidation, approveTaskValidation, rejectTaskValidation,
      claimReward, requestReward, approveRewardRequest, rejectRewardRequest, enjoyReward, revokeRewardRequest,
      addShoppingItem, editShoppingItem, toggleShoppingItem, deleteShoppingItem, clearCompletedShopping,
      updateMealPlanDay,
      addBirthday, deleteBirthday, updateBirthdayById, addGiftIdea, editGiftIdea, deleteGiftIdea, updateGiftIdeaStatus, toggleGiftStatus,
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

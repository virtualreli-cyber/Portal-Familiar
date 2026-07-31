import { useState, useEffect } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { 
  INITIAL_MEMBERS, 
  INITIAL_SHOPPING, 
  INITIAL_EVENTS, 
  INITIAL_BIRTHDAYS, 
  INITIAL_TASKS, 
  INITIAL_REWARDS, 
  INITIAL_MEAL_PLAN, 
  INITIAL_EXPENSES, 
  INITIAL_STICKY_NOTES, 
  INITIAL_EMERGENCY_CONTACTS 
} from './data/initialData';
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
} from './types';

import { Header } from './components/Header';
import { NavigationTabs, TabType } from './components/NavigationTabs';
import { DashboardOverview } from './components/DashboardOverview';
import { ShoppingList } from './components/ShoppingList';
import { CalendarView } from './components/CalendarView';
import { BirthdaysView } from './components/BirthdaysView';
import { TasksView } from './components/TasksView';
import { MealPlannerView } from './components/MealPlannerView';
import { ExpenseTrackerView } from './components/ExpenseTrackerView';
import { FamilyProfileView } from './components/FamilyProfileView';
import { KioskModeModal } from './components/KioskModeModal';
import { BackupModal } from './components/BackupModal';

export default function App() {
  // LocalStorage states
  const [familyMembers, setFamilyMembers, resetMembers] = useLocalStorage<FamilyMember[]>('hogarplus_members', INITIAL_MEMBERS);
  const [shoppingList, setShoppingList, resetShopping] = useLocalStorage<ShoppingItem[]>('hogarplus_shopping', INITIAL_SHOPPING);
  const [events, setEvents, resetEvents] = useLocalStorage<CalendarEvent[]>('hogarplus_events', INITIAL_EVENTS);
  const [birthdays, setBirthdays, resetBirthdays] = useLocalStorage<BirthdayItem[]>('hogarplus_birthdays', INITIAL_BIRTHDAYS);
  const [tasks, setTasks, resetTasks] = useLocalStorage<TaskItem[]>('hogarplus_tasks', INITIAL_TASKS);
  const [rewards, setRewards, resetRewards] = useLocalStorage<RewardItem[]>('hogarplus_rewards', INITIAL_REWARDS);
  const [mealPlan, setMealPlan, resetMeals] = useLocalStorage<WeeklyMealPlan>('hogarplus_meals', INITIAL_MEAL_PLAN);
  const [expenses, setExpenses, resetExpenses] = useLocalStorage<ExpenseItem[]>('hogarplus_expenses', INITIAL_EXPENSES);
  const [stickyNotes, setStickyNotes, resetNotes] = useLocalStorage<StickyNote[]>('hogarplus_notes', INITIAL_STICKY_NOTES);
  const [emergencyContacts, setEmergencyContacts, resetContacts] = useLocalStorage<EmergencyContact[]>('hogarplus_contacts', INITIAL_EMERGENCY_CONTACTS);
  const [darkMode, setDarkMode] = useLocalStorage<boolean>('hogarplus_darkmode', false);

  // App Navigation & UI state
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [activeMemberId, setActiveMemberId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isKioskOpen, setIsKioskOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);

  // Sync dark mode class on HTML body
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Derived counts for navigation badges
  const todayISO = new Date().toISOString().split('T')[0];
  const counts = {
    pendingShopping: shoppingList.filter(s => !s.completed).length,
    upcomingEvents: events.filter(e => e.date >= todayISO).length,
    upcomingBirthdays: birthdays.length,
    pendingTasks: tasks.filter(t => !t.completed).length,
    pinnedNotes: stickyNotes.filter(n => n.pinned).length,
  };

  // --- HANDLERS FOR SHOPPING ---
  const handleAddShoppingItem = (name: string, category?: string) => {
    const newItem: ShoppingItem = {
      id: 's_' + Date.now(),
      name,
      category: (category as any) || 'Despensa y Bebidas',
      quantity: '1 u.',
      completed: false,
      addedBy: familyMembers[0]?.name || 'Familia',
      createdAt: todayISO
    };
    setShoppingList(prev => [newItem, ...prev]);
  };

  const handleCreateShoppingItemFull = (itemData: Omit<ShoppingItem, 'id' | 'createdAt'>) => {
    const newItem: ShoppingItem = {
      ...itemData,
      id: 's_' + Date.now(),
      createdAt: todayISO
    };
    setShoppingList(prev => [newItem, ...prev]);
  };

  const handleToggleShoppingItem = (id: string) => {
    setShoppingList(prev => prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
  };

  const handleDeleteShoppingItem = (id: string) => {
    setShoppingList(prev => prev.filter(item => item.id !== id));
  };

  const handleClearCompletedShopping = () => {
    setShoppingList(prev => prev.filter(item => !item.completed));
  };

  const handleAddIngredientsFromMeals = (ingredients: string[]) => {
    const newItems: ShoppingItem[] = ingredients.map((ing, idx) => ({
      id: 's_ing_' + Date.now() + '_' + idx,
      name: ing,
      category: 'Despensa y Bebidas',
      quantity: '1 pack',
      completed: false,
      addedBy: 'Menú Semanal',
      createdAt: todayISO
    }));
    setShoppingList(prev => [...newItems, ...prev]);
  };

  // --- HANDLERS FOR CALENDAR EVENTS ---
  const handleAddEvent = (evtData: Omit<CalendarEvent, 'id'>) => {
    const newEvt: CalendarEvent = {
      ...evtData,
      id: 'e_' + Date.now()
    };
    setEvents(prev => [...prev, newEvt]);
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  // --- HANDLERS FOR BIRTHDAYS ---
  const handleAddBirthday = (bdayData: Omit<BirthdayItem, 'id'>) => {
    const newBday: BirthdayItem = {
      ...bdayData,
      id: 'b_' + Date.now()
    };
    setBirthdays(prev => [...prev, newBday]);
  };

  const handleDeleteBirthday = (id: string) => {
    setBirthdays(prev => prev.filter(b => b.id !== id));
  };

  const handleAddGiftIdea = (birthdayId: string, giftTitle: string, cost?: number, assignedTo?: string) => {
    setBirthdays(prev => prev.map(b => {
      if (b.id !== birthdayId) return b;
      return {
        ...b,
        giftIdeas: [
          ...b.giftIdeas,
          {
            id: 'g_' + Date.now(),
            title: giftTitle,
            estimatedCost: cost,
            bought: false,
            assignedTo
          }
        ]
      };
    }));
  };

  const handleToggleGiftBought = (birthdayId: string, giftId: string) => {
    setBirthdays(prev => prev.map(b => {
      if (b.id !== birthdayId) return b;
      return {
        ...b,
        giftIdeas: b.giftIdeas.map(g => g.id === giftId ? { ...g, bought: !g.bought } : g)
      };
    }));
  };

  const handleDeleteGiftIdea = (birthdayId: string, giftId: string) => {
    setBirthdays(prev => prev.map(b => {
      if (b.id !== birthdayId) return b;
      return {
        ...b,
        giftIdeas: b.giftIdeas.filter(g => g.id !== giftId)
      };
    }));
  };

  // --- HANDLERS FOR TASKS & POINTS ---
  const handleAddTask = (taskData: Omit<TaskItem, 'id'>) => {
    const newTask: TaskItem = {
      ...taskData,
      id: 't_' + Date.now()
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const handleToggleTask = (id: string) => {
    setTasks(prev => {
      const targetTask = prev.find(t => t.id === id);
      if (!targetTask) return prev;

      const isNowCompleted = !targetTask.completed;

      // Award or deduct points from assigned member
      if (targetTask.assignedToMemberId) {
        setFamilyMembers(mPrev => mPrev.map(m => {
          if (m.id !== targetTask.assignedToMemberId) return m;
          const pointDelta = isNowCompleted ? targetTask.points : -targetTask.points;
          return { ...m, points: Math.max(0, m.points + pointDelta) };
        }));
      }

      return prev.map(t => t.id === id ? { 
        ...t, 
        completed: isNowCompleted, 
        completedAt: isNowCompleted ? todayISO : undefined 
      } : t);
    });
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleAddReward = (rewardData: Omit<RewardItem, 'id'>) => {
    const newReward: RewardItem = {
      ...rewardData,
      id: 'r_' + Date.now()
    };
    setRewards(prev => [...prev, newReward]);
  };

  const handleClaimReward = (_rewardId: string, memberId: string, costPoints: number) => {
    // Deduct points from member
    setFamilyMembers(prev => prev.map(m => m.id === memberId ? { ...m, points: Math.max(0, m.points - costPoints) } : m));
  };

  // --- HANDLERS FOR EXPENSES ---
  const handleAddExpense = (expData: Omit<ExpenseItem, 'id'>) => {
    const newExp: ExpenseItem = {
      ...expData,
      id: 'ex_' + Date.now()
    };
    setExpenses(prev => [newExp, ...prev]);
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  // --- HANDLERS FOR FAMILY & STICKY NOTES ---
  const handleAddMember = (memberData: Omit<FamilyMember, 'id'>) => {
    const newMember: FamilyMember = {
      ...memberData,
      id: 'm_' + Date.now()
    };
    setFamilyMembers(prev => [...prev, newMember]);
  };

  const handleUpdateMember = (updatedMember: FamilyMember) => {
    setFamilyMembers(prev => prev.map(m => m.id === updatedMember.id ? updatedMember : m));
  };

  const handleDeleteMember = (id: string) => {
    setFamilyMembers(prev => prev.filter(m => m.id !== id));
  };

  const handleAddNote = (noteData: Omit<StickyNote, 'id' | 'createdAt'>) => {
    const newNote: StickyNote = {
      ...noteData,
      id: 'n_' + Date.now(),
      createdAt: todayISO
    };
    setStickyNotes(prev => [newNote, ...prev]);
  };

  const handleTogglePinNote = (id: string) => {
    setStickyNotes(prev => prev.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n));
  };

  const handleDeleteNote = (id: string) => {
    setStickyNotes(prev => prev.filter(n => n.id !== id));
  };

  const handleAddContact = (contactData: Omit<EmergencyContact, 'id'>) => {
    const newContact: EmergencyContact = {
      ...contactData,
      id: 'ec_' + Date.now()
    };
    setEmergencyContacts(prev => [...prev, newContact]);
  };

  const handleDeleteContact = (id: string) => {
    setEmergencyContacts(prev => prev.filter(c => c.id !== id));
  };

  // --- BACKUP & RESTORE ---
  const handleExportAllData = () => {
    const fullBackup = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      familyMembers,
      shoppingList,
      events,
      birthdays,
      tasks,
      rewards,
      mealPlan,
      expenses,
      stickyNotes,
      emergencyContacts
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fullBackup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `hogarplus-backup-${todayISO}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportAllData = (backupData: any) => {
    if (backupData.familyMembers) setFamilyMembers(backupData.familyMembers);
    if (backupData.shoppingList) setShoppingList(backupData.shoppingList);
    if (backupData.events) setEvents(backupData.events);
    if (backupData.birthdays) setBirthdays(backupData.birthdays);
    if (backupData.tasks) setTasks(backupData.tasks);
    if (backupData.rewards) setRewards(backupData.rewards);
    if (backupData.mealPlan) setMealPlan(backupData.mealPlan);
    if (backupData.expenses) setExpenses(backupData.expenses);
    if (backupData.stickyNotes) setStickyNotes(backupData.stickyNotes);
    if (backupData.emergencyContacts) setEmergencyContacts(backupData.emergencyContacts);
  };

  const handleResetToDefault = () => {
    resetMembers();
    resetShopping();
    resetEvents();
    resetBirthdays();
    resetTasks();
    resetRewards();
    resetMeals();
    resetExpenses();
    resetNotes();
    resetContacts();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      
      {/* Top Header */}
      <Header
        familyMembers={familyMembers}
        activeMemberId={activeMemberId}
        onSelectMember={setActiveMemberId}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onOpenKiosk={() => setIsKioskOpen(true)}
        onOpenBackup={() => setIsBackupOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Navigation Bar */}
      <NavigationTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        counts={counts}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <DashboardOverview
            familyMembers={familyMembers}
            shoppingList={shoppingList}
            events={events}
            birthdays={birthdays}
            tasks={tasks}
            mealPlan={mealPlan}
            stickyNotes={stickyNotes}
            activeMemberId={activeMemberId}
            onNavigate={setActiveTab}
            onToggleTask={handleToggleTask}
            onToggleShoppingItem={handleToggleShoppingItem}
            onAddShoppingItem={handleAddShoppingItem}
            onAddQuickNote={(title, content) => handleAddNote({ title, content, color: 'yellow', author: familyMembers[0]?.name || 'Familia', pinned: true })}
          />
        )}

        {activeTab === 'shopping' && (
          <ShoppingList
            items={shoppingList}
            familyMembers={familyMembers}
            onAddItem={handleCreateShoppingItemFull}
            onToggleItem={handleToggleShoppingItem}
            onDeleteItem={handleDeleteShoppingItem}
            onClearCompleted={handleClearCompletedShopping}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarView
            events={events}
            familyMembers={familyMembers}
            onAddEvent={handleAddEvent}
            onDeleteEvent={handleDeleteEvent}
          />
        )}

        {activeTab === 'birthdays' && (
          <BirthdaysView
            birthdays={birthdays}
            familyMembers={familyMembers}
            onAddBirthday={handleAddBirthday}
            onDeleteBirthday={handleDeleteBirthday}
            onAddGiftIdea={handleAddGiftIdea}
            onToggleGiftBought={handleToggleGiftBought}
            onDeleteGiftIdea={handleDeleteGiftIdea}
          />
        )}

        {activeTab === 'tasks' && (
          <TasksView
            tasks={tasks}
            rewards={rewards}
            familyMembers={familyMembers}
            activeMemberId={activeMemberId}
            onAddTask={handleAddTask}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            onAddReward={handleAddReward}
            onClaimReward={handleClaimReward}
          />
        )}

        {activeTab === 'meals' && (
          <MealPlannerView
            mealPlan={mealPlan}
            onUpdateMealPlan={setMealPlan}
            onAddIngredientsToShopping={handleAddIngredientsFromMeals}
          />
        )}

        {activeTab === 'expenses' && (
          <ExpenseTrackerView
            expenses={expenses}
            familyMembers={familyMembers}
            onAddExpense={handleAddExpense}
            onDeleteExpense={handleDeleteExpense}
          />
        )}

        {activeTab === 'family' && (
          <FamilyProfileView
            familyMembers={familyMembers}
            stickyNotes={stickyNotes}
            emergencyContacts={emergencyContacts}
            onAddMember={handleAddMember}
            onUpdateMember={handleUpdateMember}
            onDeleteMember={handleDeleteMember}
            onAddNote={handleAddNote}
            onTogglePinNote={handleTogglePinNote}
            onDeleteNote={handleDeleteNote}
            onAddContact={handleAddContact}
            onDeleteContact={handleDeleteContact}
          />
        )}
      </main>

      {/* Kiosk Mode Modal */}
      <KioskModeModal
        isOpen={isKioskOpen}
        onClose={() => setIsKioskOpen(false)}
        tasks={tasks}
        mealPlan={mealPlan}
        events={events}
        familyMembers={familyMembers}
        onToggleTask={handleToggleTask}
      />

      {/* Backup & Settings Modal */}
      <BackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        onExportData={handleExportAllData}
        onImportData={handleImportAllData}
        onResetToDefault={handleResetToDefault}
      />

    </div>
  );
}

import { useState, useEffect } from 'react';
import { FamilyData } from './types/family';
import { loadFamilyData, saveFamilyData, getDaysUntil } from './utils/storage';
import { Navbar } from './components/Navbar';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { DashboardView } from './components/views/DashboardView';
import { ShoppingView } from './components/views/ShoppingView';
import { CalendarView } from './components/views/CalendarView';
import { BirthdaysView } from './components/views/BirthdaysView';
import { ChoresView } from './components/views/ChoresView';
import { MealPlannerView } from './components/views/MealPlannerView';
import { BillsView } from './components/views/BillsView';
import { FridgeNotesView } from './components/views/FridgeNotesView';
import { RewardsView } from './components/views/RewardsView';
import { SettingsModal } from './components/modals/SettingsModal';

export function App() {
  const [data, setData] = useState<FamilyData>(() => loadFamilyData());
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('hogarsync_theme') === 'dark';
  });

  // Persist state changes to LocalStorage automatically
  useEffect(() => {
    saveFamilyData(data);
  }, [data]);

  // Sync dark mode class on html tag
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('hogarsync_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('hogarsync_theme', 'light');
    }
  }, [isDarkMode]);

  const handleUpdateData = (newData: FamilyData) => {
    setData(newData);
  };

  const pendingShoppingCount = data.shoppingItems.filter((i) => !i.completed).length;
  const pendingChoresCount = data.chores.filter((c) => !c.completed).length;
  const upcomingBirthdaysCount = data.birthdays.filter((b) => getDaysUntil(b.date) <= 30).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      
      {/* Top Navbar */}
      <Navbar
        data={data}
        onUpdateData={handleUpdateData}
        onOpenSettings={() => setShowSettingsModal(true)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />

      {/* Main Layout */}
      <div className="max-w-7xl mx-auto flex">
        
        {/* Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          pendingShoppingCount={pendingShoppingCount}
          pendingChoresCount={pendingChoresCount}
          upcomingBirthdaysCount={upcomingBirthdaysCount}
        />

        {/* Dynamic View Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              data={data}
              onUpdateData={handleUpdateData}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'shopping' && (
            <ShoppingView
              data={data}
              onUpdateData={handleUpdateData}
            />
          )}

          {activeTab === 'calendar' && (
            <CalendarView
              data={data}
              onUpdateData={handleUpdateData}
            />
          )}

          {activeTab === 'birthdays' && (
            <BirthdaysView
              data={data}
              onUpdateData={handleUpdateData}
            />
          )}

          {activeTab === 'chores' && (
            <ChoresView
              data={data}
              onUpdateData={handleUpdateData}
            />
          )}

          {activeTab === 'meals' && (
            <MealPlannerView
              data={data}
              onUpdateData={handleUpdateData}
            />
          )}

          {activeTab === 'bills' && (
            <BillsView
              data={data}
              onUpdateData={handleUpdateData}
            />
          )}

          {activeTab === 'fridge' && (
            <FridgeNotesView
              data={data}
              onUpdateData={handleUpdateData}
            />
          )}

          {activeTab === 'rewards' && (
            <RewardsView
              data={data}
              onUpdateData={handleUpdateData}
            />
          )}
        </main>

      </div>

      {/* Settings Modal */}
      {showSettingsModal && (
        <SettingsModal
          data={data}
          onUpdateData={handleUpdateData}
          onClose={() => setShowSettingsModal(false)}
        />
      )}

    </div>
  );
}

export default App;

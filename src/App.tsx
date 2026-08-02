import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FamilyProvider, useFamily } from './context/FamilyContext';
import { ActiveTab } from './types';
import { Header } from './components/Header';
import { LoginScreen } from './components/LoginScreen';
import { DashboardView } from './components/views/DashboardView';
import { CalendarView } from './components/views/CalendarView';
import { TasksView } from './components/views/TasksView';
import { ShoppingView } from './components/views/ShoppingView';
import { MealPlannerView } from './components/views/MealPlannerView';
import { CatholicCornerView } from './components/views/CatholicCornerView';
import { BirthdaysView } from './components/views/BirthdaysView';
import { FridgeNotesView } from './components/views/FridgeNotesView';
import { FinancesView } from './components/views/FinancesView';
import { EmergencyContactsView } from './components/views/EmergencyContactsView';
import { AdminSettingsView } from './components/views/AdminSettingsView';
import { WeddingView } from './components/views/WeddingView';
import { FamilyLogo } from './components/FamilyLogo';
import { getUserPreferences, saveUserPreferences } from './lib/userPreferences';

const VALID_TABS: ActiveTab[] = [
  'dashboard', 'tasks', 'shopping', 'calendar', 'notes',
  'meals', 'catholic', 'contacts', 'birthdays', 'finances', 'wedding', 'admin'
];

const getInitialTab = (): ActiveTab => {
  if (typeof window !== 'undefined') {
    const hash = window.location.hash.replace(/^#/, '').trim() as ActiveTab;
    if (hash && VALID_TABS.includes(hash)) {
      localStorage.setItem('portal_fam_active_tab', hash);
      return hash;
    }
  }
  try {
    const saved = localStorage.getItem('portal_fam_active_tab') as ActiveTab;
    if (saved && VALID_TABS.includes(saved)) {
      if (typeof window !== 'undefined' && window.location.hash !== `#${saved}`) {
        window.history.replaceState(null, '', `#${saved}`);
      }
      return saved;
    }
  } catch {}
  return 'dashboard';
};

const MainContent: React.FC = () => {
  const { currentMember, isLoggedIn, loading } = useAuth();
  const { dataLoaded } = useFamily();
  const [activeTab, setActiveTabState] = useState<ActiveTab>(getInitialTab);

  const setActiveTab = (tab: ActiveTab) => {
    setActiveTabState(tab);
    try {
      localStorage.setItem('portal_fam_active_tab', tab);
    } catch {}
    if (typeof window !== 'undefined' && window.location.hash !== `#${tab}`) {
      window.location.hash = `#${tab}`;
    }
  };

  // Keep location hash & localStorage strictly in sync across reloads & back/forward
  useEffect(() => {
    const syncTab = () => {
      const tab = getInitialTab();
      setActiveTabState(tab);
    };
    window.addEventListener('hashchange', syncTab);
    window.addEventListener('popstate', syncTab);
    return () => {
      window.removeEventListener('hashchange', syncTab);
      window.removeEventListener('popstate', syncTab);
    };
  }, []);

  // Reset view to 'dashboard' whenever logged-in member changes
  const prevMemberIdRef = React.useRef<string | null>(null);
  useEffect(() => {
    if (currentMember?.id) {
      if (prevMemberIdRef.current && prevMemberIdRef.current !== currentMember.id) {
        setActiveTab('dashboard');
      }
      prevMemberIdRef.current = currentMember.id;
    }
  }, [currentMember?.id]);

  // Per-member scroll to top on view change
  useEffect(() => {
    if (!currentMember) return;
    const prefs = getUserPreferences(currentMember.id);
    saveUserPreferences(currentMember.id, {
      lastViewTimestamps: {
        ...prefs.lastViewTimestamps,
        [activeTab]: Date.now()
      }
    });
    window.scrollTo(0, 0);
  }, [activeTab, currentMember]);

  // Show loading spinner while restoring auth session or loading data from Supabase
  if (loading || !dataLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-indigo-950 to-purple-950 flex items-center justify-center p-6">
        <div className="text-center space-y-5 flex flex-col items-center">
          <FamilyLogo size={96} animated={true} />
          <div className="space-y-1">
            <h2 className="text-white font-extrabold text-xl tracking-tight">Portal Familiar</h2>
            <p className="text-indigo-200 text-xs font-medium animate-pulse">Sincronizando datos del hogar…</p>
          </div>
        </div>
      </div>
    );
  }

  // Show login screen if not logged in
  if (!isLoggedIn || !currentMember) {
    return <LoginScreen />;
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':   return <DashboardView setActiveTab={setActiveTab} />;
      case 'calendar':    return <CalendarView />;
      case 'tasks':       return <TasksView />;
      case 'shopping':    return <ShoppingView />;
      case 'meals':       return <MealPlannerView />;
      case 'catholic':    return <CatholicCornerView />;
      case 'birthdays':   return <BirthdaysView />;
      case 'notes':       return <FridgeNotesView />;
      case 'finances':    return <FinancesView />;
      case 'contacts':    return <EmergencyContactsView />;
      case 'wedding':     return <WeddingView />;
      case 'admin':       return <AdminSettingsView />;
      default:            return <DashboardView setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-900">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 pt-4 pb-6">
        {renderActiveView()}
      </main>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <FamilyProvider>
        <MainContent />
      </FamilyProvider>
    </AuthProvider>
  );
};

export default App;

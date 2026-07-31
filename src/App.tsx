import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FamilyProvider } from './context/FamilyContext';
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
import { getUserPreferences, saveUserPreferences } from './lib/userPreferences';

const MainContent: React.FC = () => {
  const { currentMember, isLoggedIn, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

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

  // Show loading spinner while restoring session
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl animate-bounce">👨‍👩‍👧‍👦</div>
          <p className="text-white font-bold text-lg animate-pulse">Cargando Portal Familiar…</p>
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

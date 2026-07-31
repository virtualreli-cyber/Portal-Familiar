import React from 'react';
import { 
  Home, ShoppingCart, Calendar, Cake, CheckSquare, 
  Utensils, Wallet, Users
} from 'lucide-react';

export type TabType = 'overview' | 'shopping' | 'calendar' | 'birthdays' | 'tasks' | 'meals' | 'expenses' | 'family';

interface NavigationTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  counts: {
    pendingShopping: number;
    upcomingEvents: number;
    upcomingBirthdays: number;
    pendingTasks: number;
    pinnedNotes: number;
  };
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  onTabChange,
  counts
}) => {
  const tabs = [
    { id: 'overview' as TabType, label: 'Inicio', icon: Home, badge: null, color: 'text-blue-500' },
    { id: 'shopping' as TabType, label: 'Compra', icon: ShoppingCart, badge: counts.pendingShopping, color: 'text-amber-500' },
    { id: 'calendar' as TabType, label: 'Calendario', icon: Calendar, badge: counts.upcomingEvents, color: 'text-indigo-500' },
    { id: 'birthdays' as TabType, label: 'Cumpleaños', icon: Cake, badge: counts.upcomingBirthdays, color: 'text-rose-500' },
    { id: 'tasks' as TabType, label: 'Tareas y Puntos', icon: CheckSquare, badge: counts.pendingTasks, color: 'text-emerald-500' },
    { id: 'meals' as TabType, label: 'Menú Semanal', icon: Utensils, badge: null, color: 'text-teal-500' },
    { id: 'expenses' as TabType, label: 'Gastos', icon: Wallet, badge: null, color: 'text-violet-500' },
    { id: 'family' as TabType, label: 'Familia y Notas', icon: Users, badge: counts.pinnedNotes, color: 'text-cyan-500' },
  ];

  return (
    <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-20 z-20 transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-2.5 no-scrollbar scroll-smooth">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-medium text-xs sm:text-sm whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : tab.color}`} />
                <span>{tab.label}</span>
                {tab.badge !== null && tab.badge > 0 && (
                  <span
                    className={`ml-1 px-2 py-0.5 text-[10px] font-bold rounded-full transition-all ${
                      isActive
                        ? 'bg-white text-amber-600'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

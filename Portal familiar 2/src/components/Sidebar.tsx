import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Calendar as CalendarIcon, 
  Cake, 
  CheckSquare, 
  Utensils, 
  Receipt, 
  StickyNote, 
  Trophy 
} from 'lucide-react';

export type ActiveTab = 
  | 'dashboard' 
  | 'shopping' 
  | 'calendar' 
  | 'birthdays' 
  | 'chores' 
  | 'meals' 
  | 'bills' 
  | 'fridge' 
  | 'rewards';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  pendingShoppingCount: number;
  pendingChoresCount: number;
  upcomingBirthdaysCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  pendingShoppingCount,
  pendingChoresCount,
  upcomingBirthdaysCount,
}) => {
  const menuItems: {
    id: ActiveTab;
    label: string;
    icon: React.ReactNode;
    badge?: number;
    badgeColor?: string;
  }[] = [
    { id: 'dashboard', label: 'Inicio', icon: <LayoutDashboard className="w-5 h-5" /> },
    { 
      id: 'shopping', 
      label: 'Compras', 
      icon: <ShoppingCart className="w-5 h-5" />, 
      badge: pendingShoppingCount,
      badgeColor: 'bg-orange-500 text-white'
    },
    { id: 'calendar', label: 'Calendario', icon: <CalendarIcon className="w-5 h-5" /> },
    { 
      id: 'birthdays', 
      label: 'Cumpleaños', 
      icon: <Cake className="w-5 h-5" />,
      badge: upcomingBirthdaysCount,
      badgeColor: 'bg-rose-500 text-white'
    },
    { 
      id: 'chores', 
      label: 'Tareas y Checks', 
      icon: <CheckSquare className="w-5 h-5" />,
      badge: pendingChoresCount,
      badgeColor: 'bg-emerald-500 text-white'
    },
    { id: 'meals', label: 'Menú Semanal', icon: <Utensils className="w-5 h-5" /> },
    { id: 'bills', label: 'Facturas y Gastos', icon: <Receipt className="w-5 h-5" /> },
    { id: 'fridge', label: 'Notas del Frigo', icon: <StickyNote className="w-5 h-5" /> },
    { id: 'rewards', label: 'Recompensas', icon: <Trophy className="w-5 h-5" /> },
  ];

  return (
    <>
      {/* Desktop Navigation Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shrink-0 min-h-[calc(100vh-4rem)] p-4 transition-colors">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl font-medium text-sm transition-all duration-200 group ${
                  isActive
                    ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                      isActive ? 'bg-white/20 text-white' : item.badgeColor || 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-500 text-center">
          <p className="font-medium text-slate-600 dark:text-slate-400">HogarSync v1.0</p>
          <p className="mt-1">Datos guardados localmente</p>
        </div>
      </aside>

      {/* Mobile Horizontal Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-2 shadow-lg overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max justify-around">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex flex-col items-center justify-center px-3 py-1.5 rounded-xl text-[11px] font-medium transition relative ${
                  isActive
                    ? 'text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-slate-800'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <div className="relative">
                  {item.icon}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2 text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-orange-500 text-white border-2 border-white dark:border-slate-900">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="mt-1 whitespace-nowrap">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};

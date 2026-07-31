import React, { useState } from 'react';
import { ActiveTab } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  Home, 
  Calendar, 
  CheckSquare, 
  ShoppingBag, 
  UtensilsCrossed, 
  Cross, 
  Cake, 
  StickyNote, 
  Wallet, 
  PhoneCall, 
  Settings,
  MoreHorizontal,
  X
} from 'lucide-react';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { permissions, isAdmin } = useAuth();
  const [showMoreDrawer, setShowMoreDrawer] = useState(false);

  const primaryTabs: { id: ActiveTab; label: string; icon: React.ReactNode; show: boolean }[] = [
    { id: 'dashboard', label: 'Inicio', icon: <Home className="w-5 h-5" />, show: true },
    { id: 'calendar', label: 'Calendario', icon: <Calendar className="w-5 h-5" />, show: permissions.canManageCalendar },
    { id: 'tasks', label: 'Tareas', icon: <CheckSquare className="w-5 h-5" />, show: permissions.canManageTasks },
    { id: 'shopping', label: 'Compra', icon: <ShoppingBag className="w-5 h-5" />, show: permissions.canManageShopping },
    { id: 'meals', label: 'Menú', icon: <UtensilsCrossed className="w-5 h-5" />, show: permissions.canManageMeals },
  ];

  const secondaryTabs: { id: ActiveTab; label: string; icon: React.ReactNode; show: boolean }[] = [
    { id: 'catholic', label: 'Rincón Católico', icon: <Cross className="w-5 h-5 text-amber-600" />, show: permissions.canManageCatholic },
    { id: 'birthdays', label: 'Cumpleaños', icon: <Cake className="w-5 h-5 text-rose-500" />, show: true },
    { id: 'notes', label: 'Notas Nevera', icon: <StickyNote className="w-5 h-5 text-yellow-600" />, show: true },
    { id: 'finances', label: 'Gastos Hogar', icon: <Wallet className="w-5 h-5 text-emerald-600" />, show: permissions.canManageFinances },
    { id: 'contacts', label: 'Contactos', icon: <PhoneCall className="w-5 h-5 text-blue-600" />, show: true },
    { id: 'admin', label: 'Ajustes', icon: <Settings className="w-5 h-5 text-slate-600" />, show: isAdmin },
  ];

  const allVisibleTabs = [...primaryTabs, ...secondaryTabs].filter(t => t.show);

  const handleTabClick = (tabId: ActiveTab) => {
    setActiveTab(tabId);
    setShowMoreDrawer(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Desktop / Tablet Navigation Bar */}
      <nav className="hidden lg:block bg-white border-b border-slate-200 sticky top-[69px] z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 overflow-x-auto py-2 no-scrollbar">
          {allVisibleTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`px-3 py-2 rounded-xl font-medium text-xs sm:text-sm flex items-center gap-2 transition active-touch whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Top Scrollable Navigation */}
      <div className="lg:hidden bg-white border-b border-slate-200 sticky top-[69px] z-20 overflow-x-auto py-2 px-2 flex items-center gap-1.5 no-scrollbar shadow-xs">
        {allVisibleTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`px-3 py-1.5 rounded-full font-medium text-xs flex items-center gap-1.5 shrink-0 transition active-touch ${
                isActive
                  ? 'bg-indigo-600 text-white font-bold shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span className="scale-85">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Mobile Bottom Navigation Bar (Touch Optimized) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass-nav border-t border-slate-200/90 shadow-lg px-2 py-1.5">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {primaryTabs.filter(t => t.show).map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition active-touch ${
                  isActive ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div className={`p-1 rounded-xl transition ${isActive ? 'bg-indigo-50 text-indigo-600' : ''}`}>
                  {tab.icon}
                </div>
                <span className="text-[10px] mt-0.5">{tab.label}</span>
              </button>
            );
          })}

          {/* More button for secondary sections */}
          <button
            onClick={() => setShowMoreDrawer(true)}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-slate-500 hover:text-slate-800 active-touch ${
              secondaryTabs.some(t => t.id === activeTab) ? 'text-indigo-600 font-bold' : ''
            }`}
          >
            <div className="p-1 rounded-xl">
              <MoreHorizontal className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5">Más</span>
          </button>
        </div>
      </nav>

      {/* Mobile More Drawer Modal */}
      {showMoreDrawer && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full bg-white rounded-t-3xl p-5 border-t border-slate-200 shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xl">⛪</span>
                <h3 className="font-bold text-slate-900 text-base">Más Apartados del Portal</h3>
              </div>
              <button
                onClick={() => setShowMoreDrawer(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"
              >
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 pb-8">
              {secondaryTabs.filter(t => t.show).map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id)}
                    className={`p-3.5 rounded-2xl flex items-center gap-3 border text-left transition active-touch ${
                      isActive
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-bold ring-2 ring-indigo-500/20'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-slate-100">
                      {tab.icon}
                    </div>
                    <span className="text-xs font-semibold">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

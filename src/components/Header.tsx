import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useFamily } from '../context/FamilyContext';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { ActiveTab } from '../types';
import { LoginModal } from './LoginModal';
import { 
  Menu, 
  X, 
  Home, 
  Calendar, 
  CheckSquare, 
  ShoppingBag, 
  UtensilsCrossed, 
  Cross, 
  StickyNote, 
  PhoneCall, 
  Settings, 
  Users, 
  ChevronRight,
  ChevronLeft,
  Heart,
  Cake,
  Briefcase,
  LogOut
} from 'lucide-react';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

const TAB_INFO: Record<ActiveTab, { title: string; icon: string }> = {
  dashboard: { title: 'Inicio', icon: '🏠' },
  tasks: { title: 'Tareas del Hogar', icon: '✅' },
  shopping: { title: 'Lista de la Compra', icon: '🛒' },
  calendar: { title: 'Calendario Familiar', icon: '📅' },
  notes: { title: 'Notas de Nevera', icon: '📌' },
  meals: { title: 'Menú Semanal', icon: '🍽️' },
  catholic: { title: 'Rincón Católico', icon: '⛪' },
  contacts: { title: 'Contactos del Hogar', icon: '📞' },
  birthdays: { title: 'Cumpleaños & Regalos', icon: '🎂' },
  finances: { title: 'Gastos del Hogar', icon: '💼' },
  wedding: { title: 'Especial Boda', icon: '💒' },
  admin: { title: 'Ajustes del Portal', icon: '⚙️' }
};

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const { currentMember, currentRole, permissions, isAdmin, logout } = useAuth();
  const { tasks, shoppingItems, sectionVisibility, familyName, menuOrder } = useFamily();
  
  const [showDrawer, setShowDrawer] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [tabHistory, setTabHistory] = useState<ActiveTab[]>(['dashboard']);

  useBodyScrollLock(showDrawer || showLoginModal);

  const totalPendingTasksCount = tasks.filter(t => !t.completed).length;
  const urgentTasksCount = tasks.filter(t => !t.completed && t.priority === 'Alta').length;
  const urgentShoppingCount = shoppingItems.filter(s => !s.completed && s.urgent).length;

  const handleNavigate = (tab: ActiveTab) => {
    if (tab !== activeTab) {
      setTabHistory(prev => [...prev, activeTab]);
      setActiveTab(tab);
    }
    setShowDrawer(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    if (tabHistory.length > 0) {
      const prevTab = tabHistory[tabHistory.length - 1];
      setTabHistory(prev => prev.slice(0, -1));
      setActiveTab(prevTab);
    } else {
      setActiveTab('dashboard');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoHome = () => {
    handleNavigate('dashboard');
  };

  const handleLogout = () => {
    setShowDrawer(false);
    logout();
  };

  const allMenuItems: Array<{
    id: ActiveTab;
    label: string;
    icon: React.ReactNode;
    badge?: string;
    customBadge?: React.ReactNode;
    show: boolean;
  }> = [
    { id: 'dashboard', label: 'Inicio', icon: <Home className="w-5 h-5 text-indigo-600" />, show: true },
    { 
      id: 'tasks', 
      label: 'Tareas', 
      icon: <CheckSquare className="w-5 h-5 text-amber-500" />, 
      customBadge: (
        <div className="flex items-center gap-1">
          {urgentTasksCount > 0 && (
            <span 
              className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-600 text-white shadow-2xs" 
              title={`${urgentTasksCount} tareas urgentes (Prioridad Alta)`}
            >
              🔥 {urgentTasksCount}
            </span>
          )}
          {totalPendingTasksCount > 0 && (
            <span 
              className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-800 text-white" 
              title={`${totalPendingTasksCount} tareas pendientes totales`}
            >
              📋 {totalPendingTasksCount}
            </span>
          )}
        </div>
      ), 
      show: true 
    },
    { id: 'shopping', label: 'Lista Compra', icon: <ShoppingBag className="w-5 h-5 text-emerald-600" />, badge: urgentShoppingCount > 0 ? `!${urgentShoppingCount}` : undefined, show: permissions.canManageShopping },
    { id: 'calendar', label: 'Calendario', icon: <Calendar className="w-5 h-5 text-indigo-600" />, show: permissions.canManageCalendar },
    { id: 'notes', label: 'Notas de Nevera', icon: <StickyNote className="w-5 h-5 text-yellow-600" />, show: true },
    { id: 'meals', label: 'Menú Semanal', icon: <UtensilsCrossed className="w-5 h-5 text-orange-500" />, show: permissions.canManageMeals },
    { id: 'catholic', label: 'Rincón Católico', icon: <Cross className="w-5 h-5 text-amber-600" />, show: permissions.canManageCatholic },
    { id: 'contacts', label: 'Contactos', icon: <PhoneCall className="w-5 h-5 text-blue-600" />, show: true },
    { id: 'birthdays', label: 'Cumpleaños', icon: <Cake className="w-5 h-5 text-pink-500" />, show: true },
    { id: 'finances', label: 'Gastos', icon: <Briefcase className="w-5 h-5 text-purple-600" />, show: permissions.canManageFinances },
    { id: 'wedding', label: 'Boda', icon: <Heart className="w-5 h-5 text-rose-500" />, show: true },
    { id: 'admin', label: 'Ajustes', icon: <Settings className="w-5 h-5 text-slate-600" />, show: isAdmin }
  ];

  // Sort menu items according to user defined menuOrder
  const orderedMenuItems = menuOrder
    .map(tabId => allMenuItems.find(m => m.id === tabId))
    .filter((item): item is typeof allMenuItems[0] => !!item && item.show && sectionVisibility[item.id] !== false);

  // Fallback if menuOrder is missing some items
  allMenuItems.forEach(item => {
    if (item.show && sectionVisibility[item.id] !== false && !orderedMenuItems.some(m => m.id === item.id)) {
      orderedMenuItems.push(item);
    }
  });

  const currentTabMeta = TAB_INFO[activeTab] || TAB_INFO.dashboard;

  if (!currentMember) return null;

  return (
    <>
      {/* ── Top Header Bar ──────────────────────────────────────────────── */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 shadow-xs overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2 overflow-x-hidden">

          {/* LEFT: Back + Home + Menu */}
          <div className="flex items-center gap-1 min-w-0">
            {/* Discreet Back Button */}
            {activeTab !== 'dashboard' && (
              <button
                onClick={handleBack}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 transition active:scale-95 shrink-0"
                title="Volver atrás"
              >
                <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
              </button>
            )}

            {/* HOME button (separate from menu) */}
            <button
              onClick={handleGoHome}
              className="p-1.5 rounded-xl hover:bg-indigo-50 text-indigo-600 transition active:scale-95 shrink-0"
              title="Ir al Inicio"
            >
              <Home className="w-5 h-5" />
            </button>

            {/* MENU hamburger button (opens drawer) */}
            <button
              onClick={() => setShowDrawer(true)}
              className="flex items-center gap-2 p-1.5 rounded-2xl hover:bg-slate-100 transition active:scale-95 text-left group shrink overflow-hidden"
              title="Abrir menú de navegación"
            >
              {/* Family Logo */}
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white flex items-center justify-center shadow-md shadow-indigo-200 group-hover:scale-105 transition shrink-0">
                <Menu className="w-4 h-4 text-white" />
              </div>

              {/* Family name + active tab */}
              <div className="truncate hidden sm:block">
                <h1 className="text-sm font-extrabold text-slate-900 leading-tight truncate">
                  {familyName}
                </h1>
                <p className="text-xs text-slate-500 font-medium flex items-center gap-1 truncate">
                  <span className="shrink-0">{currentTabMeta.icon}</span>
                  <span className="font-semibold text-slate-700 truncate">{currentTabMeta.title}</span>
                </p>
              </div>
            </button>
          </div>

          {/* RIGHT: Profile avatar */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Profile Avatar → opens switch modal */}
            <button
              onClick={() => setShowLoginModal(true)}
              className="bg-slate-100 hover:bg-slate-200 border border-slate-200/80 p-1.5 sm:px-3 sm:py-1.5 rounded-full flex items-center gap-1.5 sm:gap-2 transition active:scale-95"
              title="Cambiar de perfil"
            >
              <span className="text-xl leading-none">{currentMember.avatar}</span>
              <div className="text-left hidden md:block">
                <p className="text-xs font-bold text-slate-800 leading-tight">{currentMember.name.split(' ')[0]}</p>
                <p className="text-[10px] text-slate-500 font-medium">{currentRole}</p>
              </div>
              <Users className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>
      </header>

      {/* ── OFF-CANVAS DRAWER ───────────────────────────────────────────── */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${
          showDrawer ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          onClick={() => setShowDrawer(false)}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
        />

        {/* Panel */}
        <aside
          className={`absolute top-0 bottom-0 left-0 w-[85%] max-w-sm bg-white shadow-2xl transition-transform duration-300 ease-out flex flex-col z-10 ${
            showDrawer ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Drawer Header */}
          <div className="p-4 bg-indigo-600 text-white flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-lg">
                👨‍👩‍👧‍👦
              </div>
              <div>
                <h3 className="font-extrabold text-base leading-tight">{familyName}</h3>
                <p className="text-[11px] text-indigo-200">Menú de Navegación</p>
              </div>
            </div>
            <button
              onClick={() => setShowDrawer(false)}
              className="p-1.5 rounded-full hover:bg-white/20 transition active:scale-95"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Current Active Member Badge */}
          <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shadow-xs ${currentMember.color || 'bg-indigo-600 text-white'}`}>
                {currentMember.avatar}
              </div>
              <div>
                <p className="font-bold text-xs text-slate-900">{currentMember.name}</p>
                <p className="text-[10px] text-slate-500 font-semibold">{currentRole}</p>
              </div>
            </div>

            <button
              onClick={() => {
                setShowDrawer(false);
                setShowLoginModal(true);
              }}
              className="px-2.5 py-1 bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-700 font-bold rounded-xl text-[11px] transition active:scale-95 shrink-0"
            >
              Cambiar
            </button>
          </div>

          {/* Menu Items */}
          <div className="p-3.5 flex-1 overflow-y-auto space-y-1.5">
            {orderedMenuItems.map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`w-full p-3 rounded-2xl flex items-center justify-between border text-left transition active:scale-[0.98] ${
                    isActive
                      ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-md shadow-indigo-100 ring-2 ring-indigo-300'
                      : 'bg-white hover:bg-slate-50 border-slate-200/80 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl transition ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100'}`}>
                      {item.icon}
                    </div>
                    <span className="text-xs sm:text-sm font-semibold">{item.label}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.customBadge ? (
                      item.customBadge
                    ) : item.badge ? (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        isActive ? 'bg-white text-indigo-900' : 'bg-rose-500 text-white'
                      }`}>
                        {item.badge}
                      </span>
                    ) : null}
                    <ChevronRight className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer: Logout button */}
          <div className="p-3.5 bg-slate-50 border-t border-slate-200 space-y-2">
            <button
              onClick={handleLogout}
              className="w-full py-2.5 px-4 flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition active:scale-95"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
            <p className="text-center text-[10px] font-semibold text-slate-400">Portal Familiar</p>
          </div>
        </aside>
      </div>

      {/* LOGIN / SWITCH MODAL */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </>
  );
};

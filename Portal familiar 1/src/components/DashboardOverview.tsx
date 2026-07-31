import React, { useState } from 'react';
import { 
  FamilyMember, ShoppingItem, CalendarEvent, BirthdayItem, TaskItem, 
  WeeklyMealPlan, StickyNote 
} from '../types';
import { TabType } from './NavigationTabs';
import { 
  ShoppingCart, Calendar, CheckSquare, Utensils, Cake, Sparkles, 
  Plus, Pin, Award, ArrowRight, Clock, AlertTriangle, CheckCircle2, Flame
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DashboardOverviewProps {
  familyMembers: FamilyMember[];
  shoppingList: ShoppingItem[];
  events: CalendarEvent[];
  birthdays: BirthdayItem[];
  tasks: TaskItem[];
  mealPlan: WeeklyMealPlan;
  stickyNotes: StickyNote[];
  activeMemberId: string | null;
  onNavigate: (tab: TabType) => void;
  onToggleTask: (taskId: string) => void;
  onToggleShoppingItem: (itemId: string) => void;
  onAddShoppingItem: (name: string, category?: string) => void;
  onAddQuickNote: (title: string, content: string) => void;
}

const DAYS_ES = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  familyMembers,
  shoppingList,
  events,
  birthdays,
  tasks,
  mealPlan,
  stickyNotes,
  activeMemberId,
  onNavigate,
  onToggleTask,
  onToggleShoppingItem,
  onAddShoppingItem,
  onAddQuickNote,
}) => {
  const [quickInput, setQuickInput] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [showNoteModal, setShowNoteModal] = useState(false);

  // Time greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? '¡Buenos días' : hour < 20 ? '¡Buenas tardes' : '¡Buenas noches';

  // Today string
  const todayObj = new Date();
  const dayName = DAYS_ES[todayObj.getDay()];
  const todayISO = todayObj.toISOString().split('T')[0];

  // Active member
  const activeMember = familyMembers.find(m => m.id === activeMemberId);

  // Filter tasks for today
  const pendingTasksToday = tasks.filter(t => {
    const matchesMember = activeMemberId ? t.assignedToMemberId === activeMemberId : true;
    return matchesMember && !t.completed;
  });

  // Filter pending shopping items
  const pendingShopping = shoppingList.filter(s => !s.completed);

  // Next upcoming events
  const upcomingEvents = events
    .filter(e => e.date >= todayISO)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 4);

  // Today's meal
  const todayMeal = mealPlan[dayName] || {
    breakfast: 'Tostadas y café',
    lunch: 'Menú variado de temporada',
    snack: 'Fruta fresca',
    dinner: 'Cena ligera en familia'
  };

  // Next upcoming birthdays calculation
  const upcomingBirthdaysCalculated = birthdays.map(b => {
    const bDate = new Date(b.birthDate);
    const thisYearBday = new Date(todayObj.getFullYear(), bDate.getMonth(), bDate.getDate());
    if (thisYearBday < new Date(todayObj.getFullYear(), todayObj.getMonth(), todayObj.getDate())) {
      thisYearBday.setFullYear(todayObj.getFullYear() + 1);
    }
    const diffTime = Math.abs(thisYearBday.getTime() - todayObj.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return { ...b, daysLeft: diffDays };
  }).sort((a, b) => a.daysLeft - b.daysLeft).slice(0, 3);

  // Pinned Sticky notes
  const pinnedNotes = stickyNotes.filter(n => n.pinned);

  // Quick action handler
  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    onAddShoppingItem(quickInput.trim());
    setQuickInput('');
    confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
  };

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim()) return;
    onAddQuickNote(noteTitle.trim(), noteContent.trim());
    setNoteTitle('');
    setNoteContent('');
    setShowNoteModal(false);
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none text-9xl">
          🏠
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md text-white border border-white/30">
                ✨ {greeting}, {activeMember ? activeMember.name : 'Familia'}!
              </span>
              <span className="text-xs text-amber-100 opacity-90 hidden sm:inline">
                Hoy es <strong className="capitalize">{dayName}</strong>
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              {activeMember ? `¡Hola ${activeMember.name}! Aquí tienes tu día` : 'Bienvenidos al Dashboard de la Familia'}
            </h2>
            <p className="text-sm sm:text-base text-amber-100 max-w-2xl">
              "El hogar es el lugar donde nace la vida y el amor nunca se apaga." — ¡Organiza las tareas, compras y eventos con armonía!
            </p>
          </div>

          {/* Quick Stats Pill Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20">
            <div className="text-center p-2 rounded-xl bg-white/10">
              <div className="text-xl sm:text-2xl font-black">{pendingShopping.length}</div>
              <div className="text-[10px] sm:text-xs text-amber-100 font-medium">Por comprar</div>
            </div>
            <div className="text-center p-2 rounded-xl bg-white/10">
              <div className="text-xl sm:text-2xl font-black">{pendingTasksToday.length}</div>
              <div className="text-[10px] sm:text-xs text-amber-100 font-medium">Tareas hoy</div>
            </div>
            <div className="col-span-2 sm:col-span-1 text-center p-2 rounded-xl bg-white/10">
              <div className="text-xl sm:text-2xl font-black">{upcomingEvents.length}</div>
              <div className="text-[10px] sm:text-xs text-amber-100 font-medium">Eventos cerca</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Add Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800">
        <form onSubmit={handleQuickAdd} className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="flex items-center gap-2 text-amber-500 font-bold text-sm whitespace-nowrap pl-2">
            <Sparkles className="w-5 h-5 animate-spin" />
            <span>Añadir rápido a la lista:</span>
          </div>
          <div className="relative flex-1 w-full">
            <input
              type="text"
              placeholder="Ej. Leche sin lactosa, Pan de molde, Papel de cocina..."
              value={quickInput}
              onChange={(e) => setQuickInput(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-xl text-sm border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Añadir a la Compra</span>
          </button>
        </form>
      </div>

      {/* Main Grid: 3 Columns Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Column 1: Tareas de Hoy & Compras Urgentes */}
        <div className="space-y-6">
          
          {/* Tareas del día */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
                    <CheckSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white">Tareas Pendientes</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Completa y gana puntos para la familia</p>
                  </div>
                </div>
                <button 
                  onClick={() => onNavigate('tasks')}
                  className="text-xs text-amber-600 dark:text-amber-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Ver todas <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {pendingTasksToday.length === 0 ? (
                <div className="text-center py-8 text-slate-400 dark:text-slate-500">
                  <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500 mb-2 opacity-80" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">¡Todo al día por aquí!</p>
                  <p className="text-xs">No hay tareas pendientes en este momento.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {pendingTasksToday.slice(0, 4).map((task) => {
                    const assignedMember = familyMembers.find(m => m.id === task.assignedToMemberId);
                    return (
                      <div
                        key={task.id}
                        className="group flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-amber-50/50 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-700/50 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => {
                              onToggleTask(task.id);
                              confetti({ particleCount: 25, spread: 50, origin: { y: 0.7 } });
                            }}
                            className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                          />
                          <div>
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                              {task.title}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              {assignedMember && (
                                <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                                  {assignedMember.avatar} {assignedMember.name}
                                </span>
                              )}
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 font-bold">
                                +{task.points} pts
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Compras Urgentes */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-xl">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white">Lista de la Compra</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Artículos urgentes o marcados</p>
                </div>
              </div>
              <button 
                onClick={() => onNavigate('shopping')}
                className="text-xs text-amber-600 dark:text-amber-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                Ver lista completa <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {pendingShopping.length === 0 ? (
              <div className="text-center py-6 text-slate-400 dark:text-slate-500">
                <p className="text-sm">La despensa está llena. No hay productos pendientes.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {pendingShopping.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50"
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => onToggleShoppingItem(item.id)}
                        className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                      />
                      <div>
                        <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                          {item.name}
                        </span>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          <span>{item.quantity}</span>
                          {item.store && <span className="text-amber-600 dark:text-amber-400 font-semibold">({item.store})</span>}
                        </div>
                      </div>
                    </div>
                    {item.urgent && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Urgente
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Column 2: Menú de Hoy & Próximos Eventos */}
        <div className="space-y-6">
          
          {/* Menú de Hoy */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 rounded-xl">
                  <Utensils className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white">Menú de Hoy ({dayName.toUpperCase()})</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Comidas planificadas para hoy</p>
                </div>
              </div>
              <button 
                onClick={() => onNavigate('meals')}
                className="text-xs text-amber-600 dark:text-amber-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                Plan de la semana <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/40">
                <div className="text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider mb-1">☕ Desayuno</div>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">{todayMeal.breakfast}</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40">
                <div className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-1">🍲 Comida</div>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">{todayMeal.lunch}</p>
              </div>
              <div className="p-3 rounded-xl bg-orange-50/50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/40">
                <div className="text-xs font-bold text-orange-700 dark:text-orange-400 uppercase tracking-wider mb-1">🍎 Merienda</div>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">{todayMeal.snack}</p>
              </div>
              <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40">
                <div className="text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider mb-1">🌙 Cena</div>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">{todayMeal.dinner}</p>
              </div>
            </div>
          </div>

          {/* Próximos Eventos en el Calendario */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white">Próximos Eventos</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Médicos, colegio y salidas</p>
                </div>
              </div>
              <button 
                onClick={() => onNavigate('calendar')}
                className="text-xs text-amber-600 dark:text-amber-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                Calendario completo <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {upcomingEvents.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">No hay eventos próximos en el calendario.</p>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map((evt) => {
                  const evtMember = familyMembers.find(m => m.id === evt.memberId);
                  return (
                    <div
                      key={evt.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-center px-2.5 py-1 bg-indigo-50 dark:bg-indigo-900/50 rounded-lg border border-indigo-100 dark:border-indigo-800">
                          <span className="block text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                            {new Date(evt.date + 'T00:00:00').toLocaleDateString('es-ES', { month: 'short' })}
                          </span>
                          <span className="block text-base font-extrabold text-slate-800 dark:text-slate-100 leading-none">
                            {new Date(evt.date + 'T00:00:00').getDate()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                            {evt.title}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                            {evt.time && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {evt.time}</span>}
                            {evt.category && <span className="px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-[10px] font-medium">{evt.category}</span>}
                          </div>
                        </div>
                      </div>
                      {evtMember && (
                        <div className="text-xl" title={evtMember.name}>
                          {evtMember.avatar}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Column 3: Tablón Nevera + Cumpleaños & Gamification */}
        <div className="space-y-6">
          
          {/* Próximos Cumpleaños */}
          <div className="bg-gradient-to-br from-rose-50 to-amber-50 dark:from-slate-900 dark:to-slate-800/90 rounded-2xl p-5 shadow-sm border border-rose-200 dark:border-rose-900/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 rounded-xl">
                  <Cake className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white">Próximos Cumpleaños</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Regalos y celebraciones</p>
                </div>
              </div>
              <button 
                onClick={() => onNavigate('birthdays')}
                className="text-xs text-rose-600 dark:text-rose-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                Ver ideas <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3">
              {upcomingBirthdaysCalculated.map((b) => (
                <div key={b.id} className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-800 border border-rose-100 dark:border-slate-700 shadow-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{b.avatar}</span>
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{b.name} <span className="text-xs font-normal text-slate-500">({b.relationship})</span></p>
                      <p className="text-xs text-slate-500">
                        {new Date(b.birthDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-extrabold ${
                      b.daysLeft === 0 
                        ? 'bg-rose-500 text-white animate-bounce' 
                        : b.daysLeft <= 7 
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300' 
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
                    }`}>
                      {b.daysLeft === 0 ? '🎉 ¡Hoy!' : `En ${b.daysLeft} días`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gamification / Leaderboard Familia */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-xl">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white">Puntos de la Familia</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Marcador de tareas completadas</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {familyMembers
                .slice()
                .sort((a, b) => b.points - a.points)
                .map((m, idx) => (
                  <div key={m.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                    <div className="flex items-center gap-2.5">
                      <span className="font-extrabold text-xs w-4 text-slate-400">
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}.`}
                      </span>
                      <span className="text-lg">{m.avatar}</span>
                      <div>
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{m.name}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 ml-1.5">({m.role})</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 font-extrabold text-amber-600 dark:text-amber-400 text-sm bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-200/50 dark:border-amber-900/30">
                      <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>{m.points} pts</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Sticky Notes on Fridge */}
          <div className="bg-amber-50/60 dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-amber-200/60 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Pin className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <h3 className="font-bold text-slate-800 dark:text-white">Notas en la Nevera</h3>
              </div>
              <button
                onClick={() => setShowNoteModal(true)}
                className="px-2.5 py-1 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Nueva nota
              </button>
            </div>

            {pinnedNotes.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">No hay notas fijadas en la nevera.</p>
            ) : (
              <div className="space-y-3">
                {pinnedNotes.map((note) => (
                  <div
                    key={note.id}
                    className="p-3 rounded-xl bg-amber-100/80 dark:bg-amber-900/20 text-slate-800 dark:text-amber-100 border border-amber-300/60 dark:border-amber-800/40 shadow-xs relative"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs">{note.title}</span>
                      <span className="text-[10px] text-amber-700 dark:text-amber-300 font-medium">Por: {note.author}</span>
                    </div>
                    <p className="text-xs whitespace-pre-wrap font-sans">{note.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Modal Nueva Nota */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Pin className="w-5 h-5 text-amber-500" /> Añadir Nota a la Nevera
            </h3>
            <form onSubmit={handleCreateNote} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Título de la nota</label>
                <input
                  type="text"
                  placeholder="Ej. Clave WiFi, Llamar al seguro..."
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Contenido / Mensaje</label>
                <textarea
                  rows={3}
                  placeholder="Escribe aquí los detalles..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                ></textarea>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNoteModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-md cursor-pointer"
                >
                  Fijar Nota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

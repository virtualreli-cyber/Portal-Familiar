import React, { useState } from 'react';
import { FamilyData, ShoppingItem } from '../../types/family';
import { ActiveTab } from '../Sidebar';
import { getDaysUntil, formatDateSpanish, getCategoryColor } from '../../utils/storage';
import { triggerConfetti, triggerBirthdayConfetti } from '../../utils/confetti';
import { 
  ShoppingCart, 
  Calendar, 
  Cake, 
  CheckSquare, 
  Utensils, 
  Coins, 
  Plus, 
  ArrowRight, 
  Sparkles, 
  PartyPopper,
  Clock,
  Pin,
  Check
} from 'lucide-react';

interface DashboardViewProps {
  data: FamilyData;
  onUpdateData: (newData: FamilyData) => void;
  onNavigateTab: (tab: ActiveTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  data,
  onUpdateData,
  onNavigateTab,
}) => {
  const [quickShoppingText, setQuickShoppingText] = useState('');
  const [quickNoteText, setQuickNoteText] = useState('');

  const activeMember = data.members.find((m) => m.id === data.activeMemberId) || data.members[0];

  // Calculations
  const pendingShopping = data.shoppingItems.filter((i) => !i.completed);
  const pendingChores = data.chores.filter((c) => !c.completed);
  const todayChores = data.chores; // show list of today's tasks

  const upcomingBirthdays = [...data.birthdays]
    .map((b) => ({ ...b, daysUntil: getDaysUntil(b.date) }))
    .sort((a, b) => a.daysUntil - b.daysUntil);

  const nextBirthday = upcomingBirthdays[0];

  const upcomingEvents = [...data.events]
    .map((e) => ({ ...e, daysUntil: getDaysUntil(e.date) }))
    .filter((e) => e.daysUntil >= 0 && e.daysUntil <= 7)
    .sort((a, b) => a.daysUntil - b.daysUntil);

  const dayOfWeekNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const todayDayName = dayOfWeekNames[new Date().getDay()];
  const todayMeal = data.mealPlan[todayDayName] || { lunch: 'No planificado', dinner: 'No planificado' };

  // Handlers
  const handleToggleChore = (choreId: string) => {
    const updatedChores = data.chores.map((c) => {
      if (c.id === choreId) {
        const isNowCompleted = !c.completed;
        if (isNowCompleted) {
          triggerConfetti();
        }
        return {
          ...c,
          completed: isNowCompleted,
          completedAt: isNowCompleted ? new Date().toISOString() : undefined,
        };
      }
      return c;
    });

    // Update active member points if chore completed
    const targetChore = data.chores.find((c) => c.id === choreId);
    let updatedMembers = data.members;
    if (targetChore && !targetChore.completed) {
      updatedMembers = data.members.map((m) => {
        if (m.id === (targetChore.assignedMemberId || data.activeMemberId)) {
          return { ...m, points: m.points + targetChore.points };
        }
        return m;
      });
    }

    onUpdateData({
      ...data,
      chores: updatedChores,
      members: updatedMembers,
    });
  };

  const handleAddQuickShopping = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickShoppingText.trim()) return;

    const newItem: ShoppingItem = {
      id: `s-${Date.now()}`,
      name: quickShoppingText.trim(),
      category: 'Despensa',
      quantity: 1,
      unit: 'ud',
      completed: false,
      priority: 'Media',
      addedAt: new Date().toISOString().split('T')[0],
      assignedMemberId: activeMember.id,
    };

    onUpdateData({
      ...data,
      shoppingItems: [newItem, ...data.shoppingItems],
    });
    setQuickShoppingText('');
    triggerConfetti();
  };

  const handleAddQuickNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickNoteText.trim()) return;

    const colors: ('yellow' | 'pink' | 'blue' | 'green' | 'purple')[] = ['yellow', 'pink', 'blue', 'green', 'purple'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newNote = {
      id: `fn-${Date.now()}`,
      text: quickNoteText.trim(),
      authorMemberId: activeMember.id,
      color: randomColor,
      createdAt: new Date().toISOString().split('T')[0],
    };

    onUpdateData({
      ...data,
      fridgeNotes: [newNote, ...data.fridgeNotes],
    });
    setQuickNoteText('');
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8 animate-in fade-in duration-300">
      
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 p-6 sm:p-8 text-white shadow-xl shadow-orange-500/15">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-white/90">
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span>{data.familyName} • {todayDayName}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              ¡Hola, {activeMember.name}! {activeMember.avatar}
            </h2>
            <p className="text-amber-100 text-sm max-w-xl">
              Aquí tienes el resumen diario de vuestro hogar. ¡Hoy es un excelente día para organizarse juntos!
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/15 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 self-start md:self-auto">
            <div className="p-3 bg-amber-400 text-slate-900 rounded-xl font-bold shadow-md">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-amber-100 font-medium">Tus Puntos Acumulados</div>
              <div className="text-2xl font-black">{activeMember.points} pts</div>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1 */}
        <div 
          onClick={() => onNavigateTab('shopping')}
          className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-amber-400 transition cursor-pointer group shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="p-2.5 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 group-hover:scale-110 transition">
              <ShoppingCart className="w-5 h-5" />
            </span>
            <span className="text-2xl font-black text-slate-800 dark:text-slate-100">{pendingShopping.length}</span>
          </div>
          <div className="mt-3">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Por Comprar</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1">
              Ver lista <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition" />
            </p>
          </div>
        </div>

        {/* Metric 2 */}
        <div 
          onClick={() => onNavigateTab('chores')}
          className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-emerald-400 transition cursor-pointer group shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition">
              <CheckSquare className="w-5 h-5" />
            </span>
            <span className="text-2xl font-black text-slate-800 dark:text-slate-100">{pendingChores.length}</span>
          </div>
          <div className="mt-3">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tareas Pendientes</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1">
              Marcar tareas <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition" />
            </p>
          </div>
        </div>

        {/* Metric 3 */}
        <div 
          onClick={() => onNavigateTab('calendar')}
          className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-blue-400 transition cursor-pointer group shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition">
              <Calendar className="w-5 h-5" />
            </span>
            <span className="text-2xl font-black text-slate-800 dark:text-slate-100">{upcomingEvents.length}</span>
          </div>
          <div className="mt-3">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Eventos (7 días)</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1">
              Ver calendario <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition" />
            </p>
          </div>
        </div>

        {/* Metric 4 */}
        <div 
          onClick={() => onNavigateTab('birthdays')}
          className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-rose-400 transition cursor-pointer group shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="p-2.5 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 group-hover:scale-110 transition">
              <Cake className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold px-2 py-1 bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 rounded-lg">
              {nextBirthday ? `¡En ${nextBirthday.daysUntil} días!` : 'Ninguno'}
            </span>
          </div>
          <div className="mt-3">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Próximo Cumple</p>
            <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 mt-0.5 truncate">
              {nextBirthday ? `${nextBirthday.avatar} ${nextBirthday.personName}` : 'Sin cumpleaños cerca'}
            </p>
          </div>
        </div>

      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols wide on Desktop) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Today's Chores Checklist */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-emerald-500" />
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  Tareas y Pendientes del Día
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab('chores')}
                className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
              >
                Ver todas ({data.chores.length}) <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {todayChores.slice(0, 5).map((chore) => {
                const assignedMember = data.members.find((m) => m.id === chore.assignedMemberId);
                return (
                  <div
                    key={chore.id}
                    onClick={() => handleToggleChore(chore.id)}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition cursor-pointer select-none ${
                      chore.completed
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50 opacity-70'
                        : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-700/80 hover:border-emerald-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition border ${
                        chore.completed 
                          ? 'bg-emerald-500 text-white border-emerald-500' 
                          : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                      }`}>
                        {chore.completed && <Check className="w-4 h-4 stroke-[3]" />}
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${
                          chore.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200'
                        }`}>
                          {chore.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            {chore.category}
                          </span>
                          {assignedMember && (
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              {assignedMember.avatar} {assignedMember.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-100/60 dark:bg-amber-950/60 px-2.5 py-1 rounded-xl flex items-center gap-1">
                      +{chore.points} pts
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Meal of the Day & Upcoming Events Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Meal of the Day */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Utensils className="w-5 h-5 text-orange-500" />
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Menú de Hoy ({todayDayName})</h3>
                  </div>
                  <button onClick={() => onNavigateTab('meals')} className="text-xs text-amber-600 dark:text-amber-400 font-semibold hover:underline">
                    Ver Semana
                  </button>
                </div>

                <div className="space-y-3 mt-3">
                  <div className="p-3 rounded-2xl bg-orange-50 dark:bg-orange-950/30 border border-orange-100 dark:border-orange-900/50">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-orange-700 dark:text-orange-400">☀️ Almuerzo / Comida</div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">{todayMeal.lunch}</p>
                    {todayMeal.lunchNotes && <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">💡 {todayMeal.lunchNotes}</p>}
                  </div>

                  <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/50">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400">🌙 Cena</div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">{todayMeal.dinner}</p>
                    {todayMeal.dinnerNotes && <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">💡 {todayMeal.dinnerNotes}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Add Shopping Item Form */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-800/80 rounded-3xl p-5 border border-amber-200/80 dark:border-slate-700 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingCart className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Añadir a la Compra Rápido</h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  ¿Se ha acabado algo? Escríbelo aquí para añadirlo al instante a la lista.
                </p>

                <form onSubmit={handleAddQuickShopping} className="space-y-3">
                  <input
                    type="text"
                    value={quickShoppingText}
                    onChange={(e) => setQuickShoppingText(e.target.value)}
                    placeholder="Ej: Huevos, Leche, Servilletas..."
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-white dark:bg-slate-900 border border-amber-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:text-white"
                  />
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Añadir a Lista
                  </button>
                </form>
              </div>

              <div className="mt-4 pt-3 border-t border-amber-200/60 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400 flex justify-between items-center">
                <span>{pendingShopping.length} productos pendientes</span>
                <button onClick={() => onNavigateTab('shopping')} className="font-semibold text-amber-700 dark:text-amber-400 hover:underline">
                  Ver Lista
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* Right Column */}
        <div className="space-y-6">
          
          {/* Next Birthday Banner Card */}
          {nextBirthday && (
            <div className="bg-gradient-to-br from-rose-500 to-pink-600 text-white rounded-3xl p-5 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-[11px] font-bold backdrop-blur-xs flex items-center gap-1">
                  <PartyPopper className="w-3.5 h-3.5" /> Próximo Cumple
                </span>
                <button
                  onClick={() => triggerBirthdayConfetti()}
                  className="p-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white transition text-xs font-bold"
                  title="¡Lanzar Confeti!"
                >
                  🎉 Celebrar
                </button>
              </div>

              <div className="flex items-center gap-3 my-2">
                <span className="text-4xl">{nextBirthday.avatar}</span>
                <div>
                  <h4 className="text-xl font-black">{nextBirthday.personName}</h4>
                  <p className="text-xs text-rose-100">{nextBirthday.relationship}</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-xs">
                <div>
                  <span className="text-rose-100">Fecha: </span>
                  <span className="font-bold">{formatDateSpanish(nextBirthday.date)}</span>
                </div>
                <div className="px-2.5 py-1 rounded-xl bg-white text-rose-600 font-extrabold shadow-xs">
                  {nextBirthday.daysUntil === 0 ? '¡HOY! 🎂' : `Faltan ${nextBirthday.daysUntil} días`}
                </div>
              </div>
            </div>
          )}

          {/* Upcoming Events Agenda */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Eventos (Próximos 7 Días)</h3>
              </div>
              <button onClick={() => onNavigateTab('calendar')} className="text-xs text-amber-600 dark:text-amber-400 font-semibold hover:underline">
                Calendario
              </button>
            </div>

            {upcomingEvents.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No hay eventos programados para los próximos días.</p>
            ) : (
              <div className="space-y-2.5">
                {upcomingEvents.map((evt) => (
                  <div key={evt.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-700/80">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border mb-1 ${getCategoryColor(evt.category)}`}>
                          {evt.category}
                        </span>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{evt.title}</h4>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {evt.time || 'Todo el día'}
                      </span>
                    </div>
                    <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                      <span>{formatDateSpanish(evt.date)}</span>
                      {evt.assignedMemberIds.length > 0 && (
                        <div className="flex gap-1">
                          {evt.assignedMemberIds.map((mId) => {
                            const mb = data.members.find((m) => m.id === mId);
                            return mb ? <span key={mId} title={mb.name}>{mb.avatar}</span> : null;
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Fridge Sticky Notes */}
          <div className="bg-amber-50/60 dark:bg-slate-800/80 rounded-3xl p-5 border border-amber-200 dark:border-slate-700 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Pin className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Post-it en el Refrigerador</h3>
              </div>
              <button onClick={() => onNavigateTab('fridge')} className="text-xs text-amber-600 dark:text-amber-400 font-semibold hover:underline">
                Ver Muro
              </button>
            </div>

            {/* Top 2 notes */}
            <div className="space-y-2 mb-3">
              {data.fridgeNotes.slice(0, 2).map((note) => {
                const author = data.members.find((m) => m.id === note.authorMemberId);
                return (
                  <div key={note.id} className="p-3 rounded-2xl bg-amber-100/80 dark:bg-slate-700/80 border border-amber-200 dark:border-slate-600 text-xs">
                    <p className="text-slate-800 dark:text-slate-200 font-medium">"{note.text}"</p>
                    {author && (
                      <div className="mt-1 text-[10px] text-slate-500 dark:text-slate-400 text-right">
                        — {author.avatar} {author.name}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <form onSubmit={handleAddQuickNote} className="flex gap-2">
              <input
                type="text"
                value={quickNoteText}
                onChange={(e) => setQuickNoteText(e.target.value)}
                placeholder="Dejar una notita..."
                className="flex-1 px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-amber-200 dark:border-slate-700 focus:outline-none dark:text-white"
              />
              <button
                type="submit"
                className="px-3 py-2 rounded-xl bg-slate-900 text-white dark:bg-amber-500 font-bold text-xs hover:opacity-90 transition"
              >
                Dejar
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
};

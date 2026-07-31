import React, { useState, useEffect } from 'react';
import { TaskItem, WeeklyMealPlan, CalendarEvent, FamilyMember } from '../types';
import { X, Sun, Utensils, CheckSquare, Calendar, Sparkles } from 'lucide-react';

interface KioskModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: TaskItem[];
  mealPlan: WeeklyMealPlan;
  events: CalendarEvent[];
  familyMembers: FamilyMember[];
  onToggleTask: (taskId: string) => void;
}

const DAYS_ES = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];

export const KioskModeModal: React.FC<KioskModeModalProps> = ({
  isOpen,
  onClose,
  tasks,
  mealPlan,
  events,
  familyMembers,
  onToggleTask,
}) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!isOpen) return null;

  const dayName = DAYS_ES[time.getDay()];
  const todayISO = time.toISOString().split('T')[0];

  const formattedDate = time.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const formattedTime = time.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const todayMeal = mealPlan[dayName] || {
    breakfast: 'Tostadas y té',
    lunch: 'Menú del día',
    snack: 'Fruta',
    dinner: 'Cena ligera'
  };

  const pendingTasks = tasks.filter(t => !t.completed);
  const todayEvents = events.filter(e => e.date === todayISO);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col justify-between p-6 sm:p-10 font-sans overflow-hidden select-none animate-fadeIn">
      
      {/* Top Kiosk Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/20">
            🏠
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">
              Hogar<span className="text-amber-500">Plus</span> <span className="text-sm font-semibold text-slate-400">| Pantalla Cocina</span>
            </h1>
            <p className="text-sm text-amber-400 font-bold capitalize">
              {formattedDate}
            </p>
          </div>
        </div>

        {/* Digital Clock */}
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-4xl sm:text-6xl font-black font-mono tracking-wider text-amber-400">
              {formattedTime}
            </div>
            <div className="text-xs text-slate-400 flex items-center justify-end gap-1 font-semibold">
              <Sun className="w-4 h-4 text-amber-500" /> Madrid 22°C • Soleado
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl transition-colors cursor-pointer"
            title="Salir de la vista pantalla cocina"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Kiosk Content - 3 Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6 flex-1 overflow-hidden">
        
        {/* Card 1: Menú de Hoy */}
        <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-teal-500/20 text-teal-400 rounded-2xl">
                <Utensils className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-white">
                Menú de Hoy
              </h2>
            </div>

            <div className="space-y-4">
              <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700/50">
                <div className="text-xs font-bold text-teal-400 uppercase tracking-wider mb-1">☕ Desayuno</div>
                <p className="text-sm text-slate-200 font-medium">{todayMeal.breakfast}</p>
              </div>

              <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700/50">
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">🍲 Comida</div>
                <p className="text-sm text-slate-200 font-medium">{todayMeal.lunch}</p>
              </div>

              <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700/50">
                <div className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-1">🍎 Merienda</div>
                <p className="text-sm text-slate-200 font-medium">{todayMeal.snack}</p>
              </div>

              <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700/50">
                <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">🌙 Cena</div>
                <p className="text-sm text-slate-200 font-medium">{todayMeal.dinner}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Tareas Pendientes */}
        <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl">
                <CheckSquare className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-white">
                Tareas Pendientes ({pendingTasks.length})
              </h2>
            </div>

            {pendingTasks.length === 0 ? (
              <p className="text-slate-400 text-sm py-12 text-center">¡Todas las tareas completadas!</p>
            ) : (
              <div className="space-y-3 max-h-[380px] overflow-y-auto no-scrollbar">
                {pendingTasks.map((t) => {
                  const member = familyMembers.find(m => m.id === t.assignedToMemberId);
                  return (
                    <div
                      key={t.id}
                      onClick={() => onToggleTask(t.id)}
                      className="p-3.5 bg-slate-800/80 hover:bg-slate-800 rounded-2xl border border-slate-700/50 flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={t.completed}
                          onChange={() => {}}
                          className="w-5 h-5 accent-emerald-500 rounded"
                        />
                        <div>
                          <p className="text-sm font-bold text-slate-100">{t.title}</p>
                          {member && (
                            <span className="text-xs text-slate-400">
                              {member.avatar} {member.name}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs font-extrabold text-amber-400 bg-amber-950/60 px-2 py-1 rounded-lg">
                        +{t.points} pts
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Card 3: Eventos de Hoy & Frase del día */}
        <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-2xl">
                <Calendar className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-white">
                Eventos para Hoy
              </h2>
            </div>

            {todayEvents.length === 0 ? (
              <p className="text-slate-400 text-sm py-8 text-center">No hay eventos marcados en el calendario para hoy.</p>
            ) : (
              <div className="space-y-3">
                {todayEvents.map((e) => (
                  <div key={e.id} className="p-3.5 bg-slate-800/80 rounded-2xl border border-indigo-500/30">
                    <p className="text-sm font-bold text-white">{e.title}</p>
                    <p className="text-xs text-indigo-400 mt-1">{e.time ? `🕐 ${e.time}` : 'Todo el día'} {e.location ? `• 📍 ${e.location}` : ''}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Inspirational Footer */}
          <div className="p-4 bg-gradient-to-r from-amber-500/20 to-rose-500/20 rounded-2xl border border-amber-500/30">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-1">
              <Sparkles className="w-4 h-4" /> Recordatorio Familiar
            </div>
            <p className="text-xs text-slate-300 italic">
              "Disfruta cada momento juntos en la mesa. La familia unida supera cualquier reto."
            </p>
          </div>
        </div>

      </div>

      {/* Kiosk Footer */}
      <div className="flex items-center justify-between border-t border-slate-800 pt-4 text-xs text-slate-500">
        <span>HogarPlus Kiosk v2.5 • Sincronización Local Activa</span>
        <span>Haz clic en ✖️ arriba para regresar al modo normal</span>
      </div>

    </div>
  );
};

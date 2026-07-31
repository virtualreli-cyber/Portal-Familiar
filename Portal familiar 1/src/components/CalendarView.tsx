import React, { useState } from 'react';
import { CalendarEvent, EventCategory, FamilyMember } from '../types';
import { 
  Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, 
  MapPin, Clock, Trash2, Filter, User
} from 'lucide-react';

interface CalendarViewProps {
  events: CalendarEvent[];
  familyMembers: FamilyMember[];
  onAddEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  onDeleteEvent: (id: string) => void;
}

const CATEGORIES: EventCategory[] = [
  'Médico',
  'Colegio',
  'Ocio/Fiesta',
  'Deporte',
  'Gestiones',
  'Hogar',
  'Otro'
];

const CATEGORY_COLORS: Record<EventCategory, { bg: string; text: string; border: string }> = {
  Médico: { bg: 'bg-rose-100 dark:bg-rose-950/50', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-900' },
  Colegio: { bg: 'bg-amber-100 dark:bg-amber-950/50', text: 'text-amber-800 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-900' },
  'Ocio/Fiesta': { bg: 'bg-purple-100 dark:bg-purple-950/50', text: 'text-purple-800 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-900' },
  Deporte: { bg: 'bg-emerald-100 dark:bg-emerald-950/50', text: 'text-emerald-800 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-900' },
  Gestiones: { bg: 'bg-blue-100 dark:bg-blue-950/50', text: 'text-blue-800 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-900' },
  Hogar: { bg: 'bg-teal-100 dark:bg-teal-950/50', text: 'text-teal-800 dark:text-teal-300', border: 'border-teal-200 dark:border-teal-900' },
  Otro: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-800 dark:text-slate-200', border: 'border-slate-200 dark:border-slate-700' }
};

export const CalendarView: React.FC<CalendarViewProps> = ({
  events,
  familyMembers,
  onAddEvent,
  onDeleteEvent,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'month' | 'list'>('month');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('10:00');
  const [category, setCategory] = useState<EventCategory>('Médico');
  const [memberId, setMemberId] = useState<string>(familyMembers[0]?.id || '');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const todayMonth = () => {
    setCurrentDate(new Date());
  };

  // Month grid calculation
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  // European calendar starts on Monday (0: Mon, 6: Sun)
  let startDayOfWeek = firstDayOfMonth.getDay() - 1;
  if (startDayOfWeek === -1) startDayOfWeek = 6;

  const daysInMonth = lastDayOfMonth.getDate();

  // Create grid cells
  const calendarDays = [];
  // Previous month padding
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    calendarDays.push({
      day: prevMonthLastDay - i,
      isCurrentMonth: false,
      dateStr: ''
    });
  }
  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    calendarDays.push({
      day: d,
      isCurrentMonth: true,
      dateStr: `${year}-${mm}-${dd}`
    });
  }

  // Filter events
  const filteredEvents = events.filter(evt => {
    const matchesCategory = selectedCategory === 'Todas' || evt.category === selectedCategory;
    const matchesMember = selectedMemberId === 'all' || evt.memberId === selectedMemberId;
    return matchesCategory && matchesMember;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddEvent({
      title: title.trim(),
      date,
      time: time || undefined,
      category,
      memberId: memberId || undefined,
      location: location.trim() || undefined,
      notes: notes.trim() || undefined
    });

    setTitle('');
    setLocation('');
    setNotes('');
    setShowAddModal(false);
  };

  const monthName = currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500 text-white rounded-2xl shadow-md shadow-indigo-500/20">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white capitalize">
              {monthName}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Gestión de médicos, reuniones escolares, cumpleaños y eventos de la familia
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* View Toggle */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                viewMode === 'month'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Mes
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Agenda
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Evento</span>
          </button>
        </div>
      </div>

      {/* Navigation & Filters Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-100/80 dark:bg-slate-800/80 p-3 rounded-2xl">
        {/* Month prev/next */}
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-slate-700 cursor-pointer shadow-xs"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={todayMonth}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-slate-700 cursor-pointer shadow-xs"
          >
            Hoy
          </button>
          <button
            onClick={nextMonth}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-slate-700 cursor-pointer shadow-xs"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 overflow-x-auto w-full md:w-auto no-scrollbar">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400">
            <Filter className="w-3.5 h-3.5" /> Categoría:
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl px-3 py-1.5 border border-slate-200 dark:border-slate-700 focus:outline-none"
          >
            <option value="Todas">Todas las categorías</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 ml-2">
            <User className="w-3.5 h-3.5" /> Miembro:
          </div>
          <select
            value={selectedMemberId}
            onChange={(e) => setSelectedMemberId(e.target.value)}
            className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl px-3 py-1.5 border border-slate-200 dark:border-slate-700 focus:outline-none"
          >
            <option value="all">👨‍👩‍👧‍👦 Todos</option>
            {familyMembers.map(m => (
              <option key={m.id} value={m.id}>{m.avatar} {m.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Month Grid View */}
      {viewMode === 'month' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
          
          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-slate-400 dark:text-slate-500 mb-2 uppercase">
            <span>Lun</span>
            <span>Mar</span>
            <span>Mié</span>
            <span>Jue</span>
            <span>Vie</span>
            <span>Sáb</span>
            <span>Dom</span>
          </div>

          {/* Grid Cells */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {calendarDays.map((cell, idx) => {
              if (!cell.isCurrentMonth) {
                return (
                  <div key={idx} className="min-h-[90px] sm:min-h-[110px] p-2 bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl border border-transparent opacity-40">
                    <span className="text-xs font-semibold text-slate-400">{cell.day}</span>
                  </div>
                );
              }

              const dayEvents = filteredEvents.filter(e => e.date === cell.dateStr);
              const isToday = cell.dateStr === new Date().toISOString().split('T')[0];

              return (
                <div
                  key={idx}
                  className={`min-h-[90px] sm:min-h-[110px] p-1.5 sm:p-2 rounded-2xl border transition-all flex flex-col justify-between ${
                    isToday
                      ? 'bg-indigo-50/60 dark:bg-indigo-950/30 border-indigo-400 dark:border-indigo-600 ring-2 ring-indigo-500/20'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-black px-1.5 py-0.5 rounded-md ${
                      isToday ? 'bg-indigo-600 text-white' : 'text-slate-700 dark:text-slate-300'
                    }`}>
                      {cell.day}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 overflow-y-auto max-h-[70px] no-scrollbar mt-1">
                    {dayEvents.map((evt) => {
                      const style = CATEGORY_COLORS[evt.category] || CATEGORY_COLORS.Otro;
                      const evtMember = familyMembers.find(m => m.id === evt.memberId);

                      return (
                        <div
                          key={evt.id}
                          className={`px-1.5 py-1 rounded-lg text-[10px] sm:text-xs font-semibold ${style.bg} ${style.text} border ${style.border} flex items-center justify-between gap-1 shadow-2xs truncate`}
                          title={`${evt.title} (${evt.time || 'Todo el día'})`}
                        >
                          <span className="truncate">
                            {evt.time && <strong className="mr-1">{evt.time}</strong>}
                            {evt.title}
                          </span>
                          {evtMember && <span className="text-xs flex-shrink-0">{evtMember.avatar}</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Agenda List View */}
      {viewMode === 'list' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="text-base font-extrabold text-slate-800 dark:text-white mb-4">
            Lista de Eventos Registrados ({filteredEvents.length})
          </h3>

          {filteredEvents.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <CalendarIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Sin eventos en este periodo</p>
              <p className="text-xs">No hay eventos para la categoría o miembro seleccionado.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEvents
                .sort((a, b) => a.date.localeCompare(b.date))
                .map((evt) => {
                  const style = CATEGORY_COLORS[evt.category] || CATEGORY_COLORS.Otro;
                  const evtMember = familyMembers.find(m => m.id === evt.memberId);

                  return (
                    <div
                      key={evt.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50 gap-4"
                    >
                      <div className="flex items-start gap-4">
                        <div className="text-center px-3 py-1.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-xl font-bold min-w-[60px]">
                          <span className="block text-xs uppercase">
                            {new Date(evt.date + 'T00:00:00').toLocaleDateString('es-ES', { month: 'short' })}
                          </span>
                          <span className="block text-xl leading-none">
                            {new Date(evt.date + 'T00:00:00').getDate()}
                          </span>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                              {evt.title}
                            </h4>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${style.bg} ${style.text}`}>
                              {evt.category}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
                            {evt.time && (
                              <span className="flex items-center gap-1 font-medium">
                                <Clock className="w-3.5 h-3.5 text-indigo-500" /> {evt.time}
                              </span>
                            )}
                            {evt.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-rose-500" /> {evt.location}
                              </span>
                            )}
                            {evtMember && (
                              <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                                {evtMember.avatar} {evtMember.name}
                              </span>
                            )}
                          </div>

                          {evt.notes && (
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 italic">
                              "{evt.notes}"
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => onDeleteEvent(evt.id)}
                        className="self-end sm:self-center p-2 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                        title="Eliminar evento"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* Modal Add Event */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-extrabold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-indigo-500" /> Nuevo Evento Familiar
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Título del evento *
                </label>
                <input
                  type="text"
                  placeholder="Ej. Cita Dentista Lucas, Excursión Escolar..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Fecha *
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Hora
                  </label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Categoría
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as EventCategory)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Asignado a
                  </label>
                  <select
                    value={memberId}
                    onChange={(e) => setMemberId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {familyMembers.map(m => (
                      <option key={m.id} value={m.id}>{m.avatar} {m.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Ubicación / Lugar
                </label>
                <input
                  type="text"
                  placeholder="Ej. Centro de Salud, Pabellón Municipal..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Notas / Detalles
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej. Llevar autorizada la excursión y tarjeta sanitaria"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md cursor-pointer"
                >
                  Guardar Evento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

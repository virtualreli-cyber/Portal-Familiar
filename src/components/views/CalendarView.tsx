import React, { useState } from 'react';
import { useFamily } from '../../context/FamilyContext';
import { useAuth } from '../../context/AuthContext';
import { CalendarEvent, EventCategory } from '../../types';
import { getTodaySaint } from '../../data/santoral';
import { getUserPreferences, saveUserPreferences } from '../../lib/userPreferences';
import { ConfirmModal } from '../ConfirmModal';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Clock, 
  MapPin, 
  X,
  Sparkles,
  Cake,
  Check,
  List,
  Grid
} from 'lucide-react';

const CATEGORIES: EventCategory[] = [
  'Médico',
  'Colegio',
  'Misa/Liturgia',
  'Ocio/Fiesta',
  'Deporte',
  'Gestiones',
  'Hogar',
  'Otro'
];

const CATEGORY_COLORS: Record<EventCategory, { bg: string; text: string; border: string }> = {
  Médico: { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-200' },
  Colegio: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' },
  'Misa/Liturgia': { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200' },
  'Ocio/Fiesta': { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
  Deporte: { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200' },
  Gestiones: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  Hogar: { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-200' },
  Otro: { bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-200' }
};

export const CalendarView: React.FC = () => {
  const { events, birthdays, anniversaries, addEvent, deleteEvent } = useFamily();
  const { allMembers, currentMember } = useAuth();

  const [viewMode, setViewModeState] = useState<'month' | 'agenda'>(() => 
    getUserPreferences(currentMember.id).calendarViewMode
  );
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [filterCategory, setFilterCategoryState] = useState<string>(() => 
    getUserPreferences(currentMember.id).calendarCategory
  );

  const setViewMode = (mode: 'month' | 'agenda') => {
    setViewModeState(mode);
    saveUserPreferences(currentMember.id, { calendarViewMode: mode });
  };

  const setFilterCategory = (cat: string) => {
    setFilterCategoryState(cat);
    saveUserPreferences(currentMember.id, { calendarCategory: cat });
  };
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);

  // Form state for adding event
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [category, setCategory] = useState<EventCategory>('Médico');
  const [assignedMemberIds, setAssignedMemberIds] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // European calendar starts on Monday (0 = Mon, 6 = Sun)
  let startingDayOfWeek = firstDayOfMonth.getDay() - 1;
  if (startingDayOfWeek === -1) startingDayOfWeek = 6;

  const calendarCells = [];
  // Previous month padding
  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    calendarCells.push({
      day: prevMonthDays - i,
      isCurrentMonth: false,
      dateStr: ''
    });
  }
  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    calendarCells.push({
      day: d,
      isCurrentMonth: true,
      dateStr: `${year}-${mm}-${dd}`
    });
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };
  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(today.toISOString().split('T')[0]);
  };

  // Filter events
  const filteredEvents = events.filter(e => {
    if (filterCategory !== 'Todas' && e.category !== filterCategory) return false;
    return true;
  });

  // Agenda view: sorted by date and time
  const agendaEvents = [...filteredEvents].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return (a.time || '').localeCompare(b.time || '');
  });

  // Selected date events & details
  const eventsOnSelectedDate = filteredEvents.filter(e => e.date === selectedDateStr);

  const getSpecialDateItems = (dateStr: string) => {
    if (!dateStr) return { birthdays: [], anniversaries: [] };
    const parts = dateStr.split('-');
    if (parts.length < 3) return { birthdays: [], anniversaries: [] };
    const m = parseInt(parts[1], 10);
    const d = parseInt(parts[2], 10);

    // 1. Family Members Birthdays
    const memberBdays: Array<{ id: string; name: string; relationship: string; avatar: string }> = allMembers.filter(mb => {
      if (!mb.birthDate) return false;
      const p = mb.birthDate.split('-');
      return p.length >= 3 && parseInt(p[1], 10) === m && parseInt(p[2], 10) === d;
    }).map(mb => ({
      id: `mb_${mb.id}`,
      name: mb.name,
      relationship: mb.role as string,
      avatar: mb.avatar || '🎂'
    }));

    // 2. Custom Birthdays
    const customBdays = birthdays.filter(b => {
      if (!b.birthDate) return false;
      const p = b.birthDate.split('-');
      return p.length >= 3 && parseInt(p[1], 10) === m && parseInt(p[2], 10) === d;
    }).map(b => ({
      id: b.id,
      name: b.name,
      relationship: b.relationship,
      avatar: b.avatar || '🎂'
    }));

    const combinedBirthdays = [...memberBdays];
    customBdays.forEach(cb => {
      if (!combinedBirthdays.some(mb => mb.name.toLowerCase() === cb.name.toLowerCase())) {
        combinedBirthdays.push(cb);
      }
    });

    // 3. Anniversaries
    const matchingAnniversaries = anniversaries.filter(a => {
      if (!a.date) return false;
      const p = a.date.split('-');
      return p.length >= 3 && parseInt(p[1], 10) === m && parseInt(p[2], 10) === d;
    });

    return {
      birthdays: combinedBirthdays,
      anniversaries: matchingAnniversaries
    };
  };

  const specialItemsOnSelectedDate = getSpecialDateItems(selectedDateStr);
  const saintForSelectedDate = getTodaySaint(selectedDateStr);

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addEvent({
      title: title.trim(),
      date: selectedDateStr,
      time: time || undefined,
      endTime: endTime || undefined,
      category,
      assignedMemberIds,
      location: location.trim() || undefined,
      notes: notes.trim() || undefined
    });

    setTitle('');
    setLocation('');
    setNotes('');
    setAssignedMemberIds([]);
    setShowAddModal(false);
  };

  const toggleMemberAssignment = (mId: string) => {
    setAssignedMemberIds(prev => 
      prev.includes(mId) ? prev.filter(id => id !== mId) : [...prev, mId]
    );
  };

  const formattedSelectedDate = new Date(selectedDateStr + 'T00:00:00').toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="space-y-6 pb-12">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Calendario Familiar</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {viewMode === 'month' 
              ? 'Haz clic en cualquier día para ver el desglose completo debajo' 
              : 'Vista de Agenda: Todos los eventos seguidos en orden cronológico'}
          </p>
        </div>

        {/* Controls: Mode Toggle, Filter & Add Button */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode Switcher */}
          <div className="bg-slate-100 p-1 rounded-2xl flex items-center shrink-0">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 active-touch ${
                viewMode === 'month' ? 'bg-white text-indigo-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Mes</span>
            </button>

            <button
              onClick={() => setViewMode('agenda')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 active-touch ${
                viewMode === 'agenda' ? 'bg-white text-indigo-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              <List className="w-3.5 h-3.5 text-indigo-600" />
              <span>Agenda</span>
            </button>
          </div>

          {/* Category filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className={`px-3 py-2 border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 transition ${
              filterCategory !== 'Todas'
                ? 'bg-amber-100 border-amber-400 text-amber-900 ring-2 ring-amber-300 font-bold'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <option value="Todas">Todas las categorías</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Active Filter Indicator Badge */}
          {filterCategory !== 'Todas' && (
            <div className="bg-amber-500 text-white px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-xs animate-fade-in">
              <span>Filtro: {filterCategory}</span>
              <button onClick={() => setFilterCategory('Todas')} className="hover:opacity-75 text-sm leading-none ml-1">✕</button>
            </div>
          )}

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-indigo-200 active-touch shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Añadir Evento</span>
          </button>
        </div>
      </div>

      {viewMode === 'month' ? (
        /* MONTH GRID VIEW */
        <>
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-4 sm:p-6">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 rounded-xl hover:bg-slate-100 border border-slate-200 text-slate-700 transition active-touch"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 capitalize">
                  {monthNames[month]} {year}
                </h3>
                <button
                  onClick={handleNextMonth}
                  className="p-2 rounded-xl hover:bg-slate-100 border border-slate-200 text-slate-700 transition active-touch"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={handleToday}
                className="px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold hover:bg-indigo-100 transition active-touch"
              >
                Hoy
              </button>
            </div>

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 text-center mb-2">
              {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((d, i) => (
                <div key={d} className={`text-xs font-bold py-1.5 ${i >= 5 ? 'text-rose-600' : 'text-slate-500'}`}>
                  {d}
                </div>
              ))}
            </div>

            {/* Days Matrix */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {calendarCells.map((cell, idx) => {
                if (!cell.isCurrentMonth) {
                  return (
                    <div key={idx} className="min-h-[50px] sm:min-h-[70px] p-1 bg-slate-50/50 rounded-xl text-slate-300 text-xs font-medium border border-transparent">
                      {cell.day}
                    </div>
                  );
                }

                const isSelected = cell.dateStr === selectedDateStr;
                const isToday = cell.dateStr === new Date().toISOString().split('T')[0];
                const dayEvents = filteredEvents.filter(e => e.date === cell.dateStr);
                const { birthdays: cellBirthdays, anniversaries: cellAnniversaries } = getSpecialDateItems(cell.dateStr);
                const hasBirthdays = cellBirthdays.length > 0;
                const hasAnniversaries = cellAnniversaries.length > 0;

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDateStr(cell.dateStr)}
                    className={`min-h-[55px] sm:min-h-[75px] p-1.5 rounded-2xl flex flex-col justify-between transition text-left active-touch border ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-300'
                        : isToday
                        ? 'bg-indigo-50 text-indigo-900 border-indigo-300 font-bold'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className={`text-xs sm:text-sm font-bold ${isSelected ? 'text-white' : ''}`}>
                        {cell.day}
                      </span>
                      <div className="flex items-center gap-0.5">
                        {hasBirthdays && <span className="text-[11px]" title="Cumpleaños el día de hoy">🎂</span>}
                        {hasAnniversaries && <span className="text-[11px]" title="Aniversario el día de hoy">❤️</span>}
                      </div>
                    </div>

                    {/* Event Dots / Badges */}
                    <div className="w-full space-y-0.5 mt-1 overflow-hidden">
                      {dayEvents.slice(0, 2).map((ev) => (
                        <div
                          key={ev.id}
                          className={`text-[9px] sm:text-[10px] px-1 py-0.5 rounded truncate font-medium ${
                            isSelected 
                              ? 'bg-white/20 text-white' 
                              : 'bg-indigo-100 text-indigo-800'
                          }`}
                        >
                          {ev.time ? `${ev.time} ` : ''}{ev.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <p className={`text-[9px] font-semibold ${isSelected ? 'text-indigo-100' : 'text-slate-500'}`}>
                          +{dayEvents.length - 2} más
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SELECTED DAY DETAILS PANEL */}
          <div className="bg-gradient-to-br from-indigo-900 to-purple-950 text-white rounded-3xl p-5 sm:p-6 shadow-xl space-y-5 border border-indigo-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-800/80 pb-4">
              <div>
                <span className="bg-amber-400 text-slate-900 px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wider">
                  Día Seleccionado
                </span>
                <h3 className="text-lg sm:text-xl font-bold mt-1 capitalize text-white">
                  {formattedSelectedDate}
                </h3>
              </div>

              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-white text-indigo-900 hover:bg-indigo-50 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md active-touch self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Añadir Evento para este día</span>
              </button>
            </div>

            {/* Birthdays and Anniversaries on Selected Day */}
            {(specialItemsOnSelectedDate.birthdays.length > 0 || specialItemsOnSelectedDate.anniversaries.length > 0) && (
              <div className="bg-rose-500/20 border border-rose-400/30 rounded-2xl p-4 space-y-3">
                {specialItemsOnSelectedDate.birthdays.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-rose-200 flex items-center gap-2">
                      <Cake className="w-4 h-4" /> Cumpleaños del Día
                    </h4>
                    {specialItemsOnSelectedDate.birthdays.map(b => (
                      <div key={b.id} className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-white">{b.avatar} {b.name} ({b.relationship})</span>
                        <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          ¡Felicidades! 🎉
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {specialItemsOnSelectedDate.anniversaries.length > 0 && (
                  <div className={`space-y-2 ${specialItemsOnSelectedDate.birthdays.length > 0 ? 'pt-2 border-t border-rose-400/20' : ''}`}>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-pink-200 flex items-center gap-2">
                      <span>❤️</span> Aniversarios y Celebraciones
                    </h4>
                    {specialItemsOnSelectedDate.anniversaries.map(a => (
                      <div key={a.id} className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-white">💍 {a.title} ({a.type})</span>
                        <span className="bg-pink-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Día Especial ✨
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Events List for Selected Day */}
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-indigo-200 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Eventos y Citas del Día ({eventsOnSelectedDate.length})
              </h4>

              {eventsOnSelectedDate.length === 0 ? (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center space-y-2">
                  <Sparkles className="w-8 h-8 text-indigo-300 mx-auto" />
                  <p className="text-sm font-medium text-indigo-100">No hay eventos ni citas programadas para este día.</p>
                  <p className="text-xs text-indigo-300">¡Haz clic en "Añadir Evento" para programar algo!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {eventsOnSelectedDate.map(ev => {
                    const catStyle = CATEGORY_COLORS[ev.category] || CATEGORY_COLORS.Otro;
                    const assignedMembers = allMembers.filter(m => ev.assignedMemberIds.includes(m.id));

                    return (
                      <div
                        key={ev.id}
                        className="bg-white text-slate-900 rounded-2xl p-4 shadow-md border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${catStyle.bg} ${catStyle.text}`}>
                              {ev.category}
                            </span>
                            {ev.time && (
                              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-500" />
                                {ev.time} {ev.endTime ? `- ${ev.endTime}` : ''}
                              </span>
                            )}
                          </div>

                          <h5 className="font-bold text-base text-slate-900">{ev.title}</h5>

                          {ev.location && (
                            <p className="text-xs text-slate-600 flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                              <span>{ev.location}</span>
                            </p>
                          )}

                          {ev.notes && (
                            <p className="text-xs text-slate-500 italic bg-slate-50 p-2 rounded-xl border border-slate-100">
                              "{ev.notes}"
                            </p>
                          )}

                          {/* Assigned Members */}
                          {assignedMembers.length > 0 && (
                            <div className="flex items-center gap-1.5 pt-1">
                              <span className="text-[10px] text-slate-400 font-semibold">Asignados:</span>
                              <div className="flex items-center gap-1">
                                {assignedMembers.map(m => (
                                  <span key={m.id} className="text-xs" title={m.name}>
                                    {m.avatar}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => setDeletingEventId(ev.id)}
                          className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition active-touch self-end sm:self-auto"
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
          </div>
        </>
      ) : (
        /* AGENDA LIST VIEW (UN EVENTO DESTRÁS DE OTRO SEGUIDOS) */
        <div className="space-y-4">
          <div className="bg-indigo-900 text-white p-5 rounded-3xl border border-indigo-800 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-amber-300">Agenda de Eventos Familiares</h3>
              <p className="text-xs text-indigo-200 mt-0.5">
                Listado cronológico completo de todas las citas y acontecimientos programados
              </p>
            </div>
            <span className="bg-indigo-800 text-indigo-100 px-3 py-1 rounded-full text-xs font-bold shrink-0">
              {agendaEvents.length} Eventos
            </span>
          </div>

          {agendaEvents.length === 0 ? (
            <div className="bg-white p-8 text-center rounded-3xl border border-slate-200 space-y-2">
              <Sparkles className="w-10 h-10 text-indigo-400 mx-auto" />
              <p className="font-bold text-slate-800 text-sm">No hay eventos en la agenda.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {agendaEvents.map((ev) => {
                const catStyle = CATEGORY_COLORS[ev.category] || CATEGORY_COLORS.Otro;
                const assignedMembers = allMembers.filter(m => ev.assignedMemberIds.includes(m.id));
                const evDateFormatted = new Date(ev.date + 'T00:00:00').toLocaleDateString('es-ES', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                });

                return (
                  <div
                    key={ev.id}
                    className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition hover:border-indigo-300"
                  >
                    <div className="flex items-start gap-4">
                      {/* Date Badge */}
                      <div className="bg-indigo-50 border border-indigo-200 p-3 rounded-2xl text-center shrink-0 min-w-[80px]">
                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                          {evDateFormatted.split(' ')[0]}
                        </span>
                        <span className="text-xl font-extrabold text-indigo-900 block">
                          {ev.date.split('-')[2]}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500 block uppercase">
                          {evDateFormatted.split(' ')[2]}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${catStyle.bg} ${catStyle.text}`}>
                            {ev.category}
                          </span>
                          {ev.time && (
                            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-500" />
                              {ev.time} {ev.endTime ? `- ${ev.endTime}` : ''}
                            </span>
                          )}
                        </div>

                        <h4 className="font-bold text-slate-900 text-base">{ev.title}</h4>

                        {ev.location && (
                          <p className="text-xs text-slate-600 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            <span>{ev.location}</span>
                          </p>
                        )}

                        {ev.notes && (
                          <p className="text-xs text-slate-500 italic bg-slate-50 p-2 rounded-xl border border-slate-100">
                            "{ev.notes}"
                          </p>
                        )}

                        {assignedMembers.length > 0 && (
                          <div className="flex items-center gap-1.5 pt-1">
                            <span className="text-[10px] text-slate-400 font-semibold">Asignados:</span>
                            <div className="flex items-center gap-1">
                              {assignedMembers.map(m => (
                                <span key={m.id} className="text-xs" title={m.name}>
                                  {m.avatar}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => setDeletingEventId(ev.id)}
                      className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition active-touch self-end sm:self-auto"
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

      {/* CREATE EVENT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
            <div className="bg-indigo-600 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                <h3 className="font-bold text-lg">Nuevo Evento o Cita</h3>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="p-5 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Título del Evento *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Misa Dominical, Médico Sofía, Partido Mateo..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Fecha</label>
                  <input
                    type="date"
                    required
                    value={selectedDateStr}
                    onChange={(e) => setSelectedDateStr(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Categoría</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as EventCategory)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Hora Inicio</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Hora Fin (Opcional)</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Lugar (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ej: Parroquia San José, Colegio, Centro de Salud"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">Asignar Miembros de la Familia</label>
                <div className="grid grid-cols-2 gap-2">
                  {allMembers.map(member => {
                    const isAssigned = assignedMemberIds.includes(member.id);
                    return (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => toggleMemberAssignment(member.id)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-semibold transition active-touch ${
                          isAssigned 
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-900 ring-1 ring-indigo-500'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <span>{member.avatar}</span>
                          <span className="truncate">{member.name.split(' ')[0]}</span>
                        </span>
                        {isAssigned && <Check className="w-4 h-4 text-indigo-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Notas Adicionales</label>
                <textarea
                  rows={2}
                  placeholder="Detalles, indicaciones..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 border border-slate-200 rounded-xl font-semibold text-slate-600 text-sm active-touch"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 text-sm active-touch"
                >
                  Guardar Evento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deletion Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingEventId}
        onCancel={() => setDeletingEventId(null)}
        onConfirm={() => {
          if (deletingEventId) deleteEvent(deletingEventId);
          setDeletingEventId(null);
        }}
      />
    </div>
  );
};

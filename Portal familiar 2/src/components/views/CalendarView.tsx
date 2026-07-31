import React, { useState } from 'react';
import { FamilyData, CalendarEvent, EventCategory } from '../../types/family';
import { getCategoryColor, formatDateSpanish } from '../../utils/storage';
import { triggerConfetti } from '../../utils/confetti';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  MapPin, 
  Trash2, 
  Users, 
  List, 
  Grid
} from 'lucide-react';

interface CalendarViewProps {
  data: FamilyData;
  onUpdateData: (newData: FamilyData) => void;
}

const CATEGORIES: EventCategory[] = [
  'Cita Médica',
  'Escuela y Colegio',
  'Deporte',
  'Cumpleaños',
  'Fiesta y Ocio',
  'Mantenimiento Hogar',
  'Recordatorio',
];

export const CalendarView: React.FC<CalendarViewProps> = ({ data, onUpdateData }) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'grid' | 'agenda'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Form state
  const [title, setTitle] = useState('');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [eventTime, setEventDateType] = useState('10:00');
  const [category, setCategory] = useState<EventCategory>('Escuela y Colegio');
  const [assignedMemberIds, setAssignedMemberIds] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  // Calendar matrix calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Day of week index (Monday = 0 ... Sunday = 6)
  let startingDayOfWeek = firstDayOfMonth.getDay() - 1;
  if (startingDayOfWeek === -1) startingDayOfWeek = 6;

  const monthDays = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    monthDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    monthDays.push(d);
  }

  // Prev / Next month navigation
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Filter events
  const filteredEvents = data.events.filter((e) => {
    if (selectedCategory !== 'Todas' && e.category !== selectedCategory) return false;
    return true;
  });

  const getEventsForDay = (day: number) => {
    const dayStr = String(day).padStart(2, '0');
    const monthStr = String(month + 1).padStart(2, '0');
    const targetDateStr = `${year}-${monthStr}-${dayStr}`;

    return filteredEvents.filter((e) => e.date === targetDateStr);
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newEvent: CalendarEvent = {
      id: `e-${Date.now()}`,
      title: title.trim(),
      date: eventDate,
      time: eventTime || undefined,
      category,
      assignedMemberIds,
      location: location.trim() || undefined,
      description: description.trim() || undefined,
    };

    onUpdateData({
      ...data,
      events: [...data.events, newEvent],
    });

    setTitle('');
    setLocation('');
    setDescription('');
    setShowAddModal(false);
    triggerConfetti();
  };

  const handleDeleteEvent = (eventId: string) => {
    const updated = data.events.filter((e) => e.id !== eventId);
    onUpdateData({ ...data, events: updated });
  };

  const toggleMemberAssignment = (memberId: string) => {
    if (assignedMemberIds.includes(memberId)) {
      setAssignedMemberIds(assignedMemberIds.filter((id) => id !== memberId));
    } else {
      setAssignedMemberIds([...assignedMemberIds, memberId]);
    }
  };

  const sortedEventsAgenda = [...filteredEvents].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-6 pb-20 lg:pb-8 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold mb-2">
            <CalendarIcon className="w-3.5 h-3.5" /> Agenda Familiar
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">Calendario de Eventos</h2>
          <p className="text-blue-100 text-xs sm:text-sm mt-1">
            Planifica citas médicas, actividades escolares, deportes y compromisos para que nadie se pierda nada.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-2xl bg-white text-slate-900 font-bold text-xs hover:bg-amber-50 transition flex items-center gap-2 shadow-md self-start md:self-auto"
        >
          <Plus className="w-4 h-4 text-blue-600" /> Añadir Evento
        </button>
      </div>

      {/* Control Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Month Navigation */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevMonth}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              >
                <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              >
                <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              </button>
            </div>
            <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 capitalize">
              {monthNames[month]} {year}
            </h3>
            <button
              onClick={handleToday}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
            >
              Hoy
            </button>
          </div>

          {/* View Switcher & Category Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            
            {/* Grid / Agenda Switch */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  viewMode === 'grid' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-500'
                }`}
              >
                <Grid className="w-4 h-4" /> <span className="hidden md:inline">Mes</span>
              </button>
              <button
                onClick={() => setViewMode('agenda')}
                className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  viewMode === 'agenda' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-500'
                }`}
              >
                <List className="w-4 h-4" /> <span className="hidden md:inline">Lista</span>
              </button>
            </div>

          </div>

        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 scrollbar-none border-t border-slate-100 dark:border-slate-700">
          <button
            onClick={() => setSelectedCategory('Todas')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              selectedCategory === 'Todas'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            Todas
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700 shadow-xs">
          
          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((d) => (
              <div key={d} className="py-2 text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                {d}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {monthDays.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="min-h-[80px] sm:min-h-[100px] bg-slate-50/50 dark:bg-slate-900/20 rounded-2xl" />;
              }

              const isToday = 
                day === new Date().getDate() &&
                month === new Date().getMonth() &&
                year === new Date().getFullYear();

              const dayEvents = getEventsForDay(day);

              return (
                <div
                  key={`day-${day}`}
                  className={`min-h-[80px] sm:min-h-[100px] p-2 rounded-2xl border transition flex flex-col justify-between ${
                    isToday
                      ? 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-400 dark:border-blue-600'
                      : 'bg-slate-50/80 dark:bg-slate-900/40 border-slate-100 dark:border-slate-700/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-black w-6 h-6 rounded-full flex items-center justify-center ${
                      isToday ? 'bg-blue-600 text-white' : 'text-slate-700 dark:text-slate-300'
                    }`}>
                      {day}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 px-1.5 py-0.2 rounded-full">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  {/* Day Events Stack */}
                  <div className="space-y-1 my-1 flex-1 overflow-hidden">
                    {dayEvents.slice(0, 2).map((evt) => (
                      <div
                        key={evt.id}
                        className={`text-[10px] p-1 rounded-lg border font-semibold truncate ${getCategoryColor(evt.category)}`}
                        title={`${evt.title} (${evt.time || 'Todo el día'})`}
                      >
                        {evt.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <p className="text-[9px] font-bold text-slate-400 text-center">+{dayEvents.length - 2} más</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Agenda List View */}
      {viewMode === 'agenda' && (
        <div className="space-y-3">
          {sortedEventsAgenda.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-700">
              <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">No hay eventos en el calendario</h3>
              <p className="text-xs text-slate-400 mt-1">Añade tu primer evento con el botón superior.</p>
            </div>
          ) : (
            sortedEventsAgenda.map((evt) => (
              <div
                key={evt.id}
                className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <div className="px-3 py-2 bg-blue-50 dark:bg-blue-950/50 rounded-xl text-center border border-blue-200 dark:border-blue-900 shrink-0">
                    <span className="text-[10px] font-bold uppercase text-blue-600 dark:text-blue-400 block">
                      {formatDateSpanish(evt.date).split(' ')[1] || 'DÍA'}
                    </span>
                    <span className="text-lg font-black text-slate-800 dark:text-slate-100">
                      {evt.date.split('-')[2]}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getCategoryColor(evt.category)}`}>
                        {evt.category}
                      </span>
                      {evt.time && (
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {evt.time}
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-1">{evt.title}</h4>
                    {evt.description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{evt.description}</p>}
                    {evt.location && (
                      <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {evt.location}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-700">
                  {evt.assignedMemberIds.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400 mr-1" />
                      {evt.assignedMemberIds.map((mId) => {
                        const mb = data.members.find((m) => m.id === mId);
                        return mb ? <span key={mId} title={mb.name}>{mb.avatar}</span> : null;
                      })}
                    </div>
                  )}

                  <button
                    onClick={() => handleDeleteEvent(evt.id)}
                    className="p-2 text-slate-300 hover:text-rose-500 transition rounded-xl"
                    title="Eliminar evento"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-blue-500" /> Añadir Nuevo Evento Familiar
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-xs text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Título del Evento *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Cita Pediatra, Partido de Baloncesto..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Fecha *</label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Hora</label>
                  <input
                    type="time"
                    value={eventTime}
                    onChange={(e) => setEventDateType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Categoría</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as EventCategory)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Asignar Miembros de la Familia</label>
                <div className="flex flex-wrap gap-2">
                  {data.members.map((m) => {
                    const isSelected = assignedMemberIds.includes(m.id);
                    return (
                      <button
                        type="button"
                        key={m.id}
                        onClick={() => toggleMemberAssignment(m.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <span>{m.avatar}</span>
                        <span>{m.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Lugar / Ubicación</label>
                <input
                  type="text"
                  placeholder="Ej: Centro de Salud, Pabellón Municipal..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Notas adicionales</label>
                <textarea
                  rows={2}
                  placeholder="Detalles del evento..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md"
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

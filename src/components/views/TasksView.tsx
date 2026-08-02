import React, { useState, useEffect } from 'react';
import { useFamily } from '../../context/FamilyContext';
import { useAuth } from '../../context/AuthContext';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { Priority, Frequency, TaskItem } from '../../types';
import { 
  CheckSquare, 
  Plus, 
  Check, 
  Trash2, 
  Sparkles,
  Bell,
  Clock,
  Lock,
  List
} from 'lucide-react';
import { getUserPreferences, saveUserPreferences } from '../../lib/userPreferences';
import { ConfirmModal } from '../ConfirmModal';

export const TasksView: React.FC = () => {
  const { 
    tasks, 
    customTaskLists,
    addTask, 
    toggleTask, 
    deleteTask, 
    requestTaskValidation
  } = useFamily();
  const { currentMember, allMembers, isAdmin } = useAuth();

  const getFilterOverrideKey = (memberId: string) => `fam_tasks_filter_member_override_${memberId}`;
  const FIVE_MINUTES_MS = 5 * 60 * 1000;

  const getActiveFilterMember = React.useCallback((defaultMemberId: string) => {
    try {
      const key = getFilterOverrideKey(defaultMemberId);
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.value && typeof parsed.timestamp === 'number') {
          if (Date.now() - parsed.timestamp < FIVE_MINUTES_MS) {
            return parsed.value;
          }
        }
      }
    } catch (e) {}
    return defaultMemberId;
  }, []);

  // Default selected list is the first specific custom list (or 'general' if none), NOT 'all'
  const [selectedListId, setSelectedListId] = useState<string>(() => 
    customTaskLists.length > 0 ? customTaskLists[0].id : 'general'
  );

  const [filterMember, setFilterMemberState] = useState<string>(() => 
    getActiveFilterMember(currentMember.id)
  );
  const [filterStatus, setFilterStatusState] = useState<'all' | 'pending' | 'completed'>(() => 
    getUserPreferences(currentMember.id).tasksStatusFilter
  );

  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  useBodyScrollLock(showAddModal || deletingTaskId !== null);

  const [title, setTitle] = useState('');
  const [targetListId, setTargetListId] = useState<string>(selectedListId !== 'all' ? selectedListId : 'general');
  const [assignedMemberId, setAssignedMemberId] = useState<string>(currentMember.id);

  // Sync assignedMemberId to currentMember.id and manage 5-minute timer on filterMember
  useEffect(() => {
    setAssignedMemberId(currentMember.id);
    setFilterMemberState(getActiveFilterMember(currentMember.id));

    const interval = setInterval(() => {
      try {
        const key = getFilterOverrideKey(currentMember.id);
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.timestamp && Date.now() - parsed.timestamp >= FIVE_MINUTES_MS) {
            localStorage.removeItem(key);
            setFilterMemberState(currentMember.id);
          }
        }
      } catch (e) {}
    }, 5000);

    return () => clearInterval(interval);
  }, [currentMember.id, getActiveFilterMember]);

  const [dueDate, setDueDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [priority, setPriority] = useState<Priority>('Media');
  const [frequency, setFrequency] = useState<Frequency>('Única');

  const isFilterActive = filterMember !== 'Todos' || filterStatus !== 'all';

  const setFilterMember = (mId: string) => {
    setFilterMemberState(mId);
    try {
      const key = getFilterOverrideKey(currentMember.id);
      if (mId === currentMember.id) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, JSON.stringify({
          value: mId,
          timestamp: Date.now()
        }));
      }
    } catch (e) {}
    saveUserPreferences(currentMember.id, { tasksMemberFilter: mId });
  };
  const setFilterStatus = (st: 'all' | 'pending' | 'completed') => {
    setFilterStatusState(st);
    saveUserPreferences(currentMember.id, { tasksStatusFilter: st });
  };

  // Filter and sort: Pending tasks ALWAYS appear ABOVE completed tasks
  const filteredTasks = tasks.filter(t => {
    if (selectedListId !== 'all' && (t.listId || 'general') !== selectedListId) return false;
    if (filterMember !== 'Todos') {
      if (filterMember === 'unassigned' && t.assignedMemberId) return false;
      if (filterMember !== 'unassigned' && t.assignedMemberId !== filterMember) return false;
    }
    if (filterStatus === 'pending' && t.completed) return false;
    if (filterStatus === 'completed' && !t.completed) return false;
    return true;
  }).sort((a, b) => Number(a.completed) - Number(b.completed));

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addTask({
      title: title.trim(),
      category: 'General',
      assignedMemberId: assignedMemberId || undefined,
      points: 0,
      dueDate,
      priority,
      frequency,
      listId: targetListId || 'general'
    });

    setTitle('');
    setShowAddModal(false);
  };

  const getPriorityStyle = (p: Priority) => {
    switch (p) {
      case 'Alta': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Media': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Baja': return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // Combined lists array (Default lists + custom lists)
  const allLists = React.useMemo(() => {
    const listMap = new Map<string, string>();
    listMap.set('general', 'Lista Principal');
    customTaskLists.forEach(l => listMap.set(l.id, l.name));
    return Array.from(listMap.entries()).map(([id, name]) => ({ id, name }));
  }, [customTaskLists]);

  return (
    <div className="space-y-6 pb-12 overflow-x-hidden">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
              <CheckSquare className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Tareas del Hogar</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Organiza las tareas del hogar por listas independientes.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => {
              setTargetListId(selectedListId !== 'all' ? selectedListId : 'general');
              setShowAddModal(true);
            }}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-indigo-200 active-touch shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Añadir Tarea</span>
          </button>
        )}
      </div>

      {/* Task Lists Bar - Horizontal Scrollable with hint */}
      <div className="relative">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 pt-1 px-1 horizontal-scroll-hint">
          {allLists.map(list => {
            const listTasksCount = tasks.filter(t => (t.listId || 'general') === list.id).length;
            const isSelected = selectedListId === list.id;
            return (
              <button
                key={list.id}
                onClick={() => setSelectedListId(list.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition active-touch whitespace-nowrap flex items-center gap-2 ${
                  isSelected ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>{list.name}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {listTasksCount}
                </span>
              </button>
            );
          })}

          {/* Optional "Ver Todo" Button */}
          <button
            onClick={() => setSelectedListId('all')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition active-touch whitespace-nowrap flex items-center gap-1.5 ${
              selectedListId === 'all' ? 'bg-slate-800 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>🌐 Ver Todo Junto</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-200/60 text-slate-800">
              {tasks.length}
            </span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className={`p-4 rounded-2xl border transition shadow-xs space-y-3 ${
        isFilterActive ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-200' : 'bg-white border-slate-200'
      }`}>
        {isFilterActive && (
          <div className="flex items-center justify-between text-xs font-bold text-amber-900 border-b border-amber-200 pb-2">
            <span>🔍 Filtros Activos</span>
            <button
              onClick={() => {
                setFilterStatus('all');
                setFilterMember('Todos');
              }}
              className="px-2 py-0.5 bg-amber-500 text-white hover:bg-amber-600 rounded-lg text-[10px] active-touch"
            >
              Limpiar Filtros ✕
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Estado</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className={`w-full px-3 py-1.5 border rounded-xl text-xs font-semibold ${
                filterStatus !== 'all' ? 'bg-amber-100 border-amber-400 text-amber-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <option value="all">Todas las tareas</option>
              <option value="pending">Pendientes únicamente</option>
              <option value="completed">Completadas</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Asignado a</label>
            <select
              value={filterMember}
              onChange={(e) => setFilterMember(e.target.value)}
              className={`w-full px-3 py-1.5 border rounded-xl text-xs font-semibold ${
                filterMember !== 'Todos' ? 'bg-amber-100 border-amber-400 text-amber-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <option value="Todos">Todos los miembros</option>
              <option value="unassigned">Cualquiera (Sin asignar)</option>
              {allMembers.map(m => (
                <option key={m.id} value={m.id}>
                  {m.avatar} {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="bg-white p-8 text-center rounded-3xl border border-slate-200 space-y-2">
            <Sparkles className="w-10 h-10 text-amber-400 mx-auto" />
            <p className="font-bold text-slate-800 text-sm">No hay tareas en esta lista.</p>
            <p className="text-xs text-slate-500">¡Genial! Todas las tareas de esta lista están completadas.</p>
          </div>
        ) : (
          filteredTasks.map(task => {
            const assignedMember = allMembers.find(m => m.id === task.assignedMemberId);
            const priStyle = getPriorityStyle(task.priority);
            const isPendingValidation = task.validationStatus === 'pending_approval';

            const canMemberNotify = !task.assignedMemberId || task.assignedMemberId === currentMember.id;

            return (
              <div
                key={task.id}
                className={`bg-white rounded-2xl p-4 border transition flex items-start justify-between gap-3 shadow-xs ${
                  task.completed ? 'opacity-65 bg-slate-50 border-slate-200' : 
                  isPendingValidation ? 'bg-amber-50/90 border-amber-300 ring-2 ring-amber-200' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* Checkbox / Validation Button */}
                  {isAdmin ? (
                    <button
                      onClick={() => toggleTask(task.id)}
                      className={`w-6 h-6 rounded-lg border flex items-center justify-center transition active-touch mt-0.5 shrink-0 ${
                        task.completed 
                          ? 'bg-emerald-500 border-emerald-600 text-white' 
                          : 'border-slate-300 hover:border-indigo-500 bg-white'
                      }`}
                    >
                      {task.completed && <Check className="w-4 h-4" />}
                    </button>
                  ) : (
                    <div className="mt-0.5 shrink-0">
                      {task.completed ? (
                        <div className="w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
                          <Check className="w-4 h-4" />
                        </div>
                      ) : isPendingValidation ? (
                        <span className="text-xs font-bold text-amber-800 bg-amber-200 px-2 py-0.5 rounded-lg flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Aviso Enviado
                        </span>
                      ) : canMemberNotify ? (
                        <button
                          onClick={() => requestTaskValidation(task.id, currentMember.id)}
                          className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] rounded-xl flex items-center gap-1 shadow-xs active-touch"
                        >
                          <Bell className="w-3 h-3" /> Aviso Padres
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-1 rounded-lg flex items-center gap-1 font-semibold">
                          <Lock className="w-3 h-3 text-slate-400" /> Tarea de {assignedMember?.name.split(' ')[0]}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${priStyle}`}>
                        {task.priority}
                      </span>
                      <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full font-medium">
                        {task.frequency}
                      </span>
                    </div>

                    <h4 className={`font-bold text-sm sm:text-base text-slate-900 ${task.completed ? 'line-through text-slate-500' : ''}`}>
                      {task.title}
                    </h4>

                    <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                      {/* Member color badge */}
                      {assignedMember ? (
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-xs ${assignedMember.color || 'bg-slate-700 text-white'}`}>
                          <span>{assignedMember.avatar}</span>
                          <span>{assignedMember.name.split(' ')[0]}</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg font-bold">
                          👤 Cualquiera
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {isAdmin && (
                  <button
                    onClick={() => setDeletingTaskId(task.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition shrink-0"
                    title="Eliminar tarea"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* CREATE TASK MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-lg">Nueva Tarea Familiar</h3>
              <button onClick={() => setShowAddModal(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">✕</button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Título de la Tarea *</label>
                <input
                  required
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Ordenar la habitación..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Lista *</label>
                  <select
                    value={targetListId}
                    onChange={(e) => setTargetListId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none"
                  >
                    {allLists.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Asignar a</label>
                  <select
                    value={assignedMemberId}
                    onChange={(e) => setAssignedMemberId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none"
                  >
                    <option value="">Cualquiera</option>
                    {allMembers.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.avatar} {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Prioridad</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  >
                    <option value="Alta">Alta</option>
                    <option value="Media">Media</option>
                    <option value="Baja">Baja</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Frecuencia</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  >
                    <option value="Única">Única</option>
                    <option value="Diaria">Diaria</option>
                    <option value="Semanal">Semanal</option>
                    <option value="Mensual">Mensual</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border rounded-xl font-bold text-slate-600 hover:bg-slate-50 active-touch"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-md active-touch"
                >
                  Guardar Tarea
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL FOR DELETION */}
      <ConfirmModal
        isOpen={!!deletingTaskId}
        onCancel={() => setDeletingTaskId(null)}
        onConfirm={() => {
          if (deletingTaskId) deleteTask(deletingTaskId);
          setDeletingTaskId(null);
        }}
      />
    </div>
  );
};

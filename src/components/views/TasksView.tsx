import React, { useState } from 'react';
import { useFamily } from '../../context/FamilyContext';
import { useAuth } from '../../context/AuthContext';
import { Priority, Frequency, TaskItem } from '../../types';
import { 
  CheckSquare, 
  Plus, 
  Gift, 
  Award, 
  Check, 
  Trash2, 
  Sparkles,
  Bell,
  Clock,
  Lock
} from 'lucide-react';
import { getUserPreferences, saveUserPreferences } from '../../lib/userPreferences';
import { ConfirmModal } from '../ConfirmModal';

export const TasksView: React.FC = () => {
  const { 
    tasks, 
    rewards, 
    rewardRequests,
    customTaskLists,
    addTask, 
    toggleTask, 
    deleteTask, 
    requestTaskValidation,
    requestReward,
    customCategories 
  } = useFamily();
  const { currentMember, allMembers, isAdmin } = useAuth();

  const taskCategoriesList = customCategories.tasks || ['Limpieza', 'Cocina', 'Estudios', 'Oración', 'Mascotas', 'General'];

  const [activeTab, setActiveTab] = useState<'tasks' | 'rewards'>('tasks');
  const [selectedListId, setSelectedListId] = useState<string>('all');

  const [filterCategory, setFilterCategoryState] = useState<string>(() => 
    getUserPreferences(currentMember.id).tasksCategoryFilter
  );
  const [filterMember, setFilterMemberState] = useState<string>(() => 
    getUserPreferences(currentMember.id).tasksMemberFilter
  );
  const [filterStatus, setFilterStatusState] = useState<'all' | 'pending' | 'completed'>(() => 
    getUserPreferences(currentMember.id).tasksStatusFilter
  );

  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Defaults: assignedMemberId = '' (Sin asignar), frequency = 'Única'
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TaskItem['category']>(taskCategoriesList[0] || 'General');
  const [assignedMemberId, setAssignedMemberId] = useState<string>('');
  const [points, setPoints] = useState<number>(15);
  const [dueDate, setDueDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [priority, setPriority] = useState<Priority>('Media');
  const [frequency, setFrequency] = useState<Frequency>('Única');

  const isFilterActive = filterCategory !== 'Todas' || filterMember !== 'Todos' || filterStatus !== 'all' || selectedListId !== 'all';

  const setFilterCategory = (cat: string) => {
    setFilterCategoryState(cat);
    saveUserPreferences(currentMember.id, { tasksCategoryFilter: cat });
  };
  const setFilterMember = (mId: string) => {
    setFilterMemberState(mId);
    saveUserPreferences(currentMember.id, { tasksMemberFilter: mId });
  };
  const setFilterStatus = (st: 'all' | 'pending' | 'completed') => {
    setFilterStatusState(st);
    saveUserPreferences(currentMember.id, { tasksStatusFilter: st });
  };

  // Filter and sort: Pending tasks ALWAYS appear ABOVE completed tasks
  const filteredTasks = tasks.filter(t => {
    if (selectedListId !== 'all' && t.listId && t.listId !== selectedListId) return false;
    if (filterCategory !== 'Todas' && t.category !== filterCategory) return false;
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
      category,
      assignedMemberId: assignedMemberId || undefined,
      points,
      dueDate,
      priority,
      frequency,
      listId: selectedListId !== 'all' ? selectedListId : 'general'
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
            Organiza el trabajo doméstico. Avisa de tus tareas completadas a tus padres.
          </p>
        </div>

        {/* Tab Switcher & Add Button */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-100 p-1 rounded-2xl flex items-center">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition active-touch ${
                activeTab === 'tasks' ? 'bg-white text-indigo-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Tareas ({tasks.filter(t => !t.completed).length})
            </button>
            <button
              onClick={() => setActiveTab('rewards')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition active-touch flex items-center gap-1 ${
                activeTab === 'rewards' ? 'bg-white text-indigo-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              <Gift className="w-3.5 h-3.5 text-amber-500" />
              <span>Premios</span>
            </button>
          </div>

          {isAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1 shadow-md shadow-indigo-200 active-touch shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir Tarea</span>
            </button>
          )}
        </div>
      </div>

      {activeTab === 'tasks' ? (
        <>
          {/* Custom Task Lists Selector (Incluye "Todas las listas juntas") */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setSelectedListId('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition active-touch whitespace-nowrap ${
                selectedListId === 'all' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700'
              }`}
            >
              🌐 Todas las listas juntas ({tasks.length})
            </button>
            {customTaskLists.map(list => {
              const listTasksCount = tasks.filter(t => t.listId === list.id || (list.id === 'general' && !t.listId)).length;
              return (
                <button
                  key={list.id}
                  onClick={() => setSelectedListId(list.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition active-touch whitespace-nowrap ${
                    selectedListId === list.id ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  📋 {list.name} ({listTasksCount})
                </button>
              );
            })}
          </div>

          {/* Filters Bar */}
          <div className={`p-4 rounded-2xl border transition shadow-xs space-y-3 ${
            isFilterActive ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-200' : 'bg-white border-slate-200'
          }`}>
            {isFilterActive && (
              <div className="flex items-center justify-between text-xs font-bold text-amber-900 border-b border-amber-200 pb-2">
                <span>🔍 Filtros Activos en Tareas</span>
                <button
                  onClick={() => {
                    setSelectedListId('all');
                    setFilterStatus('all');
                    setFilterCategory('Todas');
                    setFilterMember('Todos');
                  }}
                  className="px-2 py-0.5 bg-amber-500 text-white hover:bg-amber-600 rounded-lg text-[10px] active-touch"
                >
                  Limpiar Filtros ✕
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Categoría</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className={`w-full px-3 py-1.5 border rounded-xl text-xs font-semibold ${
                    filterCategory !== 'Todas' ? 'bg-amber-100 border-amber-400 text-amber-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <option value="Todas">Todas las categorías</option>
                  {taskCategoriesList.map(c => <option key={c} value={c}>{c}</option>)}
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
                  <option value="unassigned">Sin asignar</option>
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
                <p className="font-bold text-slate-800 text-sm">No hay tareas que coincidan con el filtro.</p>
                <p className="text-xs text-slate-500">¡Genial! Todo el trabajo del hogar está al día.</p>
              </div>
            ) : (
              filteredTasks.map(task => {
                const assignedMember = allMembers.find(m => m.id === task.assignedMemberId);
                const priStyle = getPriorityStyle(task.priority);
                const isPendingValidation = task.validationStatus === 'pending_approval';

                // Rule 1: A member can ONLY notify for their own assigned tasks or unassigned tasks!
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
                            <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-1 rounded-lg flex items-center gap-1 font-semibold" title="Solo el miembro asignado puede avisar">
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
                          <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                            {task.category}
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
                            <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg font-medium">
                              Sin asignar
                            </span>
                          )}

                          <span>•</span>
                          <span className="text-amber-700 font-bold flex items-center gap-1">
                            <Award className="w-3.5 h-3.5" /> +{task.points} pts
                          </span>
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
        </>
      ) : (
        /* REWARDS TAB */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rewards.map(reward => {
            const myPendingReq = rewardRequests.find(r => r.rewardId === reward.id && r.memberId === currentMember.id && r.status === 'requested');
            const hasEnoughPoints = currentMember.points >= reward.pointsCost;

            return (
              <div key={reward.id} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{reward.icon}</span>
                    <span className="px-3 py-1 bg-amber-100 text-amber-900 font-extrabold text-xs rounded-full border border-amber-200">
                      {reward.pointsCost} pts
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">{reward.title}</h3>
                  <p className="text-xs text-slate-500">{reward.description}</p>
                </div>

                <div>
                  {myPendingReq ? (
                    <div className="w-full py-2.5 bg-amber-100 text-amber-900 rounded-2xl text-center text-xs font-bold">
                      ⏳ Solicitada (Pendiente Padres en Inicio)
                    </div>
                  ) : isAdmin ? (
                    <button
                      onClick={() => requestReward(reward.id, currentMember.id, currentMember.name)}
                      className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl text-xs font-bold shadow-md shadow-amber-200 active-touch"
                    >
                      Canjear Directamente
                    </button>
                  ) : (
                    <button
                      disabled={!hasEnoughPoints}
                      onClick={() => requestReward(reward.id, currentMember.id, currentMember.name)}
                      className={`w-full py-2.5 rounded-2xl text-xs font-bold transition active-touch ${
                        hasEnoughPoints
                          ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-200'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      {hasEnoughPoints ? 'Solicitar Recompensa' : `Faltan ${reward.pointsCost - currentMember.points} pts`}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

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
                <label className="block text-xs font-semibold text-slate-600 mb-1">Título *</label>
                <input
                  required
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Ordenar la habitación..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Categoría</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none"
                  >
                    {taskCategoriesList.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Asignar a</label>
                  <select
                    value={assignedMemberId}
                    onChange={(e) => setAssignedMemberId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none"
                  >
                    <option value="">Sin asignar (Opción por defecto)</option>
                    {allMembers.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.avatar} {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Puntos</label>
                  <input
                    type="number"
                    value={points}
                    onChange={(e) => setPoints(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>

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
                  className="flex-1 py-2.5 border rounded-xl font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-md"
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

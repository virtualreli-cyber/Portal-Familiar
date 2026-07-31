import React, { useState } from 'react';
import { TaskItem, RewardItem, FamilyMember, Frequency, Priority } from '../types';
import { 
  CheckSquare, Plus, Flame, Award, Trash2, Filter, CheckCircle2, Trophy
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TasksViewProps {
  tasks: TaskItem[];
  rewards: RewardItem[];
  familyMembers: FamilyMember[];
  activeMemberId: string | null;
  onAddTask: (task: Omit<TaskItem, 'id'>) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onAddReward: (reward: Omit<RewardItem, 'id'>) => void;
  onClaimReward: (rewardId: string, memberId: string, costPoints: number) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  rewards,
  familyMembers,
  activeMemberId,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onAddReward,
  onClaimReward,
}) => {
  const [selectedMemberId, setSelectedMemberId] = useState<string>(activeMemberId || 'all');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [activeTab, setActiveTab] = useState<'tasks' | 'rewards'>('tasks');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);

  // Form states Task
  const [taskTitle, setTaskTitle] = useState('');
  const [taskCategory, setTaskCategory] = useState<TaskItem['category']>('Limpieza');
  const [assignedMemberId, setAssignedMemberId] = useState<string>(familyMembers[0]?.id || '');
  const [points, setPoints] = useState<number>(15);
  const [dueDate] = useState(new Date().toISOString().split('T')[0]);
  const [priority] = useState<Priority>('Media');
  const [frequency, setFrequency] = useState<Frequency>('Diaria');

  // Form states Reward
  const [rewardTitle, setRewardTitle] = useState('');
  const [rewardCost, setRewardCost] = useState<number>(50);
  const [rewardDesc, setRewardCostDesc] = useState('');
  const [rewardIcon, setRewardIcon] = useState('🎮');

  // Filter tasks
  const filteredTasks = tasks.filter(t => {
    const matchesMember = selectedMemberId === 'all' || t.assignedToMemberId === selectedMemberId;
    const matchesCat = selectedCategory === 'Todas' || t.category === selectedCategory;
    return matchesMember && matchesCat;
  });

  const pendingTasks = filteredTasks.filter(t => !t.completed);
  const completedTasks = filteredTasks.filter(t => t.completed);

  // Active claiming member
  const claimingMember = familyMembers.find(m => m.id === (selectedMemberId === 'all' ? familyMembers[0]?.id : selectedMemberId)) || familyMembers[0];

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    onAddTask({
      title: taskTitle.trim(),
      category: taskCategory,
      assignedToMemberId: assignedMemberId,
      points: Number(points) || 10,
      dueDate,
      completed: false,
      priority,
      frequency
    });

    setTaskTitle('');
    setShowTaskModal(false);
    confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
  };

  const handleRewardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rewardTitle.trim()) return;

    onAddReward({
      title: rewardTitle.trim(),
      costPoints: Number(rewardCost) || 30,
      description: rewardDesc.trim(),
      icon: rewardIcon
    });

    setRewardTitle('');
    setRewardCostDesc('');
    setShowRewardModal(false);
  };

  const handleClaim = (reward: RewardItem) => {
    if (!claimingMember) return;
    if (claimingMember.points < reward.costPoints) {
      alert(`Puntos insuficientes. ${claimingMember.name} tiene ${claimingMember.points} pts y se necesitan ${reward.costPoints} pts.`);
      return;
    }

    onClaimReward(reward.id, claimingMember.id, reward.costPoints);
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header & Main Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500 text-white rounded-2xl shadow-md shadow-emerald-500/20">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white">
              Tareas del Hogar y Recompensas
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Asigna responsabilidades, suma puntos y canjea premios en la tienda familiar
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Sub-tabs */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                activeTab === 'tasks'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              📋 Tareas ({pendingTasks.length})
            </button>
            <button
              onClick={() => setActiveTab('rewards')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                activeTab === 'rewards'
                  ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              🎁 Tienda Premios
            </button>
          </div>

          {activeTab === 'tasks' ? (
            <button
              onClick={() => setShowTaskModal(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Tarea</span>
            </button>
          ) : (
            <button
              onClick={() => setShowRewardModal(true)}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Crear Recompensa</span>
            </button>
          )}
        </div>
      </div>

      {/* Family Leaderboard Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {familyMembers.map((m) => (
          <button
            key={m.id}
            onClick={() => setSelectedMemberId(m.id)}
            className={`p-3 rounded-2xl border transition-all text-left flex items-center justify-between cursor-pointer ${
              selectedMemberId === m.id
                ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/20'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 hover:border-amber-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">{m.avatar}</span>
              <div>
                <span className="text-xs font-extrabold block truncate max-w-[80px]">{m.name}</span>
                <span className={`text-[10px] ${selectedMemberId === m.id ? 'text-amber-100' : 'text-slate-400'}`}>
                  {m.role}
                </span>
              </div>
            </div>
            <div className={`px-2 py-1 rounded-lg text-xs font-extrabold flex items-center gap-1 ${
              selectedMemberId === m.id ? 'bg-white/20 text-white' : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
            }`}>
              <Flame className="w-3 h-3 fill-amber-500" />
              <span>{m.points}</span>
            </div>
          </button>
        ))}
      </div>

      {/* TASKS VIEW */}
      {activeTab === 'tasks' && (
        <div className="space-y-6">
          
          {/* Filters Bar */}
          <div className="flex items-center justify-between bg-slate-100/80 dark:bg-slate-800/80 p-3 rounded-2xl">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <Filter className="w-4 h-4 text-slate-500 ml-1" />
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Filtrar miembro:</span>
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl px-3 py-1.5 border border-slate-200 dark:border-slate-700 focus:outline-none"
              >
                <option value="all">👨‍👩‍👧‍👦 Todos los miembros</option>
                {familyMembers.map(m => (
                  <option key={m.id} value={m.id}>{m.avatar} {m.name}</option>
                ))}
              </select>

              <span className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-3">Categoría:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl px-3 py-1.5 border border-slate-200 dark:border-slate-700 focus:outline-none"
              >
                <option value="Todas">Todas</option>
                <option value="Limpieza">Limpieza</option>
                <option value="Cocina">Cocina</option>
                <option value="Jardín">Jardín</option>
                <option value="Estudios">Estudios</option>
                <option value="Mascotas">Mascotas</option>
                <option value="General">General</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Pending Tasks */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
              <h3 className="text-base font-extrabold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                Tareas Pendientes ({pendingTasks.length})
              </h3>

              {pendingTasks.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500 mb-2 opacity-80" />
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">¡Todo impecable!</p>
                  <p className="text-xs">No hay tareas pendientes en este filtro.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingTasks.map((t) => {
                    const assignedMember = familyMembers.find(m => m.id === t.assignedToMemberId);
                    return (
                      <div
                        key={t.id}
                        className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50 hover:border-emerald-300 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={t.completed}
                            onChange={() => {
                              onToggleTask(t.id);
                              confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
                            }}
                            className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                          />
                          <div>
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                              {t.title}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              {assignedMember && (
                                <span className="font-semibold text-slate-700 dark:text-slate-300">
                                  {assignedMember.avatar} {assignedMember.name}
                                </span>
                              )}
                              <span>•</span>
                              <span>{t.category}</span>
                              <span>•</span>
                              <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 font-extrabold text-[10px]">
                                +{t.points} pts
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => onDeleteTask(t.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Completed Tasks */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
              <h3 className="text-base font-extrabold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                Tareas Completadas Hoy ({completedTasks.length})
              </h3>

              {completedTasks.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <p className="text-xs">Aún no hay tareas marcadas como completadas.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {completedTasks.map((t) => {
                    const assignedMember = familyMembers.find(m => m.id === t.assignedToMemberId);
                    return (
                      <div
                        key={t.id}
                        className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 opacity-80"
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={t.completed}
                            onChange={() => onToggleTask(t.id)}
                            className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                          />
                          <div>
                            <span className="text-sm font-semibold line-through text-slate-500 dark:text-slate-400">
                              {t.title}
                            </span>
                            <div className="text-xs text-slate-400">
                              Completado por {assignedMember?.name || 'Familia'} (+{t.points} pts)
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => onDeleteTask(t.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
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
        </div>
      )}

      {/* REWARDS STORE VIEW */}
      {activeTab === 'rewards' && (
        <div className="space-y-6">
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-3xl p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{claimingMember.avatar}</span>
              <div>
                <p className="text-xs font-bold text-amber-800 dark:text-amber-300">
                  Miembro activo para canjear:
                </p>
                <h4 className="text-lg font-black text-slate-800 dark:text-white">
                  {claimingMember.name} — <span className="text-amber-600 dark:text-amber-400">{claimingMember.points} Puntos disponibles</span>
                </h4>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              Completa tareas para acumular más puntos y canjear tus premios preferidos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rewards.map((r) => {
              const canAfford = claimingMember.points >= r.costPoints;

              return (
                <div
                  key={r.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:shadow-md transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-4xl p-3 bg-amber-50 dark:bg-amber-950/50 rounded-2xl border border-amber-200 dark:border-amber-900">
                        {r.icon}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                        {r.costPoints} pts
                      </span>
                    </div>

                    <h4 className="text-base font-extrabold text-slate-800 dark:text-white mb-1">
                      {r.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                      {r.description}
                    </p>
                  </div>

                  <button
                    onClick={() => handleClaim(r)}
                    disabled={!canAfford}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      canAfford
                        ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Trophy className="w-4 h-4" />
                    <span>{canAfford ? `Canjear por ${r.costPoints} pts` : `Te faltan ${r.costPoints - claimingMember.points} pts`}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal Add Task */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-extrabold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-emerald-500" /> Nueva Tarea Doméstica
            </h3>

            <form onSubmit={handleTaskSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nombre de la tarea *
                </label>
                <input
                  type="text"
                  placeholder="Ej. Limpiar habitación, Sacar la basura, Poner la mesa..."
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Categoría
                  </label>
                  <select
                    value={taskCategory}
                    onChange={(e) => setTaskCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Limpieza">Limpieza</option>
                    <option value="Cocina">Cocina</option>
                    <option value="Jardín">Jardín</option>
                    <option value="Estudios">Estudios</option>
                    <option value="Mascotas">Mascotas</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Asignada a
                  </label>
                  <select
                    value={assignedMemberId}
                    onChange={(e) => setAssignedMemberId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {familyMembers.map(m => (
                      <option key={m.id} value={m.id}>{m.avatar} {m.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Puntos Recompensa
                  </label>
                  <input
                    type="number"
                    value={points}
                    onChange={(e) => setPoints(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Frecuencia
                  </label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as Frequency)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Diaria">Diaria</option>
                    <option value="Semanal">Semanal</option>
                    <option value="Única">Única</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md cursor-pointer"
                >
                  Guardar Tarea
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add Reward */}
      {showRewardModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-extrabold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" /> Crear Premio / Recompensa
            </h3>

            <form onSubmit={handleRewardSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Título del Premio *</label>
                <input
                  type="text"
                  placeholder="Ej. Salida al cine, Ir por un helado..."
                  value={rewardTitle}
                  onChange={(e) => setRewardTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Coste en Puntos</label>
                  <input
                    type="number"
                    value={rewardCost}
                    onChange={(e) => setRewardCost(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Icono / Emoji</label>
                  <input
                    type="text"
                    value={rewardIcon}
                    onChange={(e) => setRewardIcon(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-center text-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Descripción</label>
                <input
                  type="text"
                  placeholder="Ej. Elegir la película el fin de semana"
                  value={rewardDesc}
                  onChange={(e) => setRewardCostDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowRewardModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-md cursor-pointer"
                >
                  Crear Premio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

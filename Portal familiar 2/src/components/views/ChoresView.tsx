import React, { useState } from 'react';
import { FamilyData, Chore, ChoreCategory } from '../../types/family';
import { triggerConfetti } from '../../utils/confetti';
import { 
  CheckSquare, 
  Plus, 
  Check, 
  Trash2, 
  Coins, 
  Repeat, 
  Award
} from 'lucide-react';

interface ChoresViewProps {
  data: FamilyData;
  onUpdateData: (newData: FamilyData) => void;
}

const CATEGORIES: ChoreCategory[] = [
  'Diaria',
  'Semanal',
  'Escuela',
  'Mascotas',
  'Proyectos Hogar',
];

export const ChoresView: React.FC<ChoresViewProps> = ({ data, onUpdateData }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [selectedMemberFilter, setSelectedMemberFilter] = useState<string>('Todos');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Add chore form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ChoreCategory>('Diaria');
  const [assignedMemberId, setAssignedMemberId] = useState(data.activeMemberId || '');
  const [points, setPoints] = useState<number>(15);
  const [recurring, setRecurring] = useState<'Ninguna' | 'Diaria' | 'Semanal' | 'Mensual'>('Diaria');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);

  // Calculations
  const completedCount = data.chores.filter((c) => c.completed).length;
  const totalCount = data.chores.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Filter tasks
  const filteredChores = data.chores.filter((c) => {
    if (selectedCategory !== 'Todas' && c.category !== selectedCategory) return false;
    if (selectedMemberFilter !== 'Todos' && c.assignedMemberId !== selectedMemberFilter) return false;
    return true;
  });

  const handleToggleChore = (choreId: string) => {
    const targetChore = data.chores.find((c) => c.id === choreId);
    if (!targetChore) return;

    const isNowCompleted = !targetChore.completed;

    if (isNowCompleted) {
      triggerConfetti();
    }

    const updatedChores = data.chores.map((c) => {
      if (c.id === choreId) {
        return {
          ...c,
          completed: isNowCompleted,
          completedAt: isNowCompleted ? new Date().toISOString() : undefined,
        };
      }
      return c;
    });

    // Update active member or assigned member points
    const targetMemberId = targetChore.assignedMemberId || data.activeMemberId;
    const updatedMembers = data.members.map((m) => {
      if (m.id === targetMemberId) {
        const pointDiff = isNowCompleted ? targetChore.points : -targetChore.points;
        return { ...m, points: Math.max(0, m.points + pointDiff) };
      }
      return m;
    });

    onUpdateData({
      ...data,
      chores: updatedChores,
      members: updatedMembers,
    });
  };

  const handleAddChore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newChore: Chore = {
      id: `c-${Date.now()}`,
      title: title.trim(),
      category,
      assignedMemberId: assignedMemberId || undefined,
      points: Number(points) || 10,
      completed: false,
      recurring,
      dueDate,
    };

    onUpdateData({
      ...data,
      chores: [newChore, ...data.chores],
    });

    setTitle('');
    setShowAddModal(false);
    triggerConfetti();
  };

  const handleDeleteChore = (choreId: string) => {
    const updated = data.chores.filter((c) => c.id !== choreId);
    onUpdateData({ ...data, chores: updated });
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold mb-2">
            <CheckSquare className="w-3.5 h-3.5" /> Tabla de Tareas del Hogar
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">Lista de Checks y Tareas</h2>
          <p className="text-emerald-100 text-xs sm:text-sm mt-1">
            Asigna responsabilidades a cada familiar, acumula puntos al completarlas y conviértelos en recompensas.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-2xl bg-white text-slate-900 font-bold text-xs hover:bg-emerald-50 transition flex items-center gap-2 shadow-md self-start md:self-auto"
        >
          <Plus className="w-4 h-4 text-emerald-600" /> Nueva Tarea
        </button>
      </div>

      {/* Daily Progress Tracker */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-500" />
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Progreso Diario de Tareas</h3>
          </div>
          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
            {completedCount} de {totalCount} completadas ({progressPercent}%)
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Member Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-none">
            <button
              onClick={() => setSelectedMemberFilter('Todos')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedMemberFilter === 'Todos'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              👥 Todos los Miembros
            </button>
            {data.members.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMemberFilter(m.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1 ${
                  selectedMemberFilter === m.id
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                <span>{m.avatar}</span>
                <span>{m.name}</span>
              </button>
            ))}
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
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Chore Cards Grid */}
      {filteredChores.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-700">
          <CheckSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">No hay tareas en este filtro</h3>
          <p className="text-xs text-slate-400 mt-1">Prueba a seleccionar otro miembro o añade una nueva tarea.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredChores.map((chore) => {
            const assignedMember = data.members.find((m) => m.id === chore.assignedMemberId);

            return (
              <div
                key={chore.id}
                className={`p-4 rounded-2xl border transition relative flex flex-col justify-between shadow-xs ${
                  chore.completed
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50 opacity-80'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-emerald-400'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <button
                      onClick={() => handleToggleChore(chore.id)}
                      className="flex items-start gap-3 text-left flex-1 group"
                    >
                      <div className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition border ${
                        chore.completed
                          ? 'bg-emerald-500 text-white border-emerald-500'
                          : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 group-hover:border-emerald-500'
                      }`}>
                        {chore.completed && <Check className="w-4 h-4 stroke-[3]" />}
                      </div>
                      <div>
                        <h4 className={`text-sm font-bold leading-snug ${
                          chore.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-100'
                        }`}>
                          {chore.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            {chore.category}
                          </span>
                          {chore.recurring !== 'Ninguna' && (
                            <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                              <Repeat className="w-3 h-3" /> {chore.recurring}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleDeleteChore(chore.id)}
                      className="text-slate-300 hover:text-rose-500 transition p-1"
                      title="Eliminar tarea"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/80 flex items-center justify-between text-xs">
                  {assignedMember ? (
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
                      <span>{assignedMember.avatar}</span>
                      <span>{assignedMember.name}</span>
                    </div>
                  ) : (
                    <span className="text-slate-400">Sin asignar</span>
                  )}

                  <span className="px-2.5 py-1 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-extrabold flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5 text-amber-600" />
                    +{chore.points} pts
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Chore Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-emerald-500" /> Crear Nueva Tarea Familiar
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-xs text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddChore} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Título de la Tarea *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Regar las plantas, Hacer deberes..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Categoría</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ChoreCategory)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Recompensa (Puntos)</label>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    value={points}
                    onChange={(e) => setPoints(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white font-bold text-amber-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Asignar A</label>
                  <select
                    value={assignedMemberId}
                    onChange={(e) => setAssignedMemberId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white"
                  >
                    <option value="">Cualquiera</option>
                    {data.members.map((m) => (
                      <option key={m.id} value={m.id}>{m.avatar} {m.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Frecuencia</label>
                  <select
                    value={recurring}
                    onChange={(e) => setRecurring(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white"
                  >
                    <option value="Diaria">Diaria</option>
                    <option value="Semanal">Semanal</option>
                    <option value="Mensual">Mensual</option>
                    <option value="Ninguna">Puntual / Ninguna</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Fecha Límite</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button type="submit" className="px-6 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md">
                  Guardar Tarea
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

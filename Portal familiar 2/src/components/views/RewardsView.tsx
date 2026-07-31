import React, { useState } from 'react';
import { FamilyData, Reward } from '../../types/family';
import { triggerConfetti } from '../../utils/confetti';
import { 
  Trophy, 
  Coins, 
  Plus, 
  Sparkles, 
  Trash2, 
  Gift,
  Award
} from 'lucide-react';

interface RewardsViewProps {
  data: FamilyData;
  onUpdateData: (newData: FamilyData) => void;
}

export const RewardsView: React.FC<RewardsViewProps> = ({ data, onUpdateData }) => {
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [pointsCost, setPointsCost] = useState<number>(50);
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('🍿');

  const [message, setMessage] = useState<string | null>(null);

  const activeMember = data.members.find((m) => m.id === data.activeMemberId) || data.members[0];

  // Leaderboard sorted by points
  const sortedMembers = [...data.members].sort((a, b) => b.points - a.points);

  const handleClaimReward = (reward: Reward) => {
    if (activeMember.points < reward.pointsCost) {
      setMessage(`⚠️ Necesitas ${reward.pointsCost - activeMember.points} puntos más para canjear "${reward.title}".`);
      setTimeout(() => setMessage(null), 3500);
      return;
    }

    // Deduct points
    const updatedMembers = data.members.map((m) => {
      if (m.id === activeMember.id) {
        return { ...m, points: m.points - reward.pointsCost };
      }
      return m;
    });

    const updatedRewards = data.rewards.map((r) => {
      if (r.id === reward.id) {
        return { ...r, claimsCount: r.claimsCount + 1 };
      }
      return r;
    });

    onUpdateData({
      ...data,
      members: updatedMembers,
      rewards: updatedRewards,
    });

    triggerConfetti();
    setMessage(`🎉 ¡Felicidades, ${activeMember.name}! Has canjeado "${reward.title}".`);
    setTimeout(() => setMessage(null), 4000);
  };

  const handleAddReward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newReward: Reward = {
      id: `rew-${Date.now()}`,
      title: title.trim(),
      pointsCost: Number(pointsCost) || 50,
      description: description.trim() || 'Recompensa especial para la familia.',
      icon: icon || '🎁',
      claimsCount: 0,
    };

    onUpdateData({
      ...data,
      rewards: [...data.rewards, newReward],
    });

    setTitle('');
    setDescription('');
    setShowAddModal(false);
    triggerConfetti();
  };

  const handleDeleteReward = (rewardId: string) => {
    const updated = data.rewards.filter((r) => r.id !== rewardId);
    onUpdateData({ ...data, rewards: updated });
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 rounded-3xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold mb-2">
            <Trophy className="w-3.5 h-3.5" /> Gamificación Familiar
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">Tabla de Puntos y Recompensas</h2>
          <p className="text-amber-100 text-xs sm:text-sm mt-1">
            Gana puntos completando tus tareas del hogar y canjéalos por premios divertidos en familia.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-2xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition flex items-center gap-2 shadow-md self-start md:self-auto"
        >
          <Plus className="w-4 h-4 text-amber-400" /> Crear Recompensa
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl font-bold text-xs shadow-md flex items-center gap-2 animate-in zoom-in-95 duration-200 ${
          message.startsWith('⚠️') ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-500 text-white'
        }`}>
          <span>{message}</span>
        </div>
      )}

      {/* Leaderboard Section */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">
              Clasificación de Puntos del Hogar
            </h3>
          </div>
          <span className="text-xs text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> ¡Tu balance: {activeMember.points} pts!
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sortedMembers.map((member, idx) => (
            <div
              key={member.id}
              className={`p-4 rounded-2xl border flex items-center justify-between transition ${
                member.id === activeMember.id
                  ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700'
                  : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-6 text-center font-black text-slate-400 text-sm">
                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                </span>
                <span className="text-2xl">{member.avatar}</span>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">{member.name}</h4>
                  <p className="text-[10px] text-slate-400">{member.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-1 font-black text-amber-600 dark:text-amber-400 text-sm bg-white dark:bg-slate-800 px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-700">
                <Coins className="w-3.5 h-3.5" />
                <span>{member.points}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rewards Catalog */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Gift className="w-5 h-5 text-amber-500" /> Catálogo de Recompensas Canjeables
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.rewards.map((reward) => {
            const canAfford = activeMember.points >= reward.pointsCost;

            return (
              <div
                key={reward.id}
                className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl p-2.5 rounded-2xl bg-amber-50 dark:bg-slate-700">{reward.icon}</span>
                      <div>
                        <h4 className="text-base font-extrabold text-slate-800 dark:text-slate-100">{reward.title}</h4>
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                          <Coins className="w-3.5 h-3.5" /> {reward.pointsCost} puntos
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteReward(reward.id)}
                      className="text-slate-300 hover:text-rose-500 transition p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
                    {reward.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Canjeado {reward.claimsCount} veces</span>

                  <button
                    onClick={() => handleClaimReward(reward)}
                    disabled={!canAfford}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      canAfford
                        ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-md cursor-pointer'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {canAfford ? <Sparkles className="w-3.5 h-3.5" /> : null}
                    {canAfford ? 'Canjear Recompensa' : `Faltan ${reward.pointsCost - activeMember.points} pts`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Reward Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Gift className="w-5 h-5 text-amber-500" /> Crear Nueva Recompensa
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-xs text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddReward} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Título de la Recompensa *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Ir al cine, Elegir postre..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Coste en Puntos *</label>
                  <input
                    type="number"
                    min="10"
                    step="10"
                    required
                    value={pointsCost}
                    onChange={(e) => setPointsCost(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white font-bold text-amber-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Icono Emoji</label>
                  <input
                    type="text"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-center text-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Descripción</label>
                <textarea
                  rows={2}
                  placeholder="Detalles sobre lo que incluye la recompensa..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
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
                <button type="submit" className="px-6 py-2 rounded-xl bg-amber-500 text-white font-bold text-xs shadow-md">
                  Guardar Recompensa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

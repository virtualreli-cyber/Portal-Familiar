import React, { useState } from 'react';
import { BirthdayItem, FamilyMember } from '../types';
import { 
  Cake, Plus, Gift, Trash2, Calendar, PartyPopper
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BirthdaysViewProps {
  birthdays: BirthdayItem[];
  familyMembers: FamilyMember[];
  onAddBirthday: (birthday: Omit<BirthdayItem, 'id'>) => void;
  onDeleteBirthday: (id: string) => void;
  onAddGiftIdea: (birthdayId: string, giftTitle: string, cost?: number, assignedTo?: string) => void;
  onToggleGiftBought: (birthdayId: string, giftId: string) => void;
  onDeleteGiftIdea: (birthdayId: string, giftId: string) => void;
}

export const BirthdaysView: React.FC<BirthdaysViewProps> = ({
  birthdays,
  onAddBirthday,
  onDeleteBirthday,
  onAddGiftIdea,
  onToggleGiftBought,
  onDeleteGiftIdea,
}) => {
  const [showAddBdayModal, setShowAddBdayModal] = useState(false);
  const [activeGiftModalBdayId, setActiveGiftModalBdayId] = useState<string | null>(null);

  // Form states for birthday
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('Hijo/a');
  const [birthDate, setBirthDate] = useState('2015-06-15');
  const [avatar, setAvatar] = useState('🎂');
  const [notes, setNotes] = useState('');

  // Form states for gift idea
  const [giftTitle, setGiftTitle] = useState('');
  const [giftCost, setGiftCost] = useState('');
  const [giftAssignedTo, setGiftAssignedTo] = useState('Papá y Mamá');

  const today = new Date();

  // Process birthdays with age and days left
  const processedBirthdays = birthdays.map(b => {
    const bDate = new Date(b.birthDate);
    const birthYear = bDate.getFullYear();
    const currentYear = today.getFullYear();
    
    // Calculate turning age
    let turningAge = currentYear - birthYear;

    // Calculate next birthday date
    let nextBday = new Date(currentYear, bDate.getMonth(), bDate.getDate());
    if (nextBday < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
      nextBday.setFullYear(currentYear + 1);
      turningAge++;
    }

    const diffTime = Math.abs(nextBday.getTime() - today.getTime());
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const totalGiftCost = b.giftIdeas.reduce((sum, g) => sum + (g.estimatedCost || 0), 0);
    const boughtGiftsCount = b.giftIdeas.filter(g => g.bought).length;

    return {
      ...b,
      turningAge,
      nextBdayDateStr: nextBday.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' }),
      daysLeft,
      totalGiftCost,
      boughtGiftsCount
    };
  }).sort((a, b) => a.daysLeft - b.daysLeft);

  const triggerCelebration = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleAddBirthday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddBirthday({
      name: name.trim(),
      relationship,
      birthDate,
      avatar,
      giftIdeas: [],
      notes: notes.trim() || undefined
    });

    setName('');
    setShowAddBdayModal(false);
    triggerCelebration();
  };

  const handleAddGiftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!giftTitle.trim() || !activeGiftModalBdayId) return;

    onAddGiftIdea(
      activeGiftModalBdayId,
      giftTitle.trim(),
      giftCost ? parseFloat(giftCost) : undefined,
      giftAssignedTo
    );

    setGiftTitle('');
    setGiftCost('');
    setActiveGiftModalBdayId(null);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header & Celebration Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-500 text-white rounded-2xl shadow-md shadow-rose-500/20">
            <Cake className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white">
              Cumpleaños y Celebraciones
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Cuenta atrás en vivo, edades y lista de ideas de regalos con presupuesto
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={triggerCelebration}
            className="px-4 py-2.5 bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 hover:bg-rose-200 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer border border-rose-200 dark:border-rose-900"
          >
            <PartyPopper className="w-4 h-4 text-rose-500" />
            <span>🎉 ¡Lanzar Confeti!</span>
          </button>

          <button
            onClick={() => setShowAddBdayModal(true)}
            className="px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-rose-500/20 flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Añadir Cumpleañero</span>
          </button>
        </div>
      </div>

      {/* Birthday Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {processedBirthdays.map((b) => (
          <div
            key={b.id}
            className={`rounded-3xl p-6 transition-all border shadow-xs relative overflow-hidden flex flex-col justify-between ${
              b.daysLeft <= 7
                ? 'bg-gradient-to-br from-rose-50 via-amber-50 to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 border-rose-400 dark:border-rose-800 ring-2 ring-rose-500/30'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
            }`}
          >
            <div>
              {/* Card Top */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-4xl p-2 bg-rose-100 dark:bg-rose-950/60 rounded-2xl border border-rose-200 dark:border-rose-900">
                    {b.avatar}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-slate-800 dark:text-white">
                        {b.name}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {b.relationship}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-rose-500" />
                      {b.nextBdayDateStr} • Cumple <strong className="text-rose-600 dark:text-rose-400">{b.turningAge} años</strong>
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black ${
                      b.daysLeft === 0
                        ? 'bg-rose-500 text-white animate-bounce shadow-md shadow-rose-500/40'
                        : b.daysLeft <= 7
                        ? 'bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-300 border border-rose-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {b.daysLeft === 0 ? '🎉 ¡Es HOY!' : `Faltan ${b.daysLeft} días`}
                  </span>

                  <button
                    onClick={() => onDeleteBirthday(b.id)}
                    className="text-slate-400 hover:text-rose-500 p-1 transition-colors cursor-pointer"
                    title="Eliminar cumpleaños"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {b.notes && (
                <div className="mb-4 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800 italic">
                  💡 {b.notes}
                </div>
              )}

              {/* Gift Ideas Section */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-rose-500" />
                    <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                      Ideas de Regalo ({b.boughtGiftsCount}/{b.giftIdeas.length})
                    </h4>
                  </div>
                  <button
                    onClick={() => setActiveGiftModalBdayId(b.id)}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Añadir idea
                  </button>
                </div>

                {b.giftIdeas.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">No hay ideas de regalo anotadas todavía.</p>
                ) : (
                  <div className="space-y-2 max-h-[160px] overflow-y-auto no-scrollbar">
                    {b.giftIdeas.map((gift) => (
                      <div
                        key={gift.id}
                        className={`flex items-center justify-between p-2.5 rounded-xl text-xs transition-all ${
                          gift.bought
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 text-slate-500 dark:text-slate-400 border border-emerald-200 dark:border-emerald-900/40 line-through'
                            : 'bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={gift.bought}
                            onChange={() => onToggleGiftBought(b.id, gift.id)}
                            className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                          />
                          <div>
                            <span className="font-bold">{gift.title}</span>
                            {gift.assignedTo && (
                              <span className="text-[10px] text-slate-400 block font-normal">
                                Encargado por: {gift.assignedTo}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {gift.estimatedCost !== undefined && (
                            <span className="font-extrabold text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-md text-[11px]">
                              {gift.estimatedCost.toFixed(2)} €
                            </span>
                          )}
                          <button
                            onClick={() => onDeleteGiftIdea(b.id, gift.id)}
                            className="text-slate-400 hover:text-rose-500 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Total Budget Card Footer */}
            {b.totalGiftCost > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span>Presupuesto estimado total:</span>
                <span className="font-black text-slate-800 dark:text-slate-100 text-sm">
                  {b.totalGiftCost.toFixed(2)} €
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal Add Birthday */}
      {showAddBdayModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-extrabold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Cake className="w-5 h-5 text-rose-500" /> Añadir Cumpleaños
            </h3>

            <form onSubmit={handleAddBirthday} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nombre *</label>
                <input
                  type="text"
                  placeholder="Ej. Lucas, Abuelo José..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Parentesco</label>
                  <select
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="Papá">Papá</option>
                    <option value="Mamá">Mamá</option>
                    <option value="Hijo/a">Hijo/a</option>
                    <option value="Abuelo/a">Abuelo/a</option>
                    <option value="Tío/a">Tío/a</option>
                    <option value="Primo/a">Primo/a</option>
                    <option value="Amigo/a">Amigo/a</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Emoji / Avatar</label>
                  <input
                    type="text"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 text-center text-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Fecha de nacimiento *</label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Notas / Preferencias de tarta</label>
                <input
                  type="text"
                  placeholder="Ej. Tarta de chocolate, le encantan los coches..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddBdayModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white rounded-xl shadow-md cursor-pointer"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add Gift Idea */}
      {activeGiftModalBdayId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-extrabold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Gift className="w-5 h-5 text-rose-500" /> Añadir Idea de Regalo
            </h3>

            <form onSubmit={handleAddGiftSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Regalo o Idea *</label>
                <input
                  type="text"
                  placeholder="Ej. Juego de mesa, Libro, Zapatillas..."
                  value={giftTitle}
                  onChange={(e) => setGiftTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Coste estim. (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Ej. 30"
                    value={giftCost}
                    onChange={(e) => setGiftCost(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Quién lo compra</label>
                  <input
                    type="text"
                    placeholder="Ej. Papá y Mamá, Tía Ana..."
                    value={giftAssignedTo}
                    onChange={(e) => setGiftAssignedTo(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setActiveGiftModalBdayId(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white rounded-xl shadow-md cursor-pointer"
                >
                  Añadir Regalo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

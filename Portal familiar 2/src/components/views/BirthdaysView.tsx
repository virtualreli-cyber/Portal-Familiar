import React, { useState } from 'react';
import { FamilyData, Birthday, GiftIdea } from '../../types/family';
import { getDaysUntil, formatDateSpanish, getZodiacSign } from '../../utils/storage';
import { triggerBirthdayConfetti, triggerConfetti } from '../../utils/confetti';
import { 
  Cake, 
  Plus, 
  Gift, 
  PartyPopper, 
  Trash2
} from 'lucide-react';

interface BirthdaysViewProps {
  data: FamilyData;
  onUpdateData: (newData: FamilyData) => void;
}

export const BirthdaysView: React.FC<BirthdaysViewProps> = ({ data, onUpdateData }) => {
  const [showAddPersonModal, setShowAddModal] = useState(false);
  const [addingGiftToPersonId, setAddingGiftToPersonId] = useState<string | null>(null);

  // Add person form state
  const [personName, setPersonName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [avatar, setAvatar] = useState('🎂');
  const [notes, setNotes] = useState('');

  // Add gift form state
  const [giftTitle, setGiftTitle] = useState('');
  const [giftPrice, setGiftPrice] = useState('');

  // Calculations
  const birthdaysWithDays = data.birthdays.map((b) => ({
    ...b,
    daysUntil: getDaysUntil(b.date),
    zodiac: getZodiacSign(b.date),
  })).sort((a, b) => a.daysUntil - b.daysUntil);

  const handleAddPerson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!personName.trim() || !birthDate) return;

    const newPerson: Birthday = {
      id: `b-${Date.now()}`,
      personName: personName.trim(),
      relationship: relationship.trim() || 'Familiar',
      date: birthDate,
      avatar: avatar || '🎂',
      giftIdeas: [],
      notes: notes.trim() || undefined,
    };

    onUpdateData({
      ...data,
      birthdays: [...data.birthdays, newPerson],
    });

    setPersonName('');
    setRelationship('');
    setBirthDate('');
    setNotes('');
    setShowAddModal(false);
    triggerBirthdayConfetti();
  };

  const handleDeletePerson = (id: string) => {
    const updated = data.birthdays.filter((b) => b.id !== id);
    onUpdateData({ ...data, birthdays: updated });
  };

  const handleAddGift = (personId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!giftTitle.trim()) return;

    const newGift: GiftIdea = {
      id: `g-${Date.now()}`,
      title: giftTitle.trim(),
      estimatedPrice: giftPrice ? parseFloat(giftPrice) : undefined,
      status: 'Idea',
    };

    const updatedBirthdays = data.birthdays.map((b) => {
      if (b.id === personId) {
        return { ...b, giftIdeas: [...b.giftIdeas, newGift] };
      }
      return b;
    });

    onUpdateData({ ...data, birthdays: updatedBirthdays });
    setGiftTitle('');
    setGiftPrice('');
    setAddingGiftToPersonId(null);
    triggerConfetti();
  };

  const handleCycleGiftStatus = (personId: string, giftId: string) => {
    const statuses: ('Idea' | 'Reservado' | 'Comprado' | 'Envuelto')[] = ['Idea', 'Reservado', 'Comprado', 'Envuelto'];
    
    const updatedBirthdays = data.birthdays.map((b) => {
      if (b.id === personId) {
        const updatedGifts = b.giftIdeas.map((g) => {
          if (g.id === giftId) {
            const nextIdx = (statuses.indexOf(g.status) + 1) % statuses.length;
            const newStatus = statuses[nextIdx];
            if (newStatus === 'Comprado' || newStatus === 'Envuelto') {
              triggerConfetti();
            }
            return { ...g, status: newStatus };
          }
          return g;
        });
        return { ...b, giftIdeas: updatedGifts };
      }
      return b;
    });

    onUpdateData({ ...data, birthdays: updatedBirthdays });
  };

  const handleDeleteGift = (personId: string, giftId: string) => {
    const updatedBirthdays = data.birthdays.map((b) => {
      if (b.id === personId) {
        return { ...b, giftIdeas: b.giftIdeas.filter((g) => g.id !== giftId) };
      }
      return b;
    });
    onUpdateData({ ...data, birthdays: updatedBirthdays });
  };

  const getStatusBadge = (status: GiftIdea['status']) => {
    switch (status) {
      case 'Idea': return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
      case 'Reservado': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300';
      case 'Comprado': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300';
      case 'Envuelto': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300';
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 rounded-3xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold mb-2">
            <Cake className="w-3.5 h-3.5" /> Fiestas y Fechas Especiales
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">Cumpleaños y Lista de Regalos</h2>
          <p className="text-rose-100 text-xs sm:text-sm mt-1">
            Cuenta atrás para cada cumpleaños familiar, signo del zodíaco y lista de ideas de regalo.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-2xl bg-white text-slate-900 font-bold text-xs hover:bg-rose-50 transition flex items-center gap-2 shadow-md self-start md:self-auto"
        >
          <Plus className="w-4 h-4 text-rose-600" /> Añadir Cumpleañero
        </button>
      </div>

      {/* Birthday Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {birthdaysWithDays.map((person) => {
          const isToday = person.daysUntil === 0;

          return (
            <div
              key={person.id}
              className={`rounded-3xl p-5 border transition-all flex flex-col justify-between shadow-xs ${
                isToday
                  ? 'bg-gradient-to-br from-rose-50 to-pink-50 dark:from-slate-800 dark:to-slate-800/90 border-rose-400 dark:border-rose-500 ring-2 ring-rose-400'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
              }`}
            >
              <div>
                {/* Header card info */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl p-2 rounded-2xl bg-rose-50 dark:bg-slate-700">{person.avatar}</span>
                    <div>
                      <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">{person.personName}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{person.relationship}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeletePerson(person.id)}
                    className="p-1 text-slate-300 hover:text-rose-500 transition"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Date & Zodiac Badges */}
                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                  <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-700 font-bold text-slate-700 dark:text-slate-200">
                    📅 {formatDateSpanish(person.date)}
                  </span>
                  <span className="px-2.5 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/50 font-semibold text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    {person.zodiac}
                  </span>
                </div>

                {/* Countdown highlight banner */}
                <div className="mt-3 p-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-white flex items-center justify-between shadow-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-100 block">Cuenta Atrás</span>
                    <span className="text-sm font-black">
                      {isToday ? '🎉 ¡HOY ES SU CUMPLE! 🎂' : `Faltan ${person.daysUntil} días`}
                    </span>
                  </div>
                  <button
                    onClick={() => triggerBirthdayConfetti()}
                    className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs transition"
                    title="¡Lanzar Confeti!"
                  >
                    <PartyPopper className="w-4 h-4" />
                  </button>
                </div>

                {person.notes && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 italic">
                    💡 "{person.notes}"
                  </p>
                )}

                {/* Gift Ideas Wishlist Section */}
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Gift className="w-4 h-4 text-rose-500" /> Ideas de Regalo ({person.giftIdeas.length})
                    </span>
                    <button
                      onClick={() => setAddingGiftToPersonId(person.id)}
                      className="text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-0.5"
                    >
                      <Plus className="w-3.5 h-3.5" /> Idea
                    </button>
                  </div>

                  {/* Gift list items */}
                  {person.giftIdeas.length === 0 ? (
                    <p className="text-[11px] text-slate-400 py-2 italic text-center">Aún no hay ideas guardadas.</p>
                  ) : (
                    <div className="space-y-2">
                      {person.giftIdeas.map((gift) => (
                        <div key={gift.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700/80 flex items-center justify-between text-xs">
                          <div className="flex-1 pr-2">
                            <p className="font-bold text-slate-800 dark:text-slate-200">{gift.title}</p>
                            {gift.estimatedPrice && (
                              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                                Presupuesto: ~{gift.estimatedPrice.toFixed(2)} €
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleCycleGiftStatus(person.id, gift.id)}
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold cursor-pointer transition ${getStatusBadge(gift.status)}`}
                              title="Haz clic para cambiar estado (Idea -> Reservado -> Comprado -> Envuelto)"
                            >
                              {gift.status}
                            </button>
                            <button
                              onClick={() => handleDeleteGift(person.id, gift.id)}
                              className="text-slate-300 hover:text-rose-500 p-0.5"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Fast Add Gift Input Inline */}
                  {addingGiftToPersonId === person.id && (
                    <form onSubmit={(e) => handleAddGift(person.id, e)} className="mt-3 p-3 bg-rose-50 dark:bg-slate-900 rounded-2xl space-y-2 border border-rose-200 dark:border-slate-700">
                      <input
                        type="text"
                        required
                        placeholder="Nombre del regalo..."
                        value={giftTitle}
                        onChange={(e) => setGiftTitle(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white"
                      />
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="Precio €"
                          value={giftPrice}
                          onChange={(e) => setGiftPrice(e.target.value)}
                          className="w-24 px-2.5 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white"
                        />
                        <button type="submit" className="flex-1 py-1.5 rounded-xl bg-rose-500 text-white font-bold text-xs">
                          Guardar
                        </button>
                        <button type="button" onClick={() => setAddingGiftToPersonId(null)} className="px-2 text-xs text-slate-400">
                          ✕
                        </button>
                      </div>
                    </form>
                  )}
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add Person */}
      {showAddPersonModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Cake className="w-5 h-5 text-rose-500" /> Registrar Cumpleaños
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-xs text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddPerson} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Nombre de la persona *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Sofia, Tío Andrés..."
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Relación / Parentezco</label>
                <input
                  type="text"
                  placeholder="Ej: Hija, Abuela, Primo..."
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Fecha de Cumpleaños *</label>
                  <input
                    type="date"
                    required
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Avatar Emoji</label>
                  <input
                    type="text"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-center text-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Notas / Gustos personales</label>
                <textarea
                  rows={2}
                  placeholder="Ej: Le encantan los libros de fantasía y los juegos de mesa..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
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
                <button type="submit" className="px-6 py-2 rounded-xl bg-rose-500 text-white font-bold text-xs shadow-md">
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

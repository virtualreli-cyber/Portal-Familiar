import React, { useState } from 'react';
import { useFamily } from '../../context/FamilyContext';
import { useAuth } from '../../context/AuthContext';
import { GiftIdea } from '../../types';
import { 
  Cake, 
  Plus, 
  Gift, 
  Trash2, 
  X, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  Sparkles 
} from 'lucide-react';

export const BirthdaysView: React.FC = () => {
  const { birthdays, addBirthday, deleteBirthday, addGiftIdea, toggleGiftStatus } = useFamily();
  const { permissions } = useAuth();

  const [showAddBdayModal, setShowAddBdayModal] = useState<boolean>(false);
  const [activeGiftModalBdayId, setActiveGiftModalBdayId] = useState<string | null>(null);

  // Birthday form
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [avatar, setAvatar] = useState('🎂');
  const [notes, setNotes] = useState('');

  // Gift idea form
  const [giftTitle, setGiftTitle] = useState('');
  const [giftCost, setGiftCost] = useState('');

  const handleCreateBirthday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !birthDate) return;

    addBirthday({
      name: name.trim(),
      relationship: relationship.trim() || 'Familia/Amigo',
      birthDate,
      avatar: avatar || '🎂',
      notes: notes.trim() || undefined
    });

    setName('');
    setRelationship('');
    setBirthDate('');
    setShowAddBdayModal(false);
  };

  const handleCreateGiftIdea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!giftTitle.trim() || !activeGiftModalBdayId) return;

    addGiftIdea(activeGiftModalBdayId, {
      title: giftTitle.trim(),
      estimatedCost: giftCost ? parseFloat(giftCost) : undefined,
      status: 'Idea'
    });

    setGiftTitle('');
    setGiftCost('');
    setActiveGiftModalBdayId(null);
  };

  const getStatusBadge = (status: GiftIdea['status']) => {
    switch (status) {
      case 'Idea': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Reservado': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Comprado': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-100 text-rose-700">
              <Cake className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Cumpleaños e Ideas de Regalos</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Organiza las fechas señaladas de familiares y la lista de regalos comunitarios
          </p>
        </div>

        <button
          onClick={() => setShowAddBdayModal(true)}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1 shadow-md shadow-rose-200 active-touch shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Añadir Cumpleaños</span>
        </button>
      </div>

      {/* Birthdays Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {birthdays.map(bday => {
          const totalGiftEst = bday.giftIdeas.reduce((acc, g) => acc + (g.estimatedCost || 0), 0);

          return (
            <div key={bday.id} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{bday.avatar}</span>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{bday.name}</h3>
                    <p className="text-xs text-slate-500">{bday.relationship} • {bday.birthDate}</p>
                  </div>
                </div>

                <button
                  onClick={() => deleteBirthday(bday.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition active-touch"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {bday.notes && (
                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 italic">
                  "{bday.notes}"
                </p>
              )}

              {/* Gift Ideas Section */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <Gift className="w-3.5 h-3.5 text-rose-500" /> Ideas de Regalo ({bday.giftIdeas.length})
                  </h4>

                  <button
                    onClick={() => setActiveGiftModalBdayId(bday.id)}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 active-touch"
                  >
                    <Plus className="w-3.5 h-3.5" /> Añadir Regalo
                  </button>
                </div>

                {bday.giftIdeas.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No hay ideas de regalo añadidas todavía.</p>
                ) : (
                  <div className="space-y-2">
                    {bday.giftIdeas.map(gift => (
                      <div
                        key={gift.id}
                        onClick={() => toggleGiftStatus(bday.id, gift.id)}
                        className="bg-slate-50 hover:bg-slate-100 p-2.5 rounded-2xl border border-slate-200 flex items-center justify-between gap-2 cursor-pointer transition active-touch text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${getStatusBadge(gift.status)}`}>
                            {gift.status}
                          </span>
                          <span className="font-semibold text-slate-800">{gift.title}</span>
                        </div>

                        {gift.estimatedCost && (
                          <span className="font-bold text-slate-700">
                            {gift.estimatedCost.toFixed(2)} €
                          </span>
                        )}
                      </div>
                    ))}
                    {totalGiftEst > 0 && (
                      <p className="text-[11px] font-bold text-right text-slate-500 pt-1">
                        Presupuesto Total Est.: {totalGiftEst.toFixed(2)} €
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE BIRTHDAY MODAL */}
      {showAddBdayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col">
            <div className="bg-rose-600 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cake className="w-5 h-5" />
                <h3 className="font-bold text-lg">Añadir Cumpleaños</h3>
              </div>
              <button 
                onClick={() => setShowAddBdayModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            <form onSubmit={handleCreateBirthday} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nombre de la Persona *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Abuela Carmen, Tío Fernando..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Parentesco / Relación</label>
                  <input
                    type="text"
                    placeholder="Ej: Abuela, Primo..."
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Fecha Nacimiento *</label>
                  <input
                    type="date"
                    required
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Notas / Gustos</label>
                <textarea
                  rows={2}
                  placeholder="Gustos, tallas o aficiones..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddBdayModal(false)}
                  className="flex-1 py-3 border border-slate-200 rounded-xl font-semibold text-slate-600 text-sm active-touch"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-lg shadow-rose-200 text-sm active-touch"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE GIFT IDEA MODAL */}
      {activeGiftModalBdayId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col">
            <div className="bg-rose-600 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5" />
                <h3 className="font-bold text-lg">Añadir Idea de Regalo</h3>
              </div>
              <button 
                onClick={() => setActiveGiftModalBdayId(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            <form onSubmit={handleCreateGiftIdea} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Título del Regalo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Libro de historia, Balón oficial..."
                  value={giftTitle}
                  onChange={(e) => setGiftTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Precio Estimado (€)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Ej: 25.00"
                  value={giftCost}
                  onChange={(e) => setGiftCost(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveGiftModalBdayId(null)}
                  className="flex-1 py-3 border border-slate-200 rounded-xl font-semibold text-slate-600 text-sm active-touch"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-lg shadow-rose-200 text-sm active-touch"
                >
                  Guardar Regalo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

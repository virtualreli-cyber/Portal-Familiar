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
  Sparkles,
  Heart,
  Calendar,
  UserCheck
} from 'lucide-react';

export const BirthdaysView: React.FC = () => {
  const { anniversaries, birthdays, addGiftIdea, toggleGiftStatus, deleteBirthday } = useFamily();
  const { allMembers } = useAuth();

  const [activeGiftModalBdayId, setActiveGiftModalBdayId] = useState<string | null>(null);

  // Gift idea form
  const [giftTitle, setGiftTitle] = useState('');
  const [giftCost, setGiftCost] = useState('');

  // Combine items: Family Members with birthDate + Anniversaries + Standalone Birthdays
  const combinedItems = React.useMemo(() => {
    const list: Array<{
      id: string;
      name: string;
      relationship: string;
      dateStr: string;
      avatar: string;
      notes?: string;
      type: 'member' | 'anniversary' | 'custom';
      giftIdeas: GiftIdea[];
    }> = [];

    // 1. Family Members
    allMembers.forEach(m => {
      if (m.birthDate) {
        const bdayEntry = birthdays.find(b => b.id === m.id);
        list.push({
          id: m.id,
          name: m.name,
          relationship: `Miembro (${m.role})`,
          dateStr: m.birthDate,
          avatar: m.avatar || '👤',
          notes: m.notes,
          type: 'member',
          giftIdeas: bdayEntry?.giftIdeas || []
        });
      }
    });

    // 2. Custom Anniversaries from Settings
    anniversaries.forEach(a => {
      const bdayEntry = birthdays.find(b => b.id === a.id);
      list.push({
        id: a.id,
        name: a.title,
        relationship: `Aniversario (${a.type})`,
        dateStr: a.date,
        avatar: a.type === 'Boda' ? '💍' : a.type === 'Santo' ? '😇' : '❤️',
        notes: a.notes,
        type: 'anniversary',
        giftIdeas: bdayEntry?.giftIdeas || []
      });
    });

    // 3. Standalone Birthdays (previously saved)
    birthdays.forEach(b => {
      const isAlreadyInList = list.some(item => item.id === b.id);
      if (!isAlreadyInList) {
        list.push({
          id: b.id,
          name: b.name,
          relationship: b.relationship,
          dateStr: b.birthDate,
          avatar: b.avatar || '🎂',
          notes: b.notes,
          type: 'custom',
          giftIdeas: b.giftIdeas || []
        });
      }
    });

    return list;
  }, [allMembers, anniversaries, birthdays]);

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

  const activeTargetName = activeGiftModalBdayId 
    ? combinedItems.find(item => item.id === activeGiftModalBdayId)?.name || 'Persona/Celebración'
    : '';

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
            Gestión comunitaria de regalos basados en las fechas de nacimiento de la familia y aniversarios
          </p>
        </div>

        <div className="bg-rose-50 border border-rose-200 text-rose-900 px-3.5 py-2 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-rose-600 shrink-0" />
          <span>Fechas gestionadas desde Ajustes</span>
        </div>
      </div>

      {/* Birthdays & Anniversaries Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {combinedItems.length === 0 ? (
          <div className="col-span-full bg-white p-8 text-center rounded-3xl border border-slate-200 space-y-2">
            <Cake className="w-10 h-10 text-rose-400 mx-auto" />
            <p className="font-bold text-slate-800 text-sm">No hay cumpleaños ni aniversarios registrados.</p>
            <p className="text-xs text-slate-500">Configura las fechas de nacimiento de los miembros de la familia en Ajustes.</p>
          </div>
        ) : (
          combinedItems.map(item => {
            const totalGiftEst = item.giftIdeas.reduce((acc, g) => acc + (g.estimatedCost || 0), 0);

            return (
              <div key={item.id} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{item.avatar}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 text-base">{item.name}</h3>
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            item.type === 'member'
                              ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                              : item.type === 'anniversary'
                              ? 'bg-pink-100 text-pink-800 border border-pink-200'
                              : 'bg-rose-100 text-rose-800 border border-rose-200'
                          }`}>
                            {item.relationship}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-rose-500" />
                          <span>Fecha: {item.dateStr || 'No especificada'}</span>
                        </p>
                      </div>
                    </div>

                    {item.type === 'custom' && (
                      <button
                        onClick={() => deleteBirthday(item.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition active-touch"
                        title="Eliminar cumpleaños"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {item.notes && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 italic">
                      "{item.notes}"
                    </p>
                  )}

                  {/* Gift Ideas Section */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1">
                        <Gift className="w-3.5 h-3.5 text-rose-500" /> Ideas de Regalo ({item.giftIdeas.length})
                      </h4>

                      <button
                        onClick={() => setActiveGiftModalBdayId(item.id)}
                        className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 active-touch"
                      >
                        <Plus className="w-3.5 h-3.5" /> Añadir Regalo
                      </button>
                    </div>

                    {item.giftIdeas.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No hay ideas de regalo añadidas todavía.</p>
                    ) : (
                      <div className="space-y-2">
                        {item.giftIdeas.map(gift => (
                          <div
                            key={gift.id}
                            onClick={() => toggleGiftStatus(item.id, gift.id)}
                            className="bg-slate-50 hover:bg-slate-100 p-2.5 rounded-2xl border border-slate-200 flex items-center justify-between gap-2 cursor-pointer transition active-touch text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${getStatusBadge(gift.status)}`}>
                                {gift.status}
                              </span>
                              <span className="font-semibold text-slate-800">{gift.title}</span>
                            </div>

                            {gift.estimatedCost !== undefined && gift.estimatedCost !== null && (
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
              </div>
            );
          })
        )}
      </div>

      {/* CREATE GIFT IDEA MODAL */}
      {activeGiftModalBdayId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col">
            <div className="bg-rose-600 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5" />
                <div>
                  <h3 className="font-bold text-lg leading-tight">Añadir Idea de Regalo</h3>
                  <p className="text-xs text-rose-100">Para {activeTargetName}</p>
                </div>
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

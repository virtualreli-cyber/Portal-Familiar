import React, { useState } from 'react';
import { useFamily } from '../../context/FamilyContext';
import { useAuth } from '../../context/AuthContext';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { PRAYERS, getTodaySaint } from '../../data/santoral';
import { CatholicIntention } from '../../types';
import { 
  Cross, 
  BookOpen, 
  HeartHandshake, 
  Plus, 
  Check, 
  Trash2, 
  ChevronDown, 
  ChevronUp,
  Sparkles,
  X
} from 'lucide-react';

export const CatholicCornerView: React.FC = () => {
  const { intentions, addIntention, toggleIntention, deleteIntention } = useFamily();
  const { currentMember } = useAuth();
  
  const todaySaint = getTodaySaint();
  const [expandedPrayerId, setExpandedPrayerId] = useState<string | null>('rosario');
  const [showAddIntentionModal, setShowAddIntentionModal] = useState<boolean>(false);

  useBodyScrollLock(showAddIntentionModal);

  // Intention form
  const [title, setTitle] = useState('');
  const [type, setType] = useState<CatholicIntention['type']>('Misa');

  const handleCreateIntention = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addIntention({
      title: title.trim(),
      date: new Date().toISOString().split('T')[0],
      type,
      requestedBy: currentMember.name
    });

    setTitle('');
    setShowAddIntentionModal(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-indigo-800 space-y-4">
        <div className="flex items-center justify-between">
          <span className="bg-amber-400 text-slate-900 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider">
            ⛪ Rincón Católico & Vida Cristiana
          </span>
          <span className="bg-white/10 text-indigo-100 px-3 py-1 rounded-full text-xs font-bold">
            {todaySaint.season}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-amber-300">
              {todaySaint.name}
            </h2>
            <p className="text-sm font-semibold text-indigo-200 mt-0.5">
              {todaySaint.title}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 shrink-0 max-w-xs">
            <p className="text-xs text-indigo-200 font-semibold uppercase tracking-wider">Color Litúrgico:</p>
            <p className="text-sm font-bold text-amber-300 flex items-center gap-1.5 mt-0.5">
              <span className="w-3 h-3 rounded-full bg-emerald-400 border border-white/40 inline-block"></span>
              <span>{todaySaint.liturgicalColor}</span>
            </p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/10">
          "{todaySaint.bio}"
        </p>

        {todaySaint.quote && (
          <p className="text-xs italic text-amber-200 text-right">
            — "{todaySaint.quote}"
          </p>
        )}
      </div>

      {/* Grid: Oraciones y Lista de Intenciones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Oraciones Familiares */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-slate-900">Oraciones en Familia</h3>
          </div>

          <div className="space-y-3">
            {PRAYERS.map(prayer => {
              const isExpanded = expandedPrayerId === prayer.id;
              return (
                <div key={prayer.id} className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
                  <button
                    onClick={() => setExpandedPrayerId(isExpanded ? null : prayer.id)}
                    className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition active-touch"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center text-base font-bold shrink-0">
                        ✝️
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{prayer.title}</h4>
                        <p className="text-xs text-slate-500">{prayer.description}</p>
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>

                  {isExpanded && (
                    <div className="p-4 bg-slate-50 border-t border-slate-100 text-xs text-slate-700 leading-relaxed whitespace-pre-line font-serif italic">
                      {prayer.text}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Intenciones de Misa y Oración */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-rose-600" />
              <h3 className="text-lg font-bold text-slate-900">Intenciones de Misa y Oración</h3>
            </div>

            <button
              onClick={() => setShowAddIntentionModal(true)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1 shadow-md shadow-indigo-200 active-touch"
            >
              <Plus className="w-4 h-4" />
              <span>Pedir Intención</span>
            </button>
          </div>

          <div className="space-y-3">
            {intentions.length === 0 ? (
              <div className="bg-white p-8 text-center rounded-3xl border border-slate-200 space-y-2">
                <Sparkles className="w-8 h-8 text-indigo-400 mx-auto" />
                <p className="font-bold text-slate-800 text-sm">No hay intenciones registradas.</p>
                <p className="text-xs text-slate-500">¡Haz clic en "Pedir Intención" para ofrecer una misa o rosario!</p>
              </div>
            ) : (
              intentions.map(item => (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl p-4 border transition flex items-center justify-between gap-3 shadow-xs ${
                    item.completed ? 'opacity-60 bg-slate-50 border-slate-200' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleIntention(item.id)}
                      className={`w-6 h-6 rounded-lg border flex items-center justify-center transition active-touch shrink-0 ${
                        item.completed 
                          ? 'bg-emerald-500 border-emerald-600 text-white' 
                          : 'border-slate-300 hover:border-indigo-500 bg-white'
                      }`}
                    >
                      {item.completed && <Check className="w-4 h-4" />}
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="bg-indigo-100 text-indigo-800 font-extrabold text-[10px] px-2 py-0.5 rounded-full">
                          {item.type}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold">
                          Por {item.requestedBy}
                        </span>
                      </div>
                      <h4 className={`font-bold text-sm text-slate-900 mt-0.5 ${item.completed ? 'line-through text-slate-500' : ''}`}>
                        {item.title}
                      </h4>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteIntention(item.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition active-touch"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* CREATE INTENTION MODAL */}
      {showAddIntentionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col">
            <div className="bg-indigo-600 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cross className="w-5 h-5" />
                <h3 className="font-bold text-lg">Nueva Intención de Oración</h3>
              </div>
              <button 
                onClick={() => setShowAddIntentionModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            <form onSubmit={handleCreateIntention} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Intención / Petición *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Por la salud del abuelo, Acción de gracias..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Tipo de Ofrecimiento</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="Misa">Santa Misa</option>
                  <option value="Rosario">Santo Rosario</option>
                  <option value="Ofrecimiento">Ofrecimiento de Obras</option>
                  <option value="Novena">Novena</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddIntentionModal(false)}
                  className="flex-1 py-3 border border-slate-200 rounded-xl font-semibold text-slate-600 text-sm active-touch"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 text-sm active-touch"
                >
                  Guardar Intención
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

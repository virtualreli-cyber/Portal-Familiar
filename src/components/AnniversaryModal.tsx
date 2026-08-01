import React, { useState, useEffect } from 'react';
import { AnniversaryItem, FamilyMember } from '../types';
import { Heart, X, Check, Calendar, Tag, Users, FileText } from 'lucide-react';

interface AnniversaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (anniversary: Omit<AnniversaryItem, 'id'>) => void;
  editingAnniversary?: AnniversaryItem | null;
  allMembers: FamilyMember[];
}

const ANNIVERSARY_TYPES = [
  'Boda',
  'Santo',
  'Bautizo',
  'Comunión',
  'Empresa/Trabajo',
  'Otro'
];

export const AnniversaryModal: React.FC<AnniversaryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingAnniversary,
  allMembers
}) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Boda');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editingAnniversary) {
      setTitle(editingAnniversary.title || '');
      setType(editingAnniversary.type || 'Boda');
      setDate(editingAnniversary.date || new Date().toISOString().split('T')[0]);
      setMemberIds(editingAnniversary.memberIds || []);
      setNotes(editingAnniversary.notes || '');
    } else {
      setTitle('');
      setType('Boda');
      setDate(new Date().toISOString().split('T')[0]);
      setMemberIds(allMembers.map(m => m.id));
      setNotes('');
    }
  }, [editingAnniversary, isOpen, allMembers]);

  if (!isOpen) return null;

  const toggleMember = (mId: string) => {
    setMemberIds(prev =>
      prev.includes(mId) ? prev.filter(id => id !== mId) : [...prev, mId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    onSave({
      title: title.trim(),
      type,
      date,
      memberIds,
      notes: notes.trim() || undefined
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-rose-500 to-pink-600 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-white/20">
              <Heart className="w-5 h-5 fill-current text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">
                {editingAnniversary ? 'Editar Aniversario / Santo' : 'Nuevo Aniversario / Celebración'}
              </h3>
              <p className="text-xs text-rose-100">Guarda las fechas especiales para el calendario y recuerdos</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition active-touch"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              <span>Título del Aniversario o Celebración *</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Aniversario de Bodas de Plata, Santo de Carlos..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-rose-500" />
                <span>Tipo</span>
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-rose-500 focus:outline-none"
              >
                {ANNIVERSARY_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-rose-500" />
                <span>Fecha *</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-rose-500" />
              <span>Miembros Implicados</span>
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-1 bg-slate-50 rounded-xl border border-slate-200">
              {allMembers.map(member => {
                const isSelected = memberIds.includes(member.id);
                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => toggleMember(member.id)}
                    className={`p-2 rounded-xl border flex items-center justify-between text-xs font-semibold transition active-touch ${
                      isSelected
                        ? 'bg-rose-50 border-rose-500 text-rose-900 ring-1 ring-rose-500'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <span>{member.avatar}</span>
                      <span className="truncate">{member.name.split(' ')[0]}</span>
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-rose-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-rose-500" />
              <span>Notas u Observaciones (Opcional)</span>
            </label>
            <textarea
              rows={2}
              placeholder="Detalles especiales, tradición, ideas de regalos..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 text-xs active-touch hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-lg shadow-rose-200 text-xs active-touch"
            >
              Guardar Aniversario
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

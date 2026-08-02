import React, { useState } from 'react';
import { useFamily } from '../../context/FamilyContext';
import { useAuth } from '../../context/AuthContext';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { StickyNote as StickyNoteType } from '../../types';
import { ConfirmModal } from '../ConfirmModal';
import { 
  StickyNote as NoteIcon, 
  Plus, 
  Pin, 
  Trash2, 
  Edit3, 
  X,
  Sparkles
} from 'lucide-react';

const NOTE_COLORS: Record<StickyNoteType['color'], { bg: string; border: string; text: string; authorText: string }> = {
  purple: { bg: 'bg-[#e3dcfd]', border: 'border-[#cbbdfa]', text: 'text-slate-800', authorText: 'text-purple-900' },
  yellow: { bg: 'bg-[#ffec85]', border: 'border-[#fada5e]', text: 'text-slate-900', authorText: 'text-amber-900' },
  blue: { bg: 'bg-[#b6eeff]', border: 'border-[#8ee0ff]', text: 'text-slate-900', authorText: 'text-sky-900' },
  pink: { bg: 'bg-[#ffd6e7]', border: 'border-[#ffb3d1]', text: 'text-slate-900', authorText: 'text-pink-900' },
  green: { bg: 'bg-[#d2f8d2]', border: 'border-[#a8f0a8]', text: 'text-slate-900', authorText: 'text-emerald-900' }
};

export const FridgeNotesView: React.FC = () => {
  const { stickyNotes, addStickyNote, editStickyNote, togglePinNote, deleteStickyNote } = useFamily();
  const { currentMember } = useAuth();

  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState<StickyNoteType | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useBodyScrollLock(showModal || deletingId !== null);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState<StickyNoteType['color']>('yellow');

  const openAddModal = () => {
    setEditingNote(null);
    setTitle('');
    setContent('');
    setColor('yellow');
    setShowModal(true);
  };

  const openEditModal = (note: StickyNoteType) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setColor(note.color);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    if (editingNote) {
      editStickyNote(editingNote.id, {
        title,
        content,
        color
      });
    } else {
      addStickyNote({
        title,
        content,
        color,
        author: currentMember.name.split(' ')[0],
        pinned: false
      });
    }

    setShowModal(false);
  };

  const sortedNotes = [...stickyNotes].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  return (
    <div className="space-y-6 pb-12 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-100 text-amber-700 font-bold text-xl">
            📌
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Notas de Nevera</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Post-its familiares, recados y recordatorios para la casa
            </p>
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-200 active-touch shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Escribir Nota</span>
        </button>
      </div>

      {/* Grid of Post-it Notes matching reference photo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
        {sortedNotes.map((note, index) => {
          const colorMeta = NOTE_COLORS[note.color] || NOTE_COLORS.yellow;
          // Alternate rotation angle matching attached photo aesthetic
          const rotationClass = index % 3 === 0 ? '-rotate-1' : index % 3 === 1 ? 'rotate-1' : 'rotate-0';

          return (
            <div
              key={note.id}
              className={`relative ${colorMeta.bg} border ${colorMeta.border} rounded-2xl p-5 shadow-md shadow-slate-200/50 hover:shadow-lg transition transform hover:-translate-y-1 ${rotationClass} flex flex-col justify-between min-h-[170px] space-y-4`}
            >
              {/* Note Header / Controls */}
              <div className="flex items-start justify-between gap-2">
                <h3 className={`font-bold text-base ${colorMeta.text} leading-snug break-words flex-1`}>
                  {note.title || note.content.slice(0, 30)}
                </h3>

                <div className="flex items-center gap-1 shrink-0 opacity-80 hover:opacity-100">
                  <button
                    onClick={() => togglePinNote(note.id)}
                    className={`p-1 rounded-lg transition ${note.pinned ? 'text-amber-800 font-bold scale-110' : 'text-slate-500 hover:text-slate-900'}`}
                    title={note.pinned ? 'Desfijar' : 'Fijar arriba'}
                  >
                    <Pin className="w-4 h-4 fill-current" />
                  </button>
                  <button
                    onClick={() => openEditModal(note)}
                    className="p-1 text-slate-600 hover:text-slate-900 rounded-lg transition"
                    title="Editar"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingId(note.id)}
                    className="p-1 text-rose-600 hover:text-rose-900 rounded-lg transition"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Note Body */}
              <p className={`text-sm sm:text-base font-semibold ${colorMeta.text} whitespace-pre-wrap leading-relaxed`}>
                {note.content}
              </p>

              {/* Note Signature matching reference photo: — Author */}
              <div className="pt-2 border-t border-slate-900/10 flex items-center justify-between">
                <span className={`text-xs font-extrabold ${colorMeta.authorText}`}>
                  — {note.author}
                </span>
                <span className="text-[10px] font-medium text-slate-500">
                  {note.createdAt}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Note Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-lg">
                {editingNote ? 'Editar Nota de Nevera' : 'Escribir Nota en la Nevera'}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Título (Opcional)</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Ej: ¡Llevar el coche al taller!"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mensaje de la Nota *</label>
                <textarea
                  required
                  rows={3}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Escribe aquí el recado para la familia..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Color del Post-it</label>
                <div className="flex items-center gap-2">
                  {[
                    { id: 'yellow', label: 'Amarillo', bg: 'bg-[#ffec85] border-[#fada5e]' },
                    { id: 'purple', label: 'Morado', bg: 'bg-[#e3dcfd] border-[#cbbdfa]' },
                    { id: 'blue', label: 'Azul', bg: 'bg-[#b6eeff] border-[#8ee0ff]' },
                    { id: 'pink', label: 'Rosa', bg: 'bg-[#ffd6e7] border-[#ffb3d1]' },
                    { id: 'green', label: 'Verde', bg: 'bg-[#d2f8d2] border-[#a8f0a8]' }
                  ].map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setColor(c.id as any)}
                      className={`w-8 h-8 rounded-full border-2 transition transform ${c.bg} ${
                        color === c.id ? 'scale-110 ring-2 ring-amber-500' : 'opacity-80'
                      }`}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md shadow-amber-200"
                >
                  {editingNote ? 'Guardar Cambios' : 'Pegar en la Nevera'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingId}
        onCancel={() => setDeletingId(null)}
        onConfirm={() => {
          if (deletingId) deleteStickyNote(deletingId);
          setDeletingId(null);
        }}
      />
    </div>
  );
};

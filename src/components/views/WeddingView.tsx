import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useFamily } from '../../context/FamilyContext';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { WeddingNote, WeddingTask } from '../../types';
import { ConfirmModal } from '../ConfirmModal';
import { 
  Heart, 
  CheckSquare, 
  StickyNote, 
  Plus, 
  Trash2, 
  Edit3,
  Check, 
  X, 
  Sparkles,
  Filter
} from 'lucide-react';

export const WeddingView: React.FC = () => {
  const { currentMember } = useAuth();
  const {
    weddingTasks,
    weddingNotes,
    addWeddingTask,
    toggleWeddingTask,
    editWeddingTask,
    deleteWeddingTask,
    addWeddingNote,
    editWeddingNote,
    deleteWeddingNote
  } = useFamily();

  const [activeWeddingTab, setActiveWeddingTab] = useState<'todo' | 'notes'>('todo');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');

  // Task Modal (Add/Edit)
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<WeddingTask | null>(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskCategory, setTaskCategory] = useState('General');

  // Note Modal (Add/Edit)
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [editingNote, setEditingNote] = useState<WeddingNote | null>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

  // Confirmation Modal
  const [deletingType, setDeletingType] = useState<'task' | 'note' | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useBodyScrollLock(showTaskModal || showNoteModal || deletingId !== null);

  // Filter and sort tasks: Pending tasks ALWAYS appear ABOVE completed tasks!
  const filteredWeddingTasks = weddingTasks.filter(t => {
    if (filterStatus === 'pending' && t.completed) return false;
    if (filterStatus === 'completed' && !t.completed) return false;
    return true;
  }).sort((a, b) => Number(a.completed) - Number(b.completed));

  const handleOpenAddTask = () => {
    setEditingTask(null);
    setTaskTitle('');
    setTaskCategory('General');
    setShowTaskModal(true);
  };

  const handleOpenEditTask = (task: WeddingTask) => {
    setEditingTask(task);
    setTaskTitle(task.title);
    setTaskCategory(task.category);
    setShowTaskModal(true);
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    if (editingTask) {
      editWeddingTask(editingTask.id, { title: taskTitle.trim(), category: taskCategory.trim() });
    } else {
      addWeddingTask({ title: taskTitle.trim(), category: taskCategory.trim() || 'General' });
    }
    setShowTaskModal(false);
  };

  const handleOpenAddNote = () => {
    setEditingNote(null);
    setNoteTitle('');
    setNoteContent('');
    setShowNoteModal(true);
  };

  const handleOpenEditNote = (note: WeddingNote) => {
    setEditingNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setShowNoteModal(true);
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;

    if (editingNote) {
      editWeddingNote(editingNote.id, { title: noteTitle.trim() || 'Nota de Boda', content: noteContent.trim() });
    } else {
      addWeddingNote({
        title: noteTitle.trim() || 'Nota de Boda',
        content: noteContent.trim(),
        author: currentMember?.name ? currentMember.name.split(' ')[0] : 'Familia',
        date: new Date().toISOString().split('T')[0]
      });
    }
    setShowNoteModal(false);
  };

  return (
    <div className="space-y-6 pb-12 overflow-x-hidden">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-rose-500 via-pink-600 to-purple-700 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-15 text-9xl select-none pointer-events-none">
          💒
        </div>

        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2">
            <span className="bg-white text-rose-700 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 fill-current text-rose-500" /> Especial Boda
            </span>
            <span className="bg-white/20 text-rose-100 px-3 py-1 rounded-full text-xs font-semibold">
              Sección Temporal
            </span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
            Planificación de Nuestra Boda 💒
          </h2>

          <p className="text-xs sm:text-sm text-pink-100 max-w-xl leading-relaxed">
            Checklist de preparativos y notas de ideas organizadas.
          </p>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 gap-2 pt-2 max-w-xs">
            <div className="bg-white/10 backdrop-blur-xs p-2.5 rounded-2xl border border-white/20 text-center">
              <p className="text-[10px] text-pink-200 uppercase font-bold">Tareas Boda</p>
              <p className="text-base font-extrabold text-white">{weddingTasks.filter(t => t.completed).length} / {weddingTasks.length}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xs p-2.5 rounded-2xl border border-white/20 text-center">
              <p className="text-[10px] text-pink-200 uppercase font-bold">Notas & Ideas</p>
              <p className="text-base font-extrabold text-amber-300">{weddingNotes.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Subtabs Navigation (Sin lista de invitados) */}
      <div className="grid grid-cols-2 gap-2 bg-slate-200/60 p-1.5 rounded-2xl">
        <button
          onClick={() => setActiveWeddingTab('todo')}
          className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition active-touch ${
            activeWeddingTab === 'todo' ? 'bg-white text-rose-600 shadow-xs' : 'text-slate-600 hover:bg-white/50'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Tareas Boda ({weddingTasks.filter(t => !t.completed).length})</span>
        </button>

        <button
          onClick={() => setActiveWeddingTab('notes')}
          className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition active-touch ${
            activeWeddingTab === 'notes' ? 'bg-white text-rose-600 shadow-xs' : 'text-slate-600 hover:bg-white/50'
          }`}
        >
          <StickyNote className="w-4 h-4" />
          <span>Notas e Ideas ({weddingNotes.length})</span>
        </button>
      </div>

      {/* SUBTAB 1: TAREAS BODA */}
      {activeWeddingTab === 'todo' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-rose-500" />
              Lista de Tareas y Preparativos de Boda
            </h3>

            <div className="flex items-center gap-2">
              {/* Filter Selector */}
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value as any)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
              >
                <option value="all">Todas las tareas</option>
                <option value="pending">Pendientes únicamente</option>
                <option value="completed">Completadas</option>
              </select>

              <button
                onClick={handleOpenAddTask}
                className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow-md shadow-rose-100 active-touch shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Nueva Tarea</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {filteredWeddingTasks.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl space-y-1">
                <Sparkles className="w-8 h-8 text-rose-400 mx-auto" />
                <p className="font-bold text-xs text-slate-700">No hay tareas que coincidan con el filtro.</p>
              </div>
            ) : (
              filteredWeddingTasks.map(t => (
                <div 
                  key={t.id}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition ${
                    t.completed ? 'bg-slate-50/80 border-slate-200 opacity-60' : 'bg-white border-slate-200 hover:border-rose-300'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <button
                      onClick={() => toggleWeddingTask(t.id)}
                      className={`w-5 h-5 rounded-lg border flex items-center justify-center transition shrink-0 ${
                        t.completed ? 'bg-rose-500 border-rose-500 text-white' : 'border-slate-300 hover:border-rose-500'
                      }`}
                    >
                      {t.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>

                    <div className="truncate">
                      <p className={`font-semibold text-xs sm:text-sm text-slate-900 truncate ${t.completed ? 'line-through text-slate-400' : ''}`}>
                        {t.title}
                      </p>
                      <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
                        {t.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleOpenEditTask(t)}
                      className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg"
                      title="Editar tarea"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setDeletingType('task');
                        setDeletingId(t.id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                      title="Eliminar tarea"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 2: NOTAS E IDEAS */}
      {activeWeddingTab === 'notes' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <StickyNote className="w-5 h-5 text-amber-500" />
              Notas e Ideas de la Boda
            </h3>

            <button
              onClick={handleOpenAddNote}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow-md shadow-amber-100 active-touch shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Nota</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {weddingNotes.map(n => (
              <div key={n.id} className="p-4 bg-pink-50/70 border border-pink-200 rounded-2xl space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-pink-950">{n.title}</h4>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleOpenEditNote(n)} className="p-1 text-slate-500 hover:text-pink-950">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setDeletingType('note');
                          setDeletingId(n.id);
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-700 whitespace-pre-wrap mt-1">{n.content}</p>
                </div>

                <div className="text-[10px] font-bold text-pink-900 pt-2 border-t border-pink-200/60 flex items-center justify-between">
                  <span>— {n.author}</span>
                  <span>{n.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TASK MODAL (ADD / EDIT) */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-lg">
                {editingTask ? 'Editar Tarea de Boda' : 'Nueva Tarea de Boda'}
              </h3>
              <button onClick={() => setShowTaskModal(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSaveTask} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Título de la Tarea *</label>
                <input required type="text" value={taskTitle} onChange={e => setTaskTitle(e.target.value)} placeholder="Ej: Reservar fotógrafo..." className="w-full px-3.5 py-2.5 border rounded-xl outline-none" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Categoría</label>
                <input type="text" value={taskCategory} onChange={e => setTaskCategory(e.target.value)} placeholder="Lugar, Banquete, Vestido..." className="w-full px-3.5 py-2.5 border rounded-xl outline-none" />
              </div>
              <div className="pt-2 flex gap-2">
                <button type="button" onClick={() => setShowTaskModal(false)} className="flex-1 py-2.5 border rounded-xl font-bold text-slate-600">Cancelar</button>
                <button type="submit" className="flex-1 py-2.5 bg-rose-600 text-white font-bold rounded-xl shadow-md">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NOTE MODAL (ADD / EDIT) */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-lg">
                {editingNote ? 'Editar Nota de Boda' : 'Nueva Nota de Boda'}
              </h3>
              <button onClick={() => setShowNoteModal(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSaveNote} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Título de la Nota</label>
                <input type="text" value={noteTitle} onChange={e => setNoteTitle(e.target.value)} placeholder="Ej: Presupuesto..." className="w-full px-3.5 py-2.5 border rounded-xl outline-none" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Contenido *</label>
                <textarea required rows={3} value={noteContent} onChange={e => setNoteContent(e.target.value)} placeholder="Escribe aquí los detalles..." className="w-full px-3.5 py-2.5 border rounded-xl outline-none" />
              </div>
              <div className="pt-2 flex gap-2">
                <button type="button" onClick={() => setShowNoteModal(false)} className="flex-1 py-2.5 border rounded-xl font-bold text-slate-600">Cancelar</button>
                <button type="submit" className="flex-1 py-2.5 bg-amber-500 text-white font-bold rounded-xl shadow-md">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION DELETION MODAL */}
      <ConfirmModal
        isOpen={!!deletingId}
        onCancel={() => {
          setDeletingId(null);
          setDeletingType(null);
        }}
        onConfirm={() => {
          if (deletingId) {
            if (deletingType === 'task') deleteWeddingTask(deletingId);
            if (deletingType === 'note') deleteWeddingNote(deletingId);
          }
          setDeletingId(null);
          setDeletingType(null);
        }}
      />
    </div>
  );
};

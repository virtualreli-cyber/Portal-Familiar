import React, { useState } from 'react';
import { FamilyMember, StickyNote, EmergencyContact, FamilyRole } from '../types';
import { 
  Users, Plus, Pin, Phone, Shirt, HeartPulse, Trash2, ShieldAlert, StickyNote as NoteIcon
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface FamilyProfileViewProps {
  familyMembers: FamilyMember[];
  stickyNotes: StickyNote[];
  emergencyContacts: EmergencyContact[];
  onAddMember: (member: Omit<FamilyMember, 'id'>) => void;
  onUpdateMember: (member: FamilyMember) => void;
  onDeleteMember: (id: string) => void;
  onAddNote: (note: Omit<StickyNote, 'id' | 'createdAt'>) => void;
  onTogglePinNote: (id: string) => void;
  onDeleteNote: (id: string) => void;
  onAddContact: (contact: Omit<EmergencyContact, 'id'>) => void;
  onDeleteContact: (id: string) => void;
}

const COLOR_PASTELS: Record<StickyNote['color'], { bg: string; border: string; text: string }> = {
  yellow: { bg: 'bg-amber-100 dark:bg-amber-950/60', border: 'border-amber-300 dark:border-amber-800', text: 'text-amber-900 dark:text-amber-200' },
  pink: { bg: 'bg-rose-100 dark:bg-rose-950/60', border: 'border-rose-300 dark:border-rose-800', text: 'text-rose-900 dark:text-rose-200' },
  blue: { bg: 'bg-sky-100 dark:bg-sky-950/60', border: 'border-sky-300 dark:border-sky-800', text: 'text-sky-900 dark:text-sky-200' },
  green: { bg: 'bg-emerald-100 dark:bg-emerald-950/60', border: 'border-emerald-300 dark:border-emerald-800', text: 'text-emerald-900 dark:text-emerald-200' },
  purple: { bg: 'bg-purple-100 dark:bg-purple-950/60', border: 'border-purple-300 dark:border-purple-800', text: 'text-purple-900 dark:text-purple-200' }
};

export const FamilyProfileView: React.FC<FamilyProfileViewProps> = ({
  familyMembers,
  stickyNotes,
  emergencyContacts,
  onAddMember,
  onDeleteMember,
  onAddNote,
  onTogglePinNote,
  onDeleteNote,
  onAddContact,
  onDeleteContact,
}) => {
  const [activeTab, setActiveTab] = useState<'members' | 'fridge' | 'emergency'>('members');
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  // Form states member
  const [name, setName] = useState('');
  const [role, setRole] = useState<FamilyRole>('Hijo');
  const [avatar, setAvatar] = useState('👦');
  const [birthDate, setBirthDate] = useState('2015-01-01');
  const [allergies, setAllergies] = useState('');
  const [shirtSize, setShirtSize] = useState('');
  const [shoesSize, setShoesSize] = useState('');
  const [phone, setPhone] = useState('');
  const [notes] = useState('');

  // Form states note
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteColor, setNoteColor] = useState<StickyNote['color']>('yellow');
  const [noteAuthor, setNoteAuthor] = useState(familyMembers[0]?.name || 'Papá');

  // Form states contact
  const [contactName, setContactName] = useState('');
  const [contactRelation, setContactRelation] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactNotes, setContactNotes] = useState('');

  const handleMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddMember({
      name: name.trim(),
      role,
      avatar,
      color: '#3b82f6',
      birthDate,
      points: 0,
      allergies: allergies ? allergies.split(',').map(s => s.trim()) : undefined,
      clothingSizes: { shirt: shirtSize || undefined, shoes: shoesSize || undefined },
      phone: phone.trim() || undefined,
      notes: notes.trim() || undefined
    });

    setName('');
    setShowMemberModal(false);
    confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
  };

  const handleNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim()) return;

    onAddNote({
      title: noteTitle.trim(),
      content: noteContent.trim(),
      color: noteColor,
      author: noteAuthor,
      pinned: true
    });

    setNoteTitle('');
    setNoteContent('');
    setShowNoteModal(false);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactPhone.trim()) return;

    onAddContact({
      name: contactName.trim(),
      relationOrType: contactRelation.trim() || 'General',
      phone: contactPhone.trim(),
      notes: contactNotes.trim() || undefined
    });

    setContactName('');
    setContactPhone('');
    setShowContactModal(false);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header & Subtabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-600 text-white rounded-2xl shadow-md shadow-cyan-600/20">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white">
              Familia, Fichas y Tablón
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Datos personales, tallas de ropa, alergias, notas adhesivas y teléfonos de emergencia
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Sub-tabs */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('members')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                activeTab === 'members'
                  ? 'bg-white dark:bg-slate-700 text-cyan-600 dark:text-cyan-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              👨‍👩‍👧‍👦 Fichas
            </button>
            <button
              onClick={() => setActiveTab('fridge')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                activeTab === 'fridge'
                  ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              📌 Nevera ({stickyNotes.length})
            </button>
            <button
              onClick={() => setActiveTab('emergency')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                activeTab === 'emergency'
                  ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              🚨 Contactos
            </button>
          </div>

          {activeTab === 'members' && (
            <button
              onClick={() => setShowMemberModal(true)}
              className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-cyan-600/20 flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir Miembro</span>
            </button>
          )}

          {activeTab === 'fridge' && (
            <button
              onClick={() => setShowNoteModal(true)}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Nota</span>
            </button>
          )}

          {activeTab === 'emergency' && (
            <button
              onClick={() => setShowContactModal(true)}
              className="px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-rose-500/20 flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir Contacto</span>
            </button>
          )}
        </div>
      </div>

      {/* MEMBERS TAB */}
      {activeTab === 'members' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {familyMembers.map((m) => (
            <div
              key={m.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 hover:border-cyan-400 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl p-2 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                      {m.avatar}
                    </span>
                    <div>
                      <h3 className="text-lg font-black text-slate-800 dark:text-white">
                        {m.name}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300">
                        {m.role}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteMember(m.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                    title="Eliminar miembro"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  {m.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-cyan-600" />
                      <span>{m.phone}</span>
                    </div>
                  )}

                  {m.allergies && m.allergies.length > 0 && (
                    <div className="flex items-start gap-2 p-2 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 border border-rose-200/50">
                      <HeartPulse className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="block font-bold">Alergias / Atención médica:</strong>
                        <span>{m.allergies.join(', ')}</span>
                      </div>
                    </div>
                  )}

                  {m.clothingSizes && (
                    <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                      <Shirt className="w-4 h-4 text-indigo-500" />
                      <div className="flex items-center gap-3 text-[11px]">
                        {m.clothingSizes.shirt && <span>Ropa: <strong>{m.clothingSizes.shirt}</strong></span>}
                        {m.clothingSizes.shoes && <span>Calzado: <strong>{m.clothingSizes.shoes}</strong></span>}
                      </div>
                    </div>
                  )}

                  {m.notes && (
                    <p className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 italic">
                      "{m.notes}"
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span>Puntos acumulados:</span>
                <span className="font-extrabold text-amber-600 dark:text-amber-400">
                  {m.points} pts
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FRIDGE / STICKY NOTES TAB */}
      {activeTab === 'fridge' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stickyNotes.map((note) => {
            const style = COLOR_PASTELS[note.color] || COLOR_PASTELS.yellow;

            return (
              <div
                key={note.id}
                className={`p-5 rounded-3xl border shadow-sm transition-all flex flex-col justify-between space-y-4 ${style.bg} ${style.border} ${style.text}`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-extrabold text-base flex items-center gap-2">
                      <NoteIcon className="w-4 h-4 opacity-70" /> {note.title}
                    </h4>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onTogglePinNote(note.id)}
                        className={`p-1 rounded-lg transition-colors cursor-pointer ${
                          note.pinned ? 'text-amber-600 dark:text-amber-300 font-bold' : 'opacity-40 hover:opacity-100'
                        }`}
                        title={note.pinned ? 'Desfijar de la portada' : 'Fijar en portada'}
                      >
                        <Pin className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteNote(note.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs whitespace-pre-wrap leading-relaxed font-sans opacity-90">
                    {note.content}
                  </p>
                </div>

                <div className="text-[10px] font-bold opacity-70 flex items-center justify-between pt-2 border-t border-black/10 dark:border-white/10">
                  <span>Por: {note.author}</span>
                  <span>{note.createdAt}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* EMERGENCY CONTACTS TAB */}
      {activeTab === 'emergency' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-800 dark:text-rose-300 text-xs font-medium flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-rose-500 flex-shrink-0" />
            <span>
              Teléfonos de urgencia y contactos frecuentes guardados en tu navegador. Consulta fácil en cualquier imprevisto.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {emergencyContacts.map((contact) => (
              <div
                key={contact.id}
                className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-rose-100 dark:bg-rose-950 text-rose-600 rounded-2xl font-bold">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-extrabold text-slate-800 dark:text-white">
                      {contact.name}
                    </h4>
                    <p className="text-xs font-bold text-rose-600 dark:text-rose-400">
                      {contact.phone}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {contact.relationOrType} {contact.address ? `• ${contact.address}` : ''}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteContact(contact.id)}
                  className="p-2 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Add Member */}
      {showMemberModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-extrabold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-600" /> Añadir Miembro de la Familia
            </h3>

            <form onSubmit={handleMemberSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nombre *</label>
                <input
                  type="text"
                  placeholder="Ej. Lucas, Carmen, Papá..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Rol</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as FamilyRole)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="Papá">Papá</option>
                    <option value="Mamá">Mamá</option>
                    <option value="Hijo">Hijo</option>
                    <option value="Hija">Hija</option>
                    <option value="Abuelo">Abuelo</option>
                    <option value="Abuela">Abuela</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Avatar Emoji</label>
                  <input
                    type="text"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-center text-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Fecha de nacimiento</label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Talla Ropa</label>
                  <input
                    type="text"
                    placeholder="Ej. M, L, 10 años"
                    value={shirtSize}
                    onChange={(e) => setShirtSize(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Talla Calzado</label>
                  <input
                    type="text"
                    placeholder="Ej. 38, 42..."
                    value={shoesSize}
                    onChange={(e) => setShoesSize(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Alergias o Nota médica</label>
                <input
                  type="text"
                  placeholder="Ej. Lactosa, Polen, Frutos secos..."
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Teléfono</label>
                <input
                  type="text"
                  placeholder="Ej. 612 345 678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowMemberModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl shadow-md cursor-pointer"
                >
                  Guardar Miembro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add Note */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-extrabold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <NoteIcon className="w-5 h-5 text-amber-500" /> Nueva Nota Adhesiva
            </h3>

            <form onSubmit={handleNoteSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Título *</label>
                <input
                  type="text"
                  placeholder="Ej. Clave WiFi, Seguro de Hogar..."
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Contenido / Mensaje</label>
                <textarea
                  rows={3}
                  placeholder="Escribe la nota..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Color del Post-It</label>
                  <select
                    value={noteColor}
                    onChange={(e) => setNoteColor(e.target.value as StickyNote['color'])}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="yellow">🟡 Amarillo</option>
                    <option value="pink">Rosa</option>
                    <option value="blue">🔵 Azul</option>
                    <option value="green">🟢 Verde</option>
                    <option value="purple">🟣 Morado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Autor/a</label>
                  <select
                    value={noteAuthor}
                    onChange={(e) => setNoteAuthor(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {familyMembers.map(m => (
                      <option key={m.id} value={m.name}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNoteModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-md cursor-pointer"
                >
                  Fijar Nota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add Contact */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-extrabold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5 text-rose-500" /> Añadir Contacto de Emergencia
            </h3>

            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nombre / Servicio *</label>
                <input
                  type="text"
                  placeholder="Ej. Pediatra, Fontanero urgente, Colegio..."
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Teléfono *</label>
                  <input
                    type="text"
                    placeholder="Ej. 918 55 44 33"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Relación / Tipo</label>
                  <input
                    type="text"
                    placeholder="Ej. Salud, Seguro Hogar..."
                    value={contactRelation}
                    onChange={(e) => setContactRelation(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Notas adicionales</label>
                <input
                  type="text"
                  placeholder="Ej. Nº de Póliza o Dirección..."
                  value={contactNotes}
                  onChange={(e) => setContactNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowContactModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white rounded-xl shadow-md cursor-pointer"
                >
                  Guardar Contacto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

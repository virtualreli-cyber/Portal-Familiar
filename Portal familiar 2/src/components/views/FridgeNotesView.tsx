import React, { useState } from 'react';
import { FamilyData, FridgeNote, EmergencyContact } from '../../types/family';
import { triggerConfetti } from '../../utils/confetti';
import { 
  Pin, 
  Plus, 
  Trash2, 
  PhoneCall, 
  Wifi, 
  Copy, 
  Check, 
  HeartHandshake
} from 'lucide-react';

interface FridgeNotesViewProps {
  data: FamilyData;
  onUpdateData: (newData: FamilyData) => void;
}

export const FridgeNotesView: React.FC<FridgeNotesViewProps> = ({ data, onUpdateData }) => {
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteColor, setNewNoteColor] = useState<'yellow' | 'pink' | 'blue' | 'green' | 'purple'>('yellow');

  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactCategory, setContactCategory] = useState<'Médico' | 'Emergencia' | 'Hogar' | 'Mascota' | 'Escuela'>('Hogar');
  const [contactNotes, setContactNotes] = useState('');

  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);
  const [copiedWifi, setCopiedWifi] = useState(false);

  const activeMember = data.members.find((m) => m.id === data.activeMemberId) || data.members[0];

  // Note colors mapping
  const noteColorClasses = {
    yellow: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-900/60 dark:text-amber-100 dark:border-amber-700',
    pink: 'bg-pink-100 text-pink-900 border-pink-300 dark:bg-pink-900/60 dark:text-pink-100 dark:border-pink-700',
    blue: 'bg-sky-100 text-sky-900 border-sky-300 dark:bg-sky-900/60 dark:text-sky-100 dark:border-sky-700',
    green: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-900/60 dark:text-emerald-100 dark:border-emerald-700',
    purple: 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-900/60 dark:text-purple-100 dark:border-purple-700',
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    const newNote: FridgeNote = {
      id: `fn-${Date.now()}`,
      text: newNoteText.trim(),
      authorMemberId: activeMember.id,
      color: newNoteColor,
      createdAt: new Date().toISOString().split('T')[0],
      isPinned: true,
    };

    onUpdateData({
      ...data,
      fridgeNotes: [newNote, ...data.fridgeNotes],
    });

    setNewNoteText('');
    triggerConfetti();
  };

  const handleDeleteNote = (noteId: string) => {
    const updated = data.fridgeNotes.filter((n) => n.id !== noteId);
    onUpdateData({ ...data, fridgeNotes: updated });
  };

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactPhone.trim()) return;

    const newContact: EmergencyContact = {
      id: `ec-${Date.now()}`,
      name: contactName.trim(),
      phone: contactPhone.trim(),
      category: contactCategory,
      notes: contactNotes.trim() || undefined,
    };

    onUpdateData({
      ...data,
      emergencyContacts: [...data.emergencyContacts, newContact],
    });

    setContactName('');
    setContactPhone('');
    setContactNotes('');
    setShowAddContactModal(false);
    triggerConfetti();
  };

  const handleDeleteContact = (contactId: string) => {
    const updated = data.emergencyContacts.filter((c) => c.id !== contactId);
    onUpdateData({ ...data, emergencyContacts: updated });
  };

  const handleCopyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedPhone(phone);
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  const handleCopyWifi = () => {
    navigator.clipboard.writeText(data.wifiPass);
    setCopiedWifi(true);
    setTimeout(() => setCopiedWifi(false), 2000);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-400 to-yellow-500 rounded-3xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold mb-2">
            <Pin className="w-3.5 h-3.5" /> Pizarra del Refrigerador
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">Post-its y Contactos de Casa</h2>
          <p className="text-amber-100 text-xs sm:text-sm mt-1">
            Deja notas rápidas con imanes para la familia, consulta teléfonos de emergencia y clave Wi-Fi.
          </p>
        </div>
      </div>

      {/* Add New Sticky Note Input Card */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-2">
          <Plus className="w-4 h-4 text-amber-500" /> Pegar un nuevo Post-it en la nevera
        </h3>

        <form onSubmit={handleAddNote} className="space-y-3">
          <textarea
            rows={2}
            required
            placeholder={`Escribe un mensaje de parte de ${activeMember.name}...`}
            value={newNoteText}
            onChange={(e) => setNewNoteText(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-2xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white"
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Color:</span>
              {(['yellow', 'pink', 'blue', 'green', 'purple'] as const).map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setNewNoteColor(color)}
                  className={`w-6 h-6 rounded-full border-2 transition ${
                    color === 'yellow' ? 'bg-amber-300' :
                    color === 'pink' ? 'bg-pink-300' :
                    color === 'blue' ? 'bg-sky-300' :
                    color === 'green' ? 'bg-emerald-300' : 'bg-purple-300'
                  } ${newNoteColor === color ? 'border-slate-900 scale-110' : 'border-transparent'}`}
                />
              ))}
            </div>

            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md transition"
            >
              Pegar Notita 📌
            </button>
          </div>
        </form>
      </div>

      {/* Sticky Notes Fridge Wall */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Pin className="w-5 h-5 text-amber-500" /> Muro de Notitas Pegadas ({data.fridgeNotes.length})
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.fridgeNotes.map((note) => {
            const author = data.members.find((m) => m.id === note.authorMemberId);

            return (
              <div
                key={note.id}
                className={`p-5 rounded-3xl border-2 shadow-md relative transform hover:-translate-y-1 transition duration-200 flex flex-col justify-between min-h-[160px] ${
                  noteColorClasses[note.color]
                }`}
              >
                {/* Red Pin Badge */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-rose-500 shadow-md flex items-center justify-center text-white text-[10px]">
                  📌
                </div>

                <div className="pt-2">
                  <p className="text-xs font-bold leading-relaxed whitespace-pre-wrap">"{note.text}"</p>
                </div>

                <div className="mt-4 pt-3 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-[11px]">
                  {author && (
                    <span className="font-bold flex items-center gap-1">
                      <span>{author.avatar}</span>
                      <span>{author.name}</span>
                    </span>
                  )}

                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="p-1 opacity-60 hover:opacity-100 hover:text-rose-600 transition"
                    title="Despegar notita"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Emergency Contacts & Wi-Fi Cards Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        
        {/* Left 2 Cols: Emergency Contacts */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
            <div className="flex items-center gap-2">
              <PhoneCall className="w-5 h-5 text-rose-500" />
              <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">
                Teléfonos de Emergencia y Contactos Útiles
              </h3>
            </div>

            <button
              onClick={() => setShowAddContactModal(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-200 transition flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Añadir Teléfono
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.emergencyContacts.map((contact) => (
              <div key={contact.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                      {contact.category}
                    </span>
                    <button
                      onClick={() => handleDeleteContact(contact.id)}
                      className="text-slate-300 hover:text-rose-500 transition p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-100 mt-1.5">{contact.name}</h4>
                  {contact.notes && <p className="text-[11px] text-slate-400 mt-0.5">{contact.notes}</p>}
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">{contact.phone}</span>
                  <button
                    onClick={() => handleCopyPhone(contact.phone)}
                    className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition text-[11px] flex items-center gap-1 font-bold"
                  >
                    {copiedPhone === contact.phone ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    <span>Copiar</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Permanent Wi-Fi Magnet Card */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-4">
              <Wifi className="w-6 h-6 text-amber-300" />
            </div>
            <h3 className="text-lg font-black">Acceso Wi-Fi de Casa</h3>
            <p className="text-xs text-indigo-200 mt-1">Imán informativo para invitados y la familia.</p>

            <div className="mt-6 space-y-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
              <div>
                <span className="text-[10px] uppercase font-bold text-indigo-200 tracking-wider">Nombre de Red</span>
                <div className="text-sm font-black mt-0.5">{data.wifiName}</div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-indigo-200 tracking-wider">Contraseña</span>
                <div className="flex items-center justify-between mt-1 bg-white/20 px-3 py-2 rounded-xl">
                  <code className="text-xs font-mono font-black text-amber-300">{data.wifiPass}</code>
                  <button
                    onClick={handleCopyWifi}
                    className="p-1 hover:bg-white/20 rounded-lg transition"
                    title="Copiar contraseña"
                  >
                    {copiedWifi ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center text-[11px] text-indigo-200 flex items-center justify-center gap-1">
            <HeartHandshake className="w-3.5 h-3.5" /> Hogar cálido y conectado
          </div>
        </div>

      </div>

      {/* Add Emergency Contact Modal */}
      {showAddContactModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <PhoneCall className="w-5 h-5 text-rose-500" /> Registrar Teléfono Útil
              </h3>
              <button onClick={() => setShowAddContactModal(false)} className="text-xs text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddContact} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Nombre o Servicio *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Fontanero, Pediatra..."
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Número de Teléfono *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: 600 000 000"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Categoría</label>
                <select
                  value={contactCategory}
                  onChange={(e) => setContactCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white"
                >
                  <option value="Hogar">Hogar</option>
                  <option value="Médico">Médico</option>
                  <option value="Emergencia">Emergencia</option>
                  <option value="Mascota">Mascota</option>
                  <option value="Escuela">Escuela</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Notas / Horario</label>
                <input
                  type="text"
                  placeholder="Ej: Urgencias 24 horas"
                  value={contactNotes}
                  onChange={(e) => setContactNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowAddContactModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button type="submit" className="px-6 py-2 rounded-xl bg-rose-500 text-white font-bold text-xs shadow-md">
                  Guardar Teléfono
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

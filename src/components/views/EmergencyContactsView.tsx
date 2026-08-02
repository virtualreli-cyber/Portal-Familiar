import React, { useState } from 'react';
import { useFamily } from '../../context/FamilyContext';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { PhoneCall, Plus, Trash2, Edit3, Wifi, Copy, Check, MapPin, X } from 'lucide-react';
import { EmergencyContact } from '../../types';
import { ConfirmModal } from '../ConfirmModal';

export const EmergencyContactsView: React.FC = () => {
  const { emergencyContacts, addEmergencyContact, deleteEmergencyContact, wifiSSID, wifiPass } = useFamily();

  const [copiedWifi, setCopiedWifi] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [deletingContactId, setDeletingContactId] = useState<string | null>(null);

  useBodyScrollLock(showAddModal || deletingContactId !== null);

  // Contact form
  const [name, setName] = useState('');
  const [relationOrType, setRelationOrType] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const wifiName = wifiSSID || '—';
  const wifiPassDisplay = wifiPass || '—';

  const copyWifi = () => {
    navigator.clipboard.writeText(`Wi-Fi: ${wifiName} | Clave: ${wifiPassDisplay}`);
    setCopiedWifi(true);
    setTimeout(() => setCopiedWifi(false), 3000);
  };

  const handleOpenAdd = () => {
    setEditingContact(null);
    setName('');
    setRelationOrType('');
    setPhone('');
    setAddress('');
    setNotes('');
    setShowAddModal(true);
  };

  const handleOpenEdit = (c: EmergencyContact) => {
    setEditingContact(c);
    setName(c.name);
    setRelationOrType(c.relationOrType || '');
    setPhone(c.phone);
    setAddress(c.address || '');
    setNotes(c.notes || '');
    setShowAddModal(true);
  };

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    if (editingContact) {
      deleteEmergencyContact(editingContact.id);
    }

    addEmergencyContact({
      name: name.trim(),
      relationOrType: relationOrType.trim() || 'Emergencia',
      phone: phone.trim(),
      address: address.trim() || undefined,
      notes: notes.trim() || undefined
    });

    setName('');
    setPhone('');
    setAddress('');
    setNotes('');
    setEditingContact(null);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
              <PhoneCall className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Directorio y Claves del Hogar</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Teléfonos de urgencia, médico, parroquia y datos clave de la casa
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1 shadow-md shadow-blue-200 active-touch shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Añadir Contacto</span>
        </button>
      </div>

      {/* Wi-Fi Card */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-3xl p-6 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl shrink-0">
            <Wifi className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-white">Red Wi-Fi del Hogar</h3>
            <p className="text-xs text-indigo-100 mt-0.5">
              Red: <span className="font-mono font-bold text-amber-300">{wifiName}</span> | Clave: <span className="font-mono font-bold text-amber-300">{wifiPassDisplay}</span>
            </p>
          </div>
        </div>

        <button
          onClick={copyWifi}
          className="px-4 py-2 bg-white text-indigo-900 hover:bg-indigo-50 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md active-touch self-start sm:self-auto shrink-0"
        >
          {copiedWifi ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          <span>{copiedWifi ? '¡Copiado!' : 'Copiar Wi-Fi'}</span>
        </button>
      </div>

      {/* Contacts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {emergencyContacts.map(contact => (
          <div key={contact.id} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-start justify-between gap-2">
                <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                  {contact.relationOrType}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(contact)}
                    className="p-1 text-slate-400 hover:text-indigo-600 rounded-lg transition active-touch"
                    title="Editar contacto"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingContactId(contact.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition active-touch"
                    title="Eliminar contacto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h4 className="font-bold text-slate-900 text-base mt-2">{contact.name}</h4>

              {contact.address && (
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>{contact.address}</span>
                </p>
              )}

              {contact.notes && (
                <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100 mt-2">
                  {contact.notes}
                </p>
              )}
            </div>

            {/* Tap-to-Call Button */}
            <a
              href={`tel:${contact.phone}`}
              className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition active-touch mt-2"
            >
              <PhoneCall className="w-4 h-4 text-blue-600" />
              <span>Llamar ({contact.phone})</span>
            </a>
          </div>
        ))}
      </div>

      {/* CREATE / EDIT CONTACT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col">
            <div className="bg-blue-600 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-5 h-5" />
                <h3 className="font-bold text-lg">{editingContact ? 'Editar Contacto' : 'Nuevo Contacto del Hogar'}</h3>
              </div>
              <button 
                onClick={() => { setShowAddModal(false); setEditingContact(null); }}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            <form onSubmit={handleSaveContact} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nombre / Entidad *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Pediatra Dra. Elena, Seguro Mapfre..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Teléfono *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+34 600 000 000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Tipo / Relación</label>
                  <input
                    type="text"
                    placeholder="Ej: Parroquia, Médico..."
                    value={relationOrType}
                    onChange={(e) => setRelationOrType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Dirección (Opcional)</label>
                <input
                  type="text"
                  placeholder="Calle o centro..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Notas (Opcional)</label>
                <textarea
                  rows={2}
                  placeholder="Horarios, nº de póliza..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setEditingContact(null); }}
                  className="flex-1 py-3 border border-slate-200 rounded-xl font-semibold text-slate-600 text-sm active-touch"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 text-sm active-touch"
                >
                  {editingContact ? 'Guardar Cambios' : 'Guardar Contacto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingContactId}
        onCancel={() => setDeletingContactId(null)}
        onConfirm={() => {
          if (deletingContactId) deleteEmergencyContact(deletingContactId);
          setDeletingContactId(null);
        }}
      />
    </div>
  );
};

import React, { useState } from 'react';
import { FamilyData, FamilyMember, FamilyRole } from '../../types/family';
import { resetToDefaultData } from '../../utils/storage';
import { triggerConfetti } from '../../utils/confetti';
import { 
  Settings, 
  Users, 
  Plus, 
  Trash2, 
  Download, 
  Upload, 
  RotateCcw, 
  X
} from 'lucide-react';

interface SettingsModalProps {
  data: FamilyData;
  onUpdateData: (newData: FamilyData) => void;
  onClose: () => void;
}

const ROLES: FamilyRole[] = ['Papá', 'Mamá', 'Hijo/a', 'Abuelo/a', 'Mascota', 'Otro'];

export const SettingsModal: React.FC<SettingsModalProps> = ({ data, onUpdateData, onClose }) => {
  const [familyName, setFamilyName] = useState(data.familyName);
  const [wifiName, setWifiName] = useState(data.wifiName);
  const [wifiPass, setWifiPass] = useState(data.wifiPass);

  // New member form
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberName, setMemberName] = useState('');
  const [memberRole, setMemberRole] = useState<FamilyRole>('Hijo/a');
  const [memberAvatar, setMemberAvatar] = useState('😊');
  const [memberPoints, setMemberPoints] = useState<number>(50);

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateData({
      ...data,
      familyName: familyName.trim() || 'Mi Familia',
      wifiName: wifiName.trim() || 'Wi-Fi Casa',
      wifiPass: wifiPass.trim() || '12345678',
    });
    triggerConfetti();
    onClose();
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberName.trim()) return;

    const newMember: FamilyMember = {
      id: `m-${Date.now()}`,
      name: memberName.trim(),
      role: memberRole,
      avatar: memberAvatar || '👤',
      color: '#3B82F6',
      points: Number(memberPoints) || 0,
    };

    onUpdateData({
      ...data,
      members: [...data.members, newMember],
    });

    setMemberName('');
    setShowAddMember(false);
    triggerConfetti();
  };

  const handleDeleteMember = (memberId: string) => {
    if (data.members.length <= 1) {
      alert('Debe haber al menos un miembro en la familia.');
      return;
    }
    const updated = data.members.filter((m) => m.id !== memberId);
    const newActive = memberId === data.activeMemberId ? updated[0].id : data.activeMemberId;

    onUpdateData({
      ...data,
      members: updated,
      activeMemberId: newActive,
    });
  };

  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hogarsync_${data.familyName.replace(/\s+/g, '_')}_backup.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.familyName && Array.isArray(parsed.members)) {
          onUpdateData(parsed);
          triggerConfetti();
          alert('¡Copia de seguridad cargada correctamente!');
        } else {
          alert('El archivo no tiene el formato correcto.');
        }
      } catch (err) {
        alert('Error al leer el archivo JSON.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    if (confirm('¿Estás seguro de restablecer todos los datos a los de ejemplo iniciales?')) {
      const reset = resetToDefaultData();
      onUpdateData(reset);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4">
          <div className="flex items-center gap-2">
            <Settings className="w-6 h-6 text-amber-500" />
            <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">
              Ajustes de la Familia y del Hogar
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* General Form */}
        <form onSubmit={handleSaveGeneral} className="space-y-4">
          <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider">Configuración General</h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Nombre de la Familia</label>
              <input
                type="text"
                required
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Nombre Wi-Fi (SSID)</label>
              <input
                type="text"
                value={wifiName}
                onChange={(e) => setWifiName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Contraseña Wi-Fi</label>
              <input
                type="text"
                value={wifiPass}
                onChange={(e) => setWifiPass(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md"
            >
              Guardar Cambios Generales
            </button>
          </div>
        </form>

        {/* Family Members Manager */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-700 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-amber-500" /> Miembros de la Familia ({data.members.length})
            </h4>
            <button
              onClick={() => setShowAddMember(!showAddMember)}
              className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Añadir Miembro
            </button>
          </div>

          {showAddMember && (
            <form onSubmit={handleAddMember} className="p-3 bg-amber-50/70 dark:bg-slate-900 rounded-2xl space-y-2 border border-amber-200 dark:border-slate-700">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <input
                  type="text"
                  required
                  placeholder="Nombre..."
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  className="px-3 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white"
                />

                <select
                  value={memberRole}
                  onChange={(e) => setMemberRole(e.target.value as FamilyRole)}
                  className="px-3 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Emoji avatar (👦, 👩...)"
                  value={memberAvatar}
                  onChange={(e) => setMemberAvatar(e.target.value)}
                  className="px-3 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center"
                />

                <input
                  type="number"
                  placeholder="Puntos"
                  value={memberPoints}
                  onChange={(e) => setMemberPoints(Number(e.target.value))}
                  className="px-3 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button type="submit" className="px-4 py-1.5 rounded-xl bg-amber-500 text-white font-bold text-xs">
                  Añadir
                </button>
                <button type="button" onClick={() => setShowAddMember(false)} className="px-2 text-xs text-slate-400">
                  Cancelar
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {data.members.map((m) => (
              <div key={m.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{m.avatar}</span>
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-100">{m.name}</div>
                    <div className="text-[10px] text-slate-400">{m.role} • <span className="text-amber-600 font-semibold">{m.points} pts</span></div>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteMember(m.id)}
                  className="p-1 text-slate-300 hover:text-rose-500 transition"
                  title="Eliminar miembro"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Data Backup & Restore Section */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-700 space-y-3">
          <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider">Copia de Seguridad y Datos Locales</h4>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleExportJSON}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold text-xs hover:opacity-90 transition flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Descargar Copia JSON
            </button>

            <label className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-200 transition cursor-pointer flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5" /> Importar Copia JSON
              <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
            </label>

            <button
              onClick={handleResetData}
              className="px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-900 font-bold text-xs hover:bg-rose-100 transition flex items-center gap-1.5 ml-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Restablecer Datos de Ejemplo
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

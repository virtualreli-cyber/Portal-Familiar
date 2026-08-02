import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { X, KeyRound, UserCheck } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { allMembers, loginWithPin, currentMember } = useAuth();
  const [selectedMemberId, setSelectedMemberId] = useState<string>(currentMember?.id || allMembers[0]?.id || '');
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useBodyScrollLock(isOpen);

  if (!isOpen) return null;

  const targetMember = allMembers.find(m => m.id === selectedMemberId) || allMembers[0];

  const handleSelectMember = (memberId: string) => {
    setSelectedMemberId(memberId);
    setPinInput('');
    setErrorMsg('');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinInput.trim()) {
      setErrorMsg('Introduce el PIN para cambiar de perfil.');
      return;
    }
    setLoading(true);
    setErrorMsg('');

    setTimeout(() => {
      const success = loginWithPin(selectedMemberId, pinInput.trim());
      if (success) {
        setPinInput('');
        setErrorMsg('');
        onClose();
      } else {
        setErrorMsg('PIN incorrecto. Inténtalo de nuevo.');
        setPinInput('');
      }
      setLoading(false);
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-indigo-600 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-xl">
              👤
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Cambiar de Perfil</h3>
              <p className="text-xs text-indigo-200">PIN requerido para cambiar</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Member grid */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              1. Selecciona el perfil:
            </label>
            <div className="grid grid-cols-1 gap-2">
              {allMembers.map(member => {
                const isSelected = member.id === selectedMemberId;
                const isCurrent = member.id === currentMember?.id;
                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => handleSelectMember(member.id)}
                    className={`w-full p-3 rounded-2xl flex items-center justify-between border transition text-left active:scale-[0.98] ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/80 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-xs ${member.color || 'bg-indigo-600 text-white'}`}>
                        {member.avatar}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{member.name}</p>
                        {isCurrent && (
                          <p className="text-xs text-indigo-600 font-semibold">(activo)</p>
                        )}
                      </div>
                    </div>
                    {isSelected && <UserCheck className="w-5 h-5 text-indigo-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* PIN form */}
          <form onSubmit={handleLogin} className="space-y-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                2. PIN del perfil seleccionado:
              </label>
              <div className="relative">
                <KeyRound className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  inputMode="numeric"
                  placeholder="Introduce PIN"
                  value={pinInput}
                  onChange={e => { setPinInput(e.target.value); setErrorMsg(''); }}
                  maxLength={8}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              {errorMsg && (
                <p className="text-xs text-rose-600 font-medium mt-1.5 bg-rose-50 border border-rose-100 px-3 py-1.5 rounded-lg">
                  {errorMsg}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50 text-sm active:scale-[0.98]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || !pinInput.trim()}
                className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg shadow-indigo-200 text-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '…' : `Entrar como ${targetMember?.name?.split(' ')[0]}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

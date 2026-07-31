import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { KeyRound, LogIn, User } from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { allMembers, loginWithPin } = useAuth();
  const [selectedMemberId, setSelectedMemberId] = useState<string>(allMembers[0]?.id || '');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedMember = allMembers.find(m => m.id === selectedMemberId) || allMembers[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) { setError('Introduce tu PIN.'); return; }
    setLoading(true);
    setError('');

    setTimeout(() => {
      const success = loginWithPin(selectedMemberId, pin.trim());
      if (!success) {
        setError('PIN incorrecto. Inténtalo de nuevo.');
        setPin('');
      }
      setLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 flex items-center justify-center p-4">
      {/* Background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo / Header */}
        <div className="text-center mb-8 space-y-3">
          <div className="w-20 h-20 rounded-3xl bg-white/15 backdrop-blur-md flex items-center justify-center text-5xl mx-auto shadow-xl border border-white/20">
            👨‍👩‍👧‍👦
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Portal Familiar</h1>
          <p className="text-indigo-200 text-sm font-medium">Selecciona tu perfil e introduce tu PIN</p>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
          {/* Member selector */}
          <div className="p-5 space-y-3">
            <p className="text-xs font-bold text-indigo-200 uppercase tracking-widest">¿Quién eres?</p>
            <div className="grid grid-cols-1 gap-2 max-h-52 overflow-y-auto pr-1">
              {allMembers.map(member => {
                const isSelected = member.id === selectedMemberId;
                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => { setSelectedMemberId(member.id); setPin(''); setError(''); }}
                    className={`w-full p-3 rounded-2xl flex items-center gap-3 border transition text-left active:scale-[0.98] ${
                      isSelected
                        ? 'bg-white/20 border-white/40 ring-2 ring-white/40'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-xs ${member.color || 'bg-indigo-600 text-white'}`}>
                      {member.avatar}
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm leading-tight">{member.name}</p>
                      <p className="text-[11px] text-indigo-200 font-medium">{member.role}</p>
                    </div>
                    {isSelected && (
                      <div className="ml-auto w-5 h-5 rounded-full bg-white/30 flex items-center justify-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-white/10 mx-5" />

          {/* PIN form */}
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <p className="text-xs font-bold text-indigo-200 uppercase tracking-widest">PIN de acceso</p>

            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="password"
                inputMode="numeric"
                placeholder="••••"
                value={pin}
                onChange={e => { setPin(e.target.value); setError(''); }}
                maxLength={8}
                autoComplete="current-password"
                className="w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/30 font-mono text-lg tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-white/40 transition"
              />
            </div>

            {error && (
              <p className="text-rose-300 text-xs font-semibold bg-rose-500/10 border border-rose-400/20 px-3 py-2 rounded-xl">
                ⚠️ {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !pin.trim()}
              className="w-full py-3.5 bg-white text-indigo-900 font-extrabold rounded-2xl flex items-center justify-center gap-2 shadow-xl hover:bg-indigo-50 transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {loading ? (
                <span className="animate-spin">⏳</span>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Entrar como {selectedMember?.name?.split(' ')[0]}
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-indigo-300/60 text-xs mt-6">
          Portal privado de la familia · Acceso restringido
        </p>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getSupabaseStatus, SUPABASE_URL } from '../lib/supabase';
import { FamilyLogo } from './FamilyLogo';
import { KeyRound, LogIn, RefreshCw, Database } from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { allMembers, loginWithPin, addMember, loadMembers } = useAuth();
  const [selectedMemberId, setSelectedMemberId] = useState<string>(allMembers[0]?.id || '');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const status = getSupabaseStatus();

  // Auto select first member when loaded from Supabase
  useEffect(() => {
    if (allMembers.length > 0 && (!selectedMemberId || !allMembers.some(m => m.id === selectedMemberId))) {
      setSelectedMemberId(allMembers[0].id);
    }
  }, [allMembers, selectedMemberId]);

  const handleReload = async () => {
    setIsRefreshing(true);
    await loadMembers();
    setIsRefreshing(false);
  };

  // Form for creating first member if table is completely empty
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'Padre' | 'Madre'>('Padre');
  const [newMemberPin, setNewMemberPin] = useState('1234');

  const selectedMember = allMembers.find(m => m.id === selectedMemberId) || allMembers[0];

  const handleCreateFirstMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) { setError('Escribe el nombre del miembro.'); return; }
    if (!newMemberPin.trim()) { setError('Asigna un PIN.'); return; }

    addMember({
      name: newMemberName.trim(),
      role: newMemberRole,
      avatar: newMemberRole === 'Padre' ? '👨‍💼' : '👩‍💼',
      color: newMemberRole === 'Padre' ? 'bg-indigo-600 text-white' : 'bg-purple-600 text-white',
      pinCode: newMemberPin.trim(),
      birthDate: '',
      points: 100,
      allergies: [],
      notes: 'Administrador del hogar'
    });
    setError('');
  };

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
        <div className="text-center mb-8 space-y-3 flex flex-col items-center">
          <FamilyLogo size={80} className="mx-auto" />
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Portal Familiar</h1>
          <p className="text-indigo-200 text-sm font-medium">
            {allMembers.length > 0 ? 'Selecciona tu perfil e introduce tu PIN' : 'Conectado a Supabase (Tabla vacía)'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
          {allMembers.length === 0 ? (
            <div className="p-6 space-y-5">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center mx-auto text-indigo-200">
                  <Database className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-bold text-white">Estado de Supabase</h2>
                <p className="text-xs text-indigo-200 max-w-xs mx-auto">
                  La app realiza la consulta a la tabla <code className="bg-white/10 px-1 py-0.5 rounded">family_members</code> en tu proyecto de Supabase.
                </p>
              </div>

              {/* Status Box */}
              <div className="bg-slate-900/60 rounded-2xl p-4 border border-white/10 text-xs space-y-2 font-mono text-indigo-200">
                <div className="flex justify-between items-center text-white font-sans font-semibold border-b border-white/10 pb-2">
                  <span>Conexión Supabase</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Activa
                  </span>
                </div>
                <div><span className="text-slate-400">URL:</span> {SUPABASE_URL}</div>
                <div><span className="text-slate-400">Filas recibidas:</span> {status.lastRowCount ?? 0}</div>
                {status.lastError ? (
                  <div className="text-rose-300 font-sans text-xs bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                    <strong>Error Supabase:</strong> {status.lastError}
                  </div>
                ) : (
                  <div className="text-amber-200/90 font-sans text-[11px] leading-relaxed pt-1">
                    💡 <strong>¿Por qué 0 miembros?</strong>
                    <ul className="list-disc pl-4 mt-1 space-y-1">
                      <li><strong>RLS (Row Level Security):</strong> Si RLS está activo en la tabla <code className="bg-white/10 px-1">family_members</code> en Supabase sin política de <code className="bg-white/10 px-1">SELECT</code> pública para rol anon, Supabase responde 0 filas sin dar error.</li>
                      <li><strong>Credenciales:</strong> Comprueba si la tabla <code className="bg-white/10 px-1">family_members</code> está en la URL indicada arriba.</li>
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleReload}
                  disabled={isRefreshing}
                  className="flex-1 py-3 bg-white/15 hover:bg-white/20 text-white font-bold rounded-xl flex items-center justify-center gap-2 border border-white/20 transition text-xs"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Reintentar lectura Supabase
                </button>
              </div>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-white/10"></div>
                <span className="flex-shrink mx-3 text-[10px] uppercase tracking-wider text-indigo-300 font-bold">O crea un miembro localmente</span>
                <div className="flex-grow border-t border-white/10"></div>
              </div>

              <form onSubmit={handleCreateFirstMember} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-indigo-200 mb-1">Nombre del perfil</label>
                  <input
                    type="text"
                    placeholder="Ej. Carlos / María"
                    value={newMemberName}
                    onChange={e => setNewMemberName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-white/40"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-indigo-200 mb-1">Rol</label>
                    <select
                      value={newMemberRole}
                      onChange={e => setNewMemberRole(e.target.value as 'Padre' | 'Madre')}
                      className="w-full px-3 py-2.5 bg-slate-800 border border-white/20 rounded-xl text-white text-sm focus:outline-none"
                    >
                      <option value="Padre">Padre</option>
                      <option value="Madre">Madre</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-indigo-200 mb-1">PIN</label>
                    <input
                      type="password"
                      placeholder="1234"
                      value={newMemberPin}
                      onChange={e => setNewMemberPin(e.target.value)}
                      maxLength={8}
                      className="w-full px-3 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:outline-none font-mono tracking-widest"
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-rose-300 text-xs font-semibold bg-rose-500/10 border border-rose-400/20 px-3 py-2 rounded-xl">
                    ⚠️ {error}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-white text-indigo-900 font-extrabold rounded-xl shadow-xl hover:bg-indigo-50 transition active:scale-[0.98] text-xs"
                >
                  Guardar Perfil en Supabase
                </button>
              </form>
            </div>
          ) : (
            <>
              {/* Member selector */}
              <div className="p-5 space-y-3">
                <p className="text-xs font-bold text-indigo-200 uppercase tracking-widest">¿Quién eres?</p>
                <div className="grid grid-cols-1 gap-2 max-h-52 overflow-y-auto pr-1">
                  {allMembers.map(member => {
                    const isSelected = member.id === selectedMemberId || (!selectedMemberId && member.id === allMembers[0].id);
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
                      Entrar como {(selectedMember || allMembers[0])?.name?.split(' ')[0]}
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-indigo-300/60 text-xs mt-6">
          Portal privado de la familia · Acceso restringido
        </p>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { FamilyData } from '../types/family';
import { 
  Home, 
  Wifi, 
  Settings, 
  Coins, 
  CheckCircle2, 
  Copy, 
  Check, 
  Sun,
  Moon
} from 'lucide-react';

interface NavbarProps {
  data: FamilyData;
  onUpdateData: (newData: FamilyData) => void;
  onOpenSettings: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  data,
  onUpdateData,
  onOpenSettings,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const [showWifiModal, setShowWifiModal] = useState(false);
  const [copiedWifi, setCopiedWifi] = useState(false);
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);

  const activeMember = data.members.find((m) => m.id === data.activeMemberId) || data.members[0];

  const handleSelectMember = (memberId: string) => {
    onUpdateData({
      ...data,
      activeMemberId: memberId,
    });
    setShowMemberDropdown(false);
  };

  const handleCopyWifiPass = () => {
    navigator.clipboard.writeText(data.wifiPass);
    setCopiedWifi(true);
    setTimeout(() => setCopiedWifi(false), 2000);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-amber-100 dark:border-slate-800 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo and Family Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 transform transition hover:scale-105">
              <Home className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg text-slate-800 dark:text-slate-100 leading-none">
                  {data.familyName}
                </h1>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  Local
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Dashboard de gestión del hogar
              </p>
            </div>
          </div>

          {/* Center / Right controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Wi-Fi Quick Access Button */}
            <button
              onClick={() => setShowWifiModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-amber-50 dark:bg-slate-800 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-slate-700 transition border border-amber-200/60 dark:border-slate-700"
              title="Ver Wi-Fi de Casa"
            >
              <Wifi className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span className="hidden md:inline">Wi-Fi Casa</span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title={isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Active Member Selector */}
            <div className="relative">
              <button
                onClick={() => setShowMemberDropdown(!showMemberDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition text-left"
              >
                <span className="text-xl leading-none">{activeMember?.avatar}</span>
                <div className="hidden sm:block text-xs">
                  <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    {activeMember?.name}
                    <span className="text-[10px] text-slate-400">({activeMember?.role})</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                    <Coins className="w-3 h-3" />
                    <span>{activeMember?.points || 0} pts</span>
                  </div>
                </div>
              </button>

              {/* Dropdown for Switch Member */}
              {showMemberDropdown && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700 mb-1">
                    ¿Quién está usando el panel?
                  </div>
                  {data.members.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => handleSelectMember(m.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition hover:bg-amber-50 dark:hover:bg-slate-700/60 ${
                        m.id === activeMember.id ? 'bg-amber-50/80 dark:bg-slate-700/80 font-semibold text-amber-900 dark:text-amber-200' : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{m.avatar}</span>
                        <div>
                          <div>{m.name}</div>
                          <div className="text-[10px] text-slate-400">{m.role}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold bg-amber-100/50 dark:bg-slate-900/40 px-2 py-0.5 rounded-full text-[10px]">
                        <Coins className="w-2.5 h-2.5" />
                        {m.points}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Settings Modal Button */}
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Ajustes de la Familia"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Wi-Fi Info Modal */}
      {showWifiModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 relative text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-3">
              <Wifi className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Red Wi-Fi Familiar</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Conexión de alta velocidad del hogar</p>

            <div className="mt-5 space-y-3 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl text-left border border-slate-100 dark:border-slate-700">
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Nombre de Red (SSID)</span>
                <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  {data.wifiName || 'Wi-Fi Casa'}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Contraseña</span>
                <div className="flex items-center justify-between mt-0.5 bg-white dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
                  <code className="text-sm font-mono text-amber-600 dark:text-amber-400 font-bold">
                    {data.wifiPass || 'Sin contraseña'}
                  </code>
                  <button
                    onClick={handleCopyWifiPass}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-700 transition"
                    title="Copiar contraseña"
                  >
                    {copiedWifi ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowWifiModal(false)}
              className="mt-6 w-full py-2.5 rounded-xl font-semibold bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:opacity-90 transition text-sm"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

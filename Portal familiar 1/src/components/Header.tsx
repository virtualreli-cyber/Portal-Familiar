import React, { useState, useEffect } from 'react';
import { 
  Sun, Moon, Monitor, Clock, 
  Search, Download, HeartHandshake
} from 'lucide-react';
import { FamilyMember } from '../types';

interface HeaderProps {
  familyMembers: FamilyMember[];
  activeMemberId: string | null;
  onSelectMember: (id: string | null) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenKiosk: () => void;
  onOpenBackup: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const CITIES = [
  { name: 'Madrid', temp: '21°C', icon: '☀️', cond: 'Soleado' },
  { name: 'Barcelona', temp: '22°C', icon: '🌤️', cond: 'Algo nublado' },
  { name: 'Sevilla', temp: '26°C', icon: '☀️', cond: 'Soleado' },
  { name: 'Valencia', temp: '23°C', icon: '🌤️', cond: 'Despejado' },
  { name: 'Bilbao', temp: '18°C', icon: '🌧️', cond: 'Lluvia débil' }
];

export const Header: React.FC<HeaderProps> = ({
  familyMembers,
  activeMemberId,
  onSelectMember,
  darkMode,
  onToggleDarkMode,
  onOpenKiosk,
  onOpenBackup,
  searchQuery,
  onSearchChange,
}) => {
  const [time, setTime] = useState(new Date());
  const [selectedCityIndex, setSelectedCityIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = time.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const formattedTime = time.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const currentWeather = CITIES[selectedCityIndex];

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Logo & Family Brand */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-md shadow-rose-500/20 transform hover:scale-105 transition-transform cursor-pointer">
              🏠
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-xl sm:text-2xl text-slate-800 dark:text-white tracking-tight">
                  Hogar<span className="text-amber-500">Plus</span>
                </h1>
                <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                  <HeartHandshake className="w-3 h-3" />
                  Familia García F.
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 capitalize hidden sm:block">
                {formattedDate}
              </p>
            </div>
          </div>

          {/* Search bar & Quick Weather widget */}
          <div className="hidden lg:flex items-center gap-4 flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar tareas, productos, eventos..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all border border-transparent focus:border-amber-500"
              />
            </div>

            {/* Weather Widget */}
            <button
              onClick={() => setSelectedCityIndex((prev) => (prev + 1) % CITIES.length)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors whitespace-nowrap cursor-pointer"
              title="Haz clic para cambiar ciudad"
            >
              <span className="text-base">{currentWeather.icon}</span>
              <div>
                <span className="font-bold">{currentWeather.temp}</span>
                <span className="text-slate-500 dark:text-slate-400 ml-1">({currentWeather.name})</span>
              </div>
            </button>
          </div>

          {/* Time & Control Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Live Clock Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-mono font-semibold">
              <Clock className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span>{formattedTime}</span>
            </div>

            {/* Family Member Active Selector */}
            <div className="relative">
              <select
                value={activeMemberId || 'all'}
                onChange={(e) => onSelectMember(e.target.value === 'all' ? null : e.target.value)}
                className="appearance-none bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl pl-3 pr-8 py-2 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-amber-500 focus:outline-none cursor-pointer"
              >
                <option value="all">👨‍👩‍👧‍👦 Todos los miembros</option>
                {familyMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.avatar} {m.name} ({m.role})
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                ▼
              </div>
            </div>

            {/* Kiosk Mode Button */}
            <button
              onClick={onOpenKiosk}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
              title="Modo Pantalla Cocina / Kiosco"
            >
              <Monitor className="w-4 h-4" />
            </button>

            {/* Backup & Settings Button */}
            <button
              onClick={onOpenBackup}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              title="Copia de seguridad y Ajustes"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={onToggleDarkMode}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-amber-500 transition-colors"
              title={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};

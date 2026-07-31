import React, { useRef } from 'react';
import { 
  X, Download, Upload, RotateCcw, ShieldCheck, Database
} from 'lucide-react';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExportData: () => void;
  onImportData: (data: any) => void;
  onResetToDefault: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  onExportData,
  onImportData,
  onResetToDefault,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        onImportData(parsed);
        alert('¡Copia de seguridad importada con éxito!');
        onClose();
      } catch (err) {
        alert('Error al leer el archivo JSON de copia de seguridad.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetConfirm = () => {
    if (window.confirm('¿Estás seguro de que quieres restablecer los datos de ejemplo iniciales? Se reemplazarán tus cambios actuales.')) {
      onResetToDefault();
      alert('¡Datos restablecidos al estado inicial!');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500 text-white rounded-2xl">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-800 dark:text-white">
                Gestión de Datos Locales
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Guardado 100% en tu navegador (LocalStorage)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          
          {/* Export JSON */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Exportar Copia JSON</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Descarga un archivo con todas tus listas y eventos</p>
            </div>
            <button
              onClick={onExportData}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <Download className="w-4 h-4" /> Exportar
            </button>
          </div>

          {/* Import JSON */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Importar Copia JSON</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Restaura datos guardados anteriormente</p>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <Upload className="w-4 h-4" /> Importar
            </button>
          </div>

          {/* Reset Defaults */}
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-rose-800 dark:text-rose-300">Restablecer Datos Muestra</h4>
              <p className="text-xs text-rose-600 dark:text-rose-400">Vuelve al estado inicial de ejemplo</p>
            </div>
            <button
              onClick={handleResetConfirm}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-rose-600/20 flex items-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-4 h-4" /> Restablecer
            </button>
          </div>

        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <span>Tus datos permanecen privados en el almacenamiento local de este dispositivo.</span>
        </div>
      </div>
    </div>
  );
};

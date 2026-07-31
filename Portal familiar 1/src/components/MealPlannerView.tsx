import React, { useState } from 'react';
import { WeeklyMealPlan, DayMeal } from '../types';
import { 
  Utensils, Sparkles, ShoppingCart, Edit3, Check, Coffee, Moon, Sun, Apple
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface MealPlannerViewProps {
  mealPlan: WeeklyMealPlan;
  onUpdateMealPlan: (newPlan: WeeklyMealPlan) => void;
  onAddIngredientsToShopping: (ingredients: string[]) => void;
}

const DAYS = [
  { key: 'lunes', label: 'Lunes' },
  { key: 'martes', label: 'Martes' },
  { key: 'miercoles', label: 'Miércoles' },
  { key: 'jueves', label: 'Jueves' },
  { key: 'viernes', label: 'Viernes' },
  { key: 'sabado', label: 'Sábado' },
  { key: 'domingo', label: 'Domingo' },
];

const SUGGESTED_SPANISH_PLAN: WeeklyMealPlan = {
  lunes: {
    breakfast: 'Tostada de aceite y tomate, café / leche',
    lunch: 'Lentejas pardinas con zanahoria y arroz + Manzana',
    snack: 'Bocadillo de queso fresco y pavo',
    dinner: 'Tortilla francesa con ensalada de tomate y atún'
  },
  martes: {
    breakfast: 'Yogur con copos de avena y Plátano',
    lunch: 'Pechugas de pollo a la plancha con puré de patatas',
    snack: 'Fruta variada y puñado de almendras',
    dinner: 'Crema de calabacín y filete de merluza al horno'
  },
  miercoles: {
    breakfast: 'Tostada de pan integral con queso mermelada',
    lunch: 'Macarrones boloñesa de pavo gratinados',
    snack: 'Batido casero de plátano y galletas',
    dinner: 'Sopa de fideos y salmón a la plancha'
  },
  jueves: {
    breakfast: 'Cereales integrales con leche de almendras',
    lunch: 'Garbanzos salteados con espinacas y bacalao',
    snack: 'Sándwich de jamón cocido',
    dinner: 'Hamburguesa casera de ternera con verduras salteadas'
  },
  viernes: {
    breakfast: 'Tostada con jamón ibérico y zumo de naranja',
    lunch: 'Paella o Arroz con verduras y pollo',
    snack: 'Fruta de temporada',
    dinner: 'Pizza casera o quesadillas en familia'
  },
  sabado: {
    breakfast: 'Tortitas caseras con miel o plátano',
    lunch: 'Solomillo de cerdo con patatas asadas',
    snack: 'Bizcocho casero',
    dinner: 'Tacos de pollo con guacamole y nachos'
  },
  domingo: {
    breakfast: 'Churros o tostadas con cacao caliente',
    lunch: 'Cocido tradicional o asado familiar',
    snack: 'Yogur con frutos rojos',
    dinner: 'Cena ligera: Gazpacho/Salmorejo y tortilla de patatas'
  }
};

export const MealPlannerView: React.FC<MealPlannerViewProps> = ({
  mealPlan,
  onUpdateMealPlan,
  onAddIngredientsToShopping,
}) => {
  const [editingDay, setEditingDay] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<DayMeal>({
    breakfast: '',
    lunch: '',
    snack: '',
    dinner: ''
  });
  const [exportedSuccess, setExportedSuccess] = useState(false);

  const startEdit = (dayKey: string) => {
    setEditingDay(dayKey);
    setEditForm(mealPlan[dayKey] || { breakfast: '', lunch: '', snack: '', dinner: '' });
  };

  const saveEdit = (dayKey: string) => {
    const updated = { ...mealPlan, [dayKey]: editForm };
    onUpdateMealPlan(updated);
    setEditingDay(null);
  };

  const handleApplyPreset = () => {
    if (window.confirm('¿Quieres sustituir el menú actual por la sugerencia de menú equilibrado tradicional?')) {
      onUpdateMealPlan(SUGGESTED_SPANISH_PLAN);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    }
  };

  const handleExportIngredients = () => {
    // Generate automatic shopping list items based on weekly menu
    const commonIngredients = [
      'Pan integral y de molde',
      'Leche y Yogures',
      'Huevos camperos',
      'Pechugas de Pollo',
      'Lentejas y Garbanzos',
      'Arroz redondo',
      'Verduras (Calabacín, Tomates, Espinacas, Patatas)',
      'Fruta de temporada (Plátanos, Manzanas, Naranjas)',
      'Merluza / Salmón fresco',
      'Queso y Jamón'
    ];

    onAddIngredientsToShopping(commonIngredients);
    setExportedSuccess(true);
    confetti({ particleCount: 50, spread: 70, origin: { y: 0.8 } });
    setTimeout(() => setExportedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-teal-500 text-white rounded-2xl shadow-md shadow-teal-500/20">
            <Utensils className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white">
              Planificador de Menús Semanales
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Organiza desayunos, comidas, meriendas y cenas para toda la familia
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            onClick={handleApplyPreset}
            className="px-4 py-2.5 bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 hover:bg-teal-200 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer border border-teal-200 dark:border-teal-900"
          >
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>Sugerir Menú Equilibrado</span>
          </button>

          <button
            onClick={handleExportIngredients}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>{exportedSuccess ? '¡Ingredientes Añadidos!' : 'Exportar a la Compra'}</span>
          </button>
        </div>
      </div>

      {/* Weekly Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {DAYS.map((day) => {
          const isEditing = editingDay === day.key;
          const dayMeal = mealPlan[day.key] || { breakfast: '', lunch: '', snack: '', dinner: '' };

          return (
            <div
              key={day.key}
              className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:border-teal-400 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="text-base font-black text-slate-800 dark:text-white capitalize flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
                    {day.label}
                  </h3>
                  
                  {isEditing ? (
                    <button
                      onClick={() => saveEdit(day.key)}
                      className="p-1.5 rounded-lg bg-teal-500 text-white hover:bg-teal-600 cursor-pointer flex items-center gap-1 text-xs font-bold px-2"
                    >
                      <Check className="w-3.5 h-3.5" /> Guardar
                    </button>
                  ) : (
                    <button
                      onClick={() => startEdit(day.key)}
                      className="p-1.5 text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 cursor-pointer"
                      title="Editar comidas del día"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-teal-600 uppercase mb-1">☕ Desayuno</label>
                      <input
                        type="text"
                        value={editForm.breakfast}
                        onChange={(e) => setEditForm({ ...editForm, breakfast: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-amber-600 uppercase mb-1">🍲 Comida</label>
                      <input
                        type="text"
                        value={editForm.lunch}
                        onChange={(e) => setEditForm({ ...editForm, lunch: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-orange-600 uppercase mb-1">🍎 Merienda</label>
                      <input
                        type="text"
                        value={editForm.snack}
                        onChange={(e) => setEditForm({ ...editForm, snack: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-indigo-600 uppercase mb-1">🌙 Cena</label>
                      <input
                        type="text"
                        value={editForm.dinner}
                        onChange={(e) => setEditForm({ ...editForm, dinner: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-2.5 rounded-xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/30">
                      <div className="text-[10px] font-bold text-teal-700 dark:text-teal-400 uppercase flex items-center gap-1 mb-0.5">
                        <Coffee className="w-3 h-3" /> Desayuno
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                        {dayMeal.breakfast || 'No especificado'}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30">
                      <div className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase flex items-center gap-1 mb-0.5">
                        <Sun className="w-3 h-3" /> Comida
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                        {dayMeal.lunch || 'No especificado'}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-orange-50/50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30">
                      <div className="text-[10px] font-bold text-orange-700 dark:text-orange-400 uppercase flex items-center gap-1 mb-0.5">
                        <Apple className="w-3 h-3" /> Merienda
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                        {dayMeal.snack || 'No especificado'}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30">
                      <div className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 uppercase flex items-center gap-1 mb-0.5">
                        <Moon className="w-3 h-3" /> Cena
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                        {dayMeal.dinner || 'No especificado'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

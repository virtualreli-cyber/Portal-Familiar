import React, { useState } from 'react';
import { useFamily } from '../../context/FamilyContext';
import { useAuth } from '../../context/AuthContext';
import { 
  UtensilsCrossed, 
  Coffee, 
  Sun, 
  Apple, 
  Moon, 
  Edit3, 
  Save, 
  ShoppingBag,
  Check
} from 'lucide-react';

const DAYS = [
  { key: 'lunes', label: 'Lunes' },
  { key: 'martes', label: 'Martes' },
  { key: 'miércoles', label: 'Miércoles' },
  { key: 'jueves', label: 'Jueves' },
  { key: 'viernes', label: 'Viernes' },
  { key: 'sábado', label: 'Sábado' },
  { key: 'domingo', label: 'Domingo' }
];

export const MealPlannerView: React.FC = () => {
  const { mealPlan, updateMealPlanDay, addShoppingItem } = useFamily();
  const { currentMember, permissions } = useAuth();
  
  const [selectedDayKey, setSelectedDayKey] = useState<string>('lunes');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [copiedIngredientMsg, setCopiedIngredientMsg] = useState<string>('');

  const currentDayData = mealPlan[selectedDayKey] || {
    breakfast: '',
    lunch: '',
    snack: '',
    dinner: '',
    notes: ''
  };

  // Form state for editing
  const [breakfast, setBreakfast] = useState(currentDayData.breakfast);
  const [lunch, setLunch] = useState(currentDayData.lunch);
  const [snack, setSnack] = useState(currentDayData.snack);
  const [dinner, setDinner] = useState(currentDayData.dinner);
  const [notes, setNotes] = useState(currentDayData.notes || '');

  const handleSelectDay = (dayKey: string) => {
    setSelectedDayKey(dayKey);
    setIsEditing(false);
    const dayData = mealPlan[dayKey] || { breakfast: '', lunch: '', snack: '', dinner: '', notes: '' };
    setBreakfast(dayData.breakfast);
    setLunch(dayData.lunch);
    setSnack(dayData.snack);
    setDinner(dayData.dinner);
    setNotes(dayData.notes || '');
  };

  const handleSaveMealPlan = () => {
    updateMealPlanDay(selectedDayKey, {
      breakfast,
      lunch,
      snack,
      dinner,
      notes
    });
    setIsEditing(false);
  };

  const handleQuickAddIngredientToShopping = (ingredientName: string) => {
    if (!ingredientName.trim()) return;
    addShoppingItem({
      name: ingredientName.trim(),
      category: 'Despensa y Bebidas',
      quantity: '1',
      store: 'Mercadona',
      addedBy: currentMember.name,
      urgent: false
    });
    setCopiedIngredientMsg(`Añadido: "${ingredientName}" a la lista de la compra`);
    setTimeout(() => setCopiedIngredientMsg(''), 3000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-orange-100 text-orange-700">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Menú Semanal de Comidas</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Planifica los menús del hogar y exporta ingredientes a la lista de la compra
          </p>
        </div>

        {permissions.canManageMeals && (
          <button
            onClick={() => {
              if (isEditing) {
                handleSaveMealPlan();
              } else {
                setIsEditing(true);
              }
            }}
            className={`px-4 py-2 font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition active-touch ${
              isEditing 
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200' 
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
            }`}
          >
            {isEditing ? (
              <>
                <Save className="w-4 h-4" />
                <span>Guardar Cambios</span>
              </>
            ) : (
              <>
                <Edit3 className="w-4 h-4" />
                <span>Editar Menú del Día</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Days Tabs (Horizontal Scrollable on Mobile) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {DAYS.map(day => {
          const isSelected = day.key === selectedDayKey;
          return (
            <button
              key={day.key}
              onClick={() => handleSelectDay(day.key)}
              className={`px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition active-touch shrink-0 border ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-200'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {day.label}
            </button>
          );
        })}
      </div>

      {copiedIngredientMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{copiedIngredientMsg}</span>
        </div>
      )}

      {/* Meals Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Desayuno */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-amber-600">
              <Coffee className="w-5 h-5" />
              <h3 className="font-bold text-slate-900 text-base">Desayuno</h3>
            </div>
            {!isEditing && currentDayData.breakfast && (
              <button
                onClick={() => handleQuickAddIngredientToShopping(`Ingredientes para Desayuno: ${currentDayData.breakfast}`)}
                className="text-slate-400 hover:text-indigo-600 text-xs font-semibold flex items-center gap-1 active-touch"
                title="Añadir a la compra"
              >
                <ShoppingBag className="w-3.5 h-3.5" /> +Compra
              </button>
            )}
          </div>

          {isEditing ? (
            <textarea
              rows={3}
              value={breakfast}
              onChange={(e) => setBreakfast(e.target.value)}
              placeholder="Escribe la opción de desayuno..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          ) : (
            <p className="text-sm font-medium text-slate-700 leading-relaxed">
              {currentDayData.breakfast || 'Sin planificar'}
            </p>
          )}
        </div>

        {/* Almuerzo / Comida Principal */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-orange-600">
              <Sun className="w-5 h-5" />
              <h3 className="font-bold text-slate-900 text-base">Almuerzo / Comida</h3>
            </div>
            {!isEditing && currentDayData.lunch && (
              <button
                onClick={() => handleQuickAddIngredientToShopping(`Ingredientes para Almuerzo: ${currentDayData.lunch}`)}
                className="text-slate-400 hover:text-indigo-600 text-xs font-semibold flex items-center gap-1 active-touch"
                title="Añadir a la compra"
              >
                <ShoppingBag className="w-3.5 h-3.5" /> +Compra
              </button>
            )}
          </div>

          {isEditing ? (
            <textarea
              rows={3}
              value={lunch}
              onChange={(e) => setLunch(e.target.value)}
              placeholder="Escribe el menú del almuerzo..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          ) : (
            <p className="text-sm font-medium text-slate-700 leading-relaxed">
              {currentDayData.lunch || 'Sin planificar'}
            </p>
          )}
        </div>

        {/* Merienda */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-emerald-600">
              <Apple className="w-5 h-5" />
              <h3 className="font-bold text-slate-900 text-base">Merienda</h3>
            </div>
            {!isEditing && currentDayData.snack && (
              <button
                onClick={() => handleQuickAddIngredientToShopping(`Ingredientes Merienda: ${currentDayData.snack}`)}
                className="text-slate-400 hover:text-indigo-600 text-xs font-semibold flex items-center gap-1 active-touch"
                title="Añadir a la compra"
              >
                <ShoppingBag className="w-3.5 h-3.5" /> +Compra
              </button>
            )}
          </div>

          {isEditing ? (
            <textarea
              rows={3}
              value={snack}
              onChange={(e) => setSnack(e.target.value)}
              placeholder="Escribe la merienda para los niños / familia..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          ) : (
            <p className="text-sm font-medium text-slate-700 leading-relaxed">
              {currentDayData.snack || 'Sin planificar'}
            </p>
          )}
        </div>

        {/* Cena */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-indigo-600">
              <Moon className="w-5 h-5" />
              <h3 className="font-bold text-slate-900 text-base">Cena</h3>
            </div>
            {!isEditing && currentDayData.dinner && (
              <button
                onClick={() => handleQuickAddIngredientToShopping(`Ingredientes para Cena: ${currentDayData.dinner}`)}
                className="text-slate-400 hover:text-indigo-600 text-xs font-semibold flex items-center gap-1 active-touch"
                title="Añadir a la compra"
              >
                <ShoppingBag className="w-3.5 h-3.5" /> +Compra
              </button>
            )}
          </div>

          {isEditing ? (
            <textarea
              rows={3}
              value={dinner}
              onChange={(e) => setDinner(e.target.value)}
              placeholder="Escribe el menú de la cena..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          ) : (
            <p className="text-sm font-medium text-slate-700 leading-relaxed">
              {currentDayData.dinner || 'Sin planificar'}
            </p>
          )}
        </div>
      </div>

      {/* Day Notes & Recipe Tips */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-3xl p-5 space-y-2">
        <h4 className="font-bold text-amber-900 text-xs uppercase tracking-wider">
          📝 Notas de Cocina y Preparación del Día
        </h4>
        {isEditing ? (
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Recordatorios de descongelar, compras previas o recetas..."
            className="w-full px-3 py-2 bg-white border border-amber-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
        ) : (
          <p className="text-xs text-amber-800 italic">
            {currentDayData.notes || 'Sin notas especiales para este día.'}
          </p>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { FamilyData, MealPlan, Recipe, ShoppingItem, ShoppingCategory } from '../../types/family';
import { triggerConfetti } from '../../utils/confetti';
import { 
  Utensils, 
  Plus, 
  BookOpen, 
  ShoppingCart, 
  Clock, 
  Edit3, 
  Save, 
  Check, 
  Trash2,
  ChefHat
} from 'lucide-react';

interface MealPlannerViewProps {
  data: FamilyData;
  onUpdateData: (newData: FamilyData) => void;
}

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export const MealPlannerView: React.FC<MealPlannerViewProps> = ({ data, onUpdateData }) => {
  const [editingDay, setEditingDay] = useState<string | null>(null);
  const [editLunch, setEditLunch] = useState('');
  const [editDinner, setEditDinner] = useState('');
  const [editLunchNotes, setEditLunchNotes] = useState('');
  const [editDinnerNotes, setEditDinnerNotes] = useState('');

  const [showAddRecipeModal, setShowAddModal] = useState(false);
  const [recipeTitle, setRecipeTitle] = useState('');
  const [recipePrepTime, setRecipePrepTime] = useState('30 min');
  const [recipeCategory, setRecipeCategory] = useState<'Rápida' | 'Fin de semana' | 'Saludable' | 'Postre'>('Rápida');
  const [recipeIngredients, setRecipeIngredients] = useState('');

  const [importedMessage, setImportedMessage] = useState<string | null>(null);

  const startEditDay = (day: string) => {
    const meal = data.mealPlan[day] || { lunch: '', dinner: '' };
    setEditingDay(day);
    setEditLunch(meal.lunch || '');
    setEditDinner(meal.dinner || '');
    setEditLunchNotes(meal.lunchNotes || '');
    setEditDinnerNotes(meal.dinnerNotes || '');
  };

  const handleSaveMeal = (day: string) => {
    const updatedPlan: MealPlan = {
      ...data.mealPlan,
      [day]: {
        lunch: editLunch.trim() || 'Por definir',
        dinner: editDinner.trim() || 'Por definir',
        lunchNotes: editLunchNotes.trim() || undefined,
        dinnerNotes: editDinnerNotes.trim() || undefined,
      },
    };

    onUpdateData({ ...data, mealPlan: updatedPlan });
    setEditingDay(null);
    triggerConfetti();
  };

  const handleAddRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipeTitle.trim()) return;

    const ingList = recipeIngredients
      .split(',')
      .map((i) => i.trim())
      .filter((i) => i.length > 0);

    const newRecipe: Recipe = {
      id: `r-${Date.now()}`,
      title: recipeTitle.trim(),
      prepTime: recipePrepTime,
      category: recipeCategory,
      ingredients: ingList.length > 0 ? ingList : ['Ingredientes variados'],
    };

    onUpdateData({
      ...data,
      recipes: [...data.recipes, newRecipe],
    });

    setRecipeTitle('');
    setRecipeIngredients('');
    setShowAddModal(false);
    triggerConfetti();
  };

  const handleDeleteRecipe = (recipeId: string) => {
    const updated = data.recipes.filter((r) => r.id !== recipeId);
    onUpdateData({ ...data, recipes: updated });
  };

  const handleImportIngredientsToShopping = (recipe: Recipe) => {
    const newShoppingItems: ShoppingItem[] = recipe.ingredients.map((ing, idx) => ({
      id: `s-rec-${Date.now()}-${idx}`,
      name: `${ing} (para ${recipe.title})`,
      category: 'Despensa' as ShoppingCategory,
      quantity: 1,
      unit: 'ud',
      completed: false,
      priority: 'Media',
      addedAt: new Date().toISOString().split('T')[0],
    }));

    onUpdateData({
      ...data,
      shoppingItems: [...newShoppingItems, ...data.shoppingItems],
    });

    triggerConfetti();
    setImportedMessage(`¡Se han añadido ${recipe.ingredients.length} ingredientes a la Lista de Compras!`);
    setTimeout(() => setImportedMessage(null), 3500);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-500 to-red-500 rounded-3xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold mb-2">
            <Utensils className="w-3.5 h-3.5" /> Planificación de Comidas
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">Menú Semanal del Hogar</h2>
          <p className="text-amber-100 text-xs sm:text-sm mt-1">
            Organiza los almuerzos y cenas de la semana, guarda vuestras recetas favoritas e importa ingredientes a la compra.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-2xl bg-white text-slate-900 font-bold text-xs hover:bg-amber-50 transition flex items-center gap-2 shadow-md self-start md:self-auto"
        >
          <Plus className="w-4 h-4 text-orange-600" /> Añadir Receta
        </button>
      </div>

      {importedMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500 text-white font-bold text-xs shadow-lg flex items-center justify-between animate-in zoom-in-95 duration-200">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5" />
            <span>{importedMessage}</span>
          </div>
        </div>
      )}

      {/* Weekly Menu Matrix */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <ChefHat className="w-5 h-5 text-orange-500" /> Plan de Comidas de Lunes a Domingo
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
          {DAYS.map((day) => {
            const meal = data.mealPlan[day] || { lunch: 'Por definir', dinner: 'Por definir' };
            const isEditing = editingDay === day;

            return (
              <div
                key={day}
                className="bg-white dark:bg-slate-800 rounded-3xl p-4 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2 mb-3">
                    <span className="font-extrabold text-sm text-slate-800 dark:text-slate-100">{day}</span>
                    {!isEditing && (
                      <button
                        onClick={() => startEditDay(day)}
                        className="p-1 rounded-lg text-slate-400 hover:text-orange-500 transition"
                        title="Editar menú"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-bold uppercase text-orange-600 block mb-0.5">☀️ Comida</label>
                        <input
                          type="text"
                          value={editLunch}
                          onChange={(e) => setEditLunch(e.target.value)}
                          className="w-full p-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white"
                        />
                        <input
                          type="text"
                          placeholder="Nota..."
                          value={editLunchNotes}
                          onChange={(e) => setEditLunchNotes(e.target.value)}
                          className="w-full p-1.5 mt-1 rounded-lg text-[10px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold uppercase text-purple-600 block mb-0.5">🌙 Cena</label>
                        <input
                          type="text"
                          value={editDinner}
                          onChange={(e) => setEditDinner(e.target.value)}
                          className="w-full p-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white"
                        />
                        <input
                          type="text"
                          placeholder="Nota..."
                          value={editDinnerNotes}
                          onChange={(e) => setEditDinnerNotes(e.target.value)}
                          className="w-full p-1.5 mt-1 rounded-lg text-[10px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white"
                        />
                      </div>

                      <div className="flex gap-1 pt-2">
                        <button
                          onClick={() => handleSaveMeal(day)}
                          className="flex-1 py-1.5 rounded-xl bg-orange-500 text-white font-bold text-xs flex items-center justify-center gap-1"
                        >
                          <Save className="w-3 h-3" /> Guardar
                        </button>
                        <button
                          onClick={() => setEditingDay(null)}
                          className="px-2 py-1.5 rounded-xl bg-slate-100 text-slate-500 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-2.5 rounded-2xl bg-orange-50/70 dark:bg-orange-950/30 border border-orange-100 dark:border-orange-900/40">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-orange-700 dark:text-orange-400 block">☀️ Almuerzo</span>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">{meal.lunch}</p>
                        {meal.lunchNotes && <p className="text-[10px] text-slate-400 mt-0.5">💡 {meal.lunchNotes}</p>}
                      </div>

                      <div className="p-2.5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400 block">🌙 Cena</span>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">{meal.dinner}</p>
                        {meal.dinnerNotes && <p className="text-[10px] text-slate-400 mt-0.5">💡 {meal.dinnerNotes}</p>}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recipe Book Section */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-orange-500" />
            <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">
              Recetario Favorito Familiar ({data.recipes.length})
            </h3>
          </div>
          <span className="text-xs text-slate-400">1 clic para añadir ingredientes a la compra</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.recipes.map((rec) => (
            <div key={rec.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300">
                      {rec.category}
                    </span>
                    <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 mt-1">{rec.title}</h4>
                  </div>
                  <button
                    onClick={() => handleDeleteRecipe(rec.id)}
                    className="text-slate-300 hover:text-rose-500 transition p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
                  <Clock className="w-3 h-3" /> {rec.prepTime}
                </div>

                <div className="mt-3">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Ingredientes:</span>
                  <div className="flex flex-wrap gap-1">
                    {rec.ingredients.map((ing, idx) => (
                      <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleImportIngredientsToShopping(rec)}
                className="w-full py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-xs"
              >
                <ShoppingCart className="w-3.5 h-3.5" /> Mandar Ingredientes a Compra
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Add Recipe */}
      {showAddRecipeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-orange-500" /> Añadir Receta al Recetario
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-xs text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddRecipe} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Nombre del plato *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Paella mixta, Tarta de queso..."
                  value={recipeTitle}
                  onChange={(e) => setRecipeTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Tiempo de prep.</label>
                  <input
                    type="text"
                    value={recipePrepTime}
                    onChange={(e) => setRecipePrepTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Categoría</label>
                  <select
                    value={recipeCategory}
                    onChange={(e) => setRecipeCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white"
                  >
                    <option value="Rápida">Rápida</option>
                    <option value="Saludable">Saludable</option>
                    <option value="Fin de semana">Fin de semana</option>
                    <option value="Postre">Postre</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Ingredientes (separados por coma)</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Ej: Arroz, Pollo, Conejo, Garrofón, Tomate..."
                  value={recipeIngredients}
                  onChange={(e) => setRecipeIngredients(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button type="submit" className="px-6 py-2 rounded-xl bg-orange-500 text-white font-bold text-xs shadow-md">
                  Guardar Receta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

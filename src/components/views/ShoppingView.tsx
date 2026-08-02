import React, { useState } from 'react';
import { useFamily } from '../../context/FamilyContext';
import { useAuth } from '../../context/AuthContext';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { ShoppingItem, CategoryShopping } from '../../types';
import { 
  ShoppingBag, 
  Plus, 
  Trash2, 
  Edit3,
  Check, 
  X, 
  AlertTriangle, 
  Sparkles,
  DollarSign,
  Eraser
} from 'lucide-react';

import { getUserPreferences, saveUserPreferences } from '../../lib/userPreferences';
import { ConfirmModal } from '../ConfirmModal';

export const ShoppingView: React.FC = () => {
  const { shoppingItems, addShoppingItem, editShoppingItem, toggleShoppingItem, deleteShoppingItem, clearCompletedShopping, customCategories } = useFamily();
  const { currentMember } = useAuth();

  const shoppingCategoriesList = customCategories.shopping || [
    'Frutas y Verduras',
    'Lácteos y Frescos',
    'Carnes y Pescados',
    'Panadería y Cereales',
    'Despensa y Bebidas',
    'Limpieza y Hogar',
    'Mascotas',
    'Otros'
  ];

  const [selectedCategory, setSelectedCategoryState] = useState<string>(() => 
    getUserPreferences(currentMember.id).shoppingCategoryFilter
  );

  const isFilterActive = selectedCategory !== 'Todas';

  const setSelectedCategory = (cat: string) => {
    setSelectedCategoryState(cat);
    saveUserPreferences(currentMember.id, { shoppingCategoryFilter: cat });
  };

  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null);
  const [deletingShoppingId, setDeletingShoppingId] = useState<string | null>(null);

  useBodyScrollLock(showAddModal || deletingShoppingId !== null);

  // Quick add state
  const [quickName, setQuickName] = useState('');

  // Detailed add/edit state
  const [name, setName] = useState('');
  const [category, setCategory] = useState<CategoryShopping>('Otros');
  const [quantity, setQuantity] = useState('1');
  const [estimatedPrice, setEstimatedPrice] = useState<string>('');
  const [urgent, setUrgent] = useState(false);

  const filteredItems = shoppingItems.filter(item => {
    if (selectedCategory !== 'Todas' && item.category !== selectedCategory) return false;
    return true;
  });

  const completedCount = shoppingItems.filter(i => i.completed).length;
  
  const totalEstPrice = filteredItems.reduce((acc, curr) => {
    if (!curr.completed && curr.estimatedPrice) {
      return acc + curr.estimatedPrice;
    }
    return acc;
  }, 0);

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickName.trim()) return;

    addShoppingItem({
      name: quickName.trim(),
      category: 'Otros',
      quantity: '1',
      addedBy: currentMember.name,
      urgent: false
    });

    setQuickName('');
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setName('');
    setCategory('Otros');
    setQuantity('1');
    setEstimatedPrice('');
    setUrgent(false);
    setShowAddModal(true);
  };

  const handleOpenEdit = (item: ShoppingItem) => {
    setEditingItem(item);
    setName(item.name);
    setCategory(item.category as CategoryShopping || 'Otros');
    setQuantity(item.quantity || '1');
    setEstimatedPrice(item.estimatedPrice !== undefined && item.estimatedPrice !== null ? item.estimatedPrice.toString() : '');
    setUrgent(!!item.urgent);
    setShowAddModal(true);
  };

  const handleSaveDetailed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingItem) {
      editShoppingItem(editingItem.id, {
        name: name.trim(),
        category,
        quantity: quantity.trim() || '1',
        estimatedPrice: estimatedPrice ? parseFloat(estimatedPrice) : undefined,
        urgent
      });
    } else {
      addShoppingItem({
        name: name.trim(),
        category,
        quantity: quantity.trim() || '1',
        estimatedPrice: estimatedPrice ? parseFloat(estimatedPrice) : undefined,
        addedBy: currentMember.name,
        urgent
      });
    }

    setName('');
    setEstimatedPrice('');
    setUrgent(false);
    setEditingItem(null);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Lista de la Compra</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Organiza las compras de la casa por categorías
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {totalEstPrice > 0 && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-2xl text-xs font-bold flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5" />
              <span>Est. {totalEstPrice.toFixed(2)} €</span>
            </div>
          )}

          {completedCount > 0 && (
            <button
              onClick={clearCompletedShopping}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs flex items-center gap-1 active-touch"
              title="Limpiar comprados"
            >
              <Eraser className="w-3.5 h-3.5 text-slate-500" />
              <span>Limpiar completados ({completedCount})</span>
            </button>
          )}

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1 shadow-md shadow-emerald-200 active-touch shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Añadir Producto</span>
          </button>
        </div>
      </div>

      {/* Quick Add Bar */}
      <form onSubmit={handleQuickAdd} className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2">
        <input
          type="text"
          placeholder="⚡ Añadir rápido (Se añadirá a 'Otros'). Ex: Leche, Pan, Jabón..."
          value={quickName}
          onChange={(e) => setQuickName(e.target.value)}
          className="w-full px-3.5 py-2 bg-transparent text-sm font-medium focus:outline-none placeholder:text-slate-400"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs active-touch shrink-0"
        >
          Añadir
        </button>
      </form>

      {/* Filters Bar */}
      <div className={`p-4 rounded-2xl border transition shadow-xs space-y-3 ${
        isFilterActive ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-200' : 'bg-white border-slate-200'
      }`}>
        {isFilterActive && (
          <div className="flex items-center justify-between text-xs font-bold text-emerald-900 border-b border-emerald-200 pb-2">
            <span>🛒 Filtros Activos</span>
            <button
              onClick={() => setSelectedCategory('Todas')}
              className="px-2 py-0.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg text-[10px] active-touch"
            >
              Limpiar Filtros ✕
            </button>
          </div>
        )}

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Categoría</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={`w-full px-3 py-1.5 border rounded-xl text-xs font-semibold ${
              selectedCategory !== 'Todas' ? 'bg-emerald-100 border-emerald-400 text-emerald-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <option value="Todas">Todas las categorías</option>
            {shoppingCategoriesList.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-2">
        {filteredItems.length === 0 ? (
          <div className="bg-white p-8 text-center rounded-3xl border border-slate-200 space-y-2">
            <Sparkles className="w-10 h-10 text-emerald-500 mx-auto" />
            <p className="font-bold text-slate-800 text-sm">No hay productos en esta lista.</p>
            <p className="text-xs text-slate-500">¡Escribe arriba lo que necesitas comprar!</p>
          </div>
        ) : (
          filteredItems.map(item => (
            <div
              key={item.id}
              className={`bg-white rounded-2xl p-3.5 border transition flex items-center justify-between gap-3 shadow-xs ${
                item.completed ? 'bg-slate-50/80 border-slate-200 opacity-60' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                {/* Touch Checkbox */}
                <button
                  onClick={() => toggleShoppingItem(item.id)}
                  className={`w-6 h-6 rounded-lg border flex items-center justify-center transition active-touch shrink-0 mt-0.5 sm:mt-0 ${
                    item.completed 
                      ? 'bg-emerald-500 border-emerald-600 text-white' 
                      : 'border-slate-300 hover:border-emerald-500 bg-white'
                  }`}
                >
                  {item.completed && <Check className="w-4 h-4" />}
                </button>

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className={`font-bold text-sm sm:text-base text-slate-900 break-words ${item.completed ? 'line-through text-slate-500' : ''}`}>
                      {item.name}
                    </h4>
                    {item.urgent && !item.completed && (
                      <span className="bg-rose-100 text-rose-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                        <AlertTriangle className="w-3 h-3" /> URGENTE
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                    <span className="font-semibold text-emerald-700">{item.quantity}</span>
                    <span>•</span>
                    <span className="bg-slate-100 px-2 py-0.5 rounded-md text-[10px] font-medium text-slate-700">
                      {item.category}
                    </span>
                    {item.estimatedPrice && (
                      <>
                        <span>•</span>
                        <span className="font-bold text-emerald-800">
                          ~{item.estimatedPrice.toFixed(2)}€
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleOpenEdit(item)}
                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition active-touch"
                  title="Editar producto"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeletingShoppingId(item.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition active-touch"
                  title="Eliminar producto"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* DETAILED ADD / EDIT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
            <div className="bg-emerald-600 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                <h3 className="font-bold text-lg">{editingItem ? 'Editar Producto' : 'Añadir Producto a la Compra'}</h3>
              </div>
              <button 
                onClick={() => { setShowAddModal(false); setEditingItem(null); }}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            <form onSubmit={handleSaveDetailed} className="p-5 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nombre del Producto *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Aceite de oliva, Pechuga de pollo, Detergente..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Cantidad / Unidad</label>
                  <input
                    type="text"
                    placeholder="Ej: 2 kg, 1 pack, 500g..."
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Precio Est. (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Ej: 4.50"
                    value={estimatedPrice}
                    onChange={(e) => setEstimatedPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Categoría</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as CategoryShopping)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {shoppingCategoriesList.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="urgentCheck"
                  checked={urgent}
                  onChange={(e) => setUrgent(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <label htmlFor="urgentCheck" className="text-xs font-bold text-rose-700 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Marcar como URGENTE (Se acaba pronto)
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setEditingItem(null); }}
                  className="flex-1 py-3 border border-slate-200 rounded-xl font-semibold text-slate-600 text-sm active-touch"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 text-sm active-touch"
                >
                  {editingItem ? 'Guardar Cambios' : 'Guardar Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingShoppingId}
        onCancel={() => setDeletingShoppingId(null)}
        onConfirm={() => {
          if (deletingShoppingId) deleteShoppingItem(deletingShoppingId);
          setDeletingShoppingId(null);
        }}
      />
    </div>
  );
};

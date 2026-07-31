import React, { useState } from 'react';
import { FamilyData, ShoppingCategory, ShoppingItem, PriorityLevel } from '../../types/family';
import { triggerConfetti } from '../../utils/confetti';
import { 
  ShoppingCart, 
  Plus, 
  Check, 
  Trash2, 
  Share2, 
  Sparkles,
  Coins,
  Search
} from 'lucide-react';

interface ShoppingViewProps {
  data: FamilyData;
  onUpdateData: (newData: FamilyData) => void;
}

const CATEGORIES: ShoppingCategory[] = [
  'Frutas y Verduras',
  'Lácteos y Huevos',
  'Carne y Pescado',
  'Panadería',
  'Despensa',
  'Limpieza y Hogar',
  'Mascotas',
  'Bebidas',
  'Varios'
];

const PRESETS = [
  { name: 'Leche entera 6L', category: 'Lácteos y Huevos', price: 5.40 },
  { name: 'Pan fresco', category: 'Panadería', price: 1.20 },
  { name: 'Huevos L 12uds', category: 'Lácteos y Huevos', price: 2.80 },
  { name: 'Manzanas / Plátanos', category: 'Frutas y Verduras', price: 3.50 },
  { name: 'Papel Higiénico 12r', category: 'Limpieza y Hogar', price: 4.20 },
  { name: 'Detergente Lavadora', category: 'Limpieza y Hogar', price: 8.50 },
  { name: 'Aceite de Oliva 1L', category: 'Despensa', price: 7.90 },
  { name: 'Agua Mineral Pack 6', category: 'Bebidas', price: 2.10 },
];

export const ShoppingView: React.FC<ShoppingViewProps> = ({ data, onUpdateData }) => {
  const [activeCategory, setActiveCategory] = useState<string>('Todas');
  const [filterStatus, setFilterStatus] = useState<'pending' | 'completed' | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // New item form state
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<ShoppingCategory>('Despensa');
  const [newItemQty, setNewItemQty] = useState<number>(1);
  const [newItemUnit, setNewItemUnit] = useState<string>('ud');
  const [newItemPriority, setNewItemPriority] = useState<PriorityLevel>('Media');
  const [newItemPrice, setNewItemPrice] = useState<string>('');
  const [newItemNotes, setNewItemNotes] = useState<string>('');
  const [assignedMemberId, setAssignedMemberId] = useState<string>(data.activeMemberId || '');

  // Filter items
  const filteredItems = data.shoppingItems.filter((item) => {
    const matchesCategory = activeCategory === 'Todas' || item.category === activeCategory;
    const matchesStatus = 
      filterStatus === 'all' ? true :
      filterStatus === 'pending' ? !item.completed : item.completed;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const pendingItems = data.shoppingItems.filter((i) => !i.completed);
  const completedItems = data.shoppingItems.filter((i) => i.completed);

  const pendingBudget = pendingItems.reduce((acc, curr) => acc + (curr.estimatedPrice || 0) * (curr.quantity || 1), 0);
  const totalBudget = data.shoppingItems.reduce((acc, curr) => acc + (curr.estimatedPrice || 0) * (curr.quantity || 1), 0);

  // Handlers
  const handleToggleItem = (itemId: string) => {
    const updated = data.shoppingItems.map((item) => {
      if (item.id === itemId) {
        const isNowCompleted = !item.completed;
        if (isNowCompleted) triggerConfetti();
        return { ...item, completed: isNowCompleted };
      }
      return item;
    });
    onUpdateData({ ...data, shoppingItems: updated });
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem: ShoppingItem = {
      id: `s-${Date.now()}`,
      name: newItemName.trim(),
      category: newItemCategory,
      quantity: Number(newItemQty) || 1,
      unit: newItemUnit,
      completed: false,
      priority: newItemPriority,
      estimatedPrice: newItemPrice ? parseFloat(newItemPrice) : undefined,
      notes: newItemNotes.trim() || undefined,
      assignedMemberId: assignedMemberId || undefined,
      addedAt: new Date().toISOString().split('T')[0],
    };

    onUpdateData({
      ...data,
      shoppingItems: [newItem, ...data.shoppingItems],
    });

    setNewItemName('');
    setNewItemPrice('');
    setNewItemNotes('');
    setShowAddForm(false);
    triggerConfetti();
  };

  const handleAddPreset = (preset: typeof PRESETS[0]) => {
    const newItem: ShoppingItem = {
      id: `s-${Date.now()}`,
      name: preset.name,
      category: preset.category as ShoppingCategory,
      quantity: 1,
      unit: 'ud',
      completed: false,
      priority: 'Media',
      estimatedPrice: preset.price,
      addedAt: new Date().toISOString().split('T')[0],
    };

    onUpdateData({
      ...data,
      shoppingItems: [newItem, ...data.shoppingItems],
    });
    triggerConfetti();
  };

  const handleDeleteItem = (itemId: string) => {
    const updated = data.shoppingItems.filter((i) => i.id !== itemId);
    onUpdateData({ ...data, shoppingItems: updated });
  };

  const handleClearCompleted = () => {
    const updated = data.shoppingItems.filter((i) => !i.completed);
    onUpdateData({ ...data, shoppingItems: updated });
  };

  const handleShareWhatsApp = () => {
    const pendingList = pendingItems.map((i) => `• [ ] ${i.name} (${i.quantity} ${i.unit})`).join('\n');
    const text = `🛒 *Lista de la Compra - ${data.familyName}*\n\n*Pendientes (${pendingItems.length}):*\n${pendingList || '¡Nada pendiente!'}\n\n📍 Presupuesto est.: ~${pendingBudget.toFixed(2)} €`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 rounded-3xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold mb-2">
            <ShoppingCart className="w-3.5 h-3.5" /> Lista de la Súper
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">Lista de Compras Familiar</h2>
          <p className="text-amber-100 text-xs sm:text-sm mt-1">
            Organiza lo que falta en la despensa, controla el gasto estimado y comparte la lista en 1 clic.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2.5 rounded-2xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition flex items-center gap-2 shadow-md"
          >
            <Plus className="w-4 h-4" /> Añadir Producto
          </button>
          <button
            onClick={handleShareWhatsApp}
            className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center gap-2 shadow-md"
          >
            <Share2 className="w-4 h-4" /> WhatsApp
          </button>
        </div>
      </div>

      {/* Preset Fast Add Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-700 dark:text-slate-300">
          <Sparkles className="w-4 h-4 text-amber-500" /> Añadir Rápido habituales (1-clic):
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => handleAddPreset(preset)}
              className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-slate-700/60 dark:hover:bg-slate-700 border border-amber-200/70 dark:border-slate-600 text-xs font-medium text-amber-900 dark:text-amber-200 whitespace-nowrap transition flex items-center gap-1 shrink-0"
            >
              <Plus className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              <span>{preset.name}</span>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold ml-1">({preset.price.toFixed(2)}€)</span>
            </button>
          ))}
        </div>
      </div>

      {/* Modal / Slide-down Form */}
      {showAddForm && (
        <form onSubmit={handleAddItem} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border-2 border-amber-400 shadow-xl space-y-4 animate-in slide-in-from-top duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
            <h3 className="font-bold text-base text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Plus className="w-5 h-5 text-amber-500" /> Nuevo Producto para Comprar
            </h3>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Cancelar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Nombre del producto *</label>
              <input
                type="text"
                required
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="Ej: Leche desnatada, Manzanas Fuji..."
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Categoría</label>
              <select
                value={newItemCategory}
                onChange={(e) => setNewItemCategory(e.target.value as ShoppingCategory)}
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Cantidad y Unidad</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  value={newItemQty}
                  onChange={(e) => setNewItemQty(Number(e.target.value))}
                  className="w-20 px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="ud, kg, pack..."
                  value={newItemUnit}
                  onChange={(e) => setNewItemUnit(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Precio Estimado (€)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Prioridad</label>
              <select
                value={newItemPriority}
                onChange={(e) => setNewItemPriority(e.target.value as PriorityLevel)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white"
              >
                <option value="Baja">Baja</option>
                <option value="Media">Media</option>
                <option value="Alta">Alta 🔥</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Notas / Marca / Detalles</label>
              <input
                type="text"
                placeholder="Ej: Marcas sin lactosa o supermercado específico"
                value={newItemNotes}
                onChange={(e) => setNewItemNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Encargado/a de Comprar</label>
              <select
                value={assignedMemberId}
                onChange={(e) => setAssignedMemberId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white"
              >
                <option value="">Cualquiera</option>
                {data.members.map((m) => (
                  <option key={m.id} value={m.id}>{m.avatar} {m.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition shadow-md"
            >
              Guardar Producto
            </button>
          </div>
        </form>
      )}

      {/* Controls Bar: Search, Status Filter, Category Filter */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Status Tabs */}
          <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 w-full md:w-auto">
            <button
              onClick={() => setFilterStatus('pending')}
              className={`flex-1 md:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition ${
                filterStatus === 'pending'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Pendientes ({pendingItems.length})
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`flex-1 md:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition ${
                filterStatus === 'completed'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Comprados ({completedItems.length})
            </button>
            <button
              onClick={() => setFilterStatus('all')}
              className={`flex-1 md:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition ${
                filterStatus === 'all'
                  ? 'bg-slate-800 text-white dark:bg-slate-700 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Todos ({data.shoppingItems.length})
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar producto..."
              className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white"
            />
          </div>

          {/* Budget Summary Badge */}
          <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/40 px-3.5 py-2 rounded-2xl border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200 font-bold whitespace-nowrap">
            <Coins className="w-4 h-4 text-amber-600" />
            <span>Pendiente: {pendingBudget.toFixed(2)} € (Total: {totalBudget.toFixed(2)} €)</span>
          </div>

        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 scrollbar-none border-t border-slate-100 dark:border-slate-700">
          <button
            onClick={() => setActiveCategory('Todas')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              activeCategory === 'Todas'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Todas
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                activeCategory === cat
                  ? 'bg-amber-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Shopping List Items */}
      {filteredItems.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-700">
          <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">No hay productos en esta vista</h3>
          <p className="text-xs text-slate-400 mt-1">Prueba a cambiar el filtro de categoría o añade un nuevo elemento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredItems.map((item) => {
            const assignedMember = data.members.find((m) => m.id === item.assignedMemberId);
            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition relative flex flex-col justify-between ${
                  item.completed
                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50 opacity-75'
                    : item.priority === 'Alta'
                    ? 'bg-amber-50/50 dark:bg-slate-800 border-amber-300 dark:border-amber-700'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <button
                      onClick={() => handleToggleItem(item.id)}
                      className="flex items-start gap-3 text-left group flex-1"
                    >
                      <div className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition border ${
                        item.completed
                          ? 'bg-emerald-500 text-white border-emerald-500'
                          : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 group-hover:border-amber-500'
                      }`}>
                        {item.completed && <Check className="w-4 h-4 stroke-[3]" />}
                      </div>
                      <div>
                        <h4 className={`text-sm font-bold leading-tight ${
                          item.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-100'
                        }`}>
                          {item.name}
                        </h4>
                        <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mt-0.5">
                          {item.quantity} {item.unit}
                        </p>
                      </div>
                    </button>

                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-slate-300 hover:text-rose-500 transition p-1"
                      title="Eliminar producto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {item.notes && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 italic bg-slate-50 dark:bg-slate-900/40 p-2 rounded-xl">
                      "{item.notes}"
                    </p>
                  )}
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/80 flex items-center justify-between text-[11px]">
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium">
                    {item.category}
                  </span>

                  <div className="flex items-center gap-2">
                    {item.estimatedPrice && (
                      <span className="font-bold text-slate-700 dark:text-slate-300 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                        {(item.estimatedPrice * item.quantity).toFixed(2)} €
                      </span>
                    )}

                    {assignedMember && (
                      <span className="flex items-center gap-1 text-slate-400" title={`Encargado: ${assignedMember.name}`}>
                        {assignedMember.avatar}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Clear Completed Action Bar */}
      {completedItems.length > 0 && (
        <div className="flex justify-end pt-2">
          <button
            onClick={handleClearCompleted}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-600 hover:text-rose-600 dark:text-slate-300 dark:hover:text-rose-300 text-xs font-semibold transition border border-slate-200 dark:border-slate-700 flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" /> Limpiar {completedItems.length} comprados
          </button>
        </div>
      )}

    </div>
  );
};

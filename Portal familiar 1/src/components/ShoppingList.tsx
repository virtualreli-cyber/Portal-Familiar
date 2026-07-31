import React, { useState } from 'react';
import { ShoppingItem, CategoryShopping, FamilyMember } from '../types';
import { 
  ShoppingCart, Plus, Trash2, CheckCircle2, 
  Filter, Share2, Check, Sparkles, DollarSign
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ShoppingListProps {
  items: ShoppingItem[];
  familyMembers: FamilyMember[];
  onAddItem: (item: Omit<ShoppingItem, 'id' | 'createdAt'>) => void;
  onToggleItem: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onClearCompleted: () => void;
}

const CATEGORIES: CategoryShopping[] = [
  'Frutas y Verduras',
  'Lácteos y Frescos',
  'Carnes y Pescados',
  'Despensa y Bebidas',
  'Limpieza y Hogar',
  'Mascotas',
  'Otros'
];

const PRESETS = [
  { name: '🍞 Pan de molde', category: 'Despensa y Bebidas' as CategoryShopping, qty: '1 paquete' },
  { name: '🥛 Leche Entera/Desnatada', category: 'Lácteos y Frescos' as CategoryShopping, qty: '1 pack' },
  { name: '🥚 Huevos Camperos', category: 'Lácteos y Frescos' as CategoryShopping, qty: '1 docena' },
  { name: '🍌 Plátanos', category: 'Frutas y Verduras' as CategoryShopping, qty: '1.5 kg' },
  { name: '🛢️ Aceite de Oliva', category: 'Despensa y Bebidas' as CategoryShopping, qty: '1 botella' },
  { name: '🧻 Papel Higiénico', category: 'Limpieza y Hogar' as CategoryShopping, qty: '1 pack 12' },
  { name: '🍗 Pechugas Pollo', category: 'Carnes y Pescados' as CategoryShopping, qty: '1 kg' },
  { name: '🧼 Detergente', category: 'Limpieza y Hogar' as CategoryShopping, qty: '1 botella' },
  { name: '☕ Café Molido', category: 'Despensa y Bebidas' as CategoryShopping, qty: '1 paquete' },
  { name: '🧀 Queso Curado', category: 'Lácteos y Frescos' as CategoryShopping, qty: '1 cuña' },
  { name: '🍅 Tomates Ensalada', category: 'Frutas y Verduras' as CategoryShopping, qty: '1 kg' },
  { name: '🍚 Arroz Redondo', category: 'Despensa y Bebidas' as CategoryShopping, qty: '1 kg' },
];

export const ShoppingList: React.FC<ShoppingListProps> = ({
  items,
  familyMembers,
  onAddItem,
  onToggleItem,
  onDeleteItem,
  onClearCompleted,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [selectedStore, setSelectedStore] = useState<string>('Todas');
  const [showAddModal, setShowAddModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState<CategoryShopping>('Despensa y Bebidas');
  const [quantity, setQuantity] = useState('1 u.');
  const [estimatedPrice, setEstimatedPrice] = useState<string>('');
  const [store, setStore] = useState('Mercadona');
  const [addedBy] = useState(familyMembers[0]?.name || 'Mamá');
  const [urgent, setUrgent] = useState(false);

  // Derived filters & stats
  const stores = Array.from(new Set(items.map(i => i.store).filter(Boolean)));

  const filteredItems = items.filter(item => {
    const matchesCat = selectedCategory === 'Todas' || item.category === selectedCategory;
    const matchesStore = selectedStore === 'Todas' || item.store === selectedStore;
    return matchesCat && matchesStore;
  });

  const pendingItems = filteredItems.filter(i => !i.completed);
  const completedItems = filteredItems.filter(i => i.completed);

  const totalEstimatedCost = pendingItems.reduce((acc, curr) => acc + (curr.estimatedPrice || 0), 0);
  const totalCartCost = completedItems.reduce((acc, curr) => acc + (curr.estimatedPrice || 0), 0);
  const progressPercent = items.length ? Math.round((items.filter(i => i.completed).length / items.length) * 100) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddItem({
      name: name.trim(),
      category,
      quantity: quantity.trim() || '1 u.',
      estimatedPrice: estimatedPrice ? parseFloat(estimatedPrice) : undefined,
      store: store.trim() || undefined,
      completed: false,
      addedBy,
      urgent
    });

    // Reset form
    setName('');
    setQuantity('1 u.');
    setEstimatedPrice('');
    setUrgent(false);
    setShowAddModal(false);

    confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
  };

  const handleQuickAddPreset = (preset: typeof PRESETS[0]) => {
    onAddItem({
      name: preset.name,
      category: preset.category,
      quantity: preset.qty,
      completed: false,
      addedBy: familyMembers[0]?.name || 'Familia',
      urgent: false
    });
    confetti({ particleCount: 20, spread: 40, origin: { y: 0.8 } });
  };

  const handleCopyFormattedText = () => {
    if (pendingItems.length === 0) return;
    const textLines = pendingItems.map(
      (item, idx) => `${idx + 1}. ${item.name} (${item.quantity}) ${item.store ? `[${item.store}]` : ''} ${item.urgent ? '🚨 URGENTE' : ''}`
    );
    const fullMessage = `🛒 *LISTA DE LA COMPRA - HOGARPLUS*\n\n${textLines.join('\n')}\n\nTotal estim.: ~${totalEstimatedCost.toFixed(2)}€`;
    
    navigator.clipboard.writeText(fullMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2.5 bg-amber-500 text-white rounded-2xl shadow-md shadow-amber-500/20">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white">
                Lista de la Compra Familial
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Añade productos, filtra por supermercado y lleva la cuenta exacta del carrito
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            onClick={handleCopyFormattedText}
            className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer"
            title="Copiar texto formateado para WhatsApp"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
            <span>{copied ? '¡Copiado para WhatsApp!' : 'Compartir / Copiar'}</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold rounded-xl transition-all shadow-md shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Añadir Producto</span>
          </button>
        </div>
      </div>

      {/* Progress & Cost Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Progress */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex justify-between text-xs font-bold mb-2">
            <span className="text-slate-600 dark:text-slate-400">Progreso en Carrito</span>
            <span className="text-amber-600 dark:text-amber-400">{progressPercent}% completado</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            {completedItems.length} de {items.length} productos en el carrito
          </div>
        </div>

        {/* Cost Pendiente */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">Coste Estimado Pendiente</span>
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {totalEstimatedCost.toFixed(2)} €
            </span>
          </div>
          <div className="p-3 bg-amber-100 dark:bg-amber-950 text-amber-600 rounded-2xl">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Cost Ya Comprado */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">Acumulado en Carrito</span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {totalCartCost.toFixed(2)} €
            </span>
          </div>
          <div className="p-3 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-2xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Preset Quick Add Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-3 text-xs font-bold text-slate-600 dark:text-slate-300">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Añadir básico con 1 clic:</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {PRESETS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickAddPreset(preset)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-slate-700 dark:text-slate-200 text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1 cursor-pointer border border-transparent hover:border-amber-300"
            >
              <span>{preset.name}</span>
              <Plus className="w-3 h-3 text-amber-500" />
            </button>
          ))}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-100/80 dark:bg-slate-800/80 p-3 rounded-2xl">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto no-scrollbar">
          <Filter className="w-4 h-4 text-slate-500 ml-1 flex-shrink-0" />
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 whitespace-nowrap">Categoría:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-medium rounded-xl px-3 py-1.5 border border-slate-200 dark:border-slate-700 focus:outline-none"
          >
            <option value="Todas">Todas las categorías</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 whitespace-nowrap ml-2">Tienda:</span>
          <select
            value={selectedStore}
            onChange={(e) => setSelectedStore(e.target.value)}
            className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-medium rounded-xl px-3 py-1.5 border border-slate-200 dark:border-slate-700 focus:outline-none"
          >
            <option value="Todas">Todas las tiendas</option>
            <option value="Mercadona">Mercadona</option>
            <option value="Carrefour">Carrefour</option>
            <option value="Lidl">Lidl</option>
            <option value="Frutería">Frutería</option>
            <option value="Carnicería">Carnicería</option>
            {stores.map(s => s && s !== 'Mercadona' && s !== 'Carrefour' && s !== 'Lidl' && s !== 'Frutería' && s !== 'Carnicería' && (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {completedItems.length > 0 && (
          <button
            onClick={onClearCompleted}
            className="text-xs font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 flex items-center gap-1 hover:underline cursor-pointer whitespace-nowrap"
          >
            <Trash2 className="w-3.5 h-3.5" /> Limpiar comprados ({completedItems.length})
          </button>
        )}
      </div>

      {/* Main List Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Pending Items */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="text-base font-extrabold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
            Pendientes de Comprar ({pendingItems.length})
          </h3>

          {pendingItems.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500 mb-2 opacity-80" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">¡Carro vacío de pendientes!</p>
              <p className="text-xs">No tienes nada por comprar con estos filtros.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {pendingItems.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-3.5 rounded-2xl transition-all ${
                    item.urgent
                      ? 'bg-rose-50/80 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40'
                      : 'bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50 hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => {
                        onToggleItem(item.id);
                        confetti({ particleCount: 20, spread: 40, origin: { y: 0.7 } });
                      }}
                      className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                          {item.name}
                        </span>
                        {item.urgent && (
                          <span className="px-1.5 py-0.5 text-[9px] font-extrabold rounded bg-rose-500 text-white">
                            URGENTE
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{item.quantity}</span>
                        <span>•</span>
                        <span className="text-slate-400">{item.category}</span>
                        {item.store && (
                          <>
                            <span>•</span>
                            <span className="text-amber-600 dark:text-amber-400 font-semibold">{item.store}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {item.estimatedPrice !== undefined && (
                      <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded-lg">
                        {item.estimatedPrice.toFixed(2)} €
                      </span>
                    )}
                    <button
                      onClick={() => onDeleteItem(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                      title="Eliminar producto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Completed Items in Cart */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="text-base font-extrabold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            Ya en el Carrito ({completedItems.length})
          </h3>

          {completedItems.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <ShoppingCart className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
              <p className="text-xs">Aún no has echado nada al carrito en esta sesión.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {completedItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 opacity-80"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => onToggleItem(item.id)}
                      className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                    />
                    <div>
                      <span className="text-sm font-semibold line-through text-slate-500 dark:text-slate-400">
                        {item.name}
                      </span>
                      <div className="text-xs text-slate-400">
                        {item.quantity} {item.store ? `• ${item.store}` : ''}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {item.estimatedPrice !== undefined && (
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                        {item.estimatedPrice.toFixed(2)} €
                      </span>
                    )}
                    <button
                      onClick={() => onDeleteItem(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Modal Add Item */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-extrabold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-amber-500" /> Añadir Producto a la Compra
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nombre del producto *
                </label>
                <input
                  type="text"
                  placeholder="Ej. Leche sin lactosa, Manzanas fuji..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Categoría
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as CategoryShopping)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Cantidad / Formato
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. 2 kg, 1 pack, 500g"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Precio estim. (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Ej. 3.50"
                    value={estimatedPrice}
                    onChange={(e) => setEstimatedPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Supermercado
                  </label>
                  <input
                    type="text"
                    placeholder="Mercadona, Carrefour, Lidl..."
                    value={store}
                    onChange={(e) => setStore(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="urgentCheck"
                  checked={urgent}
                  onChange={(e) => setUrgent(e.target.checked)}
                  className="w-4 h-4 accent-rose-500 rounded cursor-pointer"
                />
                <label htmlFor="urgentCheck" className="text-xs font-bold text-rose-600 dark:text-rose-400 cursor-pointer">
                  🚨 Marcar como producto urgente
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-md cursor-pointer"
                >
                  Guardar Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

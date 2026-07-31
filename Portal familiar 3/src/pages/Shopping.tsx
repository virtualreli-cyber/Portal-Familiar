import { useState } from "react";
import { Check, Plus, ShoppingCart, Trash2, X } from "lucide-react";
import { useFamilyData } from "../context/FamilyDataContext";
import { Card, SectionTitle } from "../components/ui/Card";
import { generateId } from "../lib/id";
import { cn } from "../utils/cn";

const LIST_ICONS = ["🛒", "💊", "🔧", "🧴", "🐾", "👕", "📚", "🎁"];

export function Shopping() {
  const { shoppingLists, setShoppingLists } = useFamilyData();
  const [activeListId, setActiveListId] = useState(shoppingLists[0]?.id ?? "");
  const [newItemText, setNewItemText] = useState("");
  const [newItemQty, setNewItemQty] = useState("");
  const [showNewList, setShowNewList] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListIcon, setNewListIcon] = useState(LIST_ICONS[0]);

  const activeList = shoppingLists.find((l) => l.id === activeListId) ?? shoppingLists[0];

  function addItem() {
    if (!newItemText.trim() || !activeList) return;
    setShoppingLists((prev) =>
      prev.map((l) =>
        l.id === activeList.id
          ? {
              ...l,
              items: [
                ...l.items,
                { id: generateId(), text: newItemText.trim(), qty: newItemQty.trim() || undefined, done: false },
              ],
            }
          : l,
      ),
    );
    setNewItemText("");
    setNewItemQty("");
  }

  function toggleItem(itemId: string) {
    if (!activeList) return;
    setShoppingLists((prev) =>
      prev.map((l) =>
        l.id === activeList.id
          ? { ...l, items: l.items.map((it) => (it.id === itemId ? { ...it, done: !it.done } : it)) }
          : l,
      ),
    );
  }

  function removeItem(itemId: string) {
    if (!activeList) return;
    setShoppingLists((prev) =>
      prev.map((l) => (l.id === activeList.id ? { ...l, items: l.items.filter((it) => it.id !== itemId) } : l)),
    );
  }

  function clearChecked() {
    if (!activeList) return;
    setShoppingLists((prev) =>
      prev.map((l) => (l.id === activeList.id ? { ...l, items: l.items.filter((it) => !it.done) } : l)),
    );
  }

  function addList() {
    if (!newListName.trim()) return;
    const list = { id: generateId(), name: newListName.trim(), icon: newListIcon, items: [] };
    setShoppingLists((prev) => [...prev, list]);
    setActiveListId(list.id);
    setNewListName("");
    setShowNewList(false);
  }

  function deleteList(id: string) {
    setShoppingLists((prev) => prev.filter((l) => l.id !== id));
    if (activeListId === id) {
      const remaining = shoppingLists.filter((l) => l.id !== id);
      setActiveListId(remaining[0]?.id ?? "");
    }
  }

  const pendingCount = activeList?.items.filter((i) => !i.done).length ?? 0;
  const doneCount = activeList?.items.filter((i) => i.done).length ?? 0;
  const total = (activeList?.items.length ?? 0) || 1;

  return (
    <div className="space-y-6">
      <SectionTitle
        icon={<ShoppingCart className="h-5 w-5 text-emerald-500" />}
        title="Listas de la compra"
        subtitle="Organiza todo lo que necesita la familia por categorías"
      />

      <div className="flex flex-wrap gap-2">
        {shoppingLists.map((list) => (
          <button
            key={list.id}
            onClick={() => setActiveListId(list.id)}
            className={cn(
              "group flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold transition-all",
              activeListId === list.id
                ? "border-emerald-400 bg-emerald-500 text-white shadow-md shadow-emerald-200"
                : "border-stone-200 bg-white text-stone-600 hover:border-emerald-300",
            )}
          >
            <span>{list.icon}</span>
            {list.name}
            <span
              className={cn(
                "rounded-full px-1.5 text-xs",
                activeListId === list.id ? "bg-white/25" : "bg-stone-100 text-stone-500",
              )}
            >
              {list.items.filter((i) => !i.done).length}
            </span>
          </button>
        ))}
        <button
          onClick={() => setShowNewList((s) => !s)}
          className="flex items-center gap-1 rounded-2xl border border-dashed border-emerald-300 px-4 py-2 text-sm font-semibold text-emerald-600 hover:bg-emerald-50"
        >
          <Plus className="h-4 w-4" /> Nueva lista
        </button>
      </div>

      {showNewList && (
        <Card className="flex flex-wrap items-center gap-3 p-4">
          <div className="flex gap-1.5">
            {LIST_ICONS.map((icon) => (
              <button
                key={icon}
                onClick={() => setNewListIcon(icon)}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl border text-lg",
                  newListIcon === icon ? "border-emerald-400 bg-emerald-50" : "border-stone-200",
                )}
              >
                {icon}
              </button>
            ))}
          </div>
          <input
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            placeholder="Nombre de la lista (ej. Ropa)"
            className="min-w-[180px] flex-1 rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none focus:border-emerald-400"
            onKeyDown={(e) => e.key === "Enter" && addList()}
          />
          <button
            onClick={addList}
            className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
          >
            Crear
          </button>
        </Card>
      )}

      {activeList ? (
        <Card className="p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="flex items-center gap-2 text-lg font-bold text-stone-800">
                <span>{activeList.icon}</span> {activeList.name}
              </h3>
              <p className="text-sm text-stone-500">
                {pendingCount} pendientes · {doneCount} en el carro
              </p>
            </div>
            <div className="flex gap-2">
              {doneCount > 0 && (
                <button
                  onClick={clearChecked}
                  className="rounded-xl border border-stone-200 px-3 py-1.5 text-xs font-semibold text-stone-500 hover:bg-stone-50"
                >
                  Vaciar comprados
                </button>
              )}
              <button
                onClick={() => deleteList(activeList.id)}
                className="rounded-xl border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-500 hover:bg-rose-50"
              >
                Eliminar lista
              </button>
            </div>
          </div>

          <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-stone-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all"
              style={{ width: `${(doneCount / total) * 100}%` }}
            />
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            <input
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addItem()}
              placeholder="Añadir artículo..."
              className="min-w-[160px] flex-1 rounded-xl border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400"
            />
            <input
              value={newItemQty}
              onChange={(e) => setNewItemQty(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addItem()}
              placeholder="Cantidad"
              className="w-24 rounded-xl border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400"
            />
            <button
              onClick={addItem}
              className="flex items-center gap-1 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600"
            >
              <Plus className="h-4 w-4" /> Añadir
            </button>
          </div>

          {activeList.items.length === 0 ? (
            <p className="rounded-xl bg-stone-50 p-6 text-center text-sm text-stone-400">
              Esta lista está vacía. ¡Añade el primer artículo!
            </p>
          ) : (
            <ul className="space-y-2">
              {[...activeList.items]
                .sort((a, b) => Number(a.done) - Number(b.done))
                .map((item) => (
                  <li
                    key={item.id}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-all",
                      item.done ? "border-stone-100 bg-stone-50" : "border-stone-100 bg-white",
                    )}
                  >
                    <button
                      onClick={() => toggleItem(item.id)}
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                        item.done ? "border-emerald-500 bg-emerald-500 text-white" : "border-stone-300",
                      )}
                    >
                      {item.done && <Check className="h-4 w-4" />}
                    </button>
                    <span
                      className={cn(
                        "flex-1 text-sm font-medium",
                        item.done ? "text-stone-400 line-through" : "text-stone-700",
                      )}
                    >
                      {item.text}
                    </span>
                    {item.qty && (
                      <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-500">
                        {item.qty}
                      </span>
                    )}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-stone-300 opacity-0 transition-opacity hover:text-rose-500 group-hover:opacity-100"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
            </ul>
          )}
        </Card>
      ) : (
        <Card className="p-10 text-center text-stone-400">
          <Trash2 className="mx-auto mb-2 h-8 w-8" />
          No tienes listas. ¡Crea una nueva!
        </Card>
      )}
    </div>
  );
}

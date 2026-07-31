import { useState } from "react";
import { Check, ListChecks, Plus, RotateCcw, Trash2 } from "lucide-react";
import { useFamilyData } from "../context/FamilyDataContext";
import { Card, SectionTitle } from "../components/ui/Card";
import { generateId } from "../lib/id";
import { getColorClasses } from "../lib/colors";
import type { ChoreFrequency } from "../types";
import { cn } from "../utils/cn";
import { todayISO } from "../lib/dateHelpers";

const FREQ_LABELS: Record<ChoreFrequency, string> = {
  "una-vez": "Una vez",
  diaria: "Diaria",
  semanal: "Semanal",
};

export function Chores() {
  const { chores, setChores, members } = useFamilyData();
  const [text, setText] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [frequency, setFrequency] = useState<ChoreFrequency>("una-vez");
  const [filter, setFilter] = useState<string>("todos");

  function addChore() {
    if (!text.trim()) return;
    setChores((prev) => [
      ...prev,
      {
        id: generateId(),
        text: text.trim(),
        done: false,
        assignedTo: assignedTo || undefined,
        frequency,
        createdAt: todayISO(),
      },
    ]);
    setText("");
    setAssignedTo("");
    setFrequency("una-vez");
  }

  function toggleChore(id: string) {
    setChores((prev) => prev.map((c) => (c.id === id ? { ...c, done: !c.done } : c)));
  }

  function removeChore(id: string) {
    setChores((prev) => prev.filter((c) => c.id !== id));
  }

  function resetCompleted() {
    setChores((prev) => prev.map((c) => (c.frequency !== "una-vez" ? { ...c, done: false } : c)));
  }

  const filtered = chores.filter((c) => {
    if (filter === "todos") return true;
    if (filter === "pendientes") return !c.done;
    if (filter === "hechas") return c.done;
    return c.assignedTo === filter;
  });

  const pending = chores.filter((c) => !c.done).length;

  return (
    <div className="space-y-6">
      <SectionTitle
        icon={<ListChecks className="h-5 w-5 text-amber-500" />}
        title="Tareas del hogar"
        subtitle={`${pending} tareas pendientes entre toda la familia`}
        action={
          <button
            onClick={resetCompleted}
            className="flex items-center gap-1 rounded-xl border border-amber-200 px-3 py-2 text-xs font-semibold text-amber-600 hover:bg-amber-50"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reiniciar recurrentes
          </button>
        }
      />

      <Card className="space-y-3 p-5">
        <div className="flex flex-wrap gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addChore()}
            placeholder="Nueva tarea (ej. Tender la ropa)"
            className="min-w-[200px] flex-1 rounded-xl border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-amber-400"
          />
          <select
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            className="rounded-xl border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-amber-400"
          >
            <option value="">Sin asignar</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.emoji} {m.name}
              </option>
            ))}
          </select>
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as ChoreFrequency)}
            className="rounded-xl border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-amber-400"
          >
            {Object.entries(FREQ_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          <button
            onClick={addChore}
            className="flex items-center gap-1 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-600"
          >
            <Plus className="h-4 w-4" /> Añadir
          </button>
        </div>
      </Card>

      <div className="flex flex-wrap gap-2">
        {[
          { key: "todos", label: "Todas" },
          { key: "pendientes", label: "Pendientes" },
          { key: "hechas", label: "Completadas" },
          ...members.map((m) => ({ key: m.id, label: `${m.emoji} ${m.name}` })),
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
              filter === f.key ? "border-amber-400 bg-amber-500 text-white" : "border-stone-200 text-stone-500 hover:bg-stone-50",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card className="p-10 text-center text-stone-400">No hay tareas en esta vista. ¡Buen trabajo! 🎉</Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {filtered.map((chore) => {
            const member = members.find((m) => m.id === chore.assignedTo);
            const colors = getColorClasses(member?.color);
            return (
              <Card
                key={chore.id}
                className={cn(
                  "group flex items-center gap-3 p-4 transition-opacity",
                  chore.done && "opacity-60",
                )}
              >
                <button
                  onClick={() => toggleChore(chore.id)}
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                    chore.done ? "border-amber-500 bg-amber-500 text-white" : "border-stone-300",
                  )}
                >
                  {chore.done && <Check className="h-4 w-4" />}
                </button>
                <div className="flex-1">
                  <p className={cn("text-sm font-semibold text-stone-800", chore.done && "line-through")}>
                    {chore.text}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-stone-500">
                      {FREQ_LABELS[chore.frequency]}
                    </span>
                    {member && (
                      <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", colors.bgSoft, colors.text)}>
                        {member.emoji} {member.name}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => removeChore(chore.id)}
                  className="text-stone-300 opacity-0 transition-opacity hover:text-rose-500 group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

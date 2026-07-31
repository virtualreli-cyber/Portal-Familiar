import { useState } from "react";
import { Cake, Plus, Trash2 } from "lucide-react";
import { useFamilyData } from "../context/FamilyDataContext";
import { Card, SectionTitle } from "../components/ui/Card";
import { generateId } from "../lib/id";
import {
  daysUntilNextOccurrence,
  formatDayMonth,
  upcomingAge,
  MONTH_NAMES_ES,
} from "../lib/dateHelpers";
import { cn } from "../utils/cn";

const EMOJIS = ["🎂", "🎉", "🎈", "🎀", "👶", "👦", "👧", "👨", "👩", "👴", "👵", "🐶"];

export function Birthdays() {
  const { birthdays, setBirthdays } = useFamilyData();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [day, setDay] = useState(1);
  const [month, setMonth] = useState(1);
  const [year, setYear] = useState("");
  const [relation, setRelation] = useState("");
  const [emoji, setEmoji] = useState(EMOJIS[0]);

  function resetForm() {
    setName("");
    setDay(1);
    setMonth(1);
    setYear("");
    setRelation("");
    setEmoji(EMOJIS[0]);
    setShowForm(false);
  }

  function addBirthday() {
    if (!name.trim()) return;
    setBirthdays((prev) => [
      ...prev,
      {
        id: generateId(),
        name: name.trim(),
        day,
        month,
        year: year ? Number(year) : undefined,
        emoji,
        relation: relation.trim() || undefined,
      },
    ]);
    resetForm();
  }

  function removeBirthday(id: string) {
    setBirthdays((prev) => prev.filter((b) => b.id !== id));
  }

  const sorted = [...birthdays]
    .map((b) => ({ ...b, daysLeft: daysUntilNextOccurrence(b.day, b.month) }))
    .sort((a, b) => a.daysLeft - b.daysLeft);

  return (
    <div className="space-y-6">
      <SectionTitle
        icon={<Cake className="h-5 w-5 text-rose-500" />}
        title="Cumpleaños"
        subtitle="No te olvides de ninguna fecha especial"
        action={
          <button
            onClick={() => setShowForm((s) => !s)}
            className="flex items-center gap-1 rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600"
          >
            <Plus className="h-4 w-4" /> Añadir
          </button>
        }
      />

      {showForm && (
        <Card className="space-y-4 p-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre"
              className="rounded-xl border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-rose-400"
            />
            <input
              value={relation}
              onChange={(e) => setRelation(e.target.value)}
              placeholder="Parentesco (ej. Hija)"
              className="rounded-xl border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-rose-400"
            />
            <select
              value={day}
              onChange={(e) => setDay(Number(e.target.value))}
              className="rounded-xl border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-rose-400"
            >
              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>
                  Día {d}
                </option>
              ))}
            </select>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="rounded-xl border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-rose-400"
            >
              {MONTH_NAMES_ES.map((m, i) => (
                <option key={m} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>
            <input
              value={year}
              onChange={(e) => setYear(e.target.value.replace(/\D/g, ""))}
              placeholder="Año de nacimiento (opcional)"
              className="rounded-xl border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-rose-400"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {EMOJIS.map((e) => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl border text-lg",
                  emoji === e ? "border-rose-400 bg-rose-50" : "border-stone-200",
                )}
              >
                {e}
              </button>
            ))}
            <button
              onClick={addBirthday}
              className="ml-auto rounded-xl bg-rose-500 px-5 py-2 text-sm font-semibold text-white hover:bg-rose-600"
            >
              Guardar
            </button>
          </div>
        </Card>
      )}

      {sorted.length === 0 ? (
        <Card className="p-10 text-center text-stone-400">Añade el primer cumpleaños de la familia 🎂</Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((b) => {
            const age = upcomingAge(b.year, b.month, b.day);
            const soon = b.daysLeft <= 7;
            return (
              <Card
                key={b.id}
                className={cn(
                  "group relative overflow-hidden p-5 transition-transform hover:-translate-y-0.5",
                  soon && "ring-2 ring-rose-300",
                )}
              >
                <button
                  onClick={() => removeBirthday(b.id)}
                  className="absolute right-3 top-3 text-stone-300 opacity-0 transition-opacity hover:text-rose-500 group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-100 to-pink-100 text-2xl">
                    {b.emoji}
                  </div>
                  <div>
                    <p className="font-bold text-stone-800">{b.name}</p>
                    <p className="text-xs text-stone-500">{b.relation || "Familia"}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-stone-600">{formatDayMonth(b.day, b.month)}</p>
                    {age !== null && <p className="text-xs text-stone-400">Cumplirá {age} años</p>}
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-3 py-1.5 text-xs font-bold",
                      soon ? "bg-rose-500 text-white" : "bg-rose-50 text-rose-500",
                    )}
                  >
                    {b.daysLeft === 0 ? "¡Es hoy! 🎉" : `Faltan ${b.daysLeft} días`}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

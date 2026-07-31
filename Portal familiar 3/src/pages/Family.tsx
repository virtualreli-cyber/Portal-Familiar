import { useState } from "react";
import { Pencil, Plus, Trash2, UsersRound } from "lucide-react";
import { useFamilyData } from "../context/FamilyDataContext";
import { Card, SectionTitle } from "../components/ui/Card";
import { generateId } from "../lib/id";
import { MEMBER_COLORS, getColorClasses } from "../lib/colors";
import { cn } from "../utils/cn";

const EMOJIS = ["👩", "👨", "👧", "👦", "👶", "👴", "👵", "🐶", "🐱", "🧑"];

export function Family() {
  const { familyName, setFamilyName, members, setMembers, birthdays, chores } = useFamilyData();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [emoji, setEmoji] = useState(EMOJIS[0]);
  const [color, setColor] = useState<string>(MEMBER_COLORS[0]);

  function resetForm() {
    setName("");
    setRole("");
    setEmoji(EMOJIS[0]);
    setColor(MEMBER_COLORS[0]);
    setEditingId(null);
    setShowForm(false);
  }

  function startEdit(id: string) {
    const m = members.find((mm) => mm.id === id);
    if (!m) return;
    setEditingId(id);
    setName(m.name);
    setRole(m.role ?? "");
    setEmoji(m.emoji);
    setColor(m.color);
    setShowForm(true);
  }

  function saveMember() {
    if (!name.trim()) return;
    if (editingId) {
      setMembers((prev) =>
        prev.map((m) => (m.id === editingId ? { ...m, name: name.trim(), role: role.trim() || undefined, emoji, color } : m)),
      );
    } else {
      setMembers((prev) => [
        ...prev,
        { id: generateId(), name: name.trim(), role: role.trim() || undefined, emoji, color },
      ]);
    }
    resetForm();
  }

  function removeMember(id: string) {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  }

  return (
    <div className="space-y-6">
      <SectionTitle
        icon={<UsersRound className="h-5 w-5 text-sky-500" />}
        title="Nuestra familia"
        subtitle="Gestiona los miembros que aparecen en tareas y eventos"
        action={
          <button
            onClick={() => (showForm ? resetForm() : setShowForm(true))}
            className="flex items-center gap-1 rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600"
          >
            <Plus className="h-4 w-4" /> Miembro
          </button>
        }
      />

      <Card className="p-5">
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-400">
          Nombre de la familia
        </label>
        <input
          value={familyName}
          onChange={(e) => setFamilyName(e.target.value)}
          className="w-full max-w-sm rounded-xl border border-stone-200 px-3 py-2.5 text-sm font-semibold outline-none focus:border-sky-400"
        />
      </Card>

      {showForm && (
        <Card className="space-y-4 p-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre"
              className="rounded-xl border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-sky-400"
            />
            <input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Rol (ej. Madre, Hijo...)"
              className="rounded-xl border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-sky-400"
            />
          </div>
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-stone-400">Avatar</p>
            <div className="flex flex-wrap gap-1.5">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-xl border text-lg",
                    emoji === e ? "border-sky-400 bg-sky-50" : "border-stone-200",
                  )}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-stone-400">Color</p>
            <div className="flex flex-wrap gap-1.5">
              {MEMBER_COLORS.map((c) => {
                const classes = getColorClasses(c);
                return (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={cn(
                      "h-8 w-8 rounded-full",
                      classes.bg,
                      color === c && "ring-2 ring-offset-2 ring-stone-400",
                    )}
                  />
                );
              })}
            </div>
          </div>
          <button
            onClick={saveMember}
            className="rounded-xl bg-sky-500 px-5 py-2 text-sm font-semibold text-white hover:bg-sky-600"
          >
            {editingId ? "Guardar cambios" : "Añadir miembro"}
          </button>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {members.map((m) => {
          const classes = getColorClasses(m.color);
          const memberBirthday = birthdays.find((b) => b.name === m.name);
          const memberChores = chores.filter((c) => c.assignedTo === m.id && !c.done).length;
          return (
            <Card key={m.id} className="group relative overflow-hidden p-5">
              <div className={cn("absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r", classes.gradient)} />
              <div className="flex items-center gap-4">
                <div className={cn("flex h-14 w-14 items-center justify-center rounded-2xl text-2xl", classes.bgSoft)}>
                  {m.emoji}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-stone-800">{m.name}</p>
                  <p className="text-xs text-stone-500">{m.role || "Familia"}</p>
                </div>
                <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => startEdit(m.id)}
                    className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-sky-500"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => removeMember(m.id)}
                    className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-rose-500"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="mt-4 flex gap-2 text-xs">
                {memberBirthday && (
                  <span className="rounded-full bg-rose-50 px-2.5 py-1 font-semibold text-rose-500">
                    🎂 {memberBirthday.day}/{memberBirthday.month}
                  </span>
                )}
                <span className={cn("rounded-full px-2.5 py-1 font-semibold", classes.bgSoft, classes.text)}>
                  {memberChores} tareas pendientes
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

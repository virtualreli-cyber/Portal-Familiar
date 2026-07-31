import { useState } from "react";
import { Plus, StickyNote, Trash2 } from "lucide-react";
import { useFamilyData } from "../context/FamilyDataContext";
import { SectionTitle } from "../components/ui/Card";
import { generateId } from "../lib/id";
import { NOTE_COLORS } from "../lib/colors";
import { cn } from "../utils/cn";
import { todayISO } from "../lib/dateHelpers";

const ROTATIONS = ["-rotate-2", "rotate-1", "-rotate-1", "rotate-2", "rotate-0"];

export function Notes() {
  const { notes, setNotes, members } = useFamilyData();
  const [text, setText] = useState("");
  const [author, setAuthor] = useState("");
  const [color, setColor] = useState(NOTE_COLORS[0].key);

  function addNote() {
    if (!text.trim()) return;
    setNotes((prev) => [
      { id: generateId(), text: text.trim(), color, author: author || undefined, createdAt: todayISO() },
      ...prev,
    ]);
    setText("");
  }

  function removeNote(id: string) {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }

  return (
    <div className="space-y-6">
      <SectionTitle
        icon={<StickyNote className="h-5 w-5 text-violet-500" />}
        title="Notas y recordatorios"
        subtitle="El corcho digital de la familia"
      />

      <div className="rounded-3xl border border-white/60 bg-white/80 p-5 shadow-sm">
        <div className="flex flex-wrap gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Escribe una nota rápida para la familia..."
            rows={2}
            className="min-w-[220px] flex-1 resize-none rounded-xl border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-violet-400"
          />
          <div className="flex flex-col gap-2">
            <select
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none focus:border-violet-400"
            >
              <option value="">Anónimo</option>
              {members.map((m) => (
                <option key={m.id} value={m.name}>
                  {m.emoji} {m.name}
                </option>
              ))}
            </select>
            <div className="flex gap-1.5">
              {NOTE_COLORS.map((c) => (
                <button
                  key={c.key}
                  onClick={() => setColor(c.key)}
                  className={cn(
                    "h-7 w-7 rounded-full border-2",
                    c.bg,
                    color === c.key ? "border-stone-500" : "border-transparent",
                  )}
                />
              ))}
            </div>
          </div>
          <button
            onClick={addNote}
            className="flex items-center gap-1 self-start rounded-xl bg-violet-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-600"
          >
            <Plus className="h-4 w-4" /> Fijar
          </button>
        </div>
      </div>

      {notes.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-stone-300 p-10 text-center text-stone-400">
          El corcho está vacío. ¡Deja el primer recordatorio!
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {notes.map((note, idx) => {
            const palette = NOTE_COLORS.find((c) => c.key === note.color) ?? NOTE_COLORS[0];
            return (
              <div
                key={note.id}
                className={cn(
                  "group relative flex min-h-[140px] flex-col justify-between rounded-lg border-2 p-4 shadow-md transition-transform hover:z-10 hover:scale-105 hover:rotate-0",
                  palette.bg,
                  palette.border,
                  ROTATIONS[idx % ROTATIONS.length],
                )}
              >
                <button
                  onClick={() => removeNote(note.id)}
                  className="absolute right-2 top-2 rounded-full bg-white/60 p-1 text-stone-500 opacity-0 transition-opacity hover:text-rose-600 group-hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                <p className="whitespace-pre-wrap text-sm font-medium text-stone-700">{note.text}</p>
                {note.author && (
                  <p className="mt-2 text-xs font-semibold text-stone-500">— {note.author}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

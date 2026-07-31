import { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { useFamilyData } from "../context/FamilyDataContext";
import { Card, SectionTitle } from "../components/ui/Card";
import { generateId } from "../lib/id";
import {
  MONTH_NAMES_ES,
  WEEKDAY_SHORT_ES,
  getMonthMatrix,
  isSameDay,
  toISO,
} from "../lib/dateHelpers";
import { EVENT_CATEGORY_COLORS, getColorClasses } from "../lib/colors";
import type { EventCategory } from "../types";
import { cn } from "../utils/cn";

const CATEGORY_LABELS: Record<EventCategory, string> = {
  familia: "Familia",
  colegio: "Colegio",
  salud: "Salud",
  trabajo: "Trabajo",
  ocio: "Ocio",
  otro: "Otro",
};

export function CalendarPage() {
  const { events, setEvents, birthdays, members } = useFamilyData();
  const [cursor, setCursor] = useState(new Date());
  const [selected, setSelected] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [category, setCategory] = useState<EventCategory>("familia");
  const [notes, setNotes] = useState("");
  const [memberId, setMemberId] = useState("");

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const weeks = useMemo(() => getMonthMatrix(year, month), [year, month]);
  const selectedISO = toISO(selected);

  const birthdaysByDay = useMemo(() => {
    const map = new Map<string, typeof birthdays>();
    birthdays.forEach((b) => {
      const key = `${b.month}-${b.day}`;
      map.set(key, [...(map.get(key) ?? []), b]);
    });
    return map;
  }, [birthdays]);

  function eventsForDate(date: Date) {
    const iso = toISO(date);
    return events.filter((e) => e.date === iso);
  }

  function birthdaysForDate(date: Date) {
    return birthdaysByDay.get(`${date.getMonth() + 1}-${date.getDate()}`) ?? [];
  }

  function addEvent() {
    if (!title.trim()) return;
    setEvents((prev) => [
      ...prev,
      {
        id: generateId(),
        title: title.trim(),
        date: selectedISO,
        time: time || undefined,
        category,
        notes: notes.trim() || undefined,
        memberId: memberId || undefined,
      },
    ]);
    setTitle("");
    setTime("");
    setNotes("");
    setCategory("familia");
    setMemberId("");
    setShowForm(false);
  }

  function removeEvent(id: string) {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }

  const selectedEvents = eventsForDate(selected).sort((a, b) =>
    (a.time ?? "").localeCompare(b.time ?? ""),
  );
  const selectedBirthdays = birthdaysForDate(selected);

  return (
    <div className="space-y-6">
      <SectionTitle
        icon={<CalendarDays className="h-5 w-5 text-indigo-500" />}
        title="Calendario familiar"
        subtitle="Planifica citas, eventos y celebraciones"
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <button
              onClick={() => setCursor(new Date(year, month - 1, 1))}
              className="rounded-xl border border-stone-200 p-2 hover:bg-stone-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <h3 className="text-lg font-bold text-stone-800">
              {MONTH_NAMES_ES[month]} {year}
            </h3>
            <button
              onClick={() => setCursor(new Date(year, month + 1, 1))}
              className="rounded-xl border border-stone-200 p-2 hover:bg-stone-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-stone-400">
            {WEEKDAY_SHORT_ES.map((d) => (
              <div key={d} className="py-1">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {weeks.flatMap((week, wi) =>
              week.map((date, di) => {
                if (!date) return <div key={`${wi}-${di}`} className="aspect-square" />;
                const dayEvents = eventsForDate(date);
                const dayBirthdays = birthdaysForDate(date);
                const isSelected = isSameDay(date, selected);
                const isToday = isSameDay(date, new Date());
                return (
                  <button
                    key={`${wi}-${di}`}
                    onClick={() => setSelected(date)}
                    className={cn(
                      "flex aspect-square flex-col items-center justify-start gap-1 rounded-xl border p-1.5 text-sm transition-all",
                      isSelected
                        ? "border-indigo-400 bg-indigo-500 text-white shadow-md"
                        : isToday
                          ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                          : "border-transparent hover:bg-stone-50",
                    )}
                  >
                    <span className="font-semibold">{date.getDate()}</span>
                    <div className="flex flex-wrap items-center justify-center gap-0.5">
                      {dayBirthdays.length > 0 && <span className="text-[10px]">🎂</span>}
                      {dayEvents.slice(0, 3).map((e) => (
                        <span
                          key={e.id}
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            isSelected ? "bg-white" : getColorClasses(EVENT_CATEGORY_COLORS[e.category]).dot,
                          )}
                        />
                      ))}
                    </div>
                  </button>
                );
              }),
            )}
          </div>
        </Card>

        <Card className="flex flex-col p-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm text-stone-400">
                {selected.toLocaleDateString("es-ES", { weekday: "long" })}
              </p>
              <h3 className="text-lg font-bold text-stone-800">
                {selected.getDate()} de {MONTH_NAMES_ES[selected.getMonth()]}
              </h3>
            </div>
            <button
              onClick={() => setShowForm((s) => !s)}
              className="flex items-center gap-1 rounded-xl bg-indigo-500 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-600"
            >
              <Plus className="h-4 w-4" /> Evento
            </button>
          </div>

          {selectedBirthdays.length > 0 && (
            <div className="mb-3 space-y-1.5">
              {selectedBirthdays.map((b) => (
                <div key={b.id} className="flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">
                  <span>{b.emoji}</span> Cumpleaños de {b.name}
                </div>
              ))}
            </div>
          )}

          {showForm && (
            <div className="mb-4 space-y-2 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-3">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título del evento"
                className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
              />
              <div className="flex gap-2">
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="flex-1 rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
                />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as EventCategory)}
                  className="flex-1 rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
                >
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <select
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
              >
                <option value="">Sin asignar</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.emoji} {m.name}
                  </option>
                ))}
              </select>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notas (opcional)"
                rows={2}
                className="w-full resize-none rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
              />
              <button
                onClick={addEvent}
                className="w-full rounded-xl bg-indigo-500 py-2 text-sm font-semibold text-white hover:bg-indigo-600"
              >
                Guardar evento
              </button>
            </div>
          )}

          <div className="flex-1 space-y-2 overflow-y-auto">
            {selectedEvents.length === 0 && !showForm ? (
              <p className="rounded-xl bg-stone-50 p-6 text-center text-sm text-stone-400">
                Sin eventos este día
              </p>
            ) : (
              selectedEvents.map((ev) => {
                const c = getColorClasses(EVENT_CATEGORY_COLORS[ev.category]);
                const member = members.find((m) => m.id === ev.memberId);
                return (
                  <div key={ev.id} className={cn("group rounded-xl border p-3", c.border, c.bgSoft)}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className={cn("text-sm font-bold", c.text)}>
                          {ev.time && <span className="mr-1.5">{ev.time}</span>}
                          {ev.title}
                        </p>
                        {ev.notes && <p className="mt-1 text-xs text-stone-500">{ev.notes}</p>}
                        {member && (
                          <p className="mt-1 text-xs text-stone-500">
                            {member.emoji} {member.name}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => removeEvent(ev.id)}
                        className="text-stone-300 opacity-0 transition-opacity hover:text-rose-500 group-hover:opacity-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

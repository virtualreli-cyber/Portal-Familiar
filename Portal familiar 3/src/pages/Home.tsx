import {
  Cake,
  CalendarDays,
  ChevronRight,
  ListChecks,
  ShoppingCart,
  StickyNote,
  UtensilsCrossed,
} from "lucide-react";
import { useFamilyData } from "../context/FamilyDataContext";
import { Card, SectionTitle } from "../components/ui/Card";
import {
  MONTH_NAMES_ES,
  WEEKDAY_NAMES_ES,
  daysUntilNextOccurrence,
  formatDayMonth,
  upcomingAge,
} from "../lib/dateHelpers";
import { getColorClasses, EVENT_CATEGORY_COLORS } from "../lib/colors";
import type { SectionKey } from "../types";

const now = new Date();

function greeting(): string {
  const h = now.getHours();
  if (h < 6) return "Buenas noches";
  if (h < 13) return "Buenos días";
  if (h < 20) return "Buenas tardes";
  return "Buenas noches";
}

export function Home({ onNavigate }: { onNavigate: (s: SectionKey) => void }) {
  const {
    familyName,
    members,
    birthdays,
    events,
    shoppingLists,
    chores,
    mealPlan,
    notes,
  } = useFamilyData();

  const todayIdx = (now.getDay() + 6) % 7; // Mon=0
  const todayMeal = mealPlan[todayIdx];

  const upcomingBirthdays = [...birthdays]
    .map((b) => ({ ...b, daysLeft: daysUntilNextOccurrence(b.day, b.month) }))
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 3);

  const todayISOStr = now.toISOString().slice(0, 10);
  const upcomingEvents = [...events]
    .filter((e) => e.date >= todayISOStr)
    .sort((a, b) => (a.date + (a.time ?? "")).localeCompare(b.date + (b.time ?? "")))
    .slice(0, 4);

  const pendingShoppingCount = shoppingLists.reduce(
    (acc, list) => acc + list.items.filter((i) => !i.done).length,
    0,
  );
  const pendingChores = chores.filter((c) => !c.done);

  const latestNotes = [...notes]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 2);

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-orange-400 via-rose-400 to-pink-500 p-7 text-white shadow-lg shadow-orange-200">
        <p className="text-sm font-medium text-white/80">
          {WEEKDAY_NAMES_ES[todayIdx]} {now.getDate()} de {MONTH_NAMES_ES[now.getMonth()]}
        </p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight">
          {greeting()}, {familyName} 👋
        </h1>
        <p className="mt-2 max-w-lg text-white/90">
          Aquí tienes el resumen de hoy: compras pendientes, próximos eventos,
          tareas y cumpleaños que se acercan.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <StatPill label="Por comprar" value={pendingShoppingCount} emoji="🛒" />
          <StatPill label="Tareas pendientes" value={pendingChores.length} emoji="✅" />
          <StatPill label="Próximos eventos" value={upcomingEvents.length} emoji="📅" />
          <StatPill label="Miembros" value={members.length} emoji="👨‍👩‍👧‍👦" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <SectionTitle
            icon={<CalendarDays className="h-5 w-5 text-rose-500" />}
            title="Próximos eventos"
            subtitle="Lo que se avecina en el calendario familiar"
            action={
              <button
                onClick={() => onNavigate("calendario")}
                className="flex items-center gap-1 text-sm font-semibold text-rose-500 hover:text-rose-600"
              >
                Ver calendario <ChevronRight className="h-4 w-4" />
              </button>
            }
          />
          {upcomingEvents.length === 0 ? (
            <EmptyRow text="No hay eventos próximos. ¡Añade uno en el calendario!" />
          ) : (
            <div className="space-y-2.5">
              {upcomingEvents.map((ev) => {
                const c = getColorClasses(EVENT_CATEGORY_COLORS[ev.category]);
                return (
                  <div
                    key={ev.id}
                    className="flex items-center gap-3 rounded-2xl border border-stone-100 bg-white p-3"
                  >
                    <div className={`h-full w-1.5 self-stretch rounded-full ${c.dot}`} />
                    <div className="flex-1">
                      <p className="font-semibold text-stone-800">{ev.title}</p>
                      <p className="text-xs text-stone-500">
                        {new Date(ev.date + "T00:00:00").toLocaleDateString("es-ES", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                        })}
                        {ev.time ? ` · ${ev.time}` : ""}
                      </p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${c.bgSoft} ${c.text}`}>
                      {ev.category}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <SectionTitle
            icon={<Cake className="h-5 w-5 text-rose-500" />}
            title="Cumpleaños"
            action={
              <button
                onClick={() => onNavigate("cumpleanos")}
                className="text-rose-500 hover:text-rose-600"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            }
          />
          <div className="space-y-3">
            {upcomingBirthdays.map((b) => {
              const age = upcomingAge(b.year, b.month, b.day);
              return (
                <div key={b.id} className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-lg">
                    {b.emoji}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-stone-800">{b.name}</p>
                    <p className="text-xs text-stone-500">
                      {formatDayMonth(b.day, b.month)}
                      {age ? ` · cumple ${age}` : ""}
                    </p>
                  </div>
                  <span className="rounded-full bg-rose-500/10 px-2 py-1 text-xs font-bold text-rose-600">
                    {b.daysLeft === 0 ? "¡Hoy!" : `${b.daysLeft}d`}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="p-5">
          <SectionTitle
            icon={<UtensilsCrossed className="h-5 w-5 text-teal-500" />}
            title="Menú de hoy"
            action={
              <button onClick={() => onNavigate("menu")} className="text-teal-500 hover:text-teal-600">
                <ChevronRight className="h-4 w-4" />
              </button>
            }
          />
          <div className="space-y-3">
            <MealRow label="Comida" value={todayMeal?.comida} />
            <MealRow label="Cena" value={todayMeal?.cena} />
          </div>
        </Card>

        <Card className="p-5">
          <SectionTitle
            icon={<ListChecks className="h-5 w-5 text-amber-500" />}
            title="Tareas pendientes"
            action={
              <button onClick={() => onNavigate("tareas")} className="text-amber-500 hover:text-amber-600">
                <ChevronRight className="h-4 w-4" />
              </button>
            }
          />
          {pendingChores.length === 0 ? (
            <EmptyRow text="¡Todo hecho! 🎉" />
          ) : (
            <ul className="space-y-2">
              {pendingChores.slice(0, 4).map((c) => (
                <li key={c.id} className="flex items-center gap-2 text-sm text-stone-700">
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  {c.text}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-5">
          <SectionTitle
            icon={<ShoppingCart className="h-5 w-5 text-emerald-500" />}
            title="Listas de compra"
            action={
              <button onClick={() => onNavigate("compras")} className="text-emerald-500 hover:text-emerald-600">
                <ChevronRight className="h-4 w-4" />
              </button>
            }
          />
          <div className="space-y-2">
            {shoppingLists.map((list) => {
              const pending = list.items.filter((i) => !i.done).length;
              return (
                <div key={list.id} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-stone-700">
                    <span>{list.icon}</span> {list.name}
                  </span>
                  <span className={pending > 0 ? "font-semibold text-emerald-600" : "text-stone-400"}>
                    {pending > 0 ? `${pending} pendientes` : "completa"}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {latestNotes.length > 0 && (
        <Card className="p-5">
          <SectionTitle
            icon={<StickyNote className="h-5 w-5 text-violet-500" />}
            title="Notas recientes"
            action={
              <button onClick={() => onNavigate("notas")} className="text-violet-500 hover:text-violet-600">
                <ChevronRight className="h-4 w-4" />
              </button>
            }
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {latestNotes.map((n) => (
              <div key={n.id} className="rounded-2xl bg-amber-50 p-4 text-sm text-stone-700 shadow-sm">
                {n.text}
                {n.author && <p className="mt-2 text-xs font-semibold text-stone-400">— {n.author}</p>}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function StatPill({ label, value, emoji }: { label: string; value: number; emoji: string }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl bg-white/20 px-4 py-2 backdrop-blur-sm">
      <span className="text-lg">{emoji}</span>
      <div>
        <p className="text-lg font-extrabold leading-none">{value}</p>
        <p className="text-[11px] text-white/80">{label}</p>
      </div>
    </div>
  );
}

function MealRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-xl bg-teal-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-teal-500">{label}</p>
      <p className="text-sm font-medium text-stone-700">{value || "Sin planificar"}</p>
    </div>
  );
}

function EmptyRow({ text }: { text: string }) {
  return <p className="rounded-xl bg-stone-50 p-4 text-center text-sm text-stone-400">{text}</p>;
}

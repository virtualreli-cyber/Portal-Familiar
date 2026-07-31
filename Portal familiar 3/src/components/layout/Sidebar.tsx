import {
  Cake,
  CalendarDays,
  Home,
  ListChecks,
  ShoppingCart,
  StickyNote,
  UsersRound,
  UtensilsCrossed,
} from "lucide-react";
import type { SectionKey } from "../../types";
import { cn } from "../../utils/cn";

interface NavItem {
  key: SectionKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const NAV_ITEMS: NavItem[] = [
  { key: "inicio", label: "Inicio", icon: Home },
  { key: "compras", label: "Compras", icon: ShoppingCart },
  { key: "cumpleanos", label: "Cumpleaños", icon: Cake },
  { key: "calendario", label: "Calendario", icon: CalendarDays },
  { key: "tareas", label: "Tareas", icon: ListChecks },
  { key: "menu", label: "Menú semanal", icon: UtensilsCrossed },
  { key: "familia", label: "Familia", icon: UsersRound },
  { key: "notas", label: "Notas", icon: StickyNote },
];

export function Sidebar({
  active,
  onChange,
  familyName,
}: {
  active: SectionKey;
  onChange: (key: SectionKey) => void;
  familyName: string;
}) {
  return (
    <aside className="hidden w-72 shrink-0 flex-col border-r border-orange-100 bg-white/70 px-5 py-7 backdrop-blur-md md:flex">
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-rose-500 text-2xl shadow-lg shadow-orange-200">
          🏡
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-orange-500">
            Family Hub
          </p>
          <p className="truncate text-lg font-bold text-stone-800">{familyName}</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onChange(item.key)}
              className={cn(
                "group flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition-all",
                isActive
                  ? "bg-gradient-to-r from-orange-400 to-rose-500 text-white shadow-md shadow-orange-200"
                  : "text-stone-500 hover:bg-orange-50 hover:text-stone-800",
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 transition-transform",
                  isActive ? "text-white" : "text-stone-400 group-hover:text-orange-500",
                )}
              />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-6 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 p-4 text-xs text-orange-800">
        <p className="font-semibold">💾 Datos guardados</p>
        <p className="mt-1 text-orange-700/80">
          Todo se guarda automáticamente en este dispositivo.
        </p>
      </div>
    </aside>
  );
}

export function MobileNav({
  active,
  onChange,
}: {
  active: SectionKey;
  onChange: (key: SectionKey) => void;
}) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex items-stretch justify-between gap-0.5 border-t border-orange-100 bg-white/95 px-1.5 pb-[env(safe-area-inset-bottom)] pt-1.5 backdrop-blur-md md:hidden">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = active === item.key;
        return (
          <button
            key={item.key}
            onClick={() => onChange(item.key)}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[10px] font-semibold transition-colors",
              isActive ? "text-rose-500" : "text-stone-400",
            )}
          >
            <Icon className={cn("h-5 w-5", isActive && "scale-110")} />
            <span className="truncate">{item.label.split(" ")[0]}</span>
          </button>
        );
      })}
    </nav>
  );
}

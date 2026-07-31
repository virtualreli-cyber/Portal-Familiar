import { UtensilsCrossed } from "lucide-react";
import { useFamilyData } from "../context/FamilyDataContext";
import { Card, SectionTitle } from "../components/ui/Card";
import { WEEKDAY_NAMES_ES } from "../lib/dateHelpers";
import { cn } from "../utils/cn";

export function MealPlanner() {
  const { mealPlan, setMealPlan } = useFamilyData();
  const todayIdx = (new Date().getDay() + 6) % 7;

  function updateMeal(dayIdx: number, field: "comida" | "cena", value: string) {
    setMealPlan((prev) => ({
      ...prev,
      [dayIdx]: { ...prev[dayIdx], [field]: value },
    }));
  }

  return (
    <div className="space-y-6">
      <SectionTitle
        icon={<UtensilsCrossed className="h-5 w-5 text-teal-500" />}
        title="Menú semanal"
        subtitle="Planifica las comidas y cenas de toda la semana"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {WEEKDAY_NAMES_ES.map((day, idx) => (
          <Card
            key={day}
            className={cn(
              "flex flex-col gap-3 p-4",
              idx === todayIdx && "ring-2 ring-teal-400",
            )}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-stone-800">{day}</h3>
              {idx === todayIdx && (
                <span className="rounded-full bg-teal-500 px-2 py-0.5 text-[10px] font-bold text-white">
                  HOY
                </span>
              )}
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-teal-500">
                🍲 Comida
              </label>
              <textarea
                value={mealPlan[idx]?.comida ?? ""}
                onChange={(e) => updateMeal(idx, "comida", e.target.value)}
                placeholder="¿Qué toca?"
                rows={2}
                className="w-full resize-none rounded-xl border border-stone-200 bg-teal-50/40 px-2.5 py-2 text-sm outline-none focus:border-teal-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-indigo-500">
                🌙 Cena
              </label>
              <textarea
                value={mealPlan[idx]?.cena ?? ""}
                onChange={(e) => updateMeal(idx, "cena", e.target.value)}
                placeholder="¿Qué toca?"
                rows={2}
                className="w-full resize-none rounded-xl border border-stone-200 bg-indigo-50/40 px-2.5 py-2 text-sm outline-none focus:border-indigo-400"
              />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

import { useState } from "react";
import { FamilyDataProvider, useFamilyData } from "./context/FamilyDataContext";
import { MobileNav, NAV_ITEMS, Sidebar } from "./components/layout/Sidebar";
import type { SectionKey } from "./types";
import { Home } from "./pages/Home";
import { Shopping } from "./pages/Shopping";
import { Birthdays } from "./pages/Birthdays";
import { CalendarPage } from "./pages/CalendarPage";
import { Chores } from "./pages/Chores";
import { MealPlanner } from "./pages/MealPlanner";
import { Family } from "./pages/Family";
import { Notes } from "./pages/Notes";

function DashboardShell() {
  const [active, setActive] = useState<SectionKey>("inicio");
  const { familyName } = useFamilyData();

  const activeLabel = NAV_ITEMS.find((n) => n.key === active)?.label ?? "";

  return (
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_top_left,_#fff7ed,_#fef2f2_45%,_#fdf4ff_100%)]">
      <Sidebar active={active} onChange={setActive} familyName={familyName} />

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-orange-100 bg-white/80 px-5 py-4 backdrop-blur-md md:hidden">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-rose-500 text-lg">
              🏡
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-orange-500">
                {familyName}
              </p>
              <p className="text-sm font-bold text-stone-800">{activeLabel}</p>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 pb-24 sm:px-6 lg:px-10 lg:py-8 md:pb-8">
          <div className="mx-auto w-full max-w-6xl">
            {active === "inicio" && <Home onNavigate={setActive} />}
            {active === "compras" && <Shopping />}
            {active === "cumpleanos" && <Birthdays />}
            {active === "calendario" && <CalendarPage />}
            {active === "tareas" && <Chores />}
            {active === "menu" && <MealPlanner />}
            {active === "familia" && <Family />}
            {active === "notas" && <Notes />}
          </div>
        </main>
      </div>

      <MobileNav active={active} onChange={setActive} />
    </div>
  );
}

export default function App() {
  return (
    <FamilyDataProvider>
      <DashboardShell />
    </FamilyDataProvider>
  );
}

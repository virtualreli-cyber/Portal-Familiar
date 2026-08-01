import React from 'react';
import { useFamily } from '../../context/FamilyContext';
import { useAuth } from '../../context/AuthContext';
import { ActiveTab } from '../../types';
import { 
  Calendar, 
  CheckSquare, 
  ShoppingBag, 
  Cross, 
  Sparkles,
  Bell,
  CheckCircle2,
  XCircle,
  Gift,
  Cake,
  PhoneCall,
  ChevronRight,
  Pin
} from 'lucide-react';

interface DashboardViewProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ setActiveTab }) => {
  const { 
    events, 
    tasks, 
    shoppingItems, 
    rewardRequests,
    intentions,
    anniversaries,
    stickyNotes,
    approveTaskValidation,
    rejectTaskValidation,
    approveRewardRequest,
    rejectRewardRequest,
    enjoyReward
  } = useFamily();
  const { currentMember, allMembers, isAdmin } = useAuth();

  const todayISO = new Date().toISOString().split('T')[0];

  // Events & Tasks assigned/involving the current logged-in member
  const myTodayEvents = events.filter(e => e.date === todayISO && (e.assignedMemberIds.length === 0 || e.assignedMemberIds.includes(currentMember.id)));
  const myPendingTasks = tasks.filter(t => !t.completed && (t.assignedMemberId === currentMember.id || !t.assignedMemberId));

  // Pending Parent Validations (Tasks & Rewards)
  const pendingTaskValidations = tasks.filter(t => t.validationStatus === 'pending_approval');
  const pendingRewardValidations = rewardRequests.filter(r => r.status === 'requested');

  // Approved Rewards for current logged-in member
  const myApprovedRewards = rewardRequests.filter(r => r.memberId === currentMember.id && r.status === 'approved');

  // Active Catholic Intentions
  const activeIntentions = intentions.filter(i => !i.completed);

  // Calculate upcoming Birthdays & Anniversaries for ALL family members
  const now = new Date();
  now.setHours(0,0,0,0);
  const currentYear = now.getFullYear();

  const upcomingEventsList: Array<{
    id: string;
    title: string;
    type: 'birthday' | 'anniversary';
    member?: (typeof allMembers)[0];
    dateStr: string;
    daysRemaining: number;
  }> = [];

  // ALL Family Members Birthdays
  allMembers.forEach(member => {
    if (!member.birthDate) return;
    const parts = member.birthDate.split('-');
    if (parts.length < 3) return;
    const month = parseInt(parts[1]) - 1;
    const day = parseInt(parts[2]);

    let targetDate = new Date(currentYear, month, day);
    if (targetDate < now) {
      targetDate = new Date(currentYear + 1, month, day);
    }
    const diffTime = targetDate.getTime() - now.getTime();
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    upcomingEventsList.push({
      id: `bday_${member.id}`,
      title: `Cumpleaños de ${member.name.split(' ')[0]}`,
      type: 'birthday',
      member,
      dateStr: `${day}/${month + 1}`,
      daysRemaining
    });
  });

  // ALL Anniversaries
  anniversaries.forEach(ann => {
    if (!ann.date) return;
    const parts = ann.date.split('-');
    if (parts.length < 3) return;
    const month = parseInt(parts[1]) - 1;
    const day = parseInt(parts[2]);

    let targetDate = new Date(currentYear, month, day);
    if (targetDate < now) {
      targetDate = new Date(currentYear + 1, month, day);
    }
    const diffTime = targetDate.getTime() - now.getTime();
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    upcomingEventsList.push({
      id: ann.id,
      title: ann.title,
      type: 'anniversary',
      dateStr: `${day}/${month + 1}`,
      daysRemaining
    });
  });

  // Sort upcoming events by days remaining
  upcomingEventsList.sort((a, b) => a.daysRemaining - b.daysRemaining);

  return (
    <div className="space-y-6 pb-12 overflow-x-hidden">
      {/* Refactored Hero Welcome Card */}
      <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white rounded-3xl p-6 sm:p-7 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white flex items-center gap-2">
            <span>Hola, {currentMember.name}</span>
            <span className="text-3xl sm:text-4xl">{currentMember.avatar}</span>
          </h2>

          {/* Member's Involvement Badges */}
          <div className="flex items-center gap-2.5 flex-wrap pt-1">
            <button
              onClick={() => setActiveTab('calendar')}
              className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs rounded-2xl flex items-center gap-1.5 shadow-xs transition active-touch"
              title="Ir al Calendario"
            >
              <Calendar className="w-4 h-4 text-slate-900" />
              <span>{myTodayEvents.length} Eventos hoy</span>
            </button>

            <button
              onClick={() => setActiveTab('tasks')}
              className="px-3.5 py-1.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-extrabold text-xs rounded-2xl flex items-center gap-1.5 shadow-xs transition active-touch"
              title="Ir a Mis Tareas"
            >
              <CheckSquare className="w-4 h-4 text-slate-900" />
              <span>{myPendingTasks.length} Tareas pendientes</span>
            </button>
          </div>
        </div>
      </div>

      {/* MEMBER'S APPROVED REWARD NOTIFICATION */}
      {myApprovedRewards.length > 0 && (
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-5 rounded-3xl shadow-lg space-y-3 animate-fade-in">
          <div className="flex items-center gap-2 font-extrabold text-sm sm:text-base border-b border-white/20 pb-2">
            <Sparkles className="w-5 h-5 text-amber-300 animate-spin" />
            <span>¡Tienes Recompensas Aprobadas por los Padres para Disfrutar!</span>
          </div>

          <div className="space-y-2">
            {myApprovedRewards.map(req => (
              <div key={req.id} className="bg-white/10 backdrop-blur-xs p-3.5 rounded-2xl border border-white/20 flex items-center justify-between gap-3">
                <div>
                  <p className="font-extrabold text-sm text-white flex items-center gap-1.5">
                    <Gift className="w-4 h-4 text-amber-300" /> {req.rewardTitle}
                  </p>
                  <p className="text-[11px] text-emerald-100">
                    Aprobado por tus padres. ¡Disfrútalo cuando quieras!
                  </p>
                </div>
                <button
                  onClick={() => enjoyReward(req.id)}
                  className="px-4 py-2 bg-amber-400 text-slate-900 font-extrabold text-xs rounded-xl shadow-md active-touch shrink-0"
                >
                  ¡Marcar como Disfrutado! ✓
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PARENTS NOTIFICATION CENTER */}
      {isAdmin && (pendingTaskValidations.length > 0 || pendingRewardValidations.length > 0) && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white p-5 sm:p-6 rounded-3xl shadow-xl space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-white/20 pb-3">
            <div className="flex items-center gap-2 font-extrabold text-sm sm:text-base">
              <Bell className="w-5 h-5 animate-bounce" />
              <span>Avisos Pendientes de Validación por los Padres</span>
            </div>
            <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-bold">
              {pendingTaskValidations.length + pendingRewardValidations.length} Solicitudes
            </span>
          </div>

          {/* Pending Task Validations */}
          {pendingTaskValidations.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-amber-100 uppercase tracking-wider">Tareas Avisadas por Hijos:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {pendingTaskValidations.map(t => {
                  const reqMember = allMembers.find(m => m.id === t.requestedByMemberId || m.id === t.assignedMemberId);
                  return (
                    <div key={t.id} className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/20 flex items-center justify-between gap-2">
                      <div className="text-xs">
                        <p className="font-bold text-white truncate">{t.title}</p>
                        <p className="text-[10px] text-amber-100">
                          Aviso por: <span className="font-bold">{reqMember?.name || 'Miembro'}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => approveTaskValidation(t.id)}
                          className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold rounded-lg flex items-center gap-1 shadow-xs active-touch"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Aprobar
                        </button>
                        <button
                          onClick={() => rejectTaskValidation(t.id)}
                          className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold rounded-lg flex items-center gap-1 active-touch"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Rechazar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Pending Reward Validations */}
          {pendingRewardValidations.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-white/20">
              <p className="text-xs font-bold text-amber-100 uppercase tracking-wider">Recompensas Solicitadas:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {pendingRewardValidations.map(r => (
                  <div key={r.id} className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/20 flex items-center justify-between gap-2">
                    <div className="text-xs">
                      <p className="font-bold text-white truncate">{r.rewardTitle}</p>
                      <p className="text-[10px] text-amber-100">
                        Por: <span className="font-bold">{r.memberName}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => approveRewardRequest(r.id)}
                        className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold rounded-lg flex items-center gap-1 shadow-xs active-touch"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Validar
                      </button>
                      <button
                        onClick={() => rejectRewardRequest(r.id)}
                        className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold rounded-lg flex items-center gap-1 active-touch"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Rechazar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* FRIDGE NOTES SECTION (Reemplaza el Menú Semanal en Inicio - Request 9) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
              <Pin className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Notas de la Nevera</h3>
          </div>
          <button
            onClick={() => setActiveTab('notes')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 active-touch"
          >
            Ver Nevera <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Compact Horizontal Scrollable Row for Sticky Notes (Request 9 & 10) */}
        {stickyNotes.length === 0 ? (
          <p className="text-xs text-slate-400 italic text-center py-2">No hay notas pegadas en la nevera.</p>
        ) : (
          <div className="relative">
            <div className="flex items-stretch gap-3 overflow-x-auto pb-2 no-scrollbar horizontal-scroll-hint">
              {stickyNotes.map(note => (
                <div
                  key={note.id}
                  onClick={() => setActiveTab('notes')}
                  className={`p-3 rounded-2xl border shadow-xs transition active-touch cursor-pointer min-w-[170px] sm:min-w-[190px] max-w-[210px] shrink-0 flex flex-col justify-between space-y-1.5 ${
                    note.color === 'yellow' ? 'bg-amber-100 border-amber-300 text-amber-950' :
                    note.color === 'pink' ? 'bg-pink-100 border-pink-300 text-pink-950' :
                    note.color === 'blue' ? 'bg-blue-100 border-blue-300 text-blue-950' :
                    note.color === 'purple' ? 'bg-purple-100 border-purple-300 text-purple-950' :
                    'bg-emerald-100 border-emerald-300 text-emerald-950'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="font-extrabold text-xs leading-tight line-clamp-1">{note.title}</h4>
                      {note.pinned && <Pin className="w-3 h-3 text-rose-600 shrink-0" />}
                    </div>
                    <p className="text-[11px] leading-snug line-clamp-3 opacity-90">{note.content}</p>
                  </div>
                  {note.author && (
                    <p className="text-[9px] font-bold opacity-75 text-right pt-1 border-t border-black/10">
                      — {note.author}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CATHOLIC PRAYER INTENTIONS BANNER */}
      {activeIntentions.length > 0 && (
        <div className="bg-gradient-to-r from-purple-800 to-indigo-900 text-white p-5 rounded-3xl shadow-md space-y-3">
          <div className="flex items-center justify-between border-b border-purple-400/30 pb-2">
            <div className="flex items-center gap-2 font-extrabold text-sm">
              <Cross className="w-5 h-5 text-amber-300" />
              <span>Intenciones de Oración de la Familia</span>
            </div>
            <button
              onClick={() => setActiveTab('catholic')}
              className="text-[10px] font-bold bg-white/20 px-2.5 py-1 rounded-full hover:bg-white/30"
            >
              Ver Rincón Católico
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {activeIntentions.map(i => (
              <div key={i.id} className="bg-white/10 p-3 rounded-2xl border border-white/15 text-xs space-y-0.5">
                <p className="font-bold text-amber-200">{i.title}</p>
                <p className="text-[10px] text-purple-200">
                  Pedida por: <span className="font-bold text-white">{i.requestedBy}</span> ({i.type})
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* UPCOMING BIRTHDAYS & ANNIVERSARIES */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-pink-100 text-pink-600">
              <Cake className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Próximos Cumpleaños y Aniversarios</h3>
          </div>
          <button
            onClick={() => setActiveTab('birthdays')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            Ver Todos <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Horizontal Scroll Bar */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar horizontal-scroll-hint">
          {upcomingEventsList.map(item => {
            const isToday = item.daysRemaining === 0;
            const daysLabel = isToday ? '¡Hoy!' : item.daysRemaining === 1 ? 'Mañana' : `En ${item.daysRemaining} d.`;

            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-2xl border flex flex-col justify-between space-y-2 shadow-2xs min-w-[140px] max-w-[160px] shrink-0 ${
                  item.member?.color || 'bg-slate-700 text-white'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xl">{item.member?.avatar || '🎉'}</span>
                  <span className="px-2 py-0.5 rounded-full bg-white/20 text-[9px] font-extrabold uppercase text-white shrink-0">
                    {daysLabel}
                  </span>
                </div>

                <div>
                  <h4 className="font-extrabold text-xs text-white leading-tight truncate">{item.title}</h4>
                  <p className="text-[10px] text-white/80 font-medium">📅 {item.dateStr}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DASHBOARD SECTION SUMMARY CARDS */}
      <div className="space-y-3">
        <h3 className="font-extrabold text-slate-900 text-base">Secciones Principales</h3>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {/* 1. Tareas */}
          <div 
            onClick={() => setActiveTab('tasks')}
            className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md hover:border-amber-300 transition cursor-pointer flex flex-col justify-between space-y-3 active-touch"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-700">
                <CheckSquare className="w-5 h-5" />
              </div>
              <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-extrabold text-[10px] rounded-full">
                {myPendingTasks.length} pendientes
              </span>
            </div>
            <div>
              <h4 className="font-extrabold text-xs sm:text-sm text-slate-900">Tareas del Hogar</h4>
              <p className="text-[10px] text-slate-500 mt-0.5">Listas de tareas</p>
            </div>
          </div>

          {/* 2. Eventos / Calendario */}
          <div 
            onClick={() => setActiveTab('calendar')}
            className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md hover:border-indigo-300 transition cursor-pointer flex flex-col justify-between space-y-3 active-touch"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-2xl bg-indigo-100 text-indigo-700">
                <Calendar className="w-5 h-5" />
              </div>
              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-900 font-extrabold text-[10px] rounded-full">
                {myTodayEvents.length} hoy
              </span>
            </div>
            <div>
              <h4 className="font-extrabold text-xs sm:text-sm text-slate-900">Eventos y Calendario</h4>
              <p className="text-[10px] text-slate-500 mt-0.5">Agenda mensual y vista diaria</p>
            </div>
          </div>

          {/* 3. Compra */}
          <div 
            onClick={() => setActiveTab('shopping')}
            className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md hover:border-emerald-300 transition cursor-pointer flex flex-col justify-between space-y-3 active-touch"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-700">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 font-extrabold text-[10px] rounded-full">
                {shoppingItems.filter(s => !s.completed).length} items
              </span>
            </div>
            <div>
              <h4 className="font-extrabold text-xs sm:text-sm text-slate-900">Lista de la Compra</h4>
              <p className="text-[10px] text-slate-500 mt-0.5">Supermercado y despensa</p>
            </div>
          </div>

          {/* 4. Contactos */}
          <div 
            onClick={() => setActiveTab('contacts')}
            className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-300 transition cursor-pointer flex flex-col justify-between space-y-3 active-touch"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-2xl bg-blue-100 text-blue-700">
                <PhoneCall className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
            <div>
              <h4 className="font-extrabold text-xs sm:text-sm text-slate-900">Contactos</h4>
              <p className="text-[10px] text-slate-500 mt-0.5">Médicos, colegio y emergencias</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

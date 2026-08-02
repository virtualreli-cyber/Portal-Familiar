import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useFamily } from '../../context/FamilyContext';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { FamilyMember, ActiveTab, FamilyRole, RolePermissions, AnniversaryItem } from '../../types';
import { ConfirmModal } from '../ConfirmModal';
import { AnniversaryModal } from '../AnniversaryModal';
import { 
  Settings, 
  ShieldCheck, 
  RotateCcw, 
  Users, 
  Lock,
  Plus,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  Wifi,
  UtensilsCrossed,
  PhoneCall,
  Tag,
  Check,
  X,
  Palette,
  Home,
  FolderPlus,
  Sun,
  Moon,
  GripVertical,
  Heart,
  LayoutGrid
} from 'lucide-react';

const AVATAR_GROUPS = [
  { label: 'Padres', avatars: ['👨‍💼', '👨‍🏫', '👨‍⚕️', '👨‍💻', '👨‍🍳', '👨‍🌾', '👨‍🎨', '👩‍💼', '👩‍🏫', '👩‍⚕️', '👩‍💻', '👩‍🍳', '👩‍🎨'] },
  { label: 'Hijos / Jóvenes', avatars: ['👦', '🧒', '👶', '🧑‍🎓', '⚽', '👧', '🧒‍♀️', '👩‍🎓', '🩰'] },
  { label: 'Abuelos / Mayores', avatars: ['👴', '👵', '👓', '🧓'] },
  { label: 'Mascotas & Otros', avatars: ['🐶', '🐱', '🐰', '✝️', '❤️', '🏡'] }
];

const COLOR_SWATCHES = [
  'bg-indigo-600 text-white',
  'bg-rose-600 text-white',
  'bg-amber-500 text-white',
  'bg-emerald-500 text-white',
  'bg-purple-600 text-white',
  'bg-sky-500 text-white',
  'bg-orange-500 text-white',
  'bg-teal-600 text-white',
  'bg-fuchsia-600 text-white',
  'bg-red-600 text-white',
  'bg-slate-700 text-white'
];

export const AdminSettingsView: React.FC = () => {
  const { allMembers, rolePermissionsMap, setRolePermissionsMap, isAdmin, updateMemberDetails, addMember, deleteMember } = useAuth();
  const { 
    familyName,
    updateFamilyName,
    darkMode,
    toggleDarkMode,
    themeColor,
    setThemeColor,
    sectionVisibility, 
    updateSectionVisibility, 
    dashboardCardsVisibility,
    updateDashboardCardVisibility,
    customCategories, 
    addCategory,
    deleteCategory,
    reorderCategories,
    customTaskLists,
    addCustomTaskList,
    deleteCustomTaskList,
    mealPlan,
    updateMealPlanDay,
    emergencyContacts,
    addEmergencyContact,
    deleteEmergencyContact,
    anniversaries,
    addAnniversary,
    deleteAnniversary,
    menuOrder,
    reorderMenuSections,
    resetToMockData,
    wifiSSID: wifiSSIDCtx,
    wifiPass: wifiPassCtx,
    updateWifi
  } = useFamily();

  const [activeAdminSubtab, setActiveAdminSubtab] = useState<'family' | 'sections' | 'general' | 'meals' | 'contacts' | 'categories' | 'usuarios'>('family');

  // PIN visibility for each member in the 'usuarios' section
  const [visiblePins, setVisiblePins] = useState<Record<string, boolean>>({});
  const togglePinVisibility = (id: string) => setVisiblePins(prev => ({ ...prev, [id]: !prev[id] }));

  // Deletion confirmation modal for categories / custom lists
  const [deletingCatInfo, setDeletingCatInfo] = useState<{ type: 'tasks' | 'shopping' | 'events' | 'anniversaries' | 'list'; name: string } | null>(null);

  // Drag and drop category state
  const [dragItem, setDragItem] = useState<{ type: 'tasks' | 'shopping' | 'events' | 'anniversaries'; index: number } | null>(null);

  // Member editing modal
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [memberForm, setMemberForm] = useState<Partial<FamilyMember>>({});

  // Contact editing modal
  const [editingContact, setEditingContact] = useState<any | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', relationOrType: '', phone: '', address: '', notes: '' });

  // Anniversary modal state
  const [showAnniversaryModal, setShowAnniversaryModal] = useState(false);
  const [editingAnniversary, setEditingAnniversary] = useState<AnniversaryItem | null>(null);

  // General settings state
  const [wifiSSID, setWifiSSID] = useState(wifiSSIDCtx);
  const [wifiPassword, setWifiPassword] = useState(wifiPassCtx);

  // Sync WiFi state from context when it loads from Supabase
  React.useEffect(() => { if (wifiSSIDCtx) setWifiSSID(wifiSSIDCtx); }, [wifiSSIDCtx]);
  React.useEffect(() => { if (wifiPassCtx) setWifiPassword(wifiPassCtx); }, [wifiPassCtx]);
  const [tempFamilyName, setTempFamilyName] = useState(familyName);
  const [savedGeneralMsg, setSavedGeneralMsg] = useState(false);

  // Category inline add inputs
  const [newCatTask, setNewCatTask] = useState('');
  const [newCatShopping, setNewCatShopping] = useState('');
  const [newCatEvent, setNewCatEvent] = useState('');
  const [newCatAnniversary, setNewCatAnniversary] = useState('');

  // Deletion confirmation
  const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null);
  const [deletingContactId, setDeletingContactId] = useState<string | null>(null);

  useBodyScrollLock(showMemberModal || showContactModal || showAnniversaryModal || deletingMemberId !== null || deletingContactId !== null || deletingCatInfo !== null);

  if (!isAdmin) {
    return (
      <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-4 max-w-lg mx-auto my-12">
        <Lock className="w-10 h-10 text-rose-500 mx-auto" />
        <h3 className="font-bold text-slate-900 text-lg">Panel Reservado a Administradores</h3>
        <p className="text-xs text-slate-500">
          Solo el usuario Padre o Madre tiene acceso a este panel de administración.
        </p>
      </div>
    );
  }

  const handleOpenEditMember = (member: FamilyMember) => {
    setEditingMember(member);
    setMemberForm({ ...member });
    setShowMemberModal(true);
  };

  const handleOpenAddMember = () => {
    setEditingMember(null);
    setMemberForm({
      name: '',
      role: 'Hijo',
      avatar: '👦',
      color: 'bg-indigo-600 text-white',
      age: 10,
      gender: 'Masculino',
      birthDate: '2016-01-01',
      pinCode: '1234',
      points: 100,
      clothingSizes: { shirt: 'M', pants: '38', shoes: '39' },
      allergies: [],
      notes: ''
    });
    setShowMemberModal(true);
  };

  const calculateAge = (birthDate?: string): number => {
    if (!birthDate) return 0;
    const birth = new Date(birthDate + 'T00:00:00');
    if (isNaN(birth.getTime())) return 0;
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return Math.max(0, age);
  };

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberForm.name) return;

    const computedAge = calculateAge(memberForm.birthDate);

    if (editingMember) {
      updateMemberDetails(editingMember.id, { ...memberForm, age: computedAge });
    } else {
      addMember({
        name: memberForm.name || 'Nuevo Miembro',
        role: (memberForm.role as FamilyRole) || 'Hijo',
        avatar: memberForm.avatar || '👦',
        color: memberForm.color || 'bg-indigo-600 text-white',
        birthDate: memberForm.birthDate || '2015-01-01',
        age: computedAge,
        gender: memberForm.gender || 'Masculino',
        points: memberForm.points || 50,
        clothingSizes: memberForm.clothingSizes,
        allergies: memberForm.allergies || [],
        notes: memberForm.notes,
        phone: memberForm.phone,
        pinCode: memberForm.pinCode || '1234'
      });
    }

    setShowMemberModal(false);
  };

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    if (familyName !== tempFamilyName) updateFamilyName(tempFamilyName);
    updateWifi(wifiSSID, wifiPassword);
    setSavedGeneralMsg(true);
    setTimeout(() => setSavedGeneralMsg(false), 2500);
  };

  const togglePermission = (role: string, permKey: keyof typeof rolePermissionsMap['Padre']) => {
    const currentRolePerms = rolePermissionsMap[role] || {
      canManageUsers: false,
      canManageFinances: false,
      canManageTasks: true,
      canManageCalendar: true,
      canManageShopping: true,
      canManageMeals: true,
      canManageCatholic: true,
      canRedeemRewards: true,
    };

    setRolePermissionsMap({
      ...rolePermissionsMap,
      [role]: {
        ...currentRolePerms,
        [permKey]: !currentRolePerms[permKey]
      }
    });
  };

  return (
    <div className="space-y-6 pb-12 overflow-x-hidden">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <Settings className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Panel de Administración del Hogar</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configuración central de miembros, ventanas, temas, menú y categorías
          </p>
        </div>
      </div>

      {/* Admin Subtabs Navigation (No Horizontal Scroll - Responsive Grid) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-2 bg-slate-200/60 p-1.5 rounded-2xl">
        {[
          { id: 'family', label: 'Familia', icon: <Users className="w-4 h-4" /> },
          { id: 'usuarios', label: 'Usuarios', icon: <Lock className="w-4 h-4" /> },
          { id: 'sections', label: 'Ventanas', icon: <Eye className="w-4 h-4" /> },
          { id: 'general', label: 'General / Tema', icon: <Palette className="w-4 h-4" /> },
          { id: 'meals', label: 'Menú Semanal', icon: <UtensilsCrossed className="w-4 h-4" /> },
          { id: 'contacts', label: 'Contactos', icon: <PhoneCall className="w-4 h-4" /> },
          { id: 'categories', label: 'Categorías', icon: <Tag className="w-4 h-4" /> }
        ].map(st => (
          <button
            key={st.id}
            onClick={() => setActiveAdminSubtab(st.id as any)}
            className={`py-2.5 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition active-touch ${
              activeAdminSubtab === st.id
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            {st.icon}
            <span className="truncate">{st.label}</span>
          </button>
        ))}
      </div>

      {/* SUBTAB 1: FAMILIA Y MIEMBROS */}
      {activeAdminSubtab === 'family' && (
        <div className="space-y-6">
          {/* Family Name Input */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Home className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-base">Nombre de la Familia</h3>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={tempFamilyName}
                onChange={e => setTempFamilyName(e.target.value)}
                placeholder="Ej: Familia Santos González"
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={() => updateFamilyName(tempFamilyName || 'Familia Santos')}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-100 active-touch shrink-0"
              >
                <Check className="w-4 h-4" />
                <span>Guardar Nombre</span>
              </button>
            </div>
          </div>

          {/* Members List Cards */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">Gestión Completa de Miembros</h3>
              </div>

              <button
                onClick={handleOpenAddMember}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-100 active-touch shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Añadir Miembro</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {allMembers.map(m => (
                <div key={m.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200/90 flex flex-col justify-between space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-xs ${m.color || 'bg-indigo-600 text-white'}`}>
                        {m.avatar}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{m.name}</h4>
                        <p className="text-xs text-slate-500 font-semibold">
                          {m.birthDate ? `${calculateAge(m.birthDate)} años` : (m.age ? `${m.age} años` : '? años')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditMember(m)}
                        className="p-1.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-700"
                        title="Editar miembro"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingMemberId(m.id)}
                        className="p-1.5 bg-white border border-rose-200 rounded-xl hover:bg-rose-50 text-rose-600"
                        title="Eliminar miembro"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-slate-600 pt-2 border-t border-slate-200/60">
                    <p><span className="font-bold">Teléfono:</span> {m.phone || 'No especificado'}</p>
                    <p><span className="font-bold">Tallas:</span> Ropa: {m.clothingSizes?.shirt || '-'}, Calzado: {m.clothingSizes?.shoes || '-'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Anniversaries & Santos Configuration */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500" />
                <h3 className="font-bold text-slate-900 text-base">Aniversarios y Santos de la Familia</h3>
              </div>
              <button
                onClick={() => {
                  setEditingAnniversary(null);
                  setShowAnniversaryModal(true);
                }}
                className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-rose-100 active-touch"
              >
                <Plus className="w-4 h-4" />
                <span>Nuevo Aniversario</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {anniversaries.map(ann => (
                <div key={ann.id} className="p-3.5 bg-rose-50/60 border border-rose-200 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-200 text-rose-900 uppercase">
                      {ann.type}
                    </span>
                    <h4 className="font-bold text-xs text-rose-950 mt-1">{ann.title}</h4>
                    <p className="text-[10px] text-slate-500">📅 Fecha: {ann.date}</p>
                    {ann.notes && <p className="text-[10px] text-slate-400 italic mt-0.5">"{ann.notes}"</p>}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingAnniversary(ann);
                        setShowAnniversaryModal(true);
                      }}
                      className="p-1.5 text-slate-500 hover:bg-rose-100 rounded-lg transition"
                      title="Editar aniversario"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteAnniversary(ann.id)}
                      className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-lg transition"
                      title="Eliminar aniversario"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Per-Member Permissions Cards with Quick Role Presets */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-slate-900 text-base">Permisos Personalizados por Miembro</h3>
              </div>
              <p className="text-xs text-slate-500">
                Ajusta los permisos individualmente para cada miembro o carga un perfil rápido por defecto.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allMembers.map(member => {
                const memberPerms = member.permissions || rolePermissionsMap[member.role] || rolePermissionsMap['Padre'];
                return (
                  <div key={member.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-base ${member.color || 'bg-indigo-600 text-white'}`}>
                          {member.avatar}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-xs text-slate-900">{member.name}</h4>
                        </div>
                      </div>

                      {/* Quick Presets Dropdown/Buttons */}
                      <div className="flex items-center gap-1">
                        {['Padre', 'Hijo', 'Abuelo'].map(rolePreset => (
                          <button
                            key={rolePreset}
                            onClick={() => {
                              const preset = rolePermissionsMap[rolePreset];
                              if (preset) {
                                updateMemberDetails(member.id, { permissions: { ...preset } });
                              }
                            }}
                            className="px-2 py-0.5 bg-white border border-slate-200 hover:bg-indigo-50 text-[9px] font-bold rounded-lg text-slate-700 active-touch"
                            title={`Cargar permisos por defecto de ${rolePreset}`}
                          >
                            {rolePreset[0]}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      {[
                        { key: 'canManageFinances', label: 'Gastos y Facturas' },
                        { key: 'canManageUsers', label: 'Gestión Usuarios' },
                        { key: 'canManageTasks', label: 'Tareas' },
                        { key: 'canManageCalendar', label: 'Calendario' },
                        { key: 'canManageShopping', label: 'Lista Compra' },
                        { key: 'canManageMeals', label: 'Menú Semanal' },
                        { key: 'canManageCatholic', label: 'Rincón Católico' }
                      ].map(perm => {
                        const isChecked = memberPerms[perm.key as keyof RolePermissions];
                        return (
                          <label key={perm.key} className="flex items-center justify-between p-1.5 bg-white rounded-xl border border-slate-100 cursor-pointer">
                            <span className="font-semibold text-slate-800 text-[11px]">{perm.label}</span>
                            <input
                              type="checkbox"
                              checked={!!isChecked}
                              onChange={() => {
                                const newMemberPerms = {
                                  ...memberPerms,
                                  [perm.key]: !isChecked
                                };
                                updateMemberDetails(member.id, { permissions: newMemberPerms });
                              }}
                              className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                            />
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: SECCIONES Y VISIBILIDAD */}
      {activeAdminSubtab === 'sections' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Eye className="w-5 h-5 text-indigo-600" />
              Visibilidad de Pestañas / Ventanas de la Web
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Activa o desactiva las ventanas que se muestran en el menú principal del portal
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { id: 'dashboard' as ActiveTab, label: 'Inicio Overview', icon: '🏠' },
              { id: 'tasks' as ActiveTab, label: 'Tareas', icon: '✅' },
              { id: 'shopping' as ActiveTab, label: 'Lista de la Compra', icon: '🛒' },
              { id: 'calendar' as ActiveTab, label: 'Calendario Familiar', icon: '📅' },
              { id: 'notes' as ActiveTab, label: 'Notas de Nevera', icon: '📌' },
              { id: 'meals' as ActiveTab, label: 'Menú Semanal', icon: '🍽️' },
              { id: 'catholic' as ActiveTab, label: 'Rincón Católico & Santoral', icon: '⛪' },
              { id: 'contacts' as ActiveTab, label: 'Contactos & Wi-Fi', icon: '📞' },
              { id: 'birthdays' as ActiveTab, label: 'Cumpleaños & Regalos', icon: '🎂' },
              { id: 'finances' as ActiveTab, label: 'Gastos del Hogar', icon: '💼' },
              { id: 'wedding' as ActiveTab, label: 'Especial Boda', icon: '💒' }
            ].map(sec => {
              const isVisible = sectionVisibility[sec.id] !== false;
              return (
                <div 
                  key={sec.id}
                  className={`p-4 rounded-2xl border flex items-center justify-between transition ${
                    isVisible ? 'bg-indigo-50/50 border-indigo-200' : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{sec.icon}</span>
                    <span className="font-bold text-xs text-slate-800">{sec.label}</span>
                  </div>

                  <button
                    onClick={() => updateSectionVisibility(sec.id, !isVisible)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition ${
                      isVisible ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{isVisible ? 'Visible' : 'Oculta'}</span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Dashboard Cards Visibility Section (Pantalla de Inicio) */}
          <div className="pt-5 border-t border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4 text-indigo-600" />
                  Tarjetas y Elementos de la Pantalla de Inicio
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Elige qué tarjetas y avisos se muestran u ocultan en la pantalla principal de Inicio
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { id: 'welcome_card' as const, label: 'Tarjeta de Saludo & Accesos', icon: '👋' },
                { id: 'wedding_banner' as const, label: 'Especial Boda & Cuenta Atrás', icon: '💒' },
                { id: 'parent_approvals' as const, label: 'Avisos Pendientes de Padres', icon: '🔔' },
                { id: 'fridge_notes' as const, label: 'Notas de la Nevera', icon: '📌' },
                { id: 'catholic_intentions' as const, label: 'Intenciones de Oración', icon: '⛪' },
                { id: 'birthdays_anniversaries' as const, label: 'Próximos Cumpleaños & Aniversarios', icon: '🎂' },
                { id: 'summary_sections' as const, label: 'Tarjetas de Secciones Principales', icon: '🗂️' }
              ].map(card => {
                const isCardVisible = dashboardCardsVisibility[card.id] !== false;
                return (
                  <div 
                    key={card.id}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between transition ${
                      isCardVisible ? 'bg-indigo-50/40 border-indigo-200' : 'bg-slate-50 border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{card.icon}</span>
                      <span className="font-bold text-xs text-slate-800">{card.label}</span>
                    </div>

                    <button
                      onClick={() => updateDashboardCardVisibility(card.id, !isCardVisible)}
                      className={`px-2.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition ${
                        isCardVisible ? 'bg-indigo-600 text-white shadow-2xs' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {isCardVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      <span>{isCardVisible ? 'Visible' : 'Oculta'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Menu Order Editor with Drag & Drop and Up/Down Buttons */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <span>Orden del Menú Lateral (Arrastra o usa ▲/▼)</span>
            </h4>

            <div className="space-y-2 max-w-md">
              {menuOrder.map((tabId, idx) => {
                const secLabelMap: Record<ActiveTab, { name: string; icon: string }> = {
                  dashboard: { name: 'Inicio', icon: '🏠' },
                  tasks: { name: 'Tareas', icon: '✅' },
                  shopping: { name: 'Lista compra', icon: '🛒' },
                  calendar: { name: 'Calendario', icon: '📅' },
                  notes: { name: 'Notas de nevera', icon: '📌' },
                  meals: { name: 'Menú semanal', icon: '🍽️' },
                  catholic: { name: 'Rincón católico', icon: '⛪' },
                  contacts: { name: 'Contactos', icon: '📞' },
                  birthdays: { name: 'Cumpleaños', icon: '🎂' },
                  finances: { name: 'Gastos', icon: '💼' },
                  wedding: { name: 'Boda', icon: '💒' },
                  admin: { name: 'Ajustes', icon: '⚙️' }
                };
                const info = secLabelMap[tabId] || { name: tabId, icon: '📄' };

                return (
                  <div
                    key={tabId}
                    draggable
                    onDragStart={() => setDragItem({ type: 'tasks', index: idx })}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                      if (dragItem && dragItem.index !== idx) {
                        const arr = [...menuOrder];
                        const [removed] = arr.splice(dragItem.index, 1);
                        arr.splice(idx, 0, removed);
                        reorderMenuSections(arr);
                        setDragItem(null);
                      }
                    }}
                    className="px-3.5 py-2 bg-slate-50 text-slate-900 font-bold rounded-xl text-xs flex items-center justify-between border border-slate-200 shadow-2xs cursor-grab active:cursor-grabbing hover:border-indigo-400 transition"
                  >
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{info.icon} {info.name}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        disabled={idx === 0}
                        onClick={() => {
                          const arr = [...menuOrder];
                          [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
                          reorderMenuSections(arr);
                        }}
                        className="w-7 h-7 rounded-lg bg-white border hover:bg-indigo-100 disabled:opacity-30 text-indigo-900 font-extrabold"
                        title="Subir posición"
                      >
                        ▲
                      </button>
                      <button
                        disabled={idx === menuOrder.length - 1}
                        onClick={() => {
                          const arr = [...menuOrder];
                          [arr[idx + 1], arr[idx]] = [arr[idx], arr[idx + 1]];
                          reorderMenuSections(arr);
                        }}
                        className="w-7 h-7 rounded-lg bg-white border hover:bg-indigo-100 disabled:opacity-30 text-indigo-900 font-extrabold"
                        title="Bajar posición"
                      >
                        ▼
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: CONFIGURACIÓN GENERAL Y TEMA */}
      {activeAdminSubtab === 'general' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6 max-w-2xl">
          {/* Light / Dark Mode Toggle */}
          <div className="border-b border-slate-100 pb-5 space-y-3">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Sun className="w-5 h-5 text-amber-500" />
              Modo Claro / Modo Oscuro
            </h3>
            <p className="text-xs text-slate-500">
              Cambia la apariencia visual completa de la aplicación entre modo claro u oscuro
            </p>

            <button
              onClick={toggleDarkMode}
              className={`px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition active-touch shadow-md ${
                darkMode ? 'bg-slate-900 text-amber-300 border border-slate-700' : 'bg-amber-400 text-slate-900'
              }`}
            >
              {darkMode ? <Moon className="w-4 h-4 text-amber-300" /> : <Sun className="w-4 h-4 text-slate-900" />}
              <span>{darkMode ? 'Modo Oscuro Activo (Cambiar a Claro)' : 'Modo Claro Activo (Cambiar a Oscuro)'}</span>
            </button>
          </div>

          {/* Wi-Fi & General Form */}
          <form onSubmit={handleSaveGeneral} className="space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Wifi className="w-5 h-5 text-blue-600" />
              Ajustes Wi-Fi del Hogar
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nombre Red Wi-Fi (SSID)</label>
              <input
                type="text"
                value={wifiSSID}
                onChange={e => setWifiSSID(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Contraseña Wi-Fi</label>
              <input
                type="text"
                value={wifiPassword}
                onChange={e => setWifiPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-100 flex items-center gap-2 active-touch"
            >
              <Check className="w-4 h-4" />
              <span>Guardar Datos Wi-Fi</span>
            </button>

            {savedGeneralMsg && (
              <p className="text-xs font-bold text-emerald-600">¡Configuración guardada correctamente!</p>
            )}
          </form>
        </div>
      )}

      {/* SUBTAB 4: CONFIGURACIÓN MENÚ SEMANAL */}
      {activeAdminSubtab === 'meals' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <UtensilsCrossed className="w-5 h-5 text-orange-500" />
              Configuración de Menú Semanal (Solo Padres)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Planifica las comidas de lunes a domingo. Los miembros normales solo podrán consultarlo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'].map(dayKey => {
              const dayMeal = mealPlan[dayKey] || { breakfast: '', lunch: '', snack: '', dinner: '' };
              return (
                <div key={dayKey} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <h4 className="font-extrabold text-sm capitalize text-slate-900 border-b border-slate-200 pb-2 flex items-center justify-between">
                    <span>🗓️ {dayKey}</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="block font-bold text-slate-600 mb-0.5">Desayuno</label>
                      <input
                        type="text"
                        value={dayMeal.breakfast}
                        onChange={e => updateMealPlanDay(dayKey, { breakfast: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-600 mb-0.5">Comida</label>
                      <input
                        type="text"
                        value={dayMeal.lunch}
                        onChange={e => updateMealPlanDay(dayKey, { lunch: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-600 mb-0.5">Merienda</label>
                      <input
                        type="text"
                        value={dayMeal.snack}
                        onChange={e => updateMealPlanDay(dayKey, { snack: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-600 mb-0.5">Cena</label>
                      <input
                        type="text"
                        value={dayMeal.dinner}
                        onChange={e => updateMealPlanDay(dayKey, { dinner: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBTAB 5: CONFIGURACIÓN DE CONTACTOS */}
      {activeAdminSubtab === 'contacts' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <PhoneCall className="w-5 h-5 text-blue-600" />
                Configuración de Agenda de Contactos
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Añade y edita los números de teléfono de emergencias, pediatrías y servicios
              </p>
            </div>

            <button
              onClick={() => {
                setEditingContact(null);
                setContactForm({ name: '', relationOrType: '', phone: '', address: '', notes: '' });
                setShowContactModal(true);
              }}
              className="px-3.5 py-2 bg-blue-600 text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow-md shadow-blue-100"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Contacto</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {emergencyContacts.map(c => (
              <div key={c.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">{c.name}</h4>
                  <p className="text-[10px] text-slate-500">{c.relationOrType} • {c.phone}</p>
                </div>
                <button
                  onClick={() => setDeletingContactId(c.id)}
                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 6: EDITAR, REORDENAR Y CONFIRMAR CATEGORÍAS REALES */}
      {activeAdminSubtab === 'categories' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Tag className="w-5 h-5 text-amber-500" />
              Editor Interactivo de Categorías (Ordenación Vertical & Confirmación)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Organiza verticalmente tus categorías en el orden exacto deseado usando los botones de subir (▲) o bajar (▼). Se requiere confirmación para eliminar.
            </p>
          </div>

          {/* Custom Task Lists Manager */}
          <div className="space-y-3 bg-indigo-50/70 p-4 rounded-2xl border border-indigo-200">
            <h4 className="font-bold text-xs text-indigo-900 uppercase tracking-wider flex items-center gap-2">
              <FolderPlus className="w-4 h-4 text-indigo-600" /> Listas Personalizadas de Tareas
            </h4>
            <p className="text-[11px] text-indigo-800">
              Puedes crear listas independientes de tareas (ej: Tareas del Hogar, Boda, Colegio, Jardinería...).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {customTaskLists.map(list => (
                <div key={list.id} className="p-3 bg-white border border-indigo-200 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="font-bold text-xs text-indigo-950">📋 {list.name}</p>
                  </div>
                  {list.id !== 'general' && (
                    <button
                      onClick={() => setDeletingCatInfo({ type: 'list', name: list.id })}
                      className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg text-xs"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-1 max-w-md">
              <input
                type="text"
                value={newCatTask}
                onChange={e => setNewCatTask(e.target.value)}
                placeholder="Nombre de la nueva lista (ej: Boda, Colegio...)"
                className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none"
              />
              <button
                onClick={() => {
                  if (newCatTask.trim()) {
                    addCustomTaskList(newCatTask.trim(), customCategories.tasks);
                    setNewCatTask('');
                  }
                }}
                className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-xs active-touch"
              >
                Crear Lista
              </button>
            </div>
          </div>

          {/* Shopping Categories Editor (Vertical List with Reordering & Drag and Drop) */}
          <div className="space-y-3 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200">
            <h4 className="font-bold text-xs text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
              <span>Categorías de la Compra (Arrastra o usa ▲/▼)</span>
            </h4>

            <div className="space-y-2 max-w-md">
              {customCategories.shopping.map((cat, idx) => (
                <div 
                  key={cat} 
                  draggable
                  onDragStart={() => setDragItem({ type: 'shopping', index: idx })}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (dragItem && dragItem.type === 'shopping' && dragItem.index !== idx) {
                      const arr = [...customCategories.shopping];
                      const [removed] = arr.splice(dragItem.index, 1);
                      arr.splice(idx, 0, removed);
                      reorderCategories('shopping', arr);
                      setDragItem(null);
                    }
                  }}
                  className="px-3.5 py-2 bg-white text-emerald-950 font-bold rounded-xl text-xs flex items-center justify-between border border-emerald-200 shadow-2xs cursor-grab active:cursor-grabbing hover:border-emerald-400 transition"
                >
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{cat}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      disabled={idx === 0}
                      onClick={() => {
                        const arr = [...customCategories.shopping];
                        [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
                        reorderCategories('shopping', arr);
                      }}
                      className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-emerald-200 disabled:opacity-30 text-emerald-900 font-extrabold"
                      title="Subir posición"
                    >
                      ▲
                    </button>
                    <button
                      disabled={idx === customCategories.shopping.length - 1}
                      onClick={() => {
                        const arr = [...customCategories.shopping];
                        [arr[idx + 1], arr[idx]] = [arr[idx], arr[idx + 1]];
                        reorderCategories('shopping', arr);
                      }}
                      className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-emerald-200 disabled:opacity-30 text-emerald-900 font-extrabold"
                      title="Bajar posición"
                    >
                      ▼
                    </button>
                    <button
                      onClick={() => setDeletingCatInfo({ type: 'shopping', name: cat })}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg ml-1"
                      title="Eliminar categoría"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-1 max-w-sm">
              <input
                type="text"
                value={newCatShopping}
                onChange={e => setNewCatShopping(e.target.value)}
                placeholder="Nueva categoría de compras..."
                className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none"
              />
              <button
                onClick={() => {
                  addCategory('shopping', newCatShopping);
                  setNewCatShopping('');
                }}
                className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Añadir Categoría
              </button>
            </div>
          </div>

          {/* Events Categories Editor (Vertical List with Reordering & Drag and Drop) */}
          <div className="space-y-3 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-200">
            <h4 className="font-bold text-xs text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
              <span>Categorías de Eventos (Arrastra o usa ▲/▼)</span>
            </h4>

            <div className="space-y-2 max-w-md">
              {customCategories.events.map((cat, idx) => (
                <div 
                  key={cat} 
                  draggable
                  onDragStart={() => setDragItem({ type: 'events', index: idx })}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (dragItem && dragItem.type === 'events' && dragItem.index !== idx) {
                      const arr = [...customCategories.events];
                      const [removed] = arr.splice(dragItem.index, 1);
                      arr.splice(idx, 0, removed);
                      reorderCategories('events', arr);
                      setDragItem(null);
                    }
                  }}
                  className="px-3.5 py-2 bg-white text-indigo-950 font-bold rounded-xl text-xs flex items-center justify-between border border-indigo-200 shadow-2xs cursor-grab active:cursor-grabbing hover:border-indigo-400 transition"
                >
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>{cat}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      disabled={idx === 0}
                      onClick={() => {
                        const arr = [...customCategories.events];
                        [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
                        reorderCategories('events', arr);
                      }}
                      className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-indigo-200 disabled:opacity-30 text-indigo-900 font-extrabold"
                      title="Subir posición"
                    >
                      ▲
                    </button>
                    <button
                      disabled={idx === customCategories.events.length - 1}
                      onClick={() => {
                        const arr = [...customCategories.events];
                        [arr[idx + 1], arr[idx]] = [arr[idx], arr[idx + 1]];
                        reorderCategories('events', arr);
                      }}
                      className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-indigo-200 disabled:opacity-30 text-indigo-900 font-extrabold"
                      title="Bajar posición"
                    >
                      ▼
                    </button>
                    <button
                      onClick={() => setDeletingCatInfo({ type: 'events', name: cat })}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg ml-1"
                      title="Eliminar categoría"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-1 max-w-sm">
              <input
                type="text"
                value={newCatEvent}
                onChange={e => setNewCatEvent(e.target.value)}
                placeholder="Nueva categoría de eventos..."
                className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none"
              />
              <button
                onClick={() => {
                  addCategory('events', newCatEvent);
                  setNewCatEvent('');
                }}
                className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Añadir Categoría
              </button>
            </div>
          </div>

          {/* Anniversary Types Categories Editor (Vertical List with Reordering & Drag and Drop) */}
          <div className="space-y-3 bg-rose-50/50 p-4 rounded-2xl border border-rose-200">
            <h4 className="font-bold text-xs text-rose-900 uppercase tracking-wider flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-rose-600" />
              <span>Tipos de Aniversarios y Celebraciones (Arrastra o usa ▲/▼)</span>
            </h4>

            <div className="space-y-2 max-w-md">
              {(customCategories.anniversaries || ['Boda', 'Santo', 'Bautizo', 'Comunión', 'Empresa/Trabajo', 'Otro']).map((cat, idx) => (
                <div 
                  key={cat} 
                  draggable
                  onDragStart={() => setDragItem({ type: 'anniversaries', index: idx })}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (dragItem && dragItem.type === 'anniversaries' && dragItem.index !== idx) {
                      const arr = [...(customCategories.anniversaries || [])];
                      const [removed] = arr.splice(dragItem.index, 1);
                      arr.splice(idx, 0, removed);
                      reorderCategories('anniversaries', arr);
                      setDragItem(null);
                    }
                  }}
                  className="px-3.5 py-2 bg-white text-rose-950 font-bold rounded-xl text-xs flex items-center justify-between border border-rose-200 shadow-2xs cursor-grab active:cursor-grabbing hover:border-rose-400 transition"
                >
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{cat}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      disabled={idx === 0}
                      onClick={() => {
                        const arr = [...(customCategories.anniversaries || [])];
                        [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
                        reorderCategories('anniversaries', arr);
                      }}
                      className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-rose-200 disabled:opacity-30 text-rose-900 font-extrabold"
                      title="Subir posición"
                    >
                      ▲
                    </button>
                    <button
                      disabled={idx === (customCategories.anniversaries || []).length - 1}
                      onClick={() => {
                        const arr = [...(customCategories.anniversaries || [])];
                        [arr[idx + 1], arr[idx]] = [arr[idx], arr[idx + 1]];
                        reorderCategories('anniversaries', arr);
                      }}
                      className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-rose-200 disabled:opacity-30 text-rose-900 font-extrabold"
                      title="Bajar posición"
                    >
                      ▼
                    </button>
                    <button
                      onClick={() => setDeletingCatInfo({ type: 'anniversaries', name: cat })}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg ml-1"
                      title="Eliminar tipo de aniversario"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-1 max-w-sm">
              <input
                type="text"
                value={newCatAnniversary}
                onChange={e => setNewCatAnniversary(e.target.value)}
                placeholder="Nuevo tipo de aniversario (ej: Graduación, Viaje...)"
                className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none"
              />
              <button
                onClick={() => {
                  if (newCatAnniversary.trim()) {
                    addCategory('anniversaries', newCatAnniversary.trim());
                    setNewCatAnniversary('');
                  }
                }}
                className="px-4 py-2 bg-rose-600 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Añadir Tipo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MEMBER EDIT / ADD MODAL (VERTICAL LAYOUT FOR COMFORTABLE MOBILE TYPING) */}
      {showMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                {editingMember ? `Editar Miembro` : 'Añadir Miembro'}
              </h3>
              <button onClick={() => setShowMemberModal(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="space-y-3.5 text-xs">
              {/* VERTICAL MOBILE-FIRST STACKED INPUTS */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nombre Completo *</label>
                <input
                  required
                  type="text"
                  value={memberForm.name || ''}
                  onChange={e => setMemberForm({ ...memberForm, name: e.target.value })}
                  placeholder="Ej: Carlos Santos"
                  className="w-full px-3.5 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Rol en la Familia</label>
                <select
                  value={memberForm.role || 'Hijo'}
                  onChange={e => setMemberForm({ ...memberForm, role: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 border rounded-xl outline-none bg-white font-semibold"
                >
                  {['Padre', 'Madre', 'Hijo', 'Hija', 'Abuelo', 'Abuela', 'Otro'].map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Fecha de Nacimiento (para calcular cumpleaños) *</label>
                <input
                  type="date"
                  value={memberForm.birthDate || ''}
                  onChange={e => setMemberForm({ ...memberForm, birthDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {memberForm.birthDate && (
                  <p className="text-[10px] font-semibold text-indigo-600 mt-1">
                    📅 {new Date(memberForm.birthDate + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })} ({calculateAge(memberForm.birthDate)} años - calculado automáticamente)
                  </p>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Sexo</label>
                <select
                  value={memberForm.gender || 'Masculino'}
                  onChange={e => setMemberForm({ ...memberForm, gender: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 border rounded-xl outline-none bg-white font-semibold"
                >
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Teléfono</label>
                <input
                  type="text"
                  value={memberForm.phone || ''}
                  onChange={e => setMemberForm({ ...memberForm, phone: e.target.value })}
                  placeholder="+34 600 000 000"
                  className="w-full px-3.5 py-2.5 border rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">PIN de Acceso</label>
                <input
                  type="text"
                  value={memberForm.pinCode || '1234'}
                  onChange={e => setMemberForm({ ...memberForm, pinCode: e.target.value })}
                  placeholder="1234"
                  maxLength={8}
                  className="w-full px-3.5 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">PIN que usará este miembro para iniciar sesión.</p>
              </div>

              {/* Grouped Avatars */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Icono / Avatar Único</label>
                <div className="space-y-2">
                  {AVATAR_GROUPS.map(grp => (
                    <div key={grp.label} className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{grp.label}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {grp.avatars.map(av => (
                          <button
                            key={av}
                            type="button"
                            onClick={() => setMemberForm({ ...memberForm, avatar: av })}
                            className={`w-9 h-9 rounded-xl border text-xl flex items-center justify-center transition ${
                              memberForm.avatar === av ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-300' : 'bg-slate-50'
                            }`}
                          >
                            {av}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Color Theme Selector (Pure Circle Swatches without Labels) */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Color Temático Único</label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_SWATCHES.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setMemberForm({ ...memberForm, color: c })}
                      className={`w-8 h-8 rounded-full transition transform ${c} ${
                        memberForm.color === c ? 'ring-4 ring-indigo-500 scale-110 shadow-md' : 'opacity-80'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Clothing Sizes */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Talla Ropa</label>
                  <input
                    type="text"
                    value={memberForm.clothingSizes?.shirt || ''}
                    onChange={e => setMemberForm({
                      ...memberForm,
                      clothingSizes: { ...memberForm.clothingSizes, shirt: e.target.value }
                    })}
                    placeholder="M / 12 años"
                    className="w-full px-3.5 py-2.5 border rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Talla Calzado</label>
                  <input
                    type="text"
                    value={memberForm.clothingSizes?.shoes || ''}
                    onChange={e => setMemberForm({
                      ...memberForm,
                      clothingSizes: { ...memberForm.clothingSizes, shoes: e.target.value }
                    })}
                    placeholder="39"
                    className="w-full px-3.5 py-2.5 border rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowMemberModal(false)}
                  className="flex-1 py-3 rounded-xl border font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold shadow-md shadow-indigo-100"
                >
                  Guardar Miembro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── USUARIOS / CONTRASEÑAS SUBTAB ─────────────────────────────── */}
      {activeAdminSubtab === 'usuarios' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Lock className="w-5 h-5 text-indigo-600" />
              <div>
                <h3 className="font-bold text-slate-900 text-base">Gestión de Usuarios y PINs</h3>
                <p className="text-xs text-slate-500 mt-0.5">Aquí puedes ver y cambiar el PIN de cada miembro. Los PINs son visibles solo para administradores.</p>
              </div>
            </div>

            <div className="space-y-3">
              {allMembers.map(member => {
                const isPinVisible = visiblePins[member.id];
                return (
                  <div key={member.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    {/* Member Header */}
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-xs ${member.color || 'bg-indigo-600 text-white'}`}>
                        {member.avatar}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{member.name}</h4>
                      </div>
                    </div>

                    {/* PIN Display & Edit */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700">PIN de Acceso</label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input
                            type={isPinVisible ? 'text' : 'password'}
                            value={member.pinCode || '1234'}
                            onChange={e => updateMemberDetails(member.id, { pinCode: e.target.value })}
                            maxLength={8}
                            className="w-full px-3 py-2 border rounded-xl text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => togglePinVisibility(member.id)}
                          className="px-3 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 text-xs"
                          title={isPinVisible ? 'Ocultar PIN' : 'Ver PIN'}
                        >
                          {isPinVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        El cambio se guarda automáticamente al escribir.
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-800 space-y-1">
            <p className="font-bold">⚠️ Aviso de seguridad</p>
            <p>Los PINs son visibles en texto claro para los administradores. Esto está diseñado para facilitar la gestión familiar. Usa PINs únicos para cada miembro.</p>
          </div>
        </div>
      )}

      {/* CONTACT EDIT / ADD MODAL */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-lg">Contacto de la Agenda</h3>
              <button onClick={() => setShowContactModal(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={e => {
              e.preventDefault();
              if (contactForm.name && contactForm.phone) {
                addEmergencyContact(contactForm);
                setShowContactModal(false);
              }
            }} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nombre / Empresa *</label>
                <input required type="text" value={contactForm.name} onChange={e => setContactForm({ ...contactForm, name: e.target.value })} className="w-full px-3 py-2 border rounded-xl outline-none" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Relación / Tipo *</label>
                <input required type="text" value={contactForm.relationOrType} onChange={e => setContactForm({ ...contactForm, relationOrType: e.target.value })} placeholder="Pediatra, Fontanero, Tía..." className="w-full px-3 py-2 border rounded-xl outline-none" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Teléfono *</label>
                <input required type="text" value={contactForm.phone} onChange={e => setContactForm({ ...contactForm, phone: e.target.value })} className="w-full px-3 py-2 border rounded-xl outline-none" />
              </div>

              <div className="pt-2 flex gap-2">
                <button type="button" onClick={() => setShowContactModal(false)} className="flex-1 py-2.5 border rounded-xl font-bold text-slate-600">Cancelar</button>
                <button type="submit" className="flex-1 py-2.5 bg-blue-600 text-white font-bold rounded-xl">Guardar Contacto</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODALS */}
      <ConfirmModal
        isOpen={!!deletingMemberId}
        onCancel={() => setDeletingMemberId(null)}
        onConfirm={() => {
          if (deletingMemberId) deleteMember(deletingMemberId);
          setDeletingMemberId(null);
        }}
      />

      <ConfirmModal
        isOpen={!!deletingContactId}
        onCancel={() => setDeletingContactId(null)}
        onConfirm={() => {
          if (deletingContactId) deleteEmergencyContact(deletingContactId);
          setDeletingContactId(null);
        }}
      />

      <ConfirmModal
        isOpen={!!deletingCatInfo}
        onCancel={() => setDeletingCatInfo(null)}
        onConfirm={() => {
          if (deletingCatInfo) {
            if (deletingCatInfo.type === 'list') {
              deleteCustomTaskList(deletingCatInfo.name);
            } else {
              deleteCategory(deletingCatInfo.type, deletingCatInfo.name);
            }
          }
          setDeletingCatInfo(null);
        }}
      />

      {/* ANNIVERSARY MODAL */}
      <AnniversaryModal
        isOpen={showAnniversaryModal}
        onClose={() => {
          setShowAnniversaryModal(false);
          setEditingAnniversary(null);
        }}
        onSave={(annData) => {
          if (editingAnniversary) {
            // Edit existing anniversary: delete and re-add or update
            deleteAnniversary(editingAnniversary.id);
            addAnniversary(annData);
          } else {
            addAnniversary(annData);
          }
          setShowAnniversaryModal(false);
          setEditingAnniversary(null);
        }}
        editingAnniversary={editingAnniversary}
        allMembers={allMembers}
      />
    </div>
  );
};

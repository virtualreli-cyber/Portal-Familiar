import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { FamilyMember, FamilyRole, RolePermissions } from '../types';
import { INITIAL_MEMBERS, DEFAULT_ROLE_PERMISSIONS } from '../data/mockData';
import { supabase, sbUpsert, sbDelete, sbFetch, sbSetConfig, sbGetConfig } from '../lib/supabase';

interface AuthContextType {
  currentMember: FamilyMember | null;
  currentRole: FamilyRole | null;
  permissions: RolePermissions;
  allMembers: FamilyMember[];
  isLoggedIn: boolean;
  isAdmin: boolean;
  // Auth actions
  loginWithPin: (memberId: string, pin: string) => boolean;
  logout: () => void;
  // Member management
  switchMember: (memberId: string) => void;
  updateMemberPoints: (memberId: string, deltaPoints: number) => void;
  updateMemberDetails: (memberId: string, updatedData: Partial<FamilyMember>) => void;
  addMember: (newMember: Omit<FamilyMember, 'id'>) => void;
  deleteMember: (memberId: string) => void;
  // Permissions
  rolePermissionsMap: Record<string, RolePermissions>;
  setRolePermissionsMap: (newMap: Record<string, RolePermissions>) => void;
  // Loading state
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Convert Supabase row → FamilyMember
function rowToMember(row: Record<string, unknown>): FamilyMember {
  return {
    id: row.id as string,
    name: row.name as string,
    role: row.role as FamilyRole,
    avatar: (row.avatar as string) || '👤',
    color: (row.color as string) || 'bg-indigo-600 text-white',
    pinCode: (row.pin_code as string) || '1234',
    email: row.email as string | undefined,
    birthDate: (row.birth_date as string) || '',
    age: row.age as number | undefined,
    gender: row.gender as FamilyMember['gender'] | undefined,
    points: (row.points as number) || 0,
    phone: row.phone as string | undefined,
    clothingSizes: row.clothing_sizes as FamilyMember['clothingSizes'],
    allergies: (row.allergies as string[]) || [],
    notes: row.notes as string | undefined,
    permissions: row.permissions as RolePermissions | undefined,
  };
}

// Convert FamilyMember → Supabase row
function memberToRow(m: FamilyMember): Record<string, unknown> {
  return {
    id: m.id,
    name: m.name,
    role: m.role,
    avatar: m.avatar,
    color: m.color,
    pin_code: m.pinCode || '1234',
    email: m.email,
    birth_date: m.birthDate,
    age: m.age,
    gender: m.gender,
    points: m.points,
    phone: m.phone,
    clothing_sizes: m.clothingSizes,
    allergies: m.allergies,
    notes: m.notes,
    permissions: m.permissions,
    updated_at: new Date().toISOString(),
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Start empty — Supabase is the single source of truth
  const [allMembers, setAllMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMember, setCurrentMember] = useState<FamilyMember | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [rolePermissionsMap, setRolePermissionsMapState] = useState<Record<string, RolePermissions>>(DEFAULT_ROLE_PERMISSIONS);

  // ─── Load members & restore session ──────────────────────────────────────
  const loadMembers = useCallback(async () => {
    try {
      const rows = await sbFetch<Record<string, unknown>>('family_members');
      let members: FamilyMember[] = [];
      if (rows.length > 0) {
        members = rows.map(rowToMember);
      } else {
        members = INITIAL_MEMBERS;
        for (const m of members) {
          await sbUpsert('family_members', memberToRow(m));
        }
      }
      setAllMembers(members);

      // Restore session synchronously before ending loading state
      const savedId = localStorage.getItem('portal_fam_session_member_id');
      const sessionExpiry = localStorage.getItem('portal_fam_session_expiry');
      if (savedId && sessionExpiry) {
        const expiry = parseInt(sessionExpiry, 10);
        if (Date.now() < expiry) {
          const found = members.find(m => m.id === savedId) || INITIAL_MEMBERS.find(m => m.id === savedId);
          if (found) {
            setCurrentMember(found);
            setIsLoggedIn(true);
          }
        } else {
          localStorage.removeItem('portal_fam_session_member_id');
          localStorage.removeItem('portal_fam_session_expiry');
        }
      }

      // Load role permissions from Supabase config
      const savedPerms = await sbGetConfig('role_permissions');
      if (savedPerms) {
        setRolePermissionsMapState(savedPerms as Record<string, RolePermissions>);
      }
    } catch (e) {
      console.warn('Error loading members from Supabase:', e);
      // Fallback to initial members on error
      setAllMembers(INITIAL_MEMBERS);
      const savedId = localStorage.getItem('portal_fam_session_member_id');
      if (savedId) {
        const found = INITIAL_MEMBERS.find(m => m.id === savedId);
        if (found) {
          setCurrentMember(found);
          setIsLoggedIn(true);
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMembers();

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        loadMembers();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
    };
  }, [loadMembers]);

  // ─── Realtime Subscriptions for family_members ─────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel('auth_realtime_members_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'family_members' }, (payload) => {
        const { eventType, new: newRow, old: oldRow } = payload;
        if (eventType === 'INSERT' || eventType === 'UPDATE') {
          const updated = rowToMember(newRow);
          setAllMembers(prev => {
            const idx = prev.findIndex(m => m.id === updated.id);
            return idx >= 0 ? prev.map(m => m.id === updated.id ? updated : m) : [...prev, updated];
          });
          setCurrentMember(curr => curr?.id === updated.id ? updated : curr);
        } else if (eventType === 'DELETE' && oldRow?.id) {
          setAllMembers(prev => prev.filter(m => m.id !== oldRow.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // ─── Persist role permissions to Supabase only ───────────────────────────
  useEffect(() => {
    sbSetConfig('role_permissions', rolePermissionsMap);
  }, [rolePermissionsMap]);

  const setRolePermissionsMap = (newMap: Record<string, RolePermissions>) => {
    setRolePermissionsMapState(newMap);
  };

  // ─── Login with PIN ──────────────────────────────────────────────────────
  const loginWithPin = useCallback((memberId: string, pin: string): boolean => {
    const member = allMembers.find(m => m.id === memberId);
    if (!member) return false;
    const expectedPin = member.pinCode || '1234';
    if (pin !== expectedPin) return false;

    setCurrentMember(member);
    setIsLoggedIn(true);

    // Persist session for 30 days (session token only — not family data)
    const expiry = Date.now() + 30 * 24 * 60 * 60 * 1000;
    localStorage.setItem('portal_fam_session_member_id', memberId);
    localStorage.setItem('portal_fam_session_expiry', expiry.toString());

    return true;
  }, [allMembers]);

  // ─── Logout ─────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    setCurrentMember(null);
    setIsLoggedIn(false);
    localStorage.removeItem('portal_fam_session_member_id');
    localStorage.removeItem('portal_fam_session_expiry');
  }, []);

  // ─── Switch member (requires PIN via LoginModal) ────────────────────────
  const switchMember = useCallback((memberId: string) => {
    const member = allMembers.find(m => m.id === memberId);
    if (member) {
      setCurrentMember(member);
      const expiry = Date.now() + 30 * 24 * 60 * 60 * 1000;
      localStorage.setItem('portal_fam_session_member_id', memberId);
      localStorage.setItem('portal_fam_session_expiry', expiry.toString());
    }
  }, [allMembers]);

  // ─── Update member points ────────────────────────────────────────────────
  const updateMemberPoints = useCallback((memberId: string, deltaPoints: number) => {
    setAllMembers(prev => {
      const updated = prev.map(m => {
        if (m.id === memberId) {
          const newPoints = Math.max(0, m.points + deltaPoints);
          const updatedM = { ...m, points: newPoints };
          if (currentMember?.id === memberId) setCurrentMember(updatedM);
          sbUpsert('family_members', memberToRow(updatedM));
          return updatedM;
        }
        return m;
      });
      return updated;
    });
  }, [currentMember]);

  // ─── Update member details ───────────────────────────────────────────────
  const updateMemberDetails = useCallback((memberId: string, updatedData: Partial<FamilyMember>) => {
    setAllMembers(prev => {
      const updated = prev.map(m => {
        if (m.id === memberId) {
          const updatedM = { ...m, ...updatedData };
          if (currentMember?.id === memberId) setCurrentMember(updatedM);
          sbUpsert('family_members', memberToRow(updatedM));
          return updatedM;
        }
        return m;
      });
      return updated;
    });
  }, [currentMember]);

  // ─── Add member ──────────────────────────────────────────────────────────
  const addMember = useCallback((newMember: Omit<FamilyMember, 'id'>) => {
    const generatedId = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}`;
    const created: FamilyMember = { ...newMember, id: generatedId };
    setAllMembers(prev => [...prev, created]);
    sbUpsert('family_members', memberToRow(created));
  }, []);

  // ─── Delete member ───────────────────────────────────────────────────────
  const deleteMember = useCallback((memberId: string) => {
    if (allMembers.length <= 1) return;
    setAllMembers(prev => {
      const filtered = prev.filter(m => m.id !== memberId);
      if (currentMember?.id === memberId) {
        setCurrentMember(filtered[0]);
      }
      return filtered;
    });
    sbDelete('family_members', memberId);
  }, [allMembers, currentMember]);

  // ─── Computed values ─────────────────────────────────────────────────────
  const currentRole = currentMember?.role || null;
  const permissions = currentMember
    ? (currentMember.permissions || rolePermissionsMap[currentMember.role] || DEFAULT_ROLE_PERMISSIONS.Padre)
    : DEFAULT_ROLE_PERMISSIONS.Hijo;
  const isAdmin = currentRole === 'Padre' || currentRole === 'Madre' || 
    !!(permissions.canManageUsers && permissions.canManageFinances);

  return (
    <AuthContext.Provider value={{
      currentMember,
      currentRole,
      permissions,
      allMembers,
      isLoggedIn,
      isAdmin,
      loginWithPin,
      logout,
      switchMember,
      updateMemberPoints,
      updateMemberDetails,
      addMember,
      deleteMember,
      rolePermissionsMap,
      setRolePermissionsMap,
      loading,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};

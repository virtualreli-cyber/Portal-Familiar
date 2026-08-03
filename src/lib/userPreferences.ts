/**
 * User Preferences & Filter Persistence Manager
 * Saves and restores per-member state globally across the app.
 */

export interface UserPreferences {
  darkMode?: boolean;
  calendarViewMode: 'month' | 'agenda';
  calendarCategory: string;
  tasksStatusFilter: 'all' | 'pending' | 'completed';
  tasksCategoryFilter: string;
  tasksMemberFilter: string;
  shoppingCategoryFilter: string;
  shoppingStoreFilter: string;
  shoppingStatusFilter?: 'all' | 'pending' | 'completed';
  financesCategoryFilter: string;
  lastViewTimestamps: Record<string, number>; // viewName -> timestamp ms
  lastScrollPositions: Record<string, number>; // viewName -> scrollY
}

const DEFAULT_PREFS: UserPreferences = {
  calendarViewMode: 'month',
  calendarCategory: 'Todas',
  tasksStatusFilter: 'all',
  tasksCategoryFilter: 'Todas',
  tasksMemberFilter: 'Todos',
  shoppingCategoryFilter: 'Todas',
  shoppingStoreFilter: 'Todos',
  shoppingStatusFilter: 'all',
  financesCategoryFilter: 'Todas',
  lastViewTimestamps: {},
  lastScrollPositions: {}
};

export function getUserPreferences(memberId: string): UserPreferences {
  try {
    const raw = localStorage.getItem(`fam_user_prefs_${memberId}`);
    if (!raw) return { ...DEFAULT_PREFS };
    return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch (e) {
    return { ...DEFAULT_PREFS };
  }
}

export function saveUserPreferences(memberId: string, prefs: Partial<UserPreferences>): void {
  try {
    const current = getUserPreferences(memberId);
    const updated = { ...current, ...prefs };
    localStorage.setItem(`fam_user_prefs_${memberId}`, JSON.stringify(updated));
  } catch (e) {
    console.warn('Error saving user preferences:', e);
  }
}

/**
 * Checks if the user visited this view within the last 5 minutes (300,000 ms).
 */
export function isWithin5Minutes(lastTimestamp?: number): boolean {
  if (!lastTimestamp) return false;
  const FIVE_MINUTES_MS = 5 * 60 * 1000;
  return (Date.now() - lastTimestamp) < FIVE_MINUTES_MS;
}

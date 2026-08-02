export interface UpcomingYearsInfo {
  years: number;
  targetYear: number;
  originYear: number;
  labelText: string;
}

/**
 * Calculates how many years will be reached on the NEXT upcoming celebration.
 */
export function getUpcomingYearsInfo(
  eventDateStr?: string | null,
  eventType?: string | null,
  memberBirthDateStr?: string | null,
  referenceDate: Date = new Date()
): UpcomingYearsInfo | null {
  if (!eventDateStr && !memberBirthDateStr) return null;

  const today = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
  const currentYear = today.getFullYear();

  // Primary date string to determine month & day of celebration
  const primaryDate = eventDateStr || memberBirthDateStr || '';
  const parts = primaryDate.split('-');
  if (parts.length < 2) return null;

  let monthIdx = 0;
  let dayNum = 1;

  if (parts.length === 3) {
    monthIdx = parseInt(parts[1], 10) - 1;
    dayNum = parseInt(parts[2], 10);
  } else if (parts.length === 2) {
    monthIdx = parseInt(parts[0], 10) - 1;
    dayNum = parseInt(parts[1], 10);
  }

  if (isNaN(monthIdx) || isNaN(dayNum)) return null;

  // Determine next celebration year (this year or next year)
  const targetDateThisYear = new Date(currentYear, monthIdx, dayNum);
  let targetYear = currentYear;
  if (targetDateThisYear < today) {
    targetYear = currentYear + 1;
  }

  // Determine origin year
  let originYear: number | null = null;

  const isSanto = eventType === 'Santo';

  // Rule: If event date has 3 parts (YYYY-MM-DD) and it's NOT a Santo, the year of eventDateStr is the event's origin year
  if (!isSanto && eventDateStr) {
    const evParts = eventDateStr.split('-');
    if (evParts.length === 3) {
      const eYear = parseInt(evParts[0], 10);
      if (!isNaN(eYear)) originYear = eYear;
    }
  }

  // Fallback to member birth year for Santo or when no explicit event year exists
  if (originYear === null && memberBirthDateStr) {
    const bdayParts = memberBirthDateStr.split('-');
    if (bdayParts.length === 3) {
      const bYear = parseInt(bdayParts[0], 10);
      if (!isNaN(bYear)) originYear = bYear;
    }
  }

  if (originYear === null || isNaN(originYear)) return null;

  const years = targetYear - originYear;
  if (years < 0) {
    return {
      years: 0,
      targetYear,
      originYear,
      labelText: 'Próximamente'
    };
  }

  if (years === 0) {
    return {
      years: 0,
      targetYear,
      originYear,
      labelText: 'Próximamente'
    };
  }

  const labelText = `${years} ${years === 1 ? 'año' : 'años'}`;

  return {
    years,
    targetYear,
    originYear,
    labelText
  };
}

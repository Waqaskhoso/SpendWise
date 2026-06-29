import { format, parseISO, startOfMonth, endOfMonth, subMonths, isWithinInterval } from 'date-fns';

export function formatDate(dateStr: string, fmt = 'MMM d, yyyy'): string {
  try {
    return format(parseISO(dateStr), fmt);
  } catch {
    return dateStr;
  }
}

export function formatDateShort(dateStr: string): string {
  return formatDate(dateStr, 'MMM d');
}

export function formatMonthYear(dateStr: string): string {
  return formatDate(dateStr, 'MMMM yyyy');
}

export function getCurrentMonth(): number {
  return new Date().getMonth() + 1;
}

export function getCurrentYear(): number {
  return new Date().getFullYear();
}

export function getMonthStart(year: number, month: number): string {
  const date = new Date(year, month - 1, 1);
  return format(startOfMonth(date), 'yyyy-MM-dd');
}

export function getMonthEnd(year: number, month: number): string {
  const date = new Date(year, month - 1, 1);
  return format(endOfMonth(date), 'yyyy-MM-dd');
}

export function getLast6Months(): Array<{ month: number; year: number; label: string }> {
  const result = [];
  for (let i = 5; i >= 0; i--) {
    const date = subMonths(new Date(), i);
    result.push({
      month: date.getMonth() + 1,
      year: date.getFullYear(),
      label: format(date, 'MMM yyyy'),
    });
  }
  return result;
}

export function isDateInRange(dateStr: string, startStr: string, endStr: string): boolean {
  try {
    const date = parseISO(dateStr);
    const start = parseISO(startStr);
    const end = parseISO(endStr);
    return isWithinInterval(date, { start, end });
  } catch {
    return false;
  }
}

export function toISODate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function todayISO(): string {
  return toISODate(new Date());
}

import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export interface TimeParts {
  hours: number;
  minutes: number;
}

const TIME_RE = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/;
const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isValidDate(value: unknown): value is Date {
  return value instanceof Date && !Number.isNaN(value.getTime());
}

/** Parse "HH:mm" or "HH:mm:ss" into numbers. Returns null for anything else. */
export function parseTime(value: string | null | undefined): TimeParts | null {
  if (!value) return null;
  const match = TIME_RE.exec(value.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 24 || minutes > 59 || (hours === 24 && minutes !== 0)) return null;
  return { hours, minutes };
}

/** Parse a "yyyy-MM-dd" database date into a local Date at midnight. */
export function parseDbDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const match = DATE_RE.exec(value.trim());
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return isValidDate(date) ? date : null;
}

/**
 * Combine a real calendar Date with a "HH:mm[:ss]" time into a new local Date.
 * Built from numeric parts — never from string concatenation.
 */
export function combineDateTime(date: Date, time: string): Date | null {
  if (!isValidDate(date)) return null;
  const parts = parseTime(time);
  if (!parts) return null;
  const combined = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    parts.hours,
    parts.minutes,
    0,
    0,
  );
  return isValidDate(combined) ? combined : null;
}

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}

export function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Date -> "yyyy-MM-dd" for the database. */
export function toDbDate(date: Date): string {
  if (!isValidDate(date)) throw new Error('toDbDate received an invalid Date');
  return format(date, 'yyyy-MM-dd');
}

/** Date -> "HH:mm:ss" for the database. */
export function toDbTime(date: Date): string {
  if (!isValidDate(date)) throw new Error('toDbTime received an invalid Date');
  return format(date, 'HH:mm:ss');
}

/** Safely format a Date (German locale); returns a fallback for anything that is not a real Date. */
export function safeFormat(date: Date | null | undefined, pattern: string, fallback = '—'): string {
  return isValidDate(date) ? format(date, pattern, { locale: de }) : fallback;
}

/** Format a "HH:mm[:ss]" database time for display, via a real Date. */
export function formatDbTime(time: string | null | undefined, pattern = 'HH:mm'): string {
  if (!time) return '—';
  const anchor = new Date(2000, 0, 1);
  return safeFormat(combineDateTime(anchor, time), pattern);
}

/** Format a "yyyy-MM-dd" database date for display, via a real Date. */
export function formatDbDate(value: string | null | undefined, pattern = 'EEE, d. MMM yyyy'): string {
  return safeFormat(parseDbDate(value), pattern);
}

/** Minutes since midnight for a "HH:mm[:ss]" time, or null. */
export function timeToMinutes(time: string | null | undefined): number | null {
  const parts = parseTime(time);
  return parts ? parts.hours * 60 + parts.minutes : null;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} Min.`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} Std. ${m} Min.` : `${h} Std.`;
}

export function formatPrice(cents: number, currency = 'EUR'): string {
  if (!cents) return 'Kostenloses Erstgespräch';
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency,
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

export const WEEKDAY_NAMES = [
  'Sonntag',
  'Montag',
  'Dienstag',
  'Mittwoch',
  'Donnerstag',
  'Freitag',
  'Samstag',
] as const;

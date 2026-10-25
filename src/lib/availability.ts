import { format } from 'date-fns';
import type { AppointmentStatus, BlockedDate, BusinessHour, Slot } from './types';
import { addMinutes, combineDateTime, isValidDate, parseDbDate, startOfLocalDay, toDbDate } from './time';

export interface ExistingBooking {
  appointment_date: string;
  start_time: string;
  end_time: string;
  status?: AppointmentStatus;
}

export interface AvailabilityRules {
  slot_interval_minutes: number;
  booking_notice_hours: number;
  max_advance_days: number;
}

export interface GenerateSlotsInput {
  date: Date;
  durationMinutes: number;
  businessHours: BusinessHour[];
  blockedDates: Pick<BlockedDate, 'blocked_date' | 'start_time' | 'end_time'>[];
  bookings: ExistingBooking[];
  rules: AvailabilityRules;
  now?: Date;
}

interface Range {
  start: Date;
  end: Date;
}

/** new_start < existing_end AND new_end > existing_start */
export function overlaps(a: Range, b: Range): boolean {
  return a.start.getTime() < b.end.getTime() && a.end.getTime() > b.start.getTime();
}

function toRange(day: Date, startTime: string, endTime: string): Range | null {
  const start = combineDateTime(day, startTime);
  const end = combineDateTime(day, endTime);
  if (!start || !end || end <= start) return null;
  return { start, end };
}

export function isBeyondAdvanceWindow(date: Date, maxAdvanceDays: number, now: Date): boolean {
  const last = startOfLocalDay(now);
  last.setDate(last.getDate() + maxAdvanceDays);
  return startOfLocalDay(date) > last;
}

/**
 * Generate every bookable slot for one calendar day.
 * Pure function: all inputs are passed in, so it is fully testable.
 */
export function generateSlots(input: GenerateSlotsInput): Slot[] {
  const { date, durationMinutes, businessHours, blockedDates, bookings, rules } = input;
  const now = input.now ?? new Date();

  if (!isValidDate(date) || !isValidDate(now)) return [];
  if (durationMinutes <= 0 || rules.slot_interval_minutes <= 0) return [];

  const day = startOfLocalDay(date);
  const today = startOfLocalDay(now);
  if (day < today) return [];
  if (isBeyondAdvanceWindow(day, rules.max_advance_days, now)) return [];

  const dayKey = toDbDate(day);

  const dayBlocks = blockedDates.filter((b) => b.blocked_date === dayKey);
  if (dayBlocks.some((b) => !b.start_time || !b.end_time)) return [];
  const blockedRanges = dayBlocks
    .map((b) => toRange(day, b.start_time as string, b.end_time as string))
    .filter((r): r is Range => r !== null);

  const bookedRanges = bookings
    .filter((b) => b.appointment_date === dayKey && b.status !== 'cancelled')
    .map((b) => toRange(day, b.start_time, b.end_time))
    .filter((r): r is Range => r !== null);

  const earliestStart = addMinutes(now, rules.booking_notice_hours * 60);

  const shifts = businessHours
    .filter((h) => h.is_open && h.weekday === day.getDay())
    .map((h) => toRange(day, h.start_time, h.end_time))
    .filter((r): r is Range => r !== null)
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  const slots: Slot[] = [];
  const seen = new Set<number>();

  for (const shift of shifts) {
    for (
      let cursor = shift.start;
      addMinutes(cursor, durationMinutes) <= shift.end;
      cursor = addMinutes(cursor, rules.slot_interval_minutes)
    ) {
      const candidate: Range = { start: cursor, end: addMinutes(cursor, durationMinutes) };

      if (candidate.start < earliestStart) continue;
      if (blockedRanges.some((r) => overlaps(candidate, r))) continue;
      if (bookedRanges.some((r) => overlaps(candidate, r))) continue;
      if (seen.has(candidate.start.getTime())) continue;

      seen.add(candidate.start.getTime());
      slots.push({
        start: candidate.start,
        end: candidate.end,
        label: format(candidate.start, 'HH:mm'),
      });
    }
  }

  return slots.sort((a, b) => a.start.getTime() - b.start.getTime());
}

/** Convenience: parse a db date and generate slots for it. */
export function generateSlotsForDbDate(dbDate: string, input: Omit<GenerateSlotsInput, 'date'>): Slot[] {
  const date = parseDbDate(dbDate);
  return date ? generateSlots({ ...input, date }) : [];
}

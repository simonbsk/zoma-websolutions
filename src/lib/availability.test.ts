import { describe, expect, it } from 'vitest';
import { findFirstSlot, generateSlots, overlaps, type GenerateSlotsInput } from './availability';
import type { BusinessHour } from './types';

// Monday 2026-11-02, "now" is the Friday before at 08:00.
const MONDAY = new Date(2026, 10, 2);
const NOW = new Date(2026, 9, 30, 8, 0);

const hours = (start: string, end: string, weekday = 1, is_open = true): BusinessHour => ({
  id: `${weekday}-${start}`,
  weekday,
  is_open,
  start_time: start,
  end_time: end,
});

function base(overrides: Partial<GenerateSlotsInput> = {}): GenerateSlotsInput {
  return {
    date: MONDAY,
    durationMinutes: 60,
    businessHours: [hours('09:00:00', '12:00:00')],
    blockedDates: [],
    bookings: [],
    rules: { slot_interval_minutes: 30, booking_notice_hours: 24, max_advance_days: 60 },
    now: NOW,
    ...overrides,
  };
}

const labels = (input: GenerateSlotsInput) => generateSlots(input).map((s) => s.label);

describe('overlaps', () => {
  it('treats touching ranges as non-overlapping', () => {
    const a = { start: new Date(2026, 0, 1, 9), end: new Date(2026, 0, 1, 10) };
    const b = { start: new Date(2026, 0, 1, 10), end: new Date(2026, 0, 1, 11) };
    expect(overlaps(a, b)).toBe(false);
  });
});

describe('generateSlots', () => {
  it('fits slots inside the shift, stepping by the interval', () => {
    expect(labels(base())).toEqual(['09:00', '09:30', '10:00', '10:30', '11:00']);
  });

  it('returns real Date objects with correct end', () => {
    const [first] = generateSlots(base());
    expect(first.start).toBeInstanceOf(Date);
    expect(first.start.getHours()).toBe(9);
    expect(first.end.getHours()).toBe(10);
  });

  it('supports split shifts', () => {
    const input = base({ businessHours: [hours('09:00', '10:00'), hours('14:00', '15:00')] });
    expect(labels(input)).toEqual(['09:00', '14:00']);
  });

  it('returns nothing on closed days or other weekdays', () => {
    expect(labels(base({ businessHours: [hours('09:00', '12:00', 1, false)] }))).toEqual([]);
    expect(labels(base({ businessHours: [hours('09:00', '12:00', 2)] }))).toEqual([]);
  });

  it('respects the booking notice', () => {
    const now = new Date(2026, 10, 1, 10, 0); // Sunday 10:00, 24h notice -> Monday 10:00
    expect(labels(base({ now }))).toEqual(['10:00', '10:30', '11:00']);
  });

  it('returns nothing for past days and beyond the advance window', () => {
    expect(labels(base({ now: new Date(2026, 10, 3, 8) }))).toEqual([]);
    expect(labels(base({ rules: { slot_interval_minutes: 30, booking_notice_hours: 0, max_advance_days: 2 } }))).toEqual([]);
  });

  it('skips fully blocked days', () => {
    const input = base({ blockedDates: [{ blocked_date: '2026-11-02', start_time: null, end_time: null }] });
    expect(labels(input)).toEqual([]);
  });

  it('skips partially blocked ranges', () => {
    const input = base({ blockedDates: [{ blocked_date: '2026-11-02', start_time: '10:00', end_time: '11:00' }] });
    expect(labels(input)).toEqual(['09:00', '11:00']);
  });

  it('skips overlapping bookings but keeps adjacent slots', () => {
    const input = base({
      bookings: [{ appointment_date: '2026-11-02', start_time: '10:00:00', end_time: '11:00:00' }],
    });
    expect(labels(input)).toEqual(['09:00', '11:00']);
  });

  it('ignores cancelled bookings and bookings on other days', () => {
    const input = base({
      bookings: [
        { appointment_date: '2026-11-02', start_time: '09:00', end_time: '12:00', status: 'cancelled' },
        { appointment_date: '2026-11-03', start_time: '09:00', end_time: '12:00' },
      ],
    });
    expect(labels(input)).toHaveLength(5);
  });

  it('never produces a slot longer than the shift', () => {
    expect(labels(base({ durationMinutes: 240 }))).toEqual([]);
  });
});

describe('findFirstSlot', () => {
  const { date: _date, ...rest } = base();

  it('finds the next open day', () => {
    const slot = findFirstSlot({ ...rest, from: NOW, days: 7 });
    expect(slot?.start.getDate()).toBe(2);
    expect(slot?.label).toBe('09:00');
  });

  it('skips blocked days and returns null when nothing is free', () => {
    const blockedDates = [{ blocked_date: '2026-11-02', start_time: null, end_time: null }];
    expect(findFirstSlot({ ...rest, blockedDates, from: NOW, days: 7 })).toBeNull();
    expect(findFirstSlot({ ...rest, blockedDates, from: NOW, days: 14 })?.start.getDate()).toBe(9);
  });
});

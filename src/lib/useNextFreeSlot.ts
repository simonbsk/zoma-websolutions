import { addDays } from 'date-fns';
import { findFirstSlot } from './availability';
import { listActiveServices } from './api/services';
import { getBookedRanges, listBlockedDates, listBusinessHours } from './api/schedule';
import { useSiteSettings } from './SiteSettings';
import { startOfLocalDay, toDbDate } from './time';
import { useAsync } from './useAsync';
import type { Service, Slot } from './types';

export interface NextFreeSlot {
  service: Service;
  slot: Slot;
}

// get_booked_ranges accepts spans of up to 62 days.
const WINDOW_DAYS = 31;

/** The earliest real, bookable slot for the first service — or null when none is known. */
export function useNextFreeSlot(): NextFreeSlot | null {
  const { settings } = useSiteSettings();

  const { data } = useAsync(async () => {
    if (!settings) return null;
    const [services, hours] = await Promise.all([listActiveServices(), listBusinessHours()]);
    const service = services[0];
    if (!service || !hours.some((h) => h.is_open)) return null;

    const rules = {
      slot_interval_minutes: settings.slot_interval_minutes,
      booking_notice_hours: settings.booking_notice_hours,
      max_advance_days: settings.max_advance_days,
    };
    const now = new Date();
    const today = startOfLocalDay(now);

    for (let offset = 0; offset <= rules.max_advance_days; offset += WINDOW_DAYS) {
      const from = addDays(today, offset);
      const to = addDays(from, WINDOW_DAYS - 1);
      const [blockedDates, bookings] = await Promise.all([
        listBlockedDates(toDbDate(from), toDbDate(to)),
        getBookedRanges(toDbDate(from), toDbDate(to)),
      ]);
      const slot = findFirstSlot({
        from,
        days: WINDOW_DAYS,
        durationMinutes: service.duration_minutes,
        businessHours: hours,
        blockedDates,
        bookings,
        rules,
        now,
      });
      if (slot) return { service, slot };
    }
    return null;
  }, [settings]);

  return data ?? null;
}

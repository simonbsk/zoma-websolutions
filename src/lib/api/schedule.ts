import { supabase } from '../supabase';
import type { BlockedDate, BookedRange, BusinessHour } from '../types';
import { unwrap } from './errors';

// ---- Business hours -------------------------------------------------------

export async function listBusinessHours(): Promise<BusinessHour[]> {
  const result = await supabase
    .from('business_hours')
    .select('*')
    .order('weekday')
    .order('start_time');
  return unwrap(result, 'Could not load business hours.') ?? [];
}

export type BusinessHourInput = Omit<BusinessHour, 'id'>;

/** Replace the full weekly schedule with the given rows. */
export async function saveBusinessHours(rows: BusinessHourInput[], existingIds: string[]): Promise<BusinessHour[]> {
  // Insert the new schedule first so a failure never leaves the studio with no hours.
  const inserted: BusinessHour[] = rows.length
    ? (unwrap(await supabase.from('business_hours').insert(rows).select(), 'Could not save business hours.') ?? [])
    : [];
  if (existingIds.length) {
    const { error } = await supabase.from('business_hours').delete().in('id', existingIds);
    if (error) unwrap({ data: null, error }, 'Could not save business hours.');
  }
  return inserted;
}

// ---- Blocked dates --------------------------------------------------------

export async function listBlockedDates(from?: string, to?: string): Promise<BlockedDate[]> {
  let query = supabase.from('blocked_dates').select('*');
  if (from) query = query.gte('blocked_date', from);
  if (to) query = query.lte('blocked_date', to);
  const result = await query.order('blocked_date').order('start_time', { nullsFirst: true });
  return unwrap(result, 'Could not load blocked dates.') ?? [];
}

export type BlockedDateInput = Pick<BlockedDate, 'blocked_date' | 'start_time' | 'end_time' | 'reason'>;

export async function createBlockedDate(input: BlockedDateInput): Promise<BlockedDate> {
  return unwrap(await supabase.from('blocked_dates').insert(input).select().single(), 'Could not block date.');
}

export async function deleteBlockedDate(id: string): Promise<void> {
  const { error } = await supabase.from('blocked_dates').delete().eq('id', id);
  if (error) unwrap({ data: null, error }, 'Could not remove blocked date.');
}

// ---- Booked ranges (public, no personal data) -----------------------------

export async function getBookedRanges(from: string, to: string): Promise<BookedRange[]> {
  const result = await supabase.rpc('get_booked_ranges', { p_from: from, p_to: to });
  return (unwrap(result, 'Could not load availability.') as BookedRange[] | null) ?? [];
}

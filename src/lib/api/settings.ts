import { supabase } from '../supabase';
import type { WebdesignSettings } from '../types';
import { unwrap } from './errors';

export type SettingsInput = Omit<WebdesignSettings, 'id' | 'created_at' | 'updated_at'>;

export const DEFAULT_RULES = {
  slot_interval_minutes: 30,
  booking_notice_hours: 24,
  max_advance_days: 60,
} as const;

export async function getSettings(): Promise<WebdesignSettings | null> {
  const result = await supabase.from('webdesign_settings').select('*').limit(1).maybeSingle();
  return unwrap(result, 'Could not load settings.');
}

/** Upsert the single settings row. */
export async function saveSettings(id: string | null, input: SettingsInput): Promise<WebdesignSettings> {
  if (id) {
    return unwrap(
      await supabase.from('webdesign_settings').update(input).eq('id', id).select().single(),
      'Could not save settings.',
    );
  }
  return unwrap(await supabase.from('webdesign_settings').insert(input).select().single(), 'Could not save settings.');
}

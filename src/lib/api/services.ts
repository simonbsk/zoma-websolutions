import { supabase } from '../supabase';
import type { Service } from '../types';
import { unwrap } from './errors';

export type ServiceInput = Pick<
  Service,
  'name' | 'slug' | 'description' | 'duration_minutes' | 'price_cents' | 'currency' | 'visual' | 'is_active' | 'sort_order'
>;

const ORDER = { sort: 'sort_order', name: 'name' } as const;

/** Active services for the public site. */
export async function listActiveServices(): Promise<Service[]> {
  const result = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order(ORDER.sort)
    .order(ORDER.name);
  return unwrap(result, 'Leistungen konnten nicht geladen werden.') ?? [];
}

/** All services (admin only — RLS returns inactive rows to admins). */
export async function listAllServices(): Promise<Service[]> {
  const result = await supabase.from('services').select('*').order(ORDER.sort).order(ORDER.name);
  return unwrap(result, 'Leistungen konnten nicht geladen werden.') ?? [];
}

export async function createService(input: ServiceInput): Promise<Service> {
  return unwrap(await supabase.from('services').insert(input).select().single(), 'Leistung konnte nicht angelegt werden.');
}

export async function updateService(id: string, input: Partial<ServiceInput>): Promise<Service> {
  return unwrap(
    await supabase.from('services').update(input).eq('id', id).select().single(),
    'Leistung konnte nicht aktualisiert werden.',
  );
}

export async function deleteService(id: string): Promise<void> {
  const { error } = await supabase.from('services').delete().eq('id', id);
  if (error) {
    // FK violation: the service has appointments.
    if (error.code === '23503') {
      throw new Error('Für diese Leistung gibt es Termine. Deaktivieren Sie sie, statt sie zu löschen.');
    }
    unwrap({ data: null, error });
  }
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

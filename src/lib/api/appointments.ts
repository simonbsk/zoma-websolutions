import { supabase } from '../supabase';
import type { Appointment, AppointmentStatus, AppointmentWithService } from '../types';
import { toDbDate, toDbTime } from '../time';
import { toApiError, unwrap } from './errors';

const SELECT_WITH_SERVICE = '*, services(id, name, duration_minutes)';

export interface AppointmentFilters {
  status?: AppointmentStatus | 'all';
  serviceId?: string | 'all';
  from?: string;
  to?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export async function listAppointments(
  filters: AppointmentFilters = {},
): Promise<{ rows: AppointmentWithService[]; count: number }> {
  const page = filters.page ?? 0;
  const pageSize = filters.pageSize ?? 20;

  let query = supabase.from('appointments').select(SELECT_WITH_SERVICE, { count: 'exact' });

  if (filters.status && filters.status !== 'all') query = query.eq('status', filters.status);
  if (filters.serviceId && filters.serviceId !== 'all') query = query.eq('service_id', filters.serviceId);
  if (filters.from) query = query.gte('appointment_date', filters.from);
  if (filters.to) query = query.lte('appointment_date', filters.to);

  const term = filters.search?.trim().replace(/[%,()]/g, ' ');
  if (term) query = query.or(`full_name.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%`);

  const { data, error, count } = await query
    .order('appointment_date', { ascending: false })
    .order('start_time', { ascending: false })
    .range(page * pageSize, page * pageSize + pageSize - 1);

  if (error) throw toApiError(error, 'Could not load appointments.');
  return { rows: (data ?? []) as AppointmentWithService[], count: count ?? 0 };
}

export async function listAppointmentsBetween(from: string, to: string): Promise<AppointmentWithService[]> {
  const result = await supabase
    .from('appointments')
    .select(SELECT_WITH_SERVICE)
    .gte('appointment_date', from)
    .lte('appointment_date', to)
    .order('appointment_date')
    .order('start_time');
  return (unwrap(result, 'Could not load appointments.') as AppointmentWithService[] | null) ?? [];
}

export async function countAppointments(filter: {
  status?: AppointmentStatus;
  from?: string;
  to?: string;
  excludeCancelled?: boolean;
}): Promise<number> {
  let query = supabase.from('appointments').select('id', { count: 'exact', head: true });
  if (filter.status) query = query.eq('status', filter.status);
  if (filter.excludeCancelled) query = query.neq('status', 'cancelled');
  if (filter.from) query = query.gte('appointment_date', filter.from);
  if (filter.to) query = query.lte('appointment_date', filter.to);
  const { count, error } = await query;
  if (error) throw toApiError(error);
  return count ?? 0;
}

export async function updateAppointmentStatus(id: string, status: AppointmentStatus): Promise<Appointment> {
  return unwrap(
    await supabase.from('appointments').update({ status }).eq('id', id).select().single(),
    'Could not update appointment.',
  );
}

export async function deleteAppointment(id: string): Promise<void> {
  const { error } = await supabase.from('appointments').delete().eq('id', id);
  if (error) throw toApiError(error, 'Could not delete appointment.');
}

// ---- Public booking -------------------------------------------------------

export interface BookingRequest {
  serviceId: string;
  start: Date;
  fullName: string;
  email: string;
  phone: string;
  notes?: string;
}

/** Create a booking through the validated server-side RPC. */
export async function createAppointment(request: BookingRequest): Promise<Appointment> {
  const { data, error } = await supabase.rpc('create_appointment', {
    p_service_id: request.serviceId,
    p_date: toDbDate(request.start),
    p_start_time: toDbTime(request.start),
    p_full_name: request.fullName,
    p_email: request.email,
    p_phone: request.phone,
    p_notes: request.notes ?? null,
  });
  if (error) throw toApiError(error, 'We could not complete your booking.');
  return data as Appointment;
}

import type { PostgrestError } from '@supabase/supabase-js';

const BOOKING_ERRORS: Record<string, string> = {
  SERVICE_UNAVAILABLE: 'This service is no longer available. Please choose another one.',
  BOOKING_NOT_CONFIGURED: 'Online booking is not configured yet. Please contact us directly.',
  INVALID_SLOT: 'That time is not valid. Please pick another slot.',
  NOTICE_TOO_SHORT: 'That time is too soon to book. Please choose a later slot.',
  TOO_FAR_AHEAD: 'That date is too far ahead. Please choose an earlier date.',
  OUTSIDE_HOURS: 'That time is outside our working hours.',
  DATE_BLOCKED: 'We are unavailable at that time. Please choose another slot.',
  SLOT_TAKEN: 'Someone just booked that slot. Please choose another time.',
};

export class ApiError extends Error {
  code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
  }
}

export function toApiError(error: PostgrestError | Error | null | undefined, fallback = 'Something went wrong.'): ApiError {
  if (!error) return new ApiError(fallback);
  const raw = error.message ?? '';
  const known = Object.keys(BOOKING_ERRORS).find((key) => raw.includes(key));
  if (known) return new ApiError(BOOKING_ERRORS[known], known);
  if ('code' in error && error.code === '42501') {
    return new ApiError('You do not have permission to do that.', error.code);
  }
  if ('code' in error && error.code === '23505') {
    return new ApiError('An entry with these details already exists.', error.code);
  }
  return new ApiError(raw || fallback, 'code' in error ? (error.code as string) : undefined);
}

/** Unwrap a Supabase response, throwing an ApiError on failure. */
export function unwrap<T>(result: { data: T | null; error: PostgrestError | null }, fallback?: string): T {
  if (result.error) throw toApiError(result.error, fallback);
  return result.data as T;
}

export function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return 'Something went wrong.';
}

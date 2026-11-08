import type { PostgrestError } from '@supabase/supabase-js';

const BOOKING_ERRORS: Record<string, string> = {
  SERVICE_UNAVAILABLE: 'Diese Leistung ist nicht mehr verfügbar. Bitte wählen Sie eine andere.',
  BOOKING_NOT_CONFIGURED: 'Die Online-Buchung ist noch nicht eingerichtet. Bitte kontaktieren Sie uns direkt.',
  INVALID_SLOT: 'Diese Uhrzeit ist ungültig. Bitte wählen Sie einen anderen Termin.',
  NOTICE_TOO_SHORT: 'Dieser Termin ist zu kurzfristig. Bitte wählen Sie einen späteren Zeitpunkt.',
  TOO_FAR_AHEAD: 'Dieses Datum liegt zu weit in der Zukunft. Bitte wählen Sie ein früheres Datum.',
  OUTSIDE_HOURS: 'Diese Uhrzeit liegt außerhalb unserer Geschäftszeiten.',
  DATE_BLOCKED: 'Zu dieser Zeit sind wir nicht verfügbar. Bitte wählen Sie einen anderen Termin.',
  SLOT_TAKEN: 'Dieser Termin wurde gerade vergeben. Bitte wählen Sie eine andere Uhrzeit.',
};

export class ApiError extends Error {
  code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
  }
}

export function toApiError(error: PostgrestError | Error | null | undefined, fallback = 'Etwas ist schiefgelaufen.'): ApiError {
  if (!error) return new ApiError(fallback);
  const raw = error.message ?? '';
  const known = Object.keys(BOOKING_ERRORS).find((key) => raw.includes(key));
  if (known) return new ApiError(BOOKING_ERRORS[known], known);
  if ('code' in error && error.code === '42501') {
    return new ApiError('Dafür fehlt Ihnen die Berechtigung.', error.code);
  }
  if ('code' in error && error.code === '23505') {
    return new ApiError('Ein Eintrag mit diesen Angaben existiert bereits.', error.code);
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
  return 'Etwas ist schiefgelaufen.';
}

/** Per-browser visitor memory (best effort — storage may be unavailable). */

const KEYS = {
  booked: 'zoma:booked',
  visits: 'zoma:visits',
  counted: 'zoma:visit-counted',
  draft: 'zoma:booking-draft',
} as const;

const DRAFT_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

export function readLocal(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeLocal(key: string, value: string | null): void {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

export function readSession(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeSession(key: string, value: string): void {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

// ---- Bookings ---------------------------------------------------------------

export function markBooked(): void {
  writeLocal(KEYS.booked, '1');
  writeLocal(KEYS.draft, null);
}

export function hasBooked(): boolean {
  return readLocal(KEYS.booked) === '1';
}

export interface BookingDraft {
  slug: string;
  name: string;
  savedAt: number;
}

/** Remembers the service a visitor started booking, so we can offer to pick up where they left off. */
export function saveBookingDraft(slug: string, name: string): void {
  writeLocal(KEYS.draft, JSON.stringify({ slug, name, savedAt: Date.now() }));
}

export function readBookingDraft(): BookingDraft | null {
  const raw = readLocal(KEYS.draft);
  if (!raw) return null;
  try {
    const draft = JSON.parse(raw) as Partial<BookingDraft>;
    if (typeof draft.slug !== 'string' || typeof draft.name !== 'string' || typeof draft.savedAt !== 'number') return null;
    if (Date.now() - draft.savedAt > DRAFT_MAX_AGE_MS) return null;
    return draft as BookingDraft;
  } catch {
    return null;
  }
}

// ---- Visits -----------------------------------------------------------------

/** Counts this visit once per browser session and reports whether the visitor has been here before. */
export function recordVisit(): { returning: boolean } {
  let visits = Number(readLocal(KEYS.visits)) || 0;
  if (readSession(KEYS.counted) !== '1') {
    visits += 1;
    writeLocal(KEYS.visits, String(visits));
    writeSession(KEYS.counted, '1');
  }
  return { returning: visits > 1 };
}

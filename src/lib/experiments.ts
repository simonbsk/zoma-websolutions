import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import { readLocal, readSession, writeLocal, writeSession } from './visitor';
import { HEADLINE_EXPERIMENT } from '../content/site';

/*
 * Lightweight A/B testing.
 * - A visitor gets one variant per experiment, remembered in localStorage.
 * - `?<experiment>=<variant>` in the URL forces a variant (handy for previews).
 * - Events carry only the event name, experiment and variant — no personal data, no visitor ID.
 *   They are stored in Supabase for the admin overview and pushed to `window.dataLayer`
 *   for any analytics tool you add later.
 */

export type SiteEvent =
  | 'experiment_view'
  | 'cta_click'
  | 'booking_started'
  | 'booking_completed'
  | 'subscribe'
  | 'request_sent';

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

const variantKey = (experiment: string) => `zoma:exp:${experiment}`;

export function getVariant<T extends string>(experiment: string, variants: readonly T[]): T {
  const isVariant = (value: string | null): value is T => value !== null && (variants as readonly string[]).includes(value);

  let forced: string | null = null;
  try {
    forced = new URLSearchParams(window.location.search).get(experiment);
  } catch {
    forced = null;
  }
  if (isVariant(forced)) {
    writeLocal(variantKey(experiment), forced);
    return forced;
  }

  const stored = readLocal(variantKey(experiment));
  if (isVariant(stored)) return stored;

  const picked = variants[Math.floor(Math.random() * variants.length)];
  writeLocal(variantKey(experiment), picked);
  return picked;
}

/** Records an event, attributed to the visitor's variant of `experiment` (if any). */
export function track(name: SiteEvent, experiment: string = HEADLINE_EXPERIMENT): void {
  const variant = readLocal(variantKey(experiment));
  const payload = { name, experiment: variant ? experiment : null, variant };
  window.dataLayer?.push({ event: name, experiment: payload.experiment, variant });
  // Fire and forget — analytics must never break the page.
  supabase
    .from('site_events')
    .insert(payload)
    .then(
      () => undefined,
      () => undefined,
    );
}

/** Returns the visitor's variant and records one view per browser session. */
export function useVariant<T extends string>(experiment: string, variants: readonly T[]): T {
  const [variant] = useState(() => getVariant(experiment, variants));

  useEffect(() => {
    const seenKey = `zoma:exp-viewed:${experiment}`;
    if (readSession(seenKey) === '1') return;
    writeSession(seenKey, '1');
    track('experiment_view', experiment);
  }, [experiment]);

  return variant;
}

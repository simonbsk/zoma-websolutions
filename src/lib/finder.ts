import type { Service, ServiceVisual } from './types';

/* The three-question service finder: answers → the best-fitting kind of session. */

export interface FinderAnswers {
  need: 'new' | 'redesign' | 'improve' | 'care';
  sell: 'products' | 'bookings' | 'presence';
  timing: 'soon' | 'quarter' | 'exploring';
}

export function recommendVisual(answers: FinderAnswers): ServiceVisual {
  if (answers.need === 'care') return 'care';
  if (answers.need === 'improve') return 'seo';
  if (answers.sell === 'products') return 'ecommerce';
  if (answers.sell === 'bookings') return 'webapp';
  if (answers.timing === 'exploring') return 'landing';
  return 'brand';
}

/** The first active service of the recommended kind, falling back to the first service. */
export function pickService(services: Service[], visual: ServiceVisual): Service | undefined {
  return services.find((s) => s.visual === visual) ?? services[0];
}

export const FINDER_REASONS: Record<ServiceVisual, string> = {
  landing: 'You’re still shaping the idea — a strategy call turns it into a clear plan and budget.',
  brand: 'You need a site that wins trust and enquiries — this session plans exactly that.',
  ecommerce: 'You want to sell online — we’ll scope catalogue, checkout and payments together.',
  webapp: 'Bookings or a portal need more than pages — we’ll map the workflows first.',
  seo: 'Your site exists but underperforms — an audit shows where speed and search are leaking.',
  care: 'You want a reliable partner after launch — we’ll agree on updates, backups and monitoring.',
};

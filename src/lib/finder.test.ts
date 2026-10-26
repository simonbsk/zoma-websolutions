import { describe, expect, it } from 'vitest';
import { pickService, recommendVisual } from './finder';
import type { Service } from './types';

describe('recommendVisual', () => {
  it('prioritises care and improvement needs', () => {
    expect(recommendVisual({ need: 'care', sell: 'products', timing: 'soon' })).toBe('care');
    expect(recommendVisual({ need: 'improve', sell: 'bookings', timing: 'soon' })).toBe('seo');
  });

  it('routes selling and booking needs', () => {
    expect(recommendVisual({ need: 'new', sell: 'products', timing: 'quarter' })).toBe('ecommerce');
    expect(recommendVisual({ need: 'redesign', sell: 'bookings', timing: 'soon' })).toBe('webapp');
  });

  it('suggests a strategy call while exploring, otherwise a business website', () => {
    expect(recommendVisual({ need: 'new', sell: 'presence', timing: 'exploring' })).toBe('landing');
    expect(recommendVisual({ need: 'redesign', sell: 'presence', timing: 'soon' })).toBe('brand');
  });
});

describe('pickService', () => {
  const service = (id: string, visual: Service['visual']) => ({ id, visual }) as Service;
  const services = [service('a', 'landing'), service('b', 'ecommerce')];

  it('returns the matching service', () => {
    expect(pickService(services, 'ecommerce')?.id).toBe('b');
  });

  it('falls back to the first service', () => {
    expect(pickService(services, 'care')?.id).toBe('a');
    expect(pickService([], 'care')).toBeUndefined();
  });
});

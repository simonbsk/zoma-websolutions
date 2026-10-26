import { describe, expect, it } from 'vitest';
import { addWorkingDays } from './time';

describe('addWorkingDays', () => {
  it('counts Monday to Friday only', () => {
    // Monday 27 October 2025 + 3 → Thursday 30 October
    expect(addWorkingDays(new Date(2025, 9, 27, 15, 30), 3)).toEqual(new Date(2025, 9, 30));
  });

  it('skips the weekend', () => {
    // Thursday 30 October + 3 → Tuesday 4 November
    expect(addWorkingDays(new Date(2025, 9, 30), 3)).toEqual(new Date(2025, 10, 4));
  });

  it('starts counting on Monday when sent at the weekend', () => {
    // Saturday 1 November + 3 → Wednesday 5 November
    expect(addWorkingDays(new Date(2025, 10, 1), 3)).toEqual(new Date(2025, 10, 5));
  });
});

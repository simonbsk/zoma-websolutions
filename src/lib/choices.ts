import { useCallback, useState } from 'react';
import { readSession, writeSession } from './visitor';
import type { BudgetOption, ReplyChannel } from '../content/site';

/*
 * What a visitor picks in the "How it works" squares on the homepage. Only choices they actually
 * touched are stored (per browser session), and the start form uses them as its defaults.
 */

export interface Choices {
  direction?: string;
  features?: string[];
  budget?: BudgetOption;
  channel?: ReplyChannel;
}

const KEY = 'zoma:choices';

export function readChoices(): Choices {
  try {
    const parsed = JSON.parse(readSession(KEY) ?? '{}') as unknown;
    return typeof parsed === 'object' && parsed !== null ? (parsed as Choices) : {};
  } catch {
    return {};
  }
}

function saveChoice<K extends keyof Choices>(key: K, value: Choices[K]) {
  writeSession(KEY, JSON.stringify({ ...readChoices(), [key]: value }));
}

/** Forgets the choices once they have been sent with a request. */
export function clearChoices() {
  writeSession(KEY, '{}');
}

/** Local state for one choice that is remembered once the visitor changes it. */
export function useChoice<K extends keyof Choices>(key: K, fallback: NonNullable<Choices[K]>) {
  const [value, setValue] = useState<NonNullable<Choices[K]>>(() => readChoices()[key] ?? fallback);
  const update = useCallback(
    (next: NonNullable<Choices[K]>) => {
      setValue(next);
      saveChoice(key, next);
    },
    [key],
  );
  return [value, update] as const;
}

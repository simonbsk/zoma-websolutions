import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import './design.css';

/*
 * Whole-site design themes. The active design is stored per browser and mirrored on
 * <html data-design="…"> (set before first paint in index.html), which scopes each
 * design's stylesheet. First-time visitors get the classic design.
 */

export type DesignId = 'classic' | 'sky';

const STORAGE_KEY = 'zoma:design';
const FADE_MS = 380;

interface DesignContextValue {
  design: DesignId;
  switching: boolean;
  /** Switches the whole site, revealing the new design from `origin` (viewport px). */
  switchDesign: (next: DesignId, origin?: { x: number; y: number }) => void;
}

const DesignContext = createContext<DesignContextValue | null>(null);

function readDesign(): DesignId {
  return document.documentElement.dataset.design === 'sky' ? 'sky' : 'classic';
}

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => { finished: Promise<void> };
};

export function DesignProvider({ children }: { children: ReactNode }) {
  const [design, setDesign] = useState<DesignId>(readDesign);
  const [switching, setSwitching] = useState(false);
  const busy = useRef(false);

  const switchDesign = useCallback(
    (next: DesignId, origin?: { x: number; y: number }) => {
      if (next === design || busy.current) return;
      busy.current = true;
      setSwitching(true);

      const root = document.documentElement;
      const x = origin?.x ?? window.innerWidth / 2;
      const y = origin?.y ?? window.innerHeight / 2;
      const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
      root.style.setProperty('--reveal-x', `${x}px`);
      root.style.setProperty('--reveal-y', `${y}px`);
      root.style.setProperty('--reveal-r', `${Math.ceil(radius)}px`);

      const commit = () => {
        flushSync(() => setDesign(next));
        root.dataset.design = next;
        try {
          localStorage.setItem(STORAGE_KEY, next);
        } catch {
          /* ignore */
        }
        // The two designs have different structures — start the new one at the top.
        window.scrollTo(0, 0);
      };
      const done = () => {
        busy.current = false;
        setSwitching(false);
      };

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const doc = document as ViewTransitionDocument;
      if (doc.startViewTransition && !reduced) {
        doc.startViewTransition(commit).finished.finally(done);
        return;
      }
      // Fallback: a soft cross-fade.
      root.classList.add('design-fade-out');
      window.setTimeout(
        () => {
          commit();
          root.classList.remove('design-fade-out');
          done();
        },
        reduced ? 0 : FADE_MS,
      );
    },
    [design],
  );

  return <DesignContext.Provider value={{ design, switching, switchDesign }}>{children}</DesignContext.Provider>;
}

export function useDesign(): DesignContextValue {
  const ctx = useContext(DesignContext);
  if (!ctx) throw new Error('useDesign must be used inside <DesignProvider>');
  return ctx;
}

/** Whether this browser has chosen a design before (used for the first-visit hint). */
export function hasChosenDesign(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    return true;
  }
}

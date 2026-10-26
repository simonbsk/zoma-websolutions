import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import './theme.css';

/*
 * Background theme of the public site: bone white or #181818.
 * The choice is stored per browser and mirrored on <html data-theme="…">, which also switches
 * the public design tokens on (see site.css). index.html sets it before first paint; the admin
 * dashboard runs without the attribute and keeps its own look.
 */

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'zoma:theme';
const FADE_MS = 320;

export const THEME_BG: Record<Theme, string> = { light: '#fdfcf9', dark: '#181818' };

function readTheme(): Theme {
  const attr = document.documentElement.dataset.theme;
  if (attr === 'light' || attr === 'dark') return attr;
  try {
    return localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

interface ThemeContextValue {
  theme: Theme;
  /** Flips the background, revealing the new one from `origin` (viewport px). */
  toggleTheme: (origin?: { x: number; y: number }) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => { finished: Promise<void> };
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(readTheme);
  const busy = useRef(false);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_BG[theme]);
  }, [theme]);

  // Leaving the public site (e.g. for the dashboard) hands the page back to the default tokens.
  useEffect(
    () => () => {
      delete document.documentElement.dataset.theme;
    },
    [],
  );

  const toggleTheme = useCallback(
    (origin?: { x: number; y: number }) => {
      if (busy.current) return;
      busy.current = true;
      const next: Theme = theme === 'dark' ? 'light' : 'dark';

      const root = document.documentElement;
      const x = origin?.x ?? window.innerWidth / 2;
      const y = origin?.y ?? 0;
      const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
      root.style.setProperty('--reveal-x', `${x}px`);
      root.style.setProperty('--reveal-y', `${y}px`);
      root.style.setProperty('--reveal-r', `${Math.ceil(radius)}px`);

      const commit = () => {
        flushSync(() => setTheme(next));
        root.dataset.theme = next;
        try {
          localStorage.setItem(STORAGE_KEY, next);
        } catch {
          /* ignore */
        }
      };
      const done = () => {
        busy.current = false;
      };

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const doc = document as ViewTransitionDocument;
      if (doc.startViewTransition && !reduced) {
        doc.startViewTransition(commit).finished.finally(done);
        return;
      }
      if (reduced) {
        commit();
        done();
        return;
      }
      // Fallback: a short cross-fade.
      root.classList.add('theme-fade-out');
      window.setTimeout(() => {
        commit();
        root.classList.remove('theme-fade-out');
        done();
      }, FADE_MS);
    },
    [theme],
  );

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { Lightbulb, X } from 'lucide-react';
import './notes.css';

/* Clickable "design note" pins with suggestions for next iterations.
   This is review tooling for the test site — remove the provider to hide everything. */

interface NotesContextValue {
  enabled: boolean;
  openId: string | null;
  setOpenId: (id: string | null) => void;
  /** Pins register themselves so the toggle can show how many notes the page has. */
  register: (id: string) => () => void;
}

const NotesContext = createContext<NotesContextValue>({
  enabled: false,
  openId: null,
  setOpenId: () => {},
  register: () => () => {},
});

const STORAGE_KEY = 'zoma:design-notes';

function readEnabled(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== 'off';
  } catch {
    return true;
  }
}

export function DesignNotesProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(readEnabled);
  const [openId, setOpenId] = useState<string | null>(null);
  const [pins, setPins] = useState<ReadonlySet<string>>(() => new Set());

  const register = useCallback((id: string) => {
    setPins((prev) => new Set(prev).add(id));
    return () =>
      setPins((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
  }, []);

  const toggle = () => {
    setEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, next ? 'on' : 'off');
      } catch {
        /* ignore */
      }
      if (!next) setOpenId(null);
      return next;
    });
  };

  return (
    <NotesContext.Provider value={{ enabled, openId, setOpenId, register }}>
      {children}
      <button type="button" className={`notes-toggle ${enabled ? 'is-on' : ''}`} onClick={toggle} aria-pressed={enabled}>
        <Lightbulb size={15} />
        <span>
          Design notes <em>{pins.size}</em>
        </span>
        <span className="notes-switch" aria-hidden />
      </button>
    </NotesContext.Provider>
  );
}

interface NotePinProps {
  id: string;
  n: number;
  title: string;
  tag?: string;
  children: ReactNode;
  style?: CSSProperties;
}

export function NotePin({ id, n, title, tag, children, style }: NotePinProps) {
  const { enabled, openId, setOpenId, register } = useContext(NotesContext);
  useEffect(() => register(id), [id, register]);
  const pinRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number; above: boolean } | null>(null);
  const open = openId === id;

  const place = useCallback(() => {
    const pin = pinRef.current;
    if (!pin) return;
    const r = pin.getBoundingClientRect();
    const width = Math.min(340, window.innerWidth - 24);
    const left = Math.min(Math.max(12, r.left + r.width / 2 - width / 2), window.innerWidth - width - 12);
    const popH = popRef.current?.offsetHeight ?? 220;
    const above = r.bottom + popH + 16 > window.innerHeight && r.top > popH + 16;
    const top = above ? r.top + window.scrollY - popH - 12 : r.bottom + window.scrollY + 12;
    setPos({ left: left + window.scrollX, top, above });
  }, []);

  useLayoutEffect(() => {
    if (open) place();
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!pinRef.current?.contains(target) && !popRef.current?.contains(target)) setOpenId(null);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpenId(null);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', place);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', place);
    };
  }, [open, place, setOpenId]);

  if (!enabled) return null;

  return (
    <>
      <button
        ref={pinRef}
        type="button"
        className={`note-pin ${open ? 'is-open' : ''}`}
        style={style}
        onClick={() => setOpenId(open ? null : id)}
        aria-expanded={open}
        aria-label={`Design note ${n}: ${title}`}
      >
        {n}
      </button>
      {open
        ? createPortal(
            <div
              ref={popRef}
              className={`note-pop ${pos?.above ? 'is-above' : ''}`}
              role="dialog"
              aria-label={title}
              style={{ left: pos?.left ?? -9999, top: pos?.top ?? 0, width: Math.min(340, window.innerWidth - 24) }}
            >
              <div className="note-pop-head">
                <span className="note-pop-n">{n}</span>
                <div>
                  {tag ? <span className="note-pop-tag">{tag}</span> : null}
                  <strong>{title}</strong>
                </div>
                <button type="button" className="note-pop-close" onClick={() => setOpenId(null)} aria-label="Close note">
                  <X size={15} />
                </button>
              </div>
              <div className="note-pop-body">{children}</div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

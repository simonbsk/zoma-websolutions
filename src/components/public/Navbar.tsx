import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { BrandLogo } from './Brand';
import { SectionLink } from './SectionLink';
import { StartLink } from './StartLink';
import { buttonClass } from '../ui/Button';
import { NotePin } from '../notes/DesignNotes';
import { useTheme } from '../../theme/ThemeProvider';

const LINKS = [
  { id: 'services', label: 'Services' },
  { id: 'process', label: 'Process' },
  { id: 'work', label: 'Work' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'team', label: 'Team' },
];

/** Every homepage section in order, so the highlight clears in sections without a nav link. */
const SECTIONS = ['services', 'process', 'work', 'pricing', 'faq', 'team', 'start'];

/** The homepage section currently under the upper third of the screen. */
function useActiveSection(enabled: boolean): string | null {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setActive(null);
      return;
    }
    let raf = 0;
    const update = () => {
      raf = 0;
      const line = window.innerHeight * 0.38;
      let current: string | null = null;
      for (const id of SECTIONS) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) current = id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [enabled]);

  return active;
}

/** Half-filled circle: light and dark in one glyph; it turns over when the theme flips. */
function ThemeGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 3.5a8.5 8.5 0 0 1 0 17z" fill="currentColor" />
    </svg>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const active = useActiveSection(location.pathname === '/');
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [location.pathname, location.hash]);

  const nextTheme = theme === 'dark' ? 'light' : 'dark';

  return (
    <header className={`nav ${scrolled ? 'is-scrolled' : ''} ${open ? 'is-open' : ''}`}>
      <div className="container nav-inner">
        <BrandLogo />
        <nav className="nav-links" aria-label="Primary">
          {LINKS.map((link) => (
            <SectionLink key={link.id} id={link.id} className={active === link.id ? 'is-active' : undefined}>
              {link.label}
            </SectionLink>
          ))}
        </nav>
        <div className="nav-actions note-host">
          <button
            type="button"
            className="theme-toggle"
            aria-label={`Switch to the ${nextTheme} background`}
            title={`Switch to the ${nextTheme} background`}
            onClick={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              toggleTheme({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
            }}
          >
            <ThemeGlyph />
          </button>
          <NotePin id="theme-default" n={12} tag="Comfort" title="Start in the visitor’s own theme" style={{ top: 34, left: -14 }}>
            <p>
              Everyone starts on bone white right now. Reading the operating system’s preference
              (<code>prefers-color-scheme</code>) on the first visit would greet night owls in #181818 straight away — the
              toggle still overrides it.
            </p>
          </NotePin>
          <StartLink from="nav" className={buttonClass('primary', 'md', 'nav-cta')} />
          <button
            type="button"
            className="nav-toggle"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {open ? (
        <nav className="nav-mobile" aria-label="Primary (mobile)">
          {LINKS.map((link) => (
            <SectionLink key={link.id} id={link.id} onNavigate={() => setOpen(false)}>
              {link.label}
            </SectionLink>
          ))}
          <SectionLink id="faq" onNavigate={() => setOpen(false)}>
            FAQ
          </SectionLink>
          <StartLink from="nav-mobile" className={buttonClass('primary', 'lg', 'btn-block')} onClick={() => setOpen(false)} />
        </nav>
      ) : null}
    </header>
  );
}

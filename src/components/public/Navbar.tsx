import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, Menu, X } from 'lucide-react';
import { BrandLogo } from './Brand';
import { buttonClass } from '../ui/Button';
import { NotePin } from '../notes/DesignNotes';
import { track } from '../../lib/experiments';

const LINKS = [
  { href: '/#services', label: 'Services' },
  { href: '/#process', label: 'Process' },
  { href: '/#about', label: 'Studio' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [location.pathname, location.hash]);

  return (
    <header className={`nav ${scrolled ? 'is-scrolled' : ''} ${open ? 'is-open' : ''}`}>
      <div className="container nav-inner">
        <BrandLogo />
        <nav className="nav-links" aria-label="Primary">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>
        <div className="nav-actions note-host">
          <Link to="/book" className={buttonClass('primary', 'md', 'nav-cta btn-midnight')} onClick={() => track('cta_click')}>
            Book a call <ArrowRight size={16} />
          </Link>
          <NotePin id="german" n={10} tag="Reach" title="A German version" style={{ top: 30, right: -10 }}>
            <p>
              Most local clients search in German. All public copy now lives in one file
              (<code>src/content/site.ts</code>), so a DE/EN switch — German by default — is a contained next step.
            </p>
          </NotePin>
          <button
            type="button"
            className="btn btn-subtle btn-icon nav-toggle"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {open ? (
        <div className="nav-mobile">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
              {link.label}
            </a>
          ))}
          <Link to="/book" className={buttonClass('primary', 'lg', 'btn-block')}>
            Book a call
          </Link>
        </div>
      ) : null}
    </header>
  );
}

import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { BrandLogo } from './Brand';
import { buttonClass } from '../ui/Button';

const LINKS = [
  { href: '/#approach', label: 'Approach' },
  { href: '/#pricing', label: 'Pricing' },
  { href: '/#team', label: 'Team' },
  { href: '/#contact', label: 'Contact' },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname, location.hash]);

  return (
    <header className={`nav ${open ? 'is-open' : ''}`}>
      <div className="nav-bar">
        <BrandLogo />
        <div className="nav-right">
          <nav className="nav-links" aria-label="Primary">
            {LINKS.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>
          <Link to="/book" className={buttonClass('primary', 'md', 'btn-cta nav-cta')}>
            Book a call <ArrowUpRight size={18} strokeWidth={1.8} />
          </Link>
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
          <Link to="/book" className={buttonClass('primary', 'lg', 'btn-cta btn-block')}>
            Book your free consultation <ArrowUpRight size={18} strokeWidth={1.8} />
          </Link>
        </div>
      ) : null}
    </header>
  );
}

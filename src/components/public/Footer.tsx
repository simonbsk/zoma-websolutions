import { Link } from 'react-router-dom';
import { BrandLogo } from './Brand';
import { ChecklistSignup } from './ChecklistSignup';
import { NotePin } from '../notes/DesignNotes';
import { useSiteSettings, useBusinessName } from '../../lib/SiteSettings';
import { FEATURED_CASE_STUDY } from '../../content/site';

export function Footer() {
  const { settings } = useSiteSettings();
  const name = useBusinessName();
  const year = new Date().getFullYear();

  return (
    <footer className="footer" id="contact">
      <div className="container">
        <div className="note-host">
          <ChecklistSignup />
          <NotePin id="double-opt-in" n={9} tag="Email" title="Double opt-in and a welcome email" style={{ top: -12, right: 0 }}>
            <p>
              German law expects <strong>double opt-in</strong> for newsletters. Next: a confirmation email that also
              delivers the checklist as a PDF, plus a simple template for monthly notes.
            </p>
          </NotePin>
        </div>

        <div className="footer-top">
          <BrandLogo light />
          <nav className="footer-links" aria-label="Footer">
            <a href="/#services">Services</a>
            <a href="/#process">Process</a>
            <a href="/#about">Studio</a>
            <Link to={`/work/${FEATURED_CASE_STUDY.slug}`}>Work</Link>
            <Link to="/checklist">Checklist</Link>
            <Link to="/book">Book a call</Link>
            {settings?.business_email ? <a href={`mailto:${settings.business_email}`}>{settings.business_email}</a> : null}
            {settings?.business_phone ? (
              <a href={`tel:${settings.business_phone.replace(/\s+/g, '')}`}>{settings.business_phone}</a>
            ) : null}
          </nav>
        </div>

        <div className="footer-base">
          <span>
            © {year} {name}
          </span>
          <Link to="/admin">Studio login</Link>
        </div>
      </div>
    </footer>
  );
}

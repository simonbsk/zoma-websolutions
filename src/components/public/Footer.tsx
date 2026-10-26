import { Link } from 'react-router-dom';
import { BrandLogo } from './Brand';
import { ChecklistSignup } from './ChecklistSignup';
import { SectionLink } from './SectionLink';
import { NotePin } from '../notes/DesignNotes';
import { useSiteSettings, useBusinessName } from '../../lib/SiteSettings';
import { FEATURED_CASE_STUDY, REPLY_DAYS } from '../../content/site';

const EXPLORE = [
  { id: 'services', label: 'Services' },
  { id: 'process', label: 'Process' },
  { id: 'work', label: 'Work' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'faq', label: 'FAQ' },
  { id: 'team', label: 'Team' },
];

export function Footer() {
  const { settings } = useSiteSettings();
  const name = useBusinessName();
  const year = new Date().getFullYear();

  return (
    <footer className="footer" id="contact">
      <div className="container">
        <div className="footer-signup">
          <ChecklistSignup />
        </div>

        <div className="footer-grid">
          <div className="footer-brand">
            <BrandLogo />
            <p>Custom websites, designed and built by four people who answer their own emails.</p>
          </div>
          <nav className="footer-col" aria-label="Explore">
            <h3>Explore</h3>
            {EXPLORE.map((link) => (
              <SectionLink key={link.id} id={link.id}>
                {link.label}
              </SectionLink>
            ))}
          </nav>
          <nav className="footer-col" aria-label="Studio">
            <h3>Studio</h3>
            <Link to="/book">Book a free call</Link>
            <Link to="/checklist">Launch checklist</Link>
            <Link to={`/work/${FEATURED_CASE_STUDY.slug}`}>Case study</Link>
            <Link to="/admin">Studio login</Link>
          </nav>
          <div className="footer-col">
            <h3>Contact</h3>
            {settings?.business_email ? <a href={`mailto:${settings.business_email}`}>{settings.business_email}</a> : null}
            {settings?.business_phone ? (
              <a href={`tel:${settings.business_phone.replace(/\s+/g, '')}`}>{settings.business_phone}</a>
            ) : null}
            {settings?.business_address ? <span>{settings.business_address}</span> : null}
            <span>Replies within {REPLY_DAYS} working days</span>
          </div>
        </div>

        <div className="footer-base note-host">
          <span>
            © {year} {name}
          </span>
          <span>Made with ink, patience and Space Grotesk.</span>
          <NotePin id="legal" n={11} tag="Before launch" title="Imprint and privacy pages" style={{ top: 14, left: '42%' }}>
            <p>
              A German business website needs an <strong>Impressum</strong> and a <strong>Datenschutzerklärung</strong>,
              one click away from every page. The privacy policy should name Supabase (hosting the form data), Google Fonts
              and the anonymous A/B test.
            </p>
            <p>Self-hosting the fonts removes one item from that list.</p>
          </NotePin>
        </div>
      </div>
    </footer>
  );
}

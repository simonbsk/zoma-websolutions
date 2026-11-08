import { Link } from 'react-router-dom';
import { ArrowUpRight, Mail, MapPin, Phone } from 'lucide-react';
import { BrandLogo } from './Brand';
import { buttonClass } from '../ui/Button';
import { useSiteSettings, useBusinessName } from '../../lib/SiteSettings';

export function Footer() {
  const { settings } = useSiteSettings();
  const name = useBusinessName();
  const year = new Date().getFullYear();

  return (
    <footer className="footer" id="contact">
      <div className="wrap footer-cta">
        <h2 className="display">Lassen Sie uns Ihre neue Website bauen.</h2>
        <Link to="/book" className={buttonClass('primary', 'md', 'btn-xl')}>
          Jetzt kostenloses Erstgespräch buchen <ArrowUpRight size={22} strokeWidth={1.8} />
        </Link>
      </div>

      <div className="footer-panel">
        <div className="wrap footer-grid">
          <div className="footer-brand">
            <BrandLogo light />
            <p className="footer-tagline">Sagen Sie Hallo zu Ihrer neuen Website.</p>
          </div>

          <div className="footer-col">
            <h3>Studio</h3>
            <a href="/#approach">Arbeitsweise</a>
            <a href="/#pricing">Preise</a>
            <a href="/#team">Das Team</a>
            <Link to="/book">
              Termin buchen <ArrowUpRight size={15} />
            </Link>
          </div>

          <div className="footer-col">
            <h3>Kontakt</h3>
            {settings?.business_email ? (
              <a href={`mailto:${settings.business_email}`}>
                <Mail size={15} /> {settings.business_email}
              </a>
            ) : null}
            {settings?.business_phone ? (
              <a href={`tel:${settings.business_phone.replace(/\s+/g, '')}`}>
                <Phone size={15} /> {settings.business_phone}
              </a>
            ) : null}
            {settings?.business_address ? (
              <span>
                <MapPin size={15} /> {settings.business_address}
              </span>
            ) : null}
            {!settings?.business_email && !settings?.business_phone && !settings?.business_address ? (
              <Link to="/book">
                Rückruf anfragen <ArrowUpRight size={15} />
              </Link>
            ) : null}
          </div>
        </div>

        <div className="wrap footer-base">
          <span>
            © {year} {name}. Alle Rechte vorbehalten.
          </span>
          <Link to="/admin">Studio-Login</Link>
        </div>
      </div>
    </footer>
  );
}

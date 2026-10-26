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
        <h2 className="display">Let's build your new site.</h2>
        <Link to="/book" className={buttonClass('primary', 'md', 'btn-xl')}>
          Book your free consultation date today <ArrowUpRight size={22} strokeWidth={1.8} />
        </Link>
      </div>

      <div className="footer-panel">
        <div className="wrap footer-grid">
          <div className="footer-brand">
            <BrandLogo light />
            <p className="footer-tagline">Say hello to your new site.</p>
          </div>

          <div className="footer-col">
            <h3>Studio</h3>
            <a href="/#approach">Approach</a>
            <a href="/#pricing">Pricing</a>
            <a href="/#team">The Team</a>
            <Link to="/book">
              Book a call <ArrowUpRight size={15} />
            </Link>
          </div>

          <div className="footer-col">
            <h3>Contact</h3>
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
                Request a call <ArrowUpRight size={15} />
              </Link>
            ) : null}
          </div>
        </div>

        <div className="wrap footer-base">
          <span>
            © {year} {name}. All rights reserved.
          </span>
          <Link to="/admin">Studio login</Link>
        </div>
      </div>
    </footer>
  );
}

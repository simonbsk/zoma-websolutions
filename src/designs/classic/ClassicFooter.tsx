import { Link } from 'react-router-dom';
import { ArrowUpRight, Mail, MapPin, Phone } from 'lucide-react';
import { BrandLogo } from '../../components/public/Brand';
import { buttonClass } from '../../components/ui/Button';
import { useSiteSettings, useBusinessName } from '../../lib/SiteSettings';

export function ClassicFooter() {
  const { settings } = useSiteSettings();
  const name = useBusinessName();
  const year = new Date().getFullYear();

  return (
    <footer className="footer" id="contact">
      <div className="container">
        <div className="footer-cta">
          <div>
            <h2 className="serif">Let's build something that lasts.</h2>
            <p>Book a free consultation — we'll map out scope, timeline and the right approach for your site.</p>
          </div>
          <div className="footer-cta-actions">
            <Link to="/book" className={buttonClass('primary', 'lg')}>
              Book a consultation
            </Link>
            {settings?.business_email ? (
              <a href={`mailto:${settings.business_email}`} className={buttonClass('ghost', 'lg', 'btn-on-dark')}>
                Email us
              </a>
            ) : null}
          </div>
        </div>

        <div className="footer-grid">
          <div className="footer-brand">
            <BrandLogo light />
            <p>Premium websites, designed and engineered with care for businesses that want to look as good as they are.</p>
          </div>

          <div className="footer-col">
            <h3>Studio</h3>
            <a href="/#services">Services</a>
            <a href="/#process">Process</a>
            <a href="/#about">About</a>
            <Link to="/book">Book a call</Link>
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

        <div className="footer-base">
          <span>
            © {year} {name}. All rights reserved.
          </span>
          <Link to="/admin">Studio login</Link>
        </div>
      </div>
    </footer>
  );
}

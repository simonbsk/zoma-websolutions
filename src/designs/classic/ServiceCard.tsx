import { Link } from 'react-router-dom';
import { ArrowRight, Clock } from 'lucide-react';
import type { Service } from '../../lib/types';
import { formatDuration, formatPrice } from '../../lib/time';
import { ServiceVisual } from '../../components/visuals/Visuals';

export function ServiceCard({ service }: { service: Service }) {
  return (
    <article className="service-card">
      <ServiceVisual kind={service.visual} />
      <div className="service-card-body">
        <div className="service-card-meta">
          <span>
            <Clock size={14} /> {formatDuration(service.duration_minutes)}
          </span>
          <span className="service-price">{formatPrice(service.price_cents, service.currency)}</span>
        </div>
        <h3>{service.name}</h3>
        <p>{service.description}</p>
        <Link to={`/book?service=${encodeURIComponent(service.slug)}`} className="link-arrow service-card-cta">
          Book this session <ArrowRight size={16} />
        </Link>
      </div>
    </article>
  );
}

export function ServiceCardSkeleton() {
  return (
    <div className="service-card" aria-hidden>
      <div className="skeleton" style={{ aspectRatio: '16 / 10', borderRadius: 0 }} />
      <div className="service-card-body">
        <div className="skeleton" style={{ height: 12, width: '40%' }} />
        <div className="skeleton" style={{ height: 22, width: '70%' }} />
        <div className="skeleton" style={{ height: 12, width: '100%' }} />
        <div className="skeleton" style={{ height: 12, width: '85%' }} />
      </div>
    </div>
  );
}

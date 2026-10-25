import { CalendarDays, Clock, Layers, Wallet } from 'lucide-react';
import type { Service, Slot } from '../../lib/types';
import { formatDuration, formatPrice, safeFormat } from '../../lib/time';

interface BookingSummaryProps {
  service: Service | null;
  date: Date | null;
  slot: Slot | null;
}

export function BookingSummary({ service, date, slot }: BookingSummaryProps) {
  const rows = [
    { icon: Layers, label: 'Service', value: service?.name ?? null },
    { icon: CalendarDays, label: 'Date', value: date ? safeFormat(date, 'EEEE, d MMMM yyyy') : null },
    {
      icon: Clock,
      label: 'Time',
      value: slot ? `${safeFormat(slot.start, 'HH:mm')} – ${safeFormat(slot.end, 'HH:mm')}` : null,
    },
    { icon: Wallet, label: 'Price', value: service ? formatPrice(service.price_cents, service.currency) : null },
  ];

  return (
    <aside className="summary" aria-label="Booking summary">
      <div className="summary-head">
        <span className="summary-kicker">Your booking</span>
        {service ? <span className="summary-duration">{formatDuration(service.duration_minutes)}</span> : null}
      </div>
      <dl className="summary-list">
        {rows.map(({ icon: Icon, label, value }) => (
          <div key={label} className={value ? 'is-set' : ''}>
            <dt>
              <Icon size={15} />
              {label}
            </dt>
            <dd>{value ?? <span className="summary-placeholder">Not selected</span>}</dd>
          </div>
        ))}
      </dl>
      <p className="summary-note">
        Requests are confirmed by email, usually within one business day. No payment is taken online.
      </p>
    </aside>
  );
}

/** Compact bar shown on small screens. */
export function BookingSummaryBar({ service, slot }: Pick<BookingSummaryProps, 'service' | 'slot'>) {
  if (!service) return null;
  return (
    <div className="summary-bar">
      <strong>{service.name}</strong>
      <span>
        {slot ? safeFormat(slot.start, "EEE d MMM 'at' HH:mm") : formatDuration(service.duration_minutes)}
      </span>
    </div>
  );
}

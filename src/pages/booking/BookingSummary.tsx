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
    { icon: Layers, label: 'Leistung', value: service?.name ?? null },
    { icon: CalendarDays, label: 'Datum', value: date ? safeFormat(date, 'EEEE, d. MMMM yyyy') : null },
    {
      icon: Clock,
      label: 'Uhrzeit',
      value: slot ? `${safeFormat(slot.start, 'HH:mm')} – ${safeFormat(slot.end, 'HH:mm')} Uhr` : null,
    },
    { icon: Wallet, label: 'Preis', value: service ? formatPrice(service.price_cents, service.currency) : null },
  ];

  return (
    <aside className="summary" aria-label="Buchungsübersicht">
      <div className="summary-head">
        <span className="summary-kicker">Ihre Buchung</span>
        {service ? <span className="summary-duration">{formatDuration(service.duration_minutes)}</span> : null}
      </div>
      <dl className="summary-list">
        {rows.map(({ icon: Icon, label, value }) => (
          <div key={label} className={value ? 'is-set' : ''}>
            <dt>
              <Icon size={15} />
              {label}
            </dt>
            <dd>{value ?? <span className="summary-placeholder">Nicht ausgewählt</span>}</dd>
          </div>
        ))}
      </dl>
      <p className="summary-note">
        Anfragen werden per E-Mail bestätigt, in der Regel innerhalb eines Werktags. Online wird keine Zahlung fällig.
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
        {slot ? safeFormat(slot.start, "EEE, d. MMM 'um' HH:mm 'Uhr'") : formatDuration(service.duration_minutes)}
      </span>
    </div>
  );
}

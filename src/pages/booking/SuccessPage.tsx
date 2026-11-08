import { Link, useLocation } from 'react-router-dom';
import { CalendarPlus, Check, Mail, MessagesSquare, ClipboardList } from 'lucide-react';
import { buttonClass } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/misc';
import type { Appointment, Service } from '../../lib/types';
import { combineDateTime, formatDuration, formatPrice, isValidDate, parseDbDate, safeFormat } from '../../lib/time';
import { useBusinessName } from '../../lib/SiteSettings';
import './booking.css';

export interface SuccessState {
  appointment: Appointment;
  service: Pick<Service, 'name' | 'duration_minutes' | 'price_cents' | 'currency'>;
}

function toIcsStamp(date: Date): string {
  // UTC basic format: 20261102T090000Z
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function escapeIcs(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
}

function downloadIcs(start: Date, end: Date, title: string, uid: string) {
  if (!isValidDate(start) || !isValidDate(end)) return;
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ZomaWebsolutions//Booking//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${uid}@zomawebsolutions`,
    `DTSTAMP:${toIcsStamp(new Date())}`,
    `DTSTART:${toIcsStamp(start)}`,
    `DTEND:${toIcsStamp(end)}`,
    `SUMMARY:${escapeIcs(title)}`,
    'DESCRIPTION:Bestätigung ausstehend — Sie erhalten eine E-Mail\\, sobald der Termin bestätigt ist.',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'zoma-erstgespraech.ics';
  a.click();
  URL.revokeObjectURL(url);
}

const NEXT_STEPS = [
  { icon: Mail, title: 'Bestätigung per E-Mail', text: 'Wir prüfen Ihre Anfrage und bestätigen sie per E-Mail, in der Regel innerhalb eines Werktags.' },
  { icon: ClipboardList, title: 'Kurze Vorbereitung', text: 'Halten Sie Ihre aktuelle Website, Beispiele, die Ihnen gefallen, und grobe Ziele bereit.' },
  { icon: MessagesSquare, title: 'Ihr Termin', text: 'Ein fokussiertes Gespräch und klare nächste Schritte — unverbindlich.' },
];

export function SuccessPage() {
  const location = useLocation();
  const state = location.state as SuccessState | null;
  const businessName = useBusinessName();

  if (!state?.appointment) {
    return (
      <div className="booking">
        <div className="container success-wrap">
          <div className="booking-panel">
            <EmptyState icon={<CalendarPlus size={20} />} title="Keine aktuelle Buchung gefunden">
              Sie möchten einen Termin vereinbaren? Starten Sie unten eine neue Buchung.
            </EmptyState>
            <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: 24 }}>
              <Link to="/book" className={buttonClass('primary')}>
                Beratung buchen
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { appointment, service } = state;
  const day = parseDbDate(appointment.appointment_date);
  const start = day ? combineDateTime(day, appointment.start_time) : null;
  const end = day ? combineDateTime(day, appointment.end_time) : null;
  const reference = appointment.id.slice(0, 8).toUpperCase();

  const rows = [
    { label: 'Leistung', value: service.name },
    { label: 'Datum', value: safeFormat(start, 'EEEE, d. MMMM yyyy') },
    { label: 'Uhrzeit', value: `${safeFormat(start, 'HH:mm')} – ${safeFormat(end, 'HH:mm')} Uhr` },
    { label: 'Dauer', value: formatDuration(service.duration_minutes) },
    { label: 'Preis', value: formatPrice(service.price_cents, service.currency) },
    { label: 'Name', value: appointment.full_name },
    { label: 'E-Mail', value: appointment.email },
    { label: 'Telefon', value: appointment.phone },
  ];

  return (
    <div className="booking">
      <div className="container success-wrap">
        <div className="success-card">
          <div className="success-hero">
            <span className="success-badge">
              <Check size={26} strokeWidth={2.6} />
            </span>
            <span className="eyebrow">Anfrage erhalten</span>
            <h1>Vielen Dank, {appointment.full_name}.</h1>
            <p>
              Ihre Terminanfrage wurde an {businessName} gesendet. Wir bestätigen sie per E-Mail an{' '}
              <strong>{appointment.email}</strong>.
            </p>
          </div>

          <div className="success-summary">
            <div className="success-summary-head">
              <span>Terminübersicht</span>
              <span className="badge badge-dot badge-pending">Bestätigung ausstehend</span>
            </div>
            <dl>
              {rows.map((row) => (
                <div key={row.label}>
                  <dt>{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
              {appointment.notes ? (
                <div className="success-notes">
                  <dt>Notizen</dt>
                  <dd>{appointment.notes}</dd>
                </div>
              ) : null}
            </dl>
            <div className="success-ref">
              Referenz <code>{reference}</code>
            </div>
          </div>

          <div className="success-actions">
            {start && end ? (
              <button
                type="button"
                className={buttonClass('ghost')}
                onClick={() => downloadIcs(start, end, `${service.name} — ${businessName}`, appointment.id)}
              >
                <CalendarPlus size={16} /> Zum Kalender hinzufügen
              </button>
            ) : null}
            <Link to="/" className={buttonClass('dark')}>
              Zurück zur Startseite
            </Link>
          </div>
        </div>

        <div className="next-steps">
          <h2>Wie es weitergeht</h2>
          <ol>
            {NEXT_STEPS.map(({ icon: Icon, title, text }) => (
              <li key={title}>
                <span className="next-icon">
                  <Icon size={18} strokeWidth={1.8} />
                </span>
                <div>
                  <strong>{title}</strong>
                  <p>{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

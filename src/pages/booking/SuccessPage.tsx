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
    'DESCRIPTION:Pending confirmation — you will receive an email once confirmed.',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'zoma-consultation.ics';
  a.click();
  URL.revokeObjectURL(url);
}

const NEXT_STEPS = [
  { icon: Mail, title: 'Confirmation email', text: 'We review your request and confirm by email, usually within one business day.' },
  { icon: ClipboardList, title: 'Light preparation', text: 'Have your current site, examples you like and rough goals at hand.' },
  { icon: MessagesSquare, title: 'Your session', text: 'A focused conversation and clear next steps — no obligation.' },
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
            <EmptyState icon={<CalendarPlus size={20} />} title="No recent booking found">
              Looking to schedule a session? Start a new booking below.
            </EmptyState>
            <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: 24 }}>
              <Link to="/book" className={buttonClass('primary')}>
                Book a consultation
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
    { label: 'Service', value: service.name },
    { label: 'Date', value: safeFormat(start, 'EEEE, d MMMM yyyy') },
    { label: 'Time', value: `${safeFormat(start, 'HH:mm')} – ${safeFormat(end, 'HH:mm')}` },
    { label: 'Duration', value: formatDuration(service.duration_minutes) },
    { label: 'Price', value: formatPrice(service.price_cents, service.currency) },
    { label: 'Name', value: appointment.full_name },
    { label: 'Email', value: appointment.email },
    { label: 'Phone', value: appointment.phone },
  ];

  return (
    <div className="booking">
      <div className="container success-wrap">
        <div className="success-card">
          <div className="success-hero">
            <span className="success-badge">
              <Check size={26} strokeWidth={2.6} />
            </span>
            <span className="eyebrow">Request received</span>
            <h1>Thank you, {appointment.full_name.split(' ')[0]}.</h1>
            <p>
              Your appointment request has been sent to {businessName}. We'll confirm it by email at{' '}
              <strong>{appointment.email}</strong>.
            </p>
          </div>

          <div className="success-summary">
            <div className="success-summary-head">
              <span>Appointment summary</span>
              <span className="badge badge-dot badge-pending">Pending confirmation</span>
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
                  <dt>Notes</dt>
                  <dd>{appointment.notes}</dd>
                </div>
              ) : null}
            </dl>
            <div className="success-ref">
              Reference <code>{reference}</code>
            </div>
          </div>

          <div className="success-actions">
            {start && end ? (
              <button
                type="button"
                className={buttonClass('ghost')}
                onClick={() => downloadIcs(start, end, `${service.name} — ${businessName}`, appointment.id)}
              >
                <CalendarPlus size={16} /> Add to calendar
              </button>
            ) : null}
            <Link to="/" className={buttonClass('dark')}>
              Back to homepage
            </Link>
          </div>
        </div>

        <div className="next-steps">
          <h2>What happens next</h2>
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

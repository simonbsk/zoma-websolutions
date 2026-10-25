import { Link } from 'react-router-dom';
import { addDays, endOfMonth, startOfMonth } from 'date-fns';
import { ArrowRight, CalendarCheck2, CalendarClock, CalendarDays, Hourglass, Inbox } from 'lucide-react';
import { PageHeader } from './AdminLayout';
import { Alert, EmptyState, StatusBadge } from '../../components/ui/misc';
import { countAppointments, listAppointmentsBetween } from '../../lib/api/appointments';
import { useAsync } from '../../lib/useAsync';
import { formatDbDate, formatDbTime, safeFormat, toDbDate } from '../../lib/time';
import { useAuth } from '../../auth/AuthProvider';

async function loadOverview() {
  const now = new Date();
  const today = toDbDate(now);
  const in7 = toDbDate(addDays(now, 6));
  const monthStart = toDbDate(startOfMonth(now));
  const monthEnd = toDbDate(endOfMonth(now));

  const [todayCount, weekCount, pendingCount, monthConfirmed, upcoming] = await Promise.all([
    countAppointments({ from: today, to: today, excludeCancelled: true }),
    countAppointments({ from: today, to: in7, excludeCancelled: true }),
    countAppointments({ status: 'pending', from: today }),
    countAppointments({ status: 'confirmed', from: monthStart, to: monthEnd }),
    listAppointmentsBetween(today, toDbDate(addDays(now, 30))),
  ]);

  return {
    todayCount,
    weekCount,
    pendingCount,
    monthConfirmed,
    upcoming: upcoming.filter((a) => a.status !== 'cancelled' && a.status !== 'completed').slice(0, 8),
  };
}

export function OverviewPage() {
  const { user } = useAuth();
  const { data, error, loading } = useAsync(loadOverview, []);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const stats = [
    { label: 'Today', value: data?.todayCount, icon: CalendarDays, hint: 'Active appointments' },
    { label: 'Next 7 days', value: data?.weekCount, icon: CalendarClock, hint: 'Including today' },
    { label: 'Awaiting review', value: data?.pendingCount, icon: Hourglass, hint: 'Pending requests', accent: true },
    { label: 'Confirmed this month', value: data?.monthConfirmed, icon: CalendarCheck2, hint: safeFormat(new Date(), 'MMMM yyyy') },
  ];

  return (
    <>
      <PageHeader
        title={`${greeting}.`}
        description={`Signed in as ${user?.email ?? ''}. Here's what's coming up.`}
      />

      {error ? <Alert tone="error">{error}</Alert> : null}

      <div className="stat-grid">
        {stats.map(({ label, value, icon: Icon, hint, accent }) => (
          <div key={label} className={`stat-card ${accent && value ? 'is-accent' : ''}`}>
            <div className="stat-top">
              <span>{label}</span>
              <Icon size={17} strokeWidth={1.8} />
            </div>
            {loading && value === undefined ? (
              <div className="skeleton" style={{ height: 34, width: 56, marginTop: 10 }} />
            ) : (
              <strong>{value ?? 0}</strong>
            )}
            <small>{hint}</small>
          </div>
        ))}
      </div>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Upcoming appointments</h2>
            <p>The next 30 days, pending and confirmed.</p>
          </div>
          <Link to="/admin/appointments" className="btn btn-ghost btn-sm">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {loading && !data ? (
          <div className="table-skeleton">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="skeleton" style={{ height: 52 }} />
            ))}
          </div>
        ) : data?.upcoming.length ? (
          <ul className="upcoming">
            {data.upcoming.map((a) => (
              <li key={a.id}>
                <div className="upcoming-date">
                  <span>{formatDbDate(a.appointment_date, 'MMM')}</span>
                  <strong>{formatDbDate(a.appointment_date, 'd')}</strong>
                </div>
                <div className="upcoming-main">
                  <strong>{a.full_name}</strong>
                  <span>
                    {a.services?.name ?? 'Service removed'} · {formatDbDate(a.appointment_date, 'EEEE')}{' '}
                    {formatDbTime(a.start_time)}–{formatDbTime(a.end_time)}
                  </span>
                </div>
                <StatusBadge status={a.status} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState icon={<Inbox size={20} />} title="No upcoming appointments">
            New booking requests from the website will appear here.
          </EmptyState>
        )}
      </section>
    </>
  );
}

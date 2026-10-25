import { useEffect, useState } from 'react';
import { CalendarClock, ChevronLeft, ChevronRight, Mail, Phone, Search, Trash2, X } from 'lucide-react';
import { PageHeader } from './AdminLayout';
import { Button } from '../../components/ui/Button';
import { Alert, EmptyState, Modal, StatusBadge, statusLabel } from '../../components/ui/misc';
import {
  deleteAppointment,
  listAppointments,
  updateAppointmentStatus,
  type AppointmentFilters,
} from '../../lib/api/appointments';
import { listAllServices } from '../../lib/api/services';
import { errorMessage } from '../../lib/api/errors';
import { useAsync } from '../../lib/useAsync';
import { formatDbDate, formatDbTime, formatDuration, safeFormat } from '../../lib/time';
import { APPOINTMENT_STATUSES, type AppointmentStatus, type AppointmentWithService } from '../../lib/types';

const PAGE_SIZE = 20;

function useDebounced<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export function AppointmentsPage() {
  const [status, setStatus] = useState<AppointmentFilters['status']>('all');
  const [serviceId, setServiceId] = useState<string>('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<AppointmentWithService | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const debouncedSearch = useDebounced(search);
  const services = useAsync(listAllServices, []);

  useEffect(() => setPage(0), [status, serviceId, from, to, debouncedSearch]);

  const result = useAsync(
    () =>
      listAppointments({
        status,
        serviceId,
        from: from || undefined,
        to: to || undefined,
        search: debouncedSearch,
        page,
        pageSize: PAGE_SIZE,
      }),
    [status, serviceId, from, to, debouncedSearch, page],
  );

  const rows = result.data?.rows ?? [];
  const total = result.data?.count ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasFilters = status !== 'all' || serviceId !== 'all' || from || to || search;

  async function changeStatus(row: AppointmentWithService, next: AppointmentStatus) {
    if (row.status === next) return;
    setBusyId(row.id);
    setActionError(null);
    try {
      const updated = await updateAppointmentStatus(row.id, next);
      result.setData((prev) =>
        prev
          ? { ...prev, rows: prev.rows.map((r) => (r.id === row.id ? { ...r, ...updated } : r)) }
          : { rows: [], count: 0 },
      );
      setSelected((s) => (s && s.id === row.id ? { ...s, ...updated } : s));
    } catch (err) {
      setActionError(errorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  async function remove(row: AppointmentWithService) {
    if (!window.confirm(`Delete the appointment for ${row.full_name}? This cannot be undone.`)) return;
    setBusyId(row.id);
    setActionError(null);
    try {
      await deleteAppointment(row.id);
      setSelected(null);
      await result.reload();
    } catch (err) {
      setActionError(errorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  function clearFilters() {
    setStatus('all');
    setServiceId('all');
    setFrom('');
    setTo('');
    setSearch('');
  }

  return (
    <>
      <PageHeader title="Appointments" description="Review booking requests, confirm sessions and keep statuses current." />

      {actionError ? <Alert tone="error">{actionError}</Alert> : null}
      {result.error ? <Alert tone="error">{result.error}</Alert> : null}

      <section className="panel">
        <div className="filters">
          <label className="search-input">
            <Search size={16} />
            <input
              type="search"
              placeholder="Search name, email or phone"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search appointments"
            />
          </label>
          <select className="select select-sm" value={status} onChange={(e) => setStatus(e.target.value as AppointmentFilters['status'])} aria-label="Filter by status">
            <option value="all">All statuses</option>
            {APPOINTMENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {statusLabel(s)}
              </option>
            ))}
          </select>
          <select className="select select-sm" value={serviceId} onChange={(e) => setServiceId(e.target.value)} aria-label="Filter by service">
            <option value="all">All services</option>
            {services.data?.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <div className="date-range">
            <input type="date" className="input input-sm" value={from} onChange={(e) => setFrom(e.target.value)} aria-label="From date" />
            <span>to</span>
            <input type="date" className="input input-sm" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} aria-label="To date" />
          </div>
          {hasFilters ? (
            <button type="button" className="btn btn-subtle btn-sm" onClick={clearFilters}>
              <X size={14} /> Clear
            </button>
          ) : null}
        </div>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Service</th>
                <th>Date & time</th>
                <th>Status</th>
                <th className="hide-md">Requested</th>
              </tr>
            </thead>
            <tbody>
              {result.loading && !result.data
                ? Array.from({ length: 6 }, (_, i) => (
                    <tr key={i}>
                      <td colSpan={5}>
                        <div className="skeleton" style={{ height: 20 }} />
                      </td>
                    </tr>
                  ))
                : rows.map((row) => (
                    <tr key={row.id} className="is-clickable" onClick={() => setSelected(row)}>
                      <td>
                        <div className="cell-primary">{row.full_name}</div>
                        <div className="cell-secondary">{row.email}</div>
                      </td>
                      <td>
                        <div className="cell-primary">{row.services?.name ?? '—'}</div>
                        {row.services ? <div className="cell-secondary">{formatDuration(row.services.duration_minutes)}</div> : null}
                      </td>
                      <td>
                        <div className="cell-primary">{formatDbDate(row.appointment_date, 'EEE, d MMM yyyy')}</div>
                        <div className="cell-secondary">
                          {formatDbTime(row.start_time)} – {formatDbTime(row.end_time)}
                        </div>
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <StatusSelect value={row.status} disabled={busyId === row.id} onChange={(s) => void changeStatus(row, s)} />
                      </td>
                      <td className="hide-md cell-secondary">{safeFormat(new Date(row.created_at), 'd MMM, HH:mm')}</td>
                    </tr>
                  ))}
            </tbody>
          </table>

          {!result.loading && rows.length === 0 ? (
            <EmptyState icon={<CalendarClock size={20} />} title={hasFilters ? 'No matching appointments' : 'No appointments yet'}>
              {hasFilters ? 'Try adjusting or clearing your filters.' : 'Bookings made on the website will appear here.'}
            </EmptyState>
          ) : null}
        </div>

        {total > 0 ? (
          <div className="pagination">
            <span>
              {page * PAGE_SIZE + 1}–{Math.min(total, (page + 1) * PAGE_SIZE)} of {total}
            </span>
            <div>
              <button type="button" className="btn btn-ghost btn-sm btn-icon" disabled={page === 0} onClick={() => setPage((p) => p - 1)} aria-label="Previous page">
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm btn-icon"
                disabled={page >= pageCount - 1}
                onClick={() => setPage((p) => p + 1)}
                aria-label="Next page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        ) : null}
      </section>

      {selected ? (
        <Modal
          title="Appointment details"
          onClose={() => setSelected(null)}
          footer={
            <>
              <Button variant="danger" onClick={() => void remove(selected)} disabled={busyId === selected.id} style={{ marginRight: 'auto' }}>
                <Trash2 size={15} /> Delete
              </Button>
              <Button variant="ghost" onClick={() => setSelected(null)}>
                Close
              </Button>
            </>
          }
        >
          <div className="modal-body">
            <div className="detail-head">
              <div>
                <h3>{selected.full_name}</h3>
                <p>{selected.services?.name ?? 'Service removed'}</p>
              </div>
              <StatusBadge status={selected.status} />
            </div>
            <dl className="detail-list">
              <div>
                <dt>Date</dt>
                <dd>{formatDbDate(selected.appointment_date, 'EEEE, d MMMM yyyy')}</dd>
              </div>
              <div>
                <dt>Time</dt>
                <dd>
                  {formatDbTime(selected.start_time)} – {formatDbTime(selected.end_time)}
                </dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>
                  <a href={`mailto:${selected.email}`}>
                    <Mail size={14} /> {selected.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>
                  <a href={`tel:${selected.phone.replace(/\s+/g, '')}`}>
                    <Phone size={14} /> {selected.phone}
                  </a>
                </dd>
              </div>
              <div className="full">
                <dt>Notes</dt>
                <dd className="notes">{selected.notes || <span className="muted">No notes provided.</span>}</dd>
              </div>
              <div>
                <dt>Requested</dt>
                <dd>{safeFormat(new Date(selected.created_at), "d MMM yyyy 'at' HH:mm")}</dd>
              </div>
              <div>
                <dt>Last updated</dt>
                <dd>{safeFormat(new Date(selected.updated_at), "d MMM yyyy 'at' HH:mm")}</dd>
              </div>
            </dl>
            <div className="status-actions">
              <span>Set status</span>
              <div>
                {APPOINTMENT_STATUSES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`status-chip status-chip-${s} ${selected.status === s ? 'is-active' : ''}`}
                    disabled={busyId === selected.id}
                    onClick={() => void changeStatus(selected, s)}
                  >
                    {statusLabel(s)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      ) : null}
    </>
  );
}

function StatusSelect({
  value,
  onChange,
  disabled,
}: {
  value: AppointmentStatus;
  onChange: (status: AppointmentStatus) => void;
  disabled?: boolean;
}) {
  return (
    <select
      className={`status-select status-select-${value}`}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value as AppointmentStatus)}
      aria-label="Change status"
    >
      {APPOINTMENT_STATUSES.map((s) => (
        <option key={s} value={s}>
          {statusLabel(s)}
        </option>
      ))}
    </select>
  );
}

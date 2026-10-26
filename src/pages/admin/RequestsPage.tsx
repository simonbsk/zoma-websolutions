import { Fragment, useState } from 'react';
import { ChevronDown, Inbox, Trash2 } from 'lucide-react';
import { PageHeader } from './AdminLayout';
import { Alert, EmptyState } from '../../components/ui/misc';
import { deleteProjectRequest, listProjectRequests, setProjectRequestStatus } from '../../lib/api/requests';
import { errorMessage } from '../../lib/api/errors';
import { useAsync } from '../../lib/useAsync';
import { addWorkingDays, safeFormat } from '../../lib/time';
import { BUDGET_OPTIONS, REPLY_CHANNELS, REPLY_DAYS, SERVICE_OPTIONS } from '../../content/site';
import { REQUEST_STATUSES, type ProjectRequest, type RequestStatus } from '../../lib/types';

const STATUS_LABEL: Record<RequestStatus, string> = { new: 'New', contacted: 'Contacted', closed: 'Closed' };
/** Reuses the appointment status colours: new = amber, contacted = accent, closed = grey. */
const STATUS_STYLE: Record<RequestStatus, string> = { new: 'pending', contacted: 'confirmed', closed: 'completed' };

function labelOf(options: readonly { id: string; label: string }[], id: string): string {
  return options.find((o) => o.id === id)?.label ?? id;
}

export function RequestsPage() {
  const requests = useAsync(listProjectRequests, []);
  const [open, setOpen] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const rows = requests.data ?? [];
  const fresh = rows.filter((r) => r.status === 'new').length;
  const now = new Date();

  async function changeStatus(row: ProjectRequest, status: RequestStatus) {
    setActionError(null);
    setBusy(row.id);
    try {
      await setProjectRequestStatus(row.id, status);
      requests.setData((prev) => (prev ?? []).map((r) => (r.id === row.id ? { ...r, status } : r)));
    } catch (err) {
      setActionError(errorMessage(err));
    } finally {
      setBusy(null);
    }
  }

  async function remove(row: ProjectRequest) {
    if (!window.confirm(`Delete the request from ${row.full_name}? This cannot be undone.`)) return;
    setActionError(null);
    try {
      await deleteProjectRequest(row.id);
      requests.setData((prev) => (prev ?? []).filter((r) => r.id !== row.id));
    } catch (err) {
      setActionError(errorMessage(err));
    }
  }

  return (
    <>
      <PageHeader
        title="Requests"
        description={`Project requests from the “Your website starts here” form. We promise an answer within ${REPLY_DAYS} working days.`}
      />

      {requests.error ? <Alert tone="error">{requests.error}</Alert> : null}
      {actionError ? <Alert tone="error">{actionError}</Alert> : null}

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>
              {rows.length} {rows.length === 1 ? 'request' : 'requests'}
            </h2>
            <p>{fresh ? `${fresh} waiting for a first reply · newest first` : 'Newest first.'}</p>
          </div>
        </div>
        <div className="table-wrap">
          <table className="table requests-table">
            <thead>
              <tr>
                <th>From</th>
                <th>Project</th>
                <th className="hide-md">Reply</th>
                <th>Status</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {requests.loading && !requests.data
                ? Array.from({ length: 4 }, (_, i) => (
                    <tr key={i}>
                      <td colSpan={5}>
                        <div className="skeleton" style={{ height: 20 }} />
                      </td>
                    </tr>
                  ))
                : rows.map((row) => {
                    const received = new Date(row.created_at);
                    const due = addWorkingDays(received, REPLY_DAYS);
                    const overdue = row.status === 'new' && due < now;
                    const expanded = open === row.id;
                    return (
                      <Fragment key={row.id}>
                        <tr className={row.status === 'closed' ? 'is-muted' : ''}>
                          <td>
                            <button
                              type="button"
                              className="request-toggle"
                              aria-expanded={expanded}
                              onClick={() => setOpen(expanded ? null : row.id)}
                            >
                              <ChevronDown size={15} aria-hidden />
                              <span>
                                <span className="cell-primary">{row.full_name}</span>
                                <span className="cell-secondary">
                                  {row.business_name ? `${row.business_name} · ` : ''}
                                  {safeFormat(received, "d MMM 'at' HH:mm")}
                                </span>
                              </span>
                            </button>
                          </td>
                          <td>
                            <div className="cell-primary">{labelOf(SERVICE_OPTIONS, row.service)}</div>
                            <div className="cell-secondary">{labelOf(BUDGET_OPTIONS, row.budget)}</div>
                          </td>
                          <td className="hide-md">
                            <div>{labelOf(REPLY_CHANNELS, row.reply_channel)}</div>
                            <div className={`cell-secondary ${overdue ? 'request-overdue' : ''}`}>
                              {row.status === 'new' ? `${overdue ? 'Overdue since' : 'By'} ${safeFormat(due, 'EEE d MMM')}` : '—'}
                            </div>
                          </td>
                          <td>
                            <select
                              className={`status-select status-select-${STATUS_STYLE[row.status]}`}
                              value={row.status}
                              disabled={busy === row.id}
                              onChange={(e) => void changeStatus(row, e.target.value as RequestStatus)}
                              aria-label={`Status of the request from ${row.full_name}`}
                            >
                              {REQUEST_STATUSES.map((s) => (
                                <option key={s} value={s}>
                                  {STATUS_LABEL[s]}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="cell-actions">
                            <button
                              type="button"
                              className="btn btn-subtle btn-sm btn-icon"
                              onClick={() => void remove(row)}
                              aria-label={`Delete the request from ${row.full_name}`}
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                        {expanded ? (
                          <tr className="request-detail">
                            <td colSpan={5}>
                              <div className="request-detail-grid">
                                <p className="request-message">{row.message}</p>
                                <dl>
                                  <div>
                                    <dt>Email</dt>
                                    <dd>
                                      <a href={`mailto:${row.email}`}>{row.email}</a>
                                    </dd>
                                  </div>
                                  {row.phone ? (
                                    <div>
                                      <dt>Phone</dt>
                                      <dd>
                                        <a href={`tel:${row.phone.replace(/[^\d+]/g, '')}`}>{row.phone}</a>
                                      </dd>
                                    </div>
                                  ) : null}
                                  <div>
                                    <dt>Wants a reply by</dt>
                                    <dd>{labelOf(REPLY_CHANNELS, row.reply_channel)}</dd>
                                  </div>
                                  {row.source ? (
                                    <div>
                                      <dt>Came from</dt>
                                      <dd>{row.source}</dd>
                                    </div>
                                  ) : null}
                                </dl>
                              </div>
                            </td>
                          </tr>
                        ) : null}
                      </Fragment>
                    );
                  })}
            </tbody>
          </table>
          {!requests.loading && !rows.length ? (
            <EmptyState icon={<Inbox size={20} />} title="No requests yet">
              Requests sent from the start form on the website will appear here.
            </EmptyState>
          ) : null}
        </div>
      </section>
    </>
  );
}

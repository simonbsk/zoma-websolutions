import { useState } from 'react';
import { Download, Mail, Trash2 } from 'lucide-react';
import { PageHeader } from './AdminLayout';
import { Button } from '../../components/ui/Button';
import { Alert, EmptyState } from '../../components/ui/misc';
import { deleteSubscriber, listSubscribers } from '../../lib/api/marketing';
import { errorMessage } from '../../lib/api/errors';
import { useAsync } from '../../lib/useAsync';
import { safeFormat } from '../../lib/time';
import type { Subscriber } from '../../lib/types';

function downloadCsv(rows: Subscriber[]) {
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const lines = [
    'email,source,subscribed_at',
    ...rows.map((r) => [escape(r.email), escape(r.source), escape(r.created_at)].join(',')),
  ];
  const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `subscribers-${safeFormat(new Date(), 'yyyy-MM-dd')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function SubscribersPage() {
  const subscribers = useAsync(listSubscribers, []);
  const [actionError, setActionError] = useState<string | null>(null);
  const rows = subscribers.data ?? [];

  async function remove(row: Subscriber) {
    if (!window.confirm(`Remove ${row.email} from the list?`)) return;
    setActionError(null);
    try {
      await deleteSubscriber(row.id);
      subscribers.setData((prev) => (prev ?? []).filter((s) => s.id !== row.id));
    } catch (err) {
      setActionError(errorMessage(err));
    }
  }

  return (
    <>
      <PageHeader
        title="Subscribers"
        description="People who asked for the website checklist from the footer."
        actions={
          <Button variant="ghost" onClick={() => downloadCsv(rows)} disabled={!rows.length}>
            <Download size={16} /> Export CSV
          </Button>
        }
      />

      {subscribers.error ? <Alert tone="error">{subscribers.error}</Alert> : null}
      {actionError ? <Alert tone="error">{actionError}</Alert> : null}

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>{rows.length} {rows.length === 1 ? 'subscriber' : 'subscribers'}</h2>
            <p>Newest first. Remove anyone who asks to unsubscribe.</p>
          </div>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Source</th>
                <th>Subscribed</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {subscribers.loading && !subscribers.data
                ? Array.from({ length: 4 }, (_, i) => (
                    <tr key={i}>
                      <td colSpan={4}>
                        <div className="skeleton" style={{ height: 20 }} />
                      </td>
                    </tr>
                  ))
                : rows.map((row) => (
                    <tr key={row.id}>
                      <td className="cell-primary">
                        <a href={`mailto:${row.email}`}>{row.email}</a>
                      </td>
                      <td className="cell-secondary">{row.source}</td>
                      <td className="cell-secondary">{safeFormat(new Date(row.created_at), "d MMM yyyy 'at' HH:mm")}</td>
                      <td className="cell-actions">
                        <button
                          type="button"
                          className="btn btn-subtle btn-sm btn-icon"
                          onClick={() => void remove(row)}
                          aria-label={`Remove ${row.email}`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
          {!subscribers.loading && !rows.length ? (
            <EmptyState icon={<Mail size={20} />} title="No subscribers yet">
              Sign-ups from the footer checklist form will appear here.
            </EmptyState>
          ) : null}
        </div>
      </section>
    </>
  );
}

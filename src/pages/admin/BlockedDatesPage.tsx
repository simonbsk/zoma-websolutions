import { useState, type FormEvent } from 'react';
import { CalendarOff, Trash2 } from 'lucide-react';
import { PageHeader } from './AdminLayout';
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/Field';
import { Alert, EmptyState, Toggle } from '../../components/ui/misc';
import { createBlockedDate, deleteBlockedDate, listBlockedDates } from '../../lib/api/schedule';
import { errorMessage } from '../../lib/api/errors';
import { useAsync } from '../../lib/useAsync';
import { formatDbDate, formatDbTime, parseDbDate, startOfLocalDay, timeToMinutes, toDbDate } from '../../lib/time';

export function BlockedDatesPage() {
  const blocked = useAsync(() => listBlockedDates(), []);
  const [showPast, setShowPast] = useState(false);

  const [date, setDate] = useState('');
  const [fullDay, setFullDay] = useState(true);
  const [start, setStart] = useState('12:00');
  const [end, setEnd] = useState('14:00');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);

  const today = startOfLocalDay(new Date());
  const todayKey = toDbDate(today);

  const rows = (blocked.data ?? []).filter((b) => {
    if (showPast) return true;
    const d = parseDbDate(b.blocked_date);
    return d ? d >= today : true;
  });
  const pastCount = (blocked.data?.length ?? 0) - rows.length;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!parseDbDate(date)) {
      setFormError('Bitte wählen Sie ein Datum.');
      return;
    }
    if (!fullDay) {
      const s = timeToMinutes(start);
      const en = timeToMinutes(end);
      if (s === null || en === null || en <= s) {
        setFormError('Die Endzeit muss nach der Startzeit liegen.');
        return;
      }
    }
    setSaving(true);
    try {
      const created = await createBlockedDate({
        blocked_date: date,
        start_time: fullDay ? null : start,
        end_time: fullDay ? null : end,
        reason: reason.trim() || null,
      });
      blocked.setData((prev) =>
        [...(prev ?? []), created].sort(
          (a, b) => a.blocked_date.localeCompare(b.blocked_date) || (a.start_time ?? '').localeCompare(b.start_time ?? ''),
        ),
      );
      setDate('');
      setReason('');
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    setListError(null);
    try {
      await deleteBlockedDate(id);
      blocked.setData((prev) => (prev ?? []).filter((b) => b.id !== id));
    } catch (err) {
      setListError(errorMessage(err));
    }
  }

  return (
    <>
      <PageHeader title="Gesperrte Tage" description="Feiertage, Urlaub oder einmalige Abwesenheiten. Gesperrte Zeiten sind nicht buchbar." />

      <div className="split">
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Zeit sperren</h2>
              <p>Ganzer Tag oder ein bestimmter Zeitraum.</p>
            </div>
          </div>
          <form className="panel-body form-stack" onSubmit={onSubmit} noValidate>
            {formError ? <Alert tone="error">{formError}</Alert> : null}
            <TextField label="Datum" type="date" min={todayKey} value={date} onChange={(e) => setDate(e.target.value)} required />
            <Toggle checked={fullDay} onChange={setFullDay} label="Ganzen Tag sperren" />
            {!fullDay ? (
              <div className="grid-2">
                <TextField label="Von" type="time" step={300} value={start} onChange={(e) => setStart(e.target.value)} />
                <TextField label="Bis" type="time" step={300} value={end} onChange={(e) => setEnd(e.target.value)} />
              </div>
            ) : null}
            <TextField
              label="Grund"
              optional
              value={reason}
              maxLength={200}
              onChange={(e) => setReason(e.target.value)}
              placeholder="z. B. Feiertag"
              hint="Interne Notiz — für Besucher nicht sichtbar."
            />
            <Button type="submit" loading={saving} block>
              Sperrzeit hinzufügen
            </Button>
          </form>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Geplante Sperrzeiten</h2>
              <p>{showPast ? 'Alle Sperrzeiten, auch vergangene.' : 'Heute und anstehend.'}</p>
            </div>
            {pastCount > 0 || showPast ? (
              <Toggle checked={showPast} onChange={setShowPast} label="Vergangene anzeigen" />
            ) : null}
          </div>

          {blocked.error ? <Alert tone="error">{blocked.error}</Alert> : null}
          {listError ? <Alert tone="error">{listError}</Alert> : null}

          {blocked.loading && !blocked.data ? (
            <div className="table-skeleton">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="skeleton" style={{ height: 52 }} />
              ))}
            </div>
          ) : rows.length ? (
            <ul className="block-list">
              {rows.map((b) => {
                const isPast = b.blocked_date < todayKey;
                return (
                  <li key={b.id} className={isPast ? 'is-past' : ''}>
                    <div className="upcoming-date">
                      <span>{formatDbDate(b.blocked_date, 'MMM')}</span>
                      <strong>{formatDbDate(b.blocked_date, 'd')}</strong>
                    </div>
                    <div className="upcoming-main">
                      <strong>{formatDbDate(b.blocked_date, 'EEEE, d. MMMM yyyy')}</strong>
                      <span>
                        {b.start_time && b.end_time ? `${formatDbTime(b.start_time)} – ${formatDbTime(b.end_time)} Uhr` : 'Ganzer Tag'}
                        {b.reason ? ` · ${b.reason}` : ''}
                      </span>
                    </div>
                    <button type="button" className="btn btn-subtle btn-sm btn-icon" onClick={() => void remove(b.id)} aria-label="Sperrzeit entfernen">
                      <Trash2 size={15} />
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState icon={<CalendarOff size={20} />} title="Nichts gesperrt">
              Alle Geschäftszeiten sind derzeit buchbar.
            </EmptyState>
          )}
        </section>
      </div>
    </>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { Copy, Plus, Trash2 } from 'lucide-react';
import { PageHeader } from './AdminLayout';
import { Button } from '../../components/ui/Button';
import { Alert, Toggle } from '../../components/ui/misc';
import { listBusinessHours, saveBusinessHours, type BusinessHourInput } from '../../lib/api/schedule';
import { errorMessage } from '../../lib/api/errors';
import { useAsync } from '../../lib/useAsync';
import { timeToMinutes, WEEKDAY_NAMES } from '../../lib/time';
import type { BusinessHour } from '../../lib/types';

interface Shift {
  key: string;
  start: string; // HH:mm
  end: string;
}

interface DayState {
  open: boolean;
  shifts: Shift[];
}

type Week = Record<number, DayState>;

// Monday first in the editor.
const ORDER = [1, 2, 3, 4, 5, 6, 0];

let keySeq = 0;
const newKey = () => `s${++keySeq}`;

function toWeek(rows: BusinessHour[]): Week {
  const week: Week = {};
  for (const d of ORDER) week[d] = { open: false, shifts: [] };
  for (const row of rows) {
    const day = week[row.weekday];
    if (!day) continue;
    day.shifts.push({ key: newKey(), start: row.start_time.slice(0, 5), end: row.end_time.slice(0, 5) });
    if (row.is_open) day.open = true;
  }
  for (const d of ORDER) week[d].shifts.sort((a, b) => a.start.localeCompare(b.start));
  return week;
}

function validateDay(day: DayState): string | null {
  if (!day.open) return null;
  if (!day.shifts.length) return 'Add at least one time range or mark the day as closed.';
  const ranges = day.shifts
    .map((s) => ({ start: timeToMinutes(s.start), end: timeToMinutes(s.end) }))
    .sort((a, b) => (a.start ?? 0) - (b.start ?? 0));
  for (const r of ranges) {
    if (r.start === null || r.end === null) return 'Enter a valid start and end time.';
    if (r.end <= r.start) return 'End time must be after start time.';
  }
  for (let i = 1; i < ranges.length; i++) {
    if ((ranges[i].start as number) < (ranges[i - 1].end as number)) return 'Time ranges must not overlap.';
  }
  return null;
}

export function BusinessHoursPage() {
  const hours = useAsync(listBusinessHours, []);
  const [week, setWeek] = useState<Week | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (hours.data) {
      setWeek(toWeek(hours.data));
      setDirty(false);
    }
  }, [hours.data]);

  const errors = useMemo(() => {
    const out: Record<number, string | null> = {};
    if (week) for (const d of ORDER) out[d] = validateDay(week[d]);
    return out;
  }, [week]);

  const hasErrors = Object.values(errors).some(Boolean);

  function update(day: number, fn: (d: DayState) => DayState) {
    setWeek((w) => (w ? { ...w, [day]: fn(w[day]) } : w));
    setDirty(true);
    setSaved(false);
  }

  function copyToWeekdays(source: number) {
    if (!week) return;
    const src = week[source];
    setWeek((w) => {
      if (!w) return w;
      const next = { ...w };
      for (const d of [1, 2, 3, 4, 5]) {
        if (d === source) continue;
        next[d] = { open: src.open, shifts: src.shifts.map((s) => ({ ...s, key: newKey() })) };
      }
      return next;
    });
    setDirty(true);
    setSaved(false);
  }

  async function save() {
    if (!week || hasErrors || !hours.data) return;
    setSaving(true);
    setSaveError(null);
    try {
      const rows: BusinessHourInput[] = [];
      for (const d of ORDER) {
        for (const s of week[d].shifts) {
          if (timeToMinutes(s.start) === null || timeToMinutes(s.end) === null) continue;
          rows.push({ weekday: d, is_open: week[d].open, start_time: s.start, end_time: s.end });
        }
      }
      const inserted = await saveBusinessHours(
        rows,
        hours.data.map((h) => h.id),
      );
      hours.setData(inserted);
      setSaved(true);
    } catch (err) {
      setSaveError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Business hours"
        description="Bookable time ranges for each weekday. Slots are generated inside these hours only."
        actions={
          <>
            {dirty ? (
              <Button
                variant="ghost"
                onClick={() => {
                  if (hours.data) setWeek(toWeek(hours.data));
                  setDirty(false);
                }}
                disabled={saving}
              >
                Discard
              </Button>
            ) : null}
            <Button onClick={() => void save()} disabled={!dirty || hasErrors} loading={saving}>
              Save hours
            </Button>
          </>
        }
      />

      {hours.error ? <Alert tone="error">{hours.error}</Alert> : null}
      {saveError ? <Alert tone="error">{saveError}</Alert> : null}
      {saved && !dirty ? <Alert tone="success">Business hours saved. Availability updates immediately.</Alert> : null}

      <section className="panel hours">
        {!week ? (
          <div className="table-skeleton">
            {ORDER.map((d) => (
              <div key={d} className="skeleton" style={{ height: 56 }} />
            ))}
          </div>
        ) : (
          ORDER.map((d) => {
            const day = week[d];
            return (
              <div key={d} className={`hours-row ${day.open ? '' : 'is-closed'}`}>
                <div className="hours-day">
                  <Toggle
                    checked={day.open}
                    onChange={(open) =>
                      update(d, (cur) => ({
                        open,
                        shifts: open && !cur.shifts.length ? [{ key: newKey(), start: '09:00', end: '17:00' }] : cur.shifts,
                      }))
                    }
                    label={<strong>{WEEKDAY_NAMES[d]}</strong>}
                  />
                </div>

                <div className="hours-shifts">
                  {day.open ? (
                    <>
                      {day.shifts.map((s) => (
                        <div key={s.key} className="shift">
                          <input
                            type="time"
                            className="input input-sm"
                            value={s.start}
                            step={300}
                            onChange={(e) =>
                              update(d, (cur) => ({
                                ...cur,
                                shifts: cur.shifts.map((x) => (x.key === s.key ? { ...x, start: e.target.value } : x)),
                              }))
                            }
                            aria-label={`${WEEKDAY_NAMES[d]} start time`}
                          />
                          <span className="shift-sep">–</span>
                          <input
                            type="time"
                            className="input input-sm"
                            value={s.end}
                            step={300}
                            onChange={(e) =>
                              update(d, (cur) => ({
                                ...cur,
                                shifts: cur.shifts.map((x) => (x.key === s.key ? { ...x, end: e.target.value } : x)),
                              }))
                            }
                            aria-label={`${WEEKDAY_NAMES[d]} end time`}
                          />
                          <button
                            type="button"
                            className="btn btn-subtle btn-sm btn-icon"
                            onClick={() => update(d, (cur) => ({ ...cur, shifts: cur.shifts.filter((x) => x.key !== s.key) }))}
                            aria-label="Remove time range"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      ))}
                      {errors[d] ? <span className="field-error">{errors[d]}</span> : null}
                    </>
                  ) : (
                    <span className="hours-closed">Closed</span>
                  )}
                </div>

                <div className="hours-actions">
                  {day.open ? (
                    <>
                      <button
                        type="button"
                        className="btn btn-subtle btn-sm"
                        onClick={() => {
                          const last = day.shifts[day.shifts.length - 1];
                          const start = last ? last.end : '09:00';
                          const startMin = timeToMinutes(start) ?? 540;
                          const endMin = Math.min(startMin + 120, 23 * 60 + 55);
                          const end = `${String(Math.floor(endMin / 60)).padStart(2, '0')}:${String(endMin % 60).padStart(2, '0')}`;
                          update(d, (cur) => ({ ...cur, shifts: [...cur.shifts, { key: newKey(), start, end }] }));
                        }}
                      >
                        <Plus size={14} /> Add range
                      </button>
                      {d >= 1 && d <= 5 ? (
                        <button type="button" className="btn btn-subtle btn-sm btn-icon" onClick={() => copyToWeekdays(d)} title="Copy to all weekdays" aria-label="Copy to all weekdays">
                          <Copy size={14} />
                        </button>
                      ) : null}
                    </>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </section>
    </>
  );
}

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { endOfMonth, endOfWeek, startOfMonth, startOfWeek, addDays } from 'date-fns';
import { ArrowLeft, ArrowRight, Check, Clock, Lock, CalendarX2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { TextAreaField, TextField } from '../../components/ui/Field';
import { Alert, EmptyState, Spinner } from '../../components/ui/misc';
import { ServiceVisual } from '../../components/visuals/Visuals';
import { listActiveServices } from '../../lib/api/services';
import { getBookedRanges, listBlockedDates, listBusinessHours } from '../../lib/api/schedule';
import { createAppointment } from '../../lib/api/appointments';
import { ApiError, errorMessage } from '../../lib/api/errors';
import { generateSlots } from '../../lib/availability';
import { useSiteSettings } from '../../lib/SiteSettings';
import { useAsync } from '../../lib/useAsync';
import { formatDuration, formatPrice, safeFormat, startOfLocalDay, toDbDate } from '../../lib/time';
import type { Service, Slot } from '../../lib/types';
import { Calendar } from './Calendar';
import { BookingSummary, BookingSummaryBar } from './BookingSummary';
import type { SuccessState } from './SuccessPage';
import './booking.css';

type Step = 1 | 2 | 3;

const STEPS: { id: Step; label: string; hint: string }[] = [
  { id: 1, label: 'Leistung', hint: 'Termin auswählen' },
  { id: 2, label: 'Datum & Uhrzeit', hint: 'Zeitfenster wählen' },
  { id: 3, label: 'Ihre Angaben', hint: 'Anfrage bestätigen' },
];

interface Details {
  fullName: string;
  email: string;
  phone: string;
  notes: string;
}

type DetailErrors = Partial<Record<keyof Details, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(details: Details): DetailErrors {
  const errors: DetailErrors = {};
  if (details.fullName.trim().length < 2) errors.fullName = 'Bitte geben Sie Ihren vollständigen Namen ein.';
  if (!EMAIL_RE.test(details.email.trim())) errors.email = 'Bitte geben Sie eine gültige E-Mail-Adresse ein.';
  const digits = details.phone.replace(/\D/g, '');
  if (digits.length < 6 || details.phone.trim().length > 40) errors.phone = 'Bitte geben Sie eine gültige Telefonnummer ein.';
  if (details.notes.length > 2000) errors.notes = 'Bitte halten Sie Ihre Notizen unter 2000 Zeichen.';
  return errors;
}

function groupSlots(slots: Slot[]) {
  const groups: { label: string; slots: Slot[] }[] = [
    { label: 'Vormittag', slots: [] },
    { label: 'Nachmittag', slots: [] },
    { label: 'Abend', slots: [] },
  ];
  for (const slot of slots) {
    const h = slot.start.getHours();
    groups[h < 12 ? 0 : h < 17 ? 1 : 2].slots.push(slot);
  }
  return groups.filter((g) => g.slots.length);
}

export function BookingPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { settings, loading: settingsLoading } = useSiteSettings();

  const services = useAsync(listActiveServices, []);
  const hours = useAsync(listBusinessHours, []);

  const [step, setStep] = useState<Step>(1);
  const [service, setService] = useState<Service | null>(null);
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [date, setDate] = useState<Date | null>(null);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [details, setDetails] = useState<Details>({ fullName: '', email: '', phone: '', notes: '' });
  const [errors, setErrors] = useState<DetailErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Deep link: /book?service=slug jumps straight to date selection.
  useEffect(() => {
    const slug = params.get('service');
    if (!slug || !services.data || service) return;
    const match = services.data.find((s) => s.slug === slug);
    if (match) {
      setService(match);
      setStep(2);
    }
  }, [params, services.data, service]);

  // Month range (including leading/trailing week days shown in the grid).
  const range = useMemo(() => {
    const from = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
    const to = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
    return { from: toDbDate(from), to: toDbDate(to), fromDate: from, toDate: to };
  }, [month]);

  const monthData = useAsync(
    async () => {
      const [blocked, booked] = await Promise.all([
        listBlockedDates(range.from, range.to),
        getBookedRanges(range.from, range.to),
      ]);
      return { blocked, booked };
    },
    [range.from, range.to, refreshKey],
  );

  const rules = settings
    ? {
        slot_interval_minutes: settings.slot_interval_minutes,
        booking_notice_hours: settings.booking_notice_hours,
        max_advance_days: settings.max_advance_days,
      }
    : null;

  // Pre-compute slots for every day in the visible grid.
  const slotsByDay = useMemo(() => {
    const map = new Map<string, Slot[]>();
    if (!service || !rules || !hours.data || !monthData.data) return map;
    const now = new Date();
    for (let d = range.fromDate; d <= range.toDate; d = addDays(d, 1)) {
      map.set(
        toDbDate(d),
        generateSlots({
          date: d,
          durationMinutes: service.duration_minutes,
          businessHours: hours.data,
          blockedDates: monthData.data.blocked,
          bookings: monthData.data.booked,
          rules,
          now,
        }),
      );
    }
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [service, hours.data, monthData.data, range, rules?.slot_interval_minutes, rules?.booking_notice_hours, rules?.max_advance_days]);

  const daySlots = date ? slotsByDay.get(toDbDate(date)) ?? [] : [];
  const monthHasSlots = useMemo(() => [...slotsByDay.values()].some((s) => s.length > 0), [slotsByDay]);

  const isAvailable = useCallback((d: Date) => (slotsByDay.get(toDbDate(d))?.length ?? 0) > 0, [slotsByDay]);

  // Keep the selected date/slot valid when availability changes.
  useEffect(() => {
    if (date && slotsByDay.size && !isAvailable(date)) {
      setDate(null);
      setSlot(null);
    } else if (slot && date) {
      const stillThere = (slotsByDay.get(toDbDate(date)) ?? []).some((s) => s.start.getTime() === slot.start.getTime());
      if (slotsByDay.size && !stillThere) setSlot(null);
    }
  }, [slotsByDay, date, slot, isAvailable]);

  const minMonth = startOfMonth(new Date());
  const maxMonth = startOfMonth(addDays(startOfLocalDay(new Date()), rules?.max_advance_days ?? 60));

  function chooseService(next: Service) {
    if (service?.id !== next.id) {
      setSlot(null);
    }
    setService(next);
    setStep(2);
    setSubmitError(null);
    params.set('service', next.slug);
    setParams(params, { replace: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function chooseDate(next: Date) {
    setDate(next);
    setSlot(null);
  }

  function goTo(next: Step) {
    if (next === 2 && !service) return;
    if (next === 3 && !slot) return;
    setStep(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function updateDetail<K extends keyof Details>(key: K, value: Details[K]) {
    setDetails((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!service || !slot) return;
    const found = validate(details);
    setErrors(found);
    if (Object.keys(found).length) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const appointment = await createAppointment({
        serviceId: service.id,
        start: slot.start,
        fullName: details.fullName,
        email: details.email,
        phone: details.phone,
        notes: details.notes,
      });
      const state: SuccessState = {
        appointment,
        service: {
          name: service.name,
          duration_minutes: service.duration_minutes,
          price_cents: service.price_cents,
          currency: service.currency,
        },
      };
      navigate('/book/success', { replace: true, state });
    } catch (err) {
      const message = errorMessage(err);
      setSubmitError(message);
      if (err instanceof ApiError && ['SLOT_TAKEN', 'NOTICE_TOO_SHORT', 'DATE_BLOCKED', 'OUTSIDE_HOURS'].includes(err.code ?? '')) {
        setSlot(null);
        setRefreshKey((k) => k + 1);
        setStep(2);
      }
    } finally {
      setSubmitting(false);
    }
  }

  const bootLoading = services.loading || hours.loading || settingsLoading;
  const bookingDisabled = !settingsLoading && !settings;

  return (
    <div className="booking">
      <div className="container">
        <header className="booking-header">
          <span className="eyebrow">Beratung buchen</span>
          <h1>Vereinbaren Sie Ihren Termin</h1>
          <p>Drei kurze Schritte. Sobald wir Ihre Anfrage geprüft haben, erhalten Sie eine Bestätigung per E-Mail.</p>
        </header>

        <ol className="stepper" aria-label="Buchungsfortschritt">
          {STEPS.map((s) => {
            const state = s.id < step ? 'done' : s.id === step ? 'current' : 'todo';
            const reachable = s.id < step || (s.id === 2 && service) || (s.id === 3 && slot);
            return (
              <li key={s.id} className={`step is-${state}`}>
                <button
                  type="button"
                  onClick={() => goTo(s.id)}
                  disabled={!reachable || s.id === step}
                  aria-current={state === 'current' ? 'step' : undefined}
                >
                  <span className="step-index">{state === 'done' ? <Check size={14} strokeWidth={2.6} /> : s.id}</span>
                  <span className="step-text">
                    <strong>{s.label}</strong>
                    <span>{s.hint}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        {bookingDisabled ? (
          <div className="booking-panel">
            <EmptyState icon={<CalendarX2 size={20} />} title="Die Online-Buchung ist noch nicht verfügbar">
              Bitte kontaktieren Sie uns per E-Mail, dann vereinbaren wir direkt einen Termin mit Ihnen.
            </EmptyState>
          </div>
        ) : (
          <div className="booking-layout">
            <div className="booking-main">
              {submitError && step !== 3 ? <Alert tone="error">{submitError}</Alert> : null}
              {services.error ? <Alert tone="error">{services.error}</Alert> : null}

              {/* Step 1 — service --------------------------------------- */}
              {step === 1 ? (
                <section className="booking-panel" aria-labelledby="step1-title">
                  <div className="panel-head">
                    <h2 id="step1-title">Welchen Termin möchten Sie buchen?</h2>
                    <p>Jeder Termin findet mit einem erfahrenen Designer oder Entwickler aus unserem Studio statt.</p>
                  </div>
                  {bootLoading && !services.data ? (
                    <div className="panel-loading">
                      <Spinner />
                    </div>
                  ) : services.data?.length ? (
                    <div className="service-options" role="list">
                      {services.data.map((s) => {
                        const selected = service?.id === s.id;
                        return (
                          <button
                            key={s.id}
                            type="button"
                            role="listitem"
                            className={`service-option ${selected ? 'is-selected' : ''}`}
                            onClick={() => chooseService(s)}
                            aria-pressed={selected}
                          >
                            <div className="service-option-visual">
                              <ServiceVisual kind={s.visual} compact />
                            </div>
                            <div className="service-option-body">
                              <strong>{s.name}</strong>
                              <p>{s.description}</p>
                              <div className="service-option-meta">
                                <span>
                                  <Clock size={13} /> {formatDuration(s.duration_minutes)}
                                </span>
                                <span className="service-option-price">{formatPrice(s.price_cents, s.currency)}</span>
                              </div>
                            </div>
                            <span className="service-option-check" aria-hidden>
                              <Check size={14} strokeWidth={3} />
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <EmptyState icon={<CalendarX2 size={20} />} title="Keine Termine verfügbar">
                      Derzeit sind keine Leistungen buchbar. Bitte schauen Sie bald wieder vorbei.
                    </EmptyState>
                  )}
                </section>
              ) : null}

              {/* Step 2 — date & time ---------------------------------- */}
              {step === 2 && service ? (
                <section className="booking-panel" aria-labelledby="step2-title">
                  <div className="panel-head panel-head-row">
                    <div>
                      <h2 id="step2-title">Datum und Uhrzeit wählen</h2>
                      <p>
                        Verfügbare Termine für <strong>{service.name}</strong> ({formatDuration(service.duration_minutes)}).
                      </p>
                    </div>
                    <button type="button" className="btn btn-subtle btn-sm" onClick={() => goTo(1)}>
                      Leistung ändern
                    </button>
                  </div>

                  {monthData.error || hours.error ? (
                    <Alert tone="error">{monthData.error ?? hours.error}</Alert>
                  ) : null}

                  <div className="datetime">
                    <Calendar
                      month={month}
                      onMonthChange={(m) => setMonth(startOfMonth(m))}
                      minMonth={minMonth}
                      maxMonth={maxMonth}
                      selected={date}
                      onSelect={chooseDate}
                      isAvailable={isAvailable}
                      loading={monthData.loading || hours.loading}
                    />

                    <div className="slots">
                      <div className="slots-head">
                        <h3>{date ? safeFormat(date, 'EEEE, d. MMMM') : 'Verfügbare Uhrzeiten'}</h3>
                        {date ? <span>{daySlots.length} {daySlots.length === 1 ? 'Termin' : 'Termine'}</span> : null}
                      </div>

                      {monthData.loading || hours.loading ? (
                        <div className="slots-skeleton">
                          {Array.from({ length: 8 }, (_, i) => (
                            <span key={i} className="skeleton" />
                          ))}
                        </div>
                      ) : !date ? (
                        <div className="slots-empty">
                          <CalendarX2 size={20} />
                          <p>
                            {monthHasSlots
                              ? 'Wählen Sie ein markiertes Datum, um die verfügbaren Uhrzeiten zu sehen.'
                              : 'In diesem Monat sind keine Termine frei. Versuchen Sie es im nächsten Monat.'}
                          </p>
                        </div>
                      ) : (
                        <div className="slot-groups">
                          {groupSlots(daySlots).map((group) => (
                            <div key={group.label} className="slot-group">
                              <span className="slot-group-label">{group.label}</span>
                              <div className="slot-grid">
                                {group.slots.map((s) => {
                                  const selected = slot?.start.getTime() === s.start.getTime();
                                  return (
                                    <button
                                      key={s.start.getTime()}
                                      type="button"
                                      className={`slot ${selected ? 'is-selected' : ''}`}
                                      aria-pressed={selected}
                                      onClick={() => setSlot(s)}
                                    >
                                      {s.label}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="panel-foot">
                    <Button variant="ghost" onClick={() => goTo(1)}>
                      <ArrowLeft size={16} /> Zurück
                    </Button>
                    <Button variant="primary" size="lg" disabled={!slot} onClick={() => goTo(3)}>
                      Weiter <ArrowRight size={16} />
                    </Button>
                  </div>
                </section>
              ) : null}

              {/* Step 3 — details -------------------------------------- */}
              {step === 3 && service && slot ? (
                <form className="booking-panel" onSubmit={submit} noValidate aria-labelledby="step3-title">
                  <div className="panel-head">
                    <h2 id="step3-title">Ihre Angaben</h2>
                    <p>Wir verwenden sie ausschließlich, um Ihren Termin zu bestätigen und vorzubereiten.</p>
                  </div>

                  {submitError ? <Alert tone="error">{submitError}</Alert> : null}

                  <fieldset className="form-group">
                    <legend>Kontakt</legend>
                    <TextField
                      label="Vollständiger Name"
                      autoComplete="name"
                      value={details.fullName}
                      onChange={(e) => updateDetail('fullName', e.target.value)}
                      error={errors.fullName}
                      placeholder="Erika Mustermann"
                      required
                    />
                    <div className="grid-2">
                      <TextField
                        label="E-Mail"
                        type="email"
                        autoComplete="email"
                        value={details.email}
                        onChange={(e) => updateDetail('email', e.target.value)}
                        error={errors.email}
                        placeholder="erika@firma.de"
                        required
                      />
                      <TextField
                        label="Telefon"
                        type="tel"
                        autoComplete="tel"
                        value={details.phone}
                        onChange={(e) => updateDetail('phone', e.target.value)}
                        error={errors.phone}
                        placeholder="+49 151 2345678"
                        required
                      />
                    </div>
                  </fieldset>

                  <fieldset className="form-group">
                    <legend>Zu Ihrem Projekt</legend>
                    <TextAreaField
                      label="Notizen"
                      optional
                      value={details.notes}
                      onChange={(e) => updateDetail('notes', e.target.value)}
                      error={errors.notes}
                      placeholder="Ihre aktuelle Website, Ziele, Zeitrahmen oder alles, was wir vorab wissen sollten."
                      hint={`${details.notes.length}/2000`}
                      maxLength={2000}
                    />
                  </fieldset>

                  <p className="privacy-line">
                    <Lock size={14} /> Ihre Daten werden sicher übertragen und niemals an Dritte weitergegeben.
                  </p>

                  <div className="panel-foot">
                    <Button variant="ghost" onClick={() => goTo(2)} disabled={submitting}>
                      <ArrowLeft size={16} /> Zurück
                    </Button>
                    <Button type="submit" variant="primary" size="lg" loading={submitting}>
                      {submitting ? 'Anfrage wird gesendet…' : 'Termin anfragen'}
                    </Button>
                  </div>
                </form>
              ) : null}
            </div>

            <div className="booking-side">
              <BookingSummary service={service} date={date} slot={slot} />
            </div>
          </div>
        )}
      </div>
      <BookingSummaryBar service={service} slot={slot} />
    </div>
  );
}

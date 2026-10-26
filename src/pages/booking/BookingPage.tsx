import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
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
import { track } from '../../lib/experiments';
import { useSiteSettings } from '../../lib/SiteSettings';
import { useAsync } from '../../lib/useAsync';
import { formatDuration, formatMoney, formatPrice, parseDbDate, safeFormat, startOfLocalDay, toDbDate } from '../../lib/time';
import { saveBookingDraft } from '../../lib/visitor';
import type { Service, Slot } from '../../lib/types';
import { Calendar } from './Calendar';
import { BookingSummary, BookingSummaryBar } from './BookingSummary';
import type { SuccessState } from './SuccessPage';
import './booking.css';

type Step = 1 | 2 | 3;

const STEPS: { id: Step; label: string; hint: string }[] = [
  { id: 1, label: 'Service', hint: 'Choose a session' },
  { id: 2, label: 'Date & time', hint: 'Pick a slot' },
  { id: 3, label: 'Your details', hint: 'Confirm request' },
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
  if (details.fullName.trim().length < 2) errors.fullName = 'Please enter your full name.';
  if (!EMAIL_RE.test(details.email.trim())) errors.email = 'Please enter a valid email address.';
  const digits = details.phone.replace(/\D/g, '');
  if (digits.length < 6 || details.phone.trim().length > 40) errors.phone = 'Please enter a valid phone number.';
  if (details.notes.length > 2000) errors.notes = 'Please keep notes under 2000 characters.';
  return errors;
}

function groupSlots(slots: Slot[]) {
  const groups: { label: string; slots: Slot[] }[] = [
    { label: 'Morning', slots: [] },
    { label: 'Afternoon', slots: [] },
    { label: 'Evening', slots: [] },
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

  // Deep links may carry a date and time (e.g. from "Next free slot") to pre-select.
  const [linkedDate] = useState(() => parseDbDate(params.get('date')));
  const [pendingTime, setPendingTime] = useState<string | null>(() => (linkedDate ? params.get('time') : null));

  const [step, setStep] = useState<Step>(1);
  const [service, setService] = useState<Service | null>(null);
  const [month, setMonth] = useState(() => startOfMonth(linkedDate ?? new Date()));
  const [date, setDate] = useState<Date | null>(linkedDate);
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

  // Remember the chosen service (for "welcome back — continue booking") and count the start once.
  const startTracked = useRef(false);
  useEffect(() => {
    if (!service) return;
    saveBookingDraft(service.slug, service.name);
    if (!startTracked.current) {
      startTracked.current = true;
      track('booking_started');
    }
  }, [service]);

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

  // Apply a linked time once that day's slots are known.
  useEffect(() => {
    if (!pendingTime || !date) return;
    const slots = slotsByDay.get(toDbDate(date));
    if (!slots) return;
    const match = slots.find((s) => s.label === pendingTime);
    if (match) setSlot(match);
    setPendingTime(null);
  }, [pendingTime, date, slotsByDay]);

  // Keep the selected date/slot valid when availability changes.
  useEffect(() => {
    if (date && slotsByDay.size && !isAvailable(date)) {
      setDate(null);
      setSlot(null);
      setPendingTime(null);
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
    params.delete('date');
    params.delete('time');
    setParams(params, { replace: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function chooseDate(next: Date) {
    setDate(next);
    setSlot(null);
    setPendingTime(null);
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
          <span className="eyebrow">Book a consultation</span>
          <h1>Schedule your session</h1>
          <p>Three short steps. You'll receive a confirmation by email once we've reviewed your request.</p>
        </header>

        <ol className="stepper" aria-label="Booking progress">
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
            <EmptyState icon={<CalendarX2 size={20} />} title="Online booking is not available yet">
              Please get in touch by email and we'll arrange a time with you directly.
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
                    <h2 id="step1-title">Which session would you like?</h2>
                    <p>Every session is with a senior designer or developer from the studio.</p>
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
                              {s.project_from_cents ? (
                                <span className="service-option-from">
                                  Projects from {formatMoney(s.project_from_cents, s.currency)}
                                </span>
                              ) : null}
                            </div>
                            <span className="service-option-check" aria-hidden>
                              <Check size={14} strokeWidth={3} />
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <EmptyState icon={<CalendarX2 size={20} />} title="No sessions available">
                      There are no bookable services right now. Please check back soon.
                    </EmptyState>
                  )}
                </section>
              ) : null}

              {/* Step 2 — date & time ---------------------------------- */}
              {step === 2 && service ? (
                <section className="booking-panel" aria-labelledby="step2-title">
                  <div className="panel-head panel-head-row">
                    <div>
                      <h2 id="step2-title">Choose a date and time</h2>
                      <p>
                        Showing availability for <strong>{service.name}</strong> ({formatDuration(service.duration_minutes)}).
                      </p>
                    </div>
                    <button type="button" className="btn btn-subtle btn-sm" onClick={() => goTo(1)}>
                      Change service
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
                        <h3>{date ? safeFormat(date, 'EEEE, d MMMM') : 'Available times'}</h3>
                        {date ? <span>{daySlots.length} {daySlots.length === 1 ? 'slot' : 'slots'}</span> : null}
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
                              ? 'Select a highlighted date to see available times.'
                              : 'No availability this month. Try the next month.'}
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
                      <ArrowLeft size={16} /> Back
                    </Button>
                    <Button variant="primary" size="lg" disabled={!slot} onClick={() => goTo(3)}>
                      Continue <ArrowRight size={16} />
                    </Button>
                  </div>
                </section>
              ) : null}

              {/* Step 3 — details -------------------------------------- */}
              {step === 3 && service && slot ? (
                <form className="booking-panel" onSubmit={submit} noValidate aria-labelledby="step3-title">
                  <div className="panel-head">
                    <h2 id="step3-title">Your details</h2>
                    <p>We'll use these only to confirm and prepare for your session.</p>
                  </div>

                  {submitError ? <Alert tone="error">{submitError}</Alert> : null}

                  <fieldset className="form-group">
                    <legend>Contact</legend>
                    <TextField
                      label="Full name"
                      autoComplete="name"
                      value={details.fullName}
                      onChange={(e) => updateDetail('fullName', e.target.value)}
                      error={errors.fullName}
                      placeholder="Jane Doe"
                      required
                    />
                    <div className="grid-2">
                      <TextField
                        label="Email"
                        type="email"
                        autoComplete="email"
                        value={details.email}
                        onChange={(e) => updateDetail('email', e.target.value)}
                        error={errors.email}
                        placeholder="jane@company.com"
                        required
                      />
                      <TextField
                        label="Phone"
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
                    <legend>About your project</legend>
                    <TextAreaField
                      label="Notes"
                      optional
                      value={details.notes}
                      onChange={(e) => updateDetail('notes', e.target.value)}
                      error={errors.notes}
                      placeholder="Your current website, goals, timeline or anything we should know beforehand."
                      hint={`${details.notes.length}/2000`}
                      maxLength={2000}
                    />
                  </fieldset>

                  <p className="privacy-line">
                    <Lock size={14} /> Your information is transmitted securely and never shared with third parties.
                  </p>

                  <div className="panel-foot">
                    <Button variant="ghost" onClick={() => goTo(2)} disabled={submitting}>
                      <ArrowLeft size={16} /> Back
                    </Button>
                    <Button type="submit" variant="primary" size="lg" loading={submitting}>
                      {submitting ? 'Sending request…' : 'Request appointment'}
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

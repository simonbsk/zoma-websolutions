import { useEffect, useState, type FormEvent } from 'react';
import { PageHeader } from './AdminLayout';
import { Button } from '../../components/ui/Button';
import { SelectField, TextField } from '../../components/ui/Field';
import { Alert } from '../../components/ui/misc';
import { DEFAULT_RULES, getSettings, saveSettings, type SettingsInput } from '../../lib/api/settings';
import { errorMessage } from '../../lib/api/errors';
import { useAsync } from '../../lib/useAsync';
import { useSiteSettings } from '../../lib/SiteSettings';

interface FormState {
  business_name: string;
  business_email: string;
  business_phone: string;
  business_address: string;
  timezone: string;
  slot_interval_minutes: string;
  booking_notice_hours: string;
  max_advance_days: string;
}

const INTERVALS = [10, 15, 20, 30, 45, 60, 90, 120];

function fallbackTimezones(): string[] {
  try {
    const supported = (Intl as unknown as { supportedValuesOf?: (key: string) => string[] }).supportedValuesOf;
    if (supported) return supported('timeZone');
  } catch {
    /* ignore */
  }
  return ['Europe/Berlin', 'Europe/Vienna', 'Europe/Zurich', 'Europe/London', 'UTC'];
}

const TIMEZONES = fallbackTimezones();

export function SettingsPage() {
  const settings = useAsync(getSettings, []);
  const site = useSiteSettings();
  const [form, setForm] = useState<FormState | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settings.loading) return;
    const s = settings.data;
    setForm({
      business_name: s?.business_name ?? 'ZomaWebsolutions',
      business_email: s?.business_email ?? '',
      business_phone: s?.business_phone ?? '',
      business_address: s?.business_address ?? '',
      timezone: s?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'Europe/Berlin',
      slot_interval_minutes: String(s?.slot_interval_minutes ?? DEFAULT_RULES.slot_interval_minutes),
      booking_notice_hours: String(s?.booking_notice_hours ?? DEFAULT_RULES.booking_notice_hours),
      max_advance_days: String(s?.max_advance_days ?? DEFAULT_RULES.max_advance_days),
    });
  }, [settings.loading, settings.data]);

  function set<K extends keyof FormState>(key: K, value: string) {
    setForm((f) => (f ? { ...f, [key]: value } : f));
    setErrors((e) => ({ ...e, [key]: undefined }));
    setSaved(false);
  }

  function parse(f: FormState): SettingsInput | null {
    const errs: typeof errors = {};
    const interval = Number(f.slot_interval_minutes);
    const notice = Number(f.booking_notice_hours);
    const advance = Number(f.max_advance_days);
    if (f.business_name.trim().length < 2) errs.business_name = 'Pflichtfeld.';
    if (f.business_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.business_email.trim())) errs.business_email = 'Ungültige E-Mail-Adresse.';
    if (!Number.isInteger(interval) || interval < 5 || interval > 240) errs.slot_interval_minutes = '5–240 Minuten.';
    if (!Number.isInteger(notice) || notice < 0 || notice > 720) errs.booking_notice_hours = '0–720 Stunden.';
    if (!Number.isInteger(advance) || advance < 1 || advance > 730) errs.max_advance_days = '1–730 Tage.';
    if (!f.timezone) errs.timezone = 'Pflichtfeld.';
    setErrors(errs);
    if (Object.keys(errs).length) return null;
    return {
      business_name: f.business_name.trim(),
      business_email: f.business_email.trim() || null,
      business_phone: f.business_phone.trim() || null,
      business_address: f.business_address.trim() || null,
      timezone: f.timezone,
      slot_interval_minutes: interval,
      booking_notice_hours: notice,
      max_advance_days: advance,
    };
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form) return;
    const input = parse(form);
    if (!input) return;
    setSaving(true);
    setSaveError(null);
    try {
      const updated = await saveSettings(settings.data?.id ?? null, input);
      settings.setData(updated);
      await site.reload();
      setSaved(true);
    } catch (err) {
      setSaveError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader title="Einstellungen" description="Studiodaten und die Regeln für die Online-Verfügbarkeit." />

      {settings.error ? <Alert tone="error">{settings.error}</Alert> : null}
      {!settings.loading && !settings.data ? (
        <Alert tone="info">Noch keine Einstellungen gespeichert — die Online-Buchung bleibt deaktiviert, bis Sie dieses Formular speichern.</Alert>
      ) : null}

      {form ? (
        <form className="settings" onSubmit={onSubmit} noValidate>
          <section className="panel">
            <div className="panel-header">
              <div>
                <h2>Studiodaten</h2>
                <p>Werden im Footer der Website und in der Buchungsbestätigung angezeigt.</p>
              </div>
            </div>
            <div className="panel-body form-stack">
              <TextField label="Firmenname" value={form.business_name} onChange={(e) => set('business_name', e.target.value)} error={errors.business_name} />
              <div className="grid-2">
                <TextField label="E-Mail" type="email" optional value={form.business_email} onChange={(e) => set('business_email', e.target.value)} error={errors.business_email} />
                <TextField label="Telefon" type="tel" optional value={form.business_phone} onChange={(e) => set('business_phone', e.target.value)} />
              </div>
              <TextField label="Adresse" optional value={form.business_address} onChange={(e) => set('business_address', e.target.value)} />
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <div>
                <h2>Buchungsregeln</h2>
                <p>Gelten sofort für den öffentlichen Buchungskalender und werden serverseitig durchgesetzt.</p>
              </div>
            </div>
            <div className="panel-body form-stack">
              <div className="grid-2">
                <SelectField
                  label="Terminraster"
                  value={form.slot_interval_minutes}
                  onChange={(e) => set('slot_interval_minutes', e.target.value)}
                  error={errors.slot_interval_minutes}
                  hint="Wie oft eine neue Startzeit angeboten wird."
                >
                  {[...new Set([...INTERVALS, Number(form.slot_interval_minutes)])]
                    .filter((n) => Number.isFinite(n) && n > 0)
                    .sort((a, b) => a - b)
                    .map((n) => (
                      <option key={n} value={String(n)}>
                        Alle {n} Minuten
                      </option>
                    ))}
                </SelectField>
                <SelectField label="Zeitzone" value={form.timezone} onChange={(e) => set('timezone', e.target.value)} error={errors.timezone} hint="Wird für die serverseitige Prüfung der Vorlaufzeit verwendet.">
                  {[...new Set([form.timezone, ...TIMEZONES])].map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </SelectField>
              </div>
              <div className="grid-2">
                <TextField
                  label="Mindestvorlauf (Stunden)"
                  type="number"
                  min={0}
                  max={720}
                  value={form.booking_notice_hours}
                  onChange={(e) => set('booking_notice_hours', e.target.value)}
                  error={errors.booking_notice_hours}
                  hint="Frühester buchbarer Zeitpunkt ab jetzt."
                />
                <TextField
                  label="Buchungszeitraum (Tage)"
                  type="number"
                  min={1}
                  max={730}
                  value={form.max_advance_days}
                  onChange={(e) => set('max_advance_days', e.target.value)}
                  error={errors.max_advance_days}
                  hint="Wie weit im Voraus Kunden buchen können."
                />
              </div>
            </div>
          </section>

          <div className="settings-foot">
            {saveError ? <Alert tone="error">{saveError}</Alert> : null}
            {saved ? <Alert tone="success">Einstellungen gespeichert.</Alert> : null}
            <Button type="submit" size="lg" loading={saving}>
              Einstellungen speichern
            </Button>
          </div>
        </form>
      ) : (
        <section className="panel">
          <div className="table-skeleton">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="skeleton" style={{ height: 46 }} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

import { useState, type FormEvent } from 'react';
import { Layers, Pencil, Plus, Trash2 } from 'lucide-react';
import { PageHeader } from './AdminLayout';
import { Button } from '../../components/ui/Button';
import { SelectField, TextAreaField, TextField } from '../../components/ui/Field';
import { Alert, EmptyState, Modal, Toggle } from '../../components/ui/misc';
import { ServiceVisual } from '../../components/visuals/Visuals';
import {
  createService,
  deleteService,
  listAllServices,
  slugify,
  updateService,
  type ServiceInput,
} from '../../lib/api/services';
import { errorMessage } from '../../lib/api/errors';
import { useAsync } from '../../lib/useAsync';
import { formatDuration, formatPrice } from '../../lib/time';
import { SERVICE_VISUALS, type Service, type ServiceVisual as VisualKind } from '../../lib/types';

const VISUAL_LABELS: Record<VisualKind, string> = {
  landing: 'Landingpage',
  ecommerce: 'E-Commerce',
  brand: 'Marke & Identität',
  webapp: 'Web-App / Dashboard',
  seo: 'SEO & Performance',
  care: 'Betreuung & Wartung',
};

interface FormState {
  name: string;
  slug: string;
  description: string;
  duration: string;
  price: string;
  currency: string;
  visual: VisualKind;
  is_active: boolean;
  sort_order: string;
}

const EMPTY: FormState = {
  name: '',
  slug: '',
  description: '',
  duration: '60',
  price: '0',
  currency: 'EUR',
  visual: 'landing',
  is_active: true,
  sort_order: '0',
};

function toForm(s: Service): FormState {
  return {
    name: s.name,
    slug: s.slug,
    description: s.description,
    duration: String(s.duration_minutes),
    price: (s.price_cents / 100).toString(),
    currency: s.currency,
    visual: s.visual,
    is_active: s.is_active,
    sort_order: String(s.sort_order),
  };
}

type Errors = Partial<Record<keyof FormState, string>>;

function parseForm(f: FormState): { input?: ServiceInput; errors: Errors } {
  const errors: Errors = {};
  const duration = Number(f.duration);
  const price = Number(f.price.replace(',', '.'));
  const sort = Number(f.sort_order);
  const slug = slugify(f.slug || f.name);

  if (f.name.trim().length < 2) errors.name = 'Der Name muss mindestens 2 Zeichen lang sein.';
  if (!slug) errors.slug = 'Slug ist erforderlich.';
  if (!Number.isInteger(duration) || duration < 5 || duration > 600) errors.duration = 'Zwischen 5 und 600 Minuten.';
  if (!Number.isFinite(price) || price < 0) errors.price = 'Geben Sie einen gültigen Preis ein (0 = kostenlos).';
  if (!/^[A-Z]{3}$/.test(f.currency.trim().toUpperCase())) errors.currency = '3-stelliger Code, z. B. EUR.';
  if (!Number.isInteger(sort)) errors.sort_order = 'Ganze Zahl.';

  if (Object.keys(errors).length) return { errors };
  return {
    errors,
    input: {
      name: f.name.trim(),
      slug,
      description: f.description.trim(),
      duration_minutes: duration,
      price_cents: Math.round(price * 100),
      currency: f.currency.trim().toUpperCase(),
      visual: f.visual,
      is_active: f.is_active,
      sort_order: sort,
    },
  };
}

export function ServicesPage() {
  const services = useAsync(listAllServices, []);
  const [editing, setEditing] = useState<Service | 'new' | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [slugTouched, setSlugTouched] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);

  function openNew() {
    const nextSort = (services.data?.reduce((max, s) => Math.max(max, s.sort_order), 0) ?? 0) + 1;
    setForm({ ...EMPTY, sort_order: String(nextSort) });
    setSlugTouched(false);
    setErrors({});
    setFormError(null);
    setEditing('new');
  }

  function openEdit(s: Service) {
    setForm(toForm(s));
    setSlugTouched(true);
    setErrors({});
    setFormError(null);
    setEditing(s);
  }

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'name' && !slugTouched) next.slug = slugify(String(value));
      return next;
    });
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const { input, errors: found } = parseForm(form);
    setErrors(found);
    if (!input) return;
    setSaving(true);
    setFormError(null);
    try {
      if (editing === 'new') await createService(input);
      else if (editing) await updateService(editing.id, input);
      setEditing(null);
      await services.reload();
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(s: Service) {
    setPageError(null);
    try {
      const updated = await updateService(s.id, { is_active: !s.is_active });
      services.setData((prev) => (prev ?? []).map((x) => (x.id === s.id ? updated : x)));
    } catch (err) {
      setPageError(errorMessage(err));
    }
  }

  async function remove(s: Service) {
    if (!window.confirm(`„${s.name}“ löschen? Das kann nicht rückgängig gemacht werden.`)) return;
    setPageError(null);
    try {
      await deleteService(s.id);
      services.setData((prev) => (prev ?? []).filter((x) => x.id !== s.id));
    } catch (err) {
      setPageError(errorMessage(err));
    }
  }

  return (
    <>
      <PageHeader
        title="Leistungen"
        description="Aktive Leistungen erscheinen sofort auf der Website und in der Buchung."
        actions={
          <Button onClick={openNew}>
            <Plus size={16} /> Neue Leistung
          </Button>
        }
      />

      {pageError ? <Alert tone="error">{pageError}</Alert> : null}
      {services.error ? <Alert tone="error">{services.error}</Alert> : null}

      <section className="panel">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Leistung</th>
                <th>Dauer</th>
                <th>Preis</th>
                <th className="hide-md">Reihenfolge</th>
                <th>Sichtbar</th>
                <th aria-label="Aktionen" />
              </tr>
            </thead>
            <tbody>
              {services.loading && !services.data
                ? Array.from({ length: 4 }, (_, i) => (
                    <tr key={i}>
                      <td colSpan={6}>
                        <div className="skeleton" style={{ height: 36 }} />
                      </td>
                    </tr>
                  ))
                : services.data?.map((s) => (
                    <tr key={s.id} className={s.is_active ? '' : 'is-muted'}>
                      <td>
                        <div className="service-cell">
                          <div className="service-thumb">
                            <ServiceVisual kind={s.visual} compact />
                          </div>
                          <div>
                            <div className="cell-primary">{s.name}</div>
                            <div className="cell-secondary">/{s.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td>{formatDuration(s.duration_minutes)}</td>
                      <td>{formatPrice(s.price_cents, s.currency)}</td>
                      <td className="hide-md cell-secondary">{s.sort_order}</td>
                      <td>
                        <Toggle checked={s.is_active} onChange={() => void toggleActive(s)} label={<span className="sr-only">Auf der Website sichtbar</span>} />
                      </td>
                      <td className="cell-actions">
                        <button type="button" className="btn btn-subtle btn-sm btn-icon" onClick={() => openEdit(s)} aria-label={`${s.name} bearbeiten`}>
                          <Pencil size={15} />
                        </button>
                        <button type="button" className="btn btn-subtle btn-sm btn-icon" onClick={() => void remove(s)} aria-label={`${s.name} löschen`}>
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
          {!services.loading && services.data?.length === 0 ? (
            <EmptyState icon={<Layers size={20} />} title="Noch keine Leistungen">
              Legen Sie Ihre erste Leistung an, um Buchungen zu ermöglichen.
            </EmptyState>
          ) : null}
        </div>
      </section>

      {editing ? (
        <Modal title={editing === 'new' ? 'Neue Leistung' : 'Leistung bearbeiten'} onClose={() => setEditing(null)}>
          <form onSubmit={onSubmit} noValidate>
            <div className="modal-body">
              {formError ? <Alert tone="error">{formError}</Alert> : null}
              <TextField label="Name" value={form.name} onChange={(e) => set('name', e.target.value)} error={errors.name} autoFocus />
              <TextField
                label="URL-Slug"
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  set('slug', e.target.value);
                }}
                onBlur={() => set('slug', slugify(form.slug))}
                error={errors.slug}
                hint="Wird in Buchungslinks verwendet, z. B. /book?service=ihr-slug"
              />
              <TextAreaField
                label="Beschreibung"
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                rows={3}
                hint="Ein bis zwei Sätze, die auf der Leistungskarte erscheinen."
              />
              <div className="grid-2">
                <TextField
                  label="Dauer (Minuten)"
                  type="number"
                  min={5}
                  max={600}
                  step={5}
                  value={form.duration}
                  onChange={(e) => set('duration', e.target.value)}
                  error={errors.duration}
                />
                <div className="price-row">
                  <TextField
                    label="Preis"
                    inputMode="decimal"
                    value={form.price}
                    onChange={(e) => set('price', e.target.value)}
                    error={errors.price}
                    hint="0 = kostenloses Erstgespräch"
                  />
                  <TextField
                    label="Währung"
                    value={form.currency}
                    maxLength={3}
                    onChange={(e) => set('currency', e.target.value.toUpperCase())}
                    error={errors.currency}
                  />
                </div>
              </div>
              <div className="grid-2">
                <SelectField label="Kartenmotiv" value={form.visual} onChange={(e) => set('visual', e.target.value as VisualKind)}>
                  {SERVICE_VISUALS.map((v) => (
                    <option key={v} value={v}>
                      {VISUAL_LABELS[v]}
                    </option>
                  ))}
                </SelectField>
                <TextField
                  label="Reihenfolge"
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => set('sort_order', e.target.value)}
                  error={errors.sort_order}
                />
              </div>
              <div className="visual-preview">
                <ServiceVisual kind={form.visual} />
              </div>
              <Toggle checked={form.is_active} onChange={(v) => set('is_active', v)} label="Auf der Website sichtbar und buchbar" />
            </div>
            <div className="modal-foot">
              <Button variant="ghost" onClick={() => setEditing(null)} disabled={saving}>
                Abbrechen
              </Button>
              <Button type="submit" loading={saving}>
                {editing === 'new' ? 'Leistung anlegen' : 'Änderungen speichern'}
              </Button>
            </div>
          </form>
        </Modal>
      ) : null}
    </>
  );
}

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
  landing: 'Landing page',
  ecommerce: 'E-commerce',
  brand: 'Brand & identity',
  webapp: 'Web app / dashboard',
  seo: 'SEO & performance',
  care: 'Care & maintenance',
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

  if (f.name.trim().length < 2) errors.name = 'Name must be at least 2 characters.';
  if (!slug) errors.slug = 'Slug is required.';
  if (!Number.isInteger(duration) || duration < 5 || duration > 600) errors.duration = 'Between 5 and 600 minutes.';
  if (!Number.isFinite(price) || price < 0) errors.price = 'Enter a valid price (0 for free).';
  if (!/^[A-Z]{3}$/.test(f.currency.trim().toUpperCase())) errors.currency = '3-letter code, e.g. EUR.';
  if (!Number.isInteger(sort)) errors.sort_order = 'Whole number.';

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
    if (!window.confirm(`Delete “${s.name}”? This cannot be undone.`)) return;
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
        title="Services"
        description="Active services appear on the website and in the booking flow immediately."
        actions={
          <Button onClick={openNew}>
            <Plus size={16} /> New service
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
                <th>Service</th>
                <th>Duration</th>
                <th>Price</th>
                <th className="hide-md">Order</th>
                <th>Visible</th>
                <th aria-label="Actions" />
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
                        <Toggle checked={s.is_active} onChange={() => void toggleActive(s)} label={<span className="sr-only">Visible on website</span>} />
                      </td>
                      <td className="cell-actions">
                        <button type="button" className="btn btn-subtle btn-sm btn-icon" onClick={() => openEdit(s)} aria-label={`Edit ${s.name}`}>
                          <Pencil size={15} />
                        </button>
                        <button type="button" className="btn btn-subtle btn-sm btn-icon" onClick={() => void remove(s)} aria-label={`Delete ${s.name}`}>
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
          {!services.loading && services.data?.length === 0 ? (
            <EmptyState icon={<Layers size={20} />} title="No services yet">
              Create your first service to start accepting bookings.
            </EmptyState>
          ) : null}
        </div>
      </section>

      {editing ? (
        <Modal title={editing === 'new' ? 'New service' : 'Edit service'} onClose={() => setEditing(null)}>
          <form onSubmit={onSubmit} noValidate>
            <div className="modal-body">
              {formError ? <Alert tone="error">{formError}</Alert> : null}
              <TextField label="Name" value={form.name} onChange={(e) => set('name', e.target.value)} error={errors.name} autoFocus />
              <TextField
                label="URL slug"
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  set('slug', e.target.value);
                }}
                onBlur={() => set('slug', slugify(form.slug))}
                error={errors.slug}
                hint="Used in booking links, e.g. /book?service=your-slug"
              />
              <TextAreaField
                label="Description"
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                rows={3}
                hint="One or two sentences shown on the service card."
              />
              <div className="grid-2">
                <TextField
                  label="Duration (minutes)"
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
                    label="Price"
                    inputMode="decimal"
                    value={form.price}
                    onChange={(e) => set('price', e.target.value)}
                    error={errors.price}
                    hint="0 = free consultation"
                  />
                  <TextField
                    label="Currency"
                    value={form.currency}
                    maxLength={3}
                    onChange={(e) => set('currency', e.target.value.toUpperCase())}
                    error={errors.currency}
                  />
                </div>
              </div>
              <div className="grid-2">
                <SelectField label="Card visual" value={form.visual} onChange={(e) => set('visual', e.target.value as VisualKind)}>
                  {SERVICE_VISUALS.map((v) => (
                    <option key={v} value={v}>
                      {VISUAL_LABELS[v]}
                    </option>
                  ))}
                </SelectField>
                <TextField
                  label="Sort order"
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => set('sort_order', e.target.value)}
                  error={errors.sort_order}
                />
              </div>
              <div className="visual-preview">
                <ServiceVisual kind={form.visual} />
              </div>
              <Toggle checked={form.is_active} onChange={(v) => set('is_active', v)} label="Visible on website and bookable" />
            </div>
            <div className="modal-foot">
              <Button variant="ghost" onClick={() => setEditing(null)} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" loading={saving}>
                {editing === 'new' ? 'Create service' : 'Save changes'}
              </Button>
            </div>
          </form>
        </Modal>
      ) : null}
    </>
  );
}

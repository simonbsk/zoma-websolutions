import { useEffect, type ReactNode } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import type { AppointmentStatus } from '../../lib/types';

export function Spinner({ label = 'Wird geladen' }: { label?: string }) {
  return (
    <span role="status" aria-label={label}>
      <span className="spinner" />
    </span>
  );
}

export function FullPageSpinner() {
  return (
    <div className="center-screen">
      <Spinner />
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label?: ReactNode;
  disabled?: boolean;
}) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
      <span className="toggle-track" aria-hidden />
      {label ? <span>{label}</span> : null}
    </label>
  );
}

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  pending: 'Ausstehend',
  confirmed: 'Bestätigt',
  completed: 'Abgeschlossen',
  cancelled: 'Storniert',
};

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  return <span className={`badge badge-dot badge-${status}`}>{STATUS_LABEL[status]}</span>;
}

export function statusLabel(status: AppointmentStatus): string {
  return STATUS_LABEL[status];
}

export function Alert({ tone = 'info', children }: { tone?: 'info' | 'error' | 'success'; children: ReactNode }) {
  const Icon = tone === 'error' ? AlertCircle : tone === 'success' ? CheckCircle2 : Info;
  return (
    <div className={`alert alert-${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
      <Icon size={16} />
      <div>{children}</div>
    </div>
  );
}

export function EmptyState({ icon, title, children }: { icon: ReactNode; title: string; children?: ReactNode }) {
  return (
    <div className="empty">
      <div className="empty-icon">{icon}</div>
      <h3>{title}</h3>
      {children ? <p>{children}</p> : null}
    </div>
  );
}

export function Modal({
  title,
  onClose,
  children,
  footer,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-head">
          <h2>{title}</h2>
          <button type="button" className="btn btn-subtle btn-sm btn-icon" onClick={onClose} aria-label="Schließen">
            <X size={18} />
          </button>
        </div>
        {children}
        {footer ? <div className="modal-foot">{footer}</div> : null}
      </div>
    </div>
  );
}

import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';

interface FieldShellProps {
  label: string;
  optional?: boolean;
  hint?: ReactNode;
  error?: string | null;
  className?: string;
  children: (id: string, describedBy: string | undefined) => ReactNode;
}

function FieldShell({ label, optional, hint, error, className = '', children }: FieldShellProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;
  return (
    <div className={`field ${className}`}>
      <label className="field-label" htmlFor={id}>
        {label}
        {optional ? <span className="optional">Optional</span> : null}
      </label>
      {children(id, describedBy)}
      {error ? (
        <span id={errorId} className="field-error" role="alert">
          {error}
        </span>
      ) : hint ? (
        <span id={hintId} className="field-hint">
          {hint}
        </span>
      ) : null}
    </div>
  );
}

type Common = { label: string; optional?: boolean; hint?: ReactNode; error?: string | null; fieldClassName?: string };

export function TextField({ label, optional, hint, error, fieldClassName, className = '', ...rest }: Common & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <FieldShell label={label} optional={optional} hint={hint} error={error} className={fieldClassName}>
      {(id, describedBy) => (
        <input
          id={id}
          className={`input ${className}`}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          {...rest}
        />
      )}
    </FieldShell>
  );
}

export function TextAreaField({ label, optional, hint, error, fieldClassName, className = '', ...rest }: Common & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <FieldShell label={label} optional={optional} hint={hint} error={error} className={fieldClassName}>
      {(id, describedBy) => (
        <textarea
          id={id}
          className={`textarea ${className}`}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          {...rest}
        />
      )}
    </FieldShell>
  );
}

export function SelectField({
  label,
  optional,
  hint,
  error,
  fieldClassName,
  className = '',
  children,
  ...rest
}: Common & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <FieldShell label={label} optional={optional} hint={hint} error={error} className={fieldClassName}>
      {(id, describedBy) => (
        <select id={id} className={`select ${className}`} aria-describedby={describedBy} {...rest}>
          {children}
        </select>
      )}
    </FieldShell>
  );
}

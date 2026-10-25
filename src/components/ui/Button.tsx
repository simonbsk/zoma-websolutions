import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'dark' | 'ghost' | 'subtle' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  icon?: boolean;
  loading?: boolean;
  children?: ReactNode;
}

export function buttonClass(variant: Variant = 'primary', size: Size = 'md', extra = ''): string {
  return ['btn', `btn-${variant}`, size !== 'md' ? `btn-${size}` : '', extra].filter(Boolean).join(' ');
}

export function Button({
  variant = 'primary',
  size = 'md',
  block,
  icon,
  loading,
  disabled,
  className = '',
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  const classes = buttonClass(variant, size, [block && 'btn-block', icon && 'btn-icon', className].filter(Boolean).join(' '));
  return (
    <button type={type} className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {loading ? <span className={variant === 'primary' || variant === 'dark' ? 'spinner spinner-sm' : 'spinner'} /> : null}
      {children}
    </button>
  );
}

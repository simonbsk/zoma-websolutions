import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';

/** Links to a section of the homepage from anywhere; clicking the current one scrolls there again. */
export function SectionLink({
  id,
  className,
  onNavigate,
  children,
}: {
  id: string;
  className?: string;
  onNavigate?: () => void;
  children: ReactNode;
}) {
  const location = useLocation();
  return (
    <Link
      to={{ pathname: '/', hash: `#${id}` }}
      className={className}
      onClick={() => {
        onNavigate?.();
        if (location.pathname === '/' && location.hash === `#${id}`) {
          document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }}
    >
      {children}
    </Link>
  );
}

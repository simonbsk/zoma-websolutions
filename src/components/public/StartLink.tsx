import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { track } from '../../lib/experiments';
import type { BudgetOption, ServiceOption } from '../../content/site';

/*
 * The project form at /start is only reachable through these designated buttons. They carry a
 * router state the form checks for (a typed-in URL is sent to the homepage's closing section),
 * plus optional presets — e.g. a pricing card preselects its budget.
 */

export interface StartState {
  entry: 'cta';
  from: string;
  budget?: BudgetOption;
  service?: ServiceOption;
}

export function hasStartAccess(state: unknown): state is StartState {
  return typeof state === 'object' && state !== null && (state as Partial<StartState>).entry === 'cta';
}

interface StartLinkProps {
  /** Where the button sits — stored with the request so we know which buttons work. */
  from: string;
  label?: 'Start today' | 'Your website starts here';
  className?: string;
  budget?: BudgetOption;
  service?: ServiceOption;
  onClick?: () => void;
  children?: ReactNode;
}

export function StartLink({ from, label = 'Start today', className, budget, service, onClick, children }: StartLinkProps) {
  const state: StartState = { entry: 'cta', from, budget, service };
  return (
    <Link
      to="/start"
      state={state}
      className={className}
      onClick={() => {
        track('cta_click');
        onClick?.();
      }}
    >
      {children ?? (
        <>
          {label} <ArrowRight size={18} className="btn-arrow" aria-hidden />
        </>
      )}
    </Link>
  );
}

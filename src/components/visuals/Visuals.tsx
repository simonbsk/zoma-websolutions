import { Gauge, LayoutDashboard, LayoutTemplate, PenTool, ShieldCheck, ShoppingBag, type LucideIcon } from 'lucide-react';
import type { ServiceVisual as VisualKind } from '../../lib/types';
import './visuals.css';

/** Colour tile per service, using the same square-and-stripe motif as the hero. */
const KINDS: Record<VisualKind, { bg: string; ink: string; icon: LucideIcon }> = {
  landing: { bg: '#1d1d1b', ink: '#e9e4da', icon: LayoutTemplate },
  ecommerce: { bg: '#ff5a1f', ink: '#ffe3d2', icon: ShoppingBag },
  brand: { bg: '#e04f74', ink: '#ffd3df', icon: PenTool },
  webapp: { bg: '#5b3df5', ink: '#d6cfff', icon: LayoutDashboard },
  seo: { bg: '#d4ff3a', ink: '#141414', icon: Gauge },
  care: { bg: '#14213d', ink: '#c8b48a', icon: ShieldCheck },
};

export function ServiceVisual({ kind, compact }: { kind: VisualKind; compact?: boolean }) {
  const { bg, ink, icon: Icon } = KINDS[kind] ?? KINDS.landing;
  return (
    <div className={`v-stage ${compact ? 'v-stage-compact' : ''}`} style={{ background: bg, color: ink }} aria-hidden>
      <svg className="v-stripe" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polygon points="0,100 0,84 84,0 100,0 100,16 16,100" />
      </svg>
      <Icon className="v-icon" strokeWidth={1.6} />
    </div>
  );
}

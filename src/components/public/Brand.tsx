import { Link } from 'react-router-dom';

/** Monochrome "Z" mark — its 45° diagonal echoes the stripes in the hero. */
export function BrandMark({ size = 30, light = false }: { size?: number; light?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <rect width="32" height="32" rx="5" fill={light ? '#ffffff' : '#222222'} />
      <path
        d="M10 10h12L10 22h12"
        fill="none"
        stroke={light ? '#222222' : '#ffffff'}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BrandLogo({ to = '/', light = false }: { to?: string; light?: boolean }) {
  return (
    <Link to={to} className={`brand ${light ? 'brand-light' : ''}`} aria-label="ZomaWebsolutions home">
      <BrandMark size={26} light={light} />
      <span className="brand-word">
        Zoma<span>Websolutions</span>
      </span>
    </Link>
  );
}

import { Link } from 'react-router-dom';

export function BrandMark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <rect width="32" height="32" rx="9" fill="#1f4e4a" />
      <path
        d="M10 11h12l-12 10h12"
        fill="none"
        stroke="#fbfaf7"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BrandLogo({ to = '/', light = false }: { to?: string; light?: boolean }) {
  return (
    <Link to={to} className={`brand ${light ? 'brand-light' : ''}`} aria-label="ZomaWebsolutions home">
      <BrandMark />
      <span className="brand-word">
        Zoma<span>Websolutions</span>
      </span>
    </Link>
  );
}

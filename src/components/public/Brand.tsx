import { Link } from 'react-router-dom';

export function BrandMark({ size = 30 }: { size?: number }) {
  return (
    <img
      src="/eyuep.png"
      width={size}
      height={size}
      alt=""
      aria-hidden
      style={{ borderRadius: 9, objectFit: 'cover', objectPosition: 'center 20%', flex: 'none' }}
    />
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

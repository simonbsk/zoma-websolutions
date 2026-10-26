import { useId } from 'react';
import type { PortraitHair } from '../../content/site';

/* Illustrated golden-hour portrait: a backlit figure at the shore, rim-lit by a low sun.
   Deliberately a silhouette — swap for real photography of the team when available. */

const HORIZON = 300;

function Hair({ hair }: { hair: PortraitHair }) {
  switch (hair) {
    case 'bun':
      return (
        <>
          <path d="M104 178 C 101 142, 124 122, 151 122 C 179 122, 200 142, 197 180 C 191 158, 176 148, 151 148 C 126 148, 110 158, 104 178 Z" />
          <circle cx="151" cy="116" r="21" />
        </>
      );
    case 'long':
      return (
        <path d="M101 196 C 93 140, 119 116, 151 116 C 184 116, 209 140, 200 196 C 206 234, 211 266, 222 292 L 180 290 C 183 262, 185 232, 187 206 L 114 206 C 116 232, 118 262, 121 290 L 79 292 C 90 266, 95 234, 101 196 Z" />
      );
    case 'curly':
      return (
        <>
          {[-170, -150, -128, -106, -84, -62, -40, -18, 2].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            return <circle key={deg} cx={151 + Math.cos(rad) * 50} cy={176 + Math.sin(rad) * 54} r={17} />;
          })}
        </>
      );
    default:
      return (
        <path d="M102 184 C 97 138, 122 116, 153 116 C 186 117, 206 140, 200 186 C 196 160, 180 144, 152 144 C 125 144, 107 160, 102 184 Z" />
      );
  }
}

function Figure({ hair }: { hair: PortraitHair }) {
  return (
    <>
      <path d="M28 380 C 32 318, 82 290, 128 284 L 174 284 C 220 290, 270 318, 272 380 Z" />
      <path d="M131 238 C 133 258, 131 274, 127 288 L 175 288 C 171 274, 169 258, 171 238 Z" />
      <ellipse cx="151" cy="188" rx="46" ry="56" />
      <ellipse cx="105" cy="194" rx="7" ry="12" />
      <ellipse cx="197" cy="194" rx="7" ry="12" />
      <Hair hair={hair} />
    </>
  );
}

export function Portrait({ hair, sunX }: { hair: PortraitHair; sunX: number }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const id = (name: string) => `${uid}-${name}`;
  const sx = 30 + sunX * 240;
  const sunLeft = sx < 151;
  // Light comes from the sun's side: the rim sits there, and the figure steps slightly away from it.
  const dir = sunLeft ? -1 : 1;
  const place = `translate(${-dir * 12} 0) translate(151 380) scale(1.06) translate(-151 -380)`;

  return (
    <svg className="portrait" viewBox="0 0 300 380" aria-hidden focusable="false">
      <defs>
        <linearGradient id={id('sky')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3f3870" />
          <stop offset="0.48" stopColor="#c0768b" />
          <stop offset="0.79" stopColor="#ffb071" />
        </linearGradient>
        <linearGradient id={id('sea')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e09470" />
          <stop offset="0.3" stopColor="#8b5262" />
          <stop offset="1" stopColor="#2f2140" />
        </linearGradient>
        <radialGradient id={id('glow')} cx={sx} cy={HORIZON} r="210" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff6e2" />
          <stop offset="0.14" stopColor="#ffd294" stopOpacity="0.95" />
          <stop offset="0.5" stopColor="#ff9c64" stopOpacity="0.3" />
          <stop offset="1" stopColor="#ff9c64" stopOpacity="0" />
        </radialGradient>
        {/* The side facing the sun catches a little warm light. */}
        <linearGradient
          id={id('figure')}
          gradientUnits="userSpaceOnUse"
          x1={sunLeft ? 80 : 222}
          y1="150"
          x2={sunLeft ? 222 : 80}
          y2="240"
        >
          <stop offset="0" stopColor="#4a2a38" />
          <stop offset="0.45" stopColor="#24141f" />
          <stop offset="1" stopColor="#140a12" />
        </linearGradient>
        <filter id={id('rim')} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.6" />
        </filter>
        <filter id={id('glow-wide')} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <filter id={id('haze')} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
        <clipPath id={id('sky-clip')}>
          <rect width="300" height={HORIZON} />
        </clipPath>
      </defs>

      <rect width="300" height="380" fill={`url(#${id('sky')})`} />
      <g clipPath={`url(#${id('sky-clip')})`}>
        <circle cx={sx} cy={HORIZON} r="210" fill={`url(#${id('glow')})`} />
        <ellipse cx={sx} cy={HORIZON + 3} rx="30" ry="25" fill="#fff6e4" />
      </g>
      <rect y={HORIZON} width="300" height={380 - HORIZON} fill={`url(#${id('sea')})`} />
      <rect y={HORIZON - 1} width="300" height="2" fill="#ffd9b0" opacity="0.5" />
      <g fill="#ffe2bd">
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <rect
            key={i}
            x={sx - 8 - i * 6 + ((i * 37) % 13)}
            y={HORIZON + 4 + i * 10}
            width={16 + i * 9}
            height={1.5 + i * 0.45}
            rx="1"
            opacity={0.9 - i * 0.08}
          />
        ))}
      </g>

      <g transform={place}>
        {/* Atmospheric bloom around the figure, then a wide and a tight rim, then the figure. */}
        <g fill="#ffb877" opacity="0.4" filter={`url(#${id('haze')})`}>
          <Figure hair={hair} />
        </g>
        <g fill="#ffc98e" opacity="0.65" filter={`url(#${id('glow-wide')})`} transform={`translate(${dir * 4} -2)`}>
          <Figure hair={hair} />
        </g>
        <g fill="#ffe9c9" filter={`url(#${id('rim')})`} transform={`translate(${dir * 2.4} -1.4)`}>
          <Figure hair={hair} />
        </g>
        <g fill={`url(#${id('figure')})`}>
          <Figure hair={hair} />
        </g>
      </g>
    </svg>
  );
}

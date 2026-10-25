import './israel.css';

/** The flag of Israel, drawn to its official 8:11 proportions. */
export function IsraelFlag({ width = 66, className = '' }: { width?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 220 160"
      width={width}
      height={(width * 160) / 220}
      className={`il-flag ${className}`}
      aria-hidden
    >
      <rect width="220" height="160" fill="#fff" />
      <rect y="15" width="220" height="25" fill="#0038b8" />
      <rect y="120" width="220" height="25" fill="#0038b8" />
      <g fill="none" stroke="#0038b8" strokeWidth="5.5">
        <polygon points="110,50 135.98,95 84.02,95" />
        <polygon points="110,110 135.98,65 84.02,65" />
      </g>
    </svg>
  );
}

const SLOGANS = ['We Stand With Israel', 'Am Yisrael Chai', 'עם ישראל חי', 'Proud Friends of Israel'];

/** Scrolling banner pinned above the navbar. */
export function IsraelBanner() {
  const items = [...SLOGANS, ...SLOGANS, ...SLOGANS, ...SLOGANS];
  return (
    <div className="il-banner" aria-label="We stand with Israel">
      <div className="il-banner-track">
        {[0, 1].map((copy) => (
          <span className="il-banner-run" key={copy} aria-hidden={copy === 1}>
            {items.map((text, i) => (
              <span className="il-banner-item" key={i}>
                <IsraelFlag width={28} />
                {text}
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}

/** A string of small flags, like party bunting. */
export function IsraelBunting() {
  return (
    <div className="il-bunting" aria-hidden>
      {Array.from({ length: 24 }, (_, i) => (
        <IsraelFlag key={i} width={44} className="il-wave" />
      ))}
    </div>
  );
}

/** Flags fixed to the page edges and corners. */
export function IsraelEdgeFlags() {
  return (
    <div className="il-edges" aria-hidden>
      <div className="il-pole il-pole-left">
        <IsraelFlag width={120} className="il-wave" />
      </div>
      <div className="il-pole il-pole-right">
        <IsraelFlag width={120} className="il-wave" />
      </div>
      <div className="il-rail il-rail-left">
        {Array.from({ length: 8 }, (_, i) => (
          <IsraelFlag key={i} width={40} className="il-wave" />
        ))}
      </div>
      <div className="il-rail il-rail-right">
        {Array.from({ length: 8 }, (_, i) => (
          <IsraelFlag key={i} width={40} className="il-wave" />
        ))}
      </div>
    </div>
  );
}

/** Full-width section with a big waving flag and slogans. */
export function IsraelShowcase() {
  return (
    <section className="il-showcase">
      <div className="container il-showcase-inner">
        <IsraelFlag width={340} className="il-wave il-showcase-flag" />
        <div className="il-showcase-copy">
          <span className="il-kicker">ZomaWebsolutions</span>
          <h2 className="serif">We Stand With Israel</h2>
          <p className="il-hebrew" lang="he" dir="rtl">
            עם ישראל חי
          </p>
          <p className="il-sub">Am Yisrael Chai — the people of Israel live.</p>
          <div className="il-showcase-row">
            {Array.from({ length: 6 }, (_, i) => (
              <IsraelFlag key={i} width={52} className="il-wave" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

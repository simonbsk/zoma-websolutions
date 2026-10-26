import { useEffect } from 'react';

/**
 * Fades `[data-reveal]` elements in as they enter the viewport (see site.css; instant with
 * reduced motion). Elements arriving together are staggered here rather than with a CSS
 * transition-delay, so their own hover transitions stay immediate.
 */
export function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-revealed)');
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-revealed'));
      return;
    }
    const timers = new Set<number>();
    const io = new IntersectionObserver(
      (entries) => {
        let k = 0;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target;
          io.unobserve(el);
          const timer = window.setTimeout(() => {
            timers.delete(timer);
            el.classList.add('is-revealed');
          }, k++ * 90);
          timers.add(timer);
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => {
      io.disconnect();
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, []);
}

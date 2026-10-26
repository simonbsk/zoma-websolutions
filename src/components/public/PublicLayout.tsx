import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { SkyBackground } from '../sky/SkyBackground';
import { DesignNotesProvider } from '../notes/DesignNotes';
import { DesignSwitcher } from '../../design/DesignSwitcher';
import { useDesign } from '../../design/DesignProvider';
import { ClassicNavbar } from '../../designs/classic/ClassicNavbar';
import { ClassicFooter } from '../../designs/classic/ClassicFooter';
import '../../designs/classic/classic.css';
import '../../designs/sky/sky-design.css';

/** Scrolls to hash targets after navigation, or to top on route change. */
function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        requestAnimationFrame(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }));
        return;
      }
    }
    window.scrollTo({ top: 0 });
  }, [pathname, hash]);
  return null;
}

interface PublicLayoutProps {
  hideFooter?: boolean;
  /**
   * In the sky design, `home` gets the scroll-driven sunrise → midnight sky and `booking`
   * a still midnight sky. The classic design keeps every page plain and light.
   */
  page?: 'home' | 'booking' | 'page';
}

export function PublicLayout({ hideFooter = false, page = 'page' }: PublicLayoutProps) {
  const { design } = useDesign();
  const rootRef = useRef<HTMLDivElement>(null);
  const sky = design === 'sky' ? (page === 'home' ? 'day' : page === 'booking' ? 'night' : undefined) : undefined;
  const classes = ['public', sky ? 'has-sky' : '', sky === 'night' ? 'sky-static' : ''].filter(Boolean).join(' ');
  const SiteNavbar = design === 'sky' ? Navbar : ClassicNavbar;
  const SiteFooter = design === 'sky' ? Footer : ClassicFooter;

  const content = (
    <div ref={rootRef} className={classes}>
      <ScrollManager />
      {sky === 'day' ? <SkyBackground scopeRef={rootRef} /> : null}
      {sky === 'night' ? <SkyBackground scopeRef={rootRef} fixedTime={1} themeUi={false} /> : null}
      <SiteNavbar />
      <main>
        <Outlet />
      </main>
      {hideFooter ? null : <SiteFooter />}
      <DesignSwitcher />
    </div>
  );

  return sky === 'day' ? <DesignNotesProvider>{content}</DesignNotesProvider> : content;
}

import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { InkBackground } from '../ink/InkBackground';
import { DesignNotesProvider } from '../notes/DesignNotes';
import { ThemeProvider } from '../../theme/ThemeProvider';
import '../../styles/site.css';

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
   * `home` plays the ink story behind the page, `start` keeps the three inks calm at the edges,
   * every other page sits on the plain background.
   */
  page?: 'home' | 'start' | 'page';
}

export function PublicLayout({ hideFooter = false, page = 'page' }: PublicLayoutProps) {
  const ink = page === 'home' ? 'story' : page === 'start' ? 'calm' : null;

  const content = (
    <div className="site">
      <ScrollManager />
      {ink ? <InkBackground mode={ink} /> : null}
      <Navbar />
      <main>
        <Outlet />
      </main>
      {hideFooter ? null : <Footer />}
    </div>
  );

  // Design notes (review suggestions) live on the pages that carry them.
  return <ThemeProvider>{ink ? <DesignNotesProvider>{content}</DesignNotesProvider> : content}</ThemeProvider>;
}

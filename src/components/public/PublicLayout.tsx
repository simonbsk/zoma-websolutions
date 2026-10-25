import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { IsraelBanner, IsraelBunting, IsraelEdgeFlags, IsraelShowcase } from './IsraelTheme';
import '../../pages/public/public.css';

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

export function PublicLayout({ hideFooter = false }: { hideFooter?: boolean }) {
  return (
    <div className="public">
      <ScrollManager />
      <IsraelBanner />
      <Navbar />
      <IsraelBunting />
      <main>
        <Outlet />
      </main>
      <IsraelShowcase />
      {hideFooter ? null : <Footer />}
      <IsraelEdgeFlags />
    </div>
  );
}

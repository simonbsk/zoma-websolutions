import { useEffect, useState, type ReactNode } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  CalendarClock,
  CalendarOff,
  ExternalLink,
  LayoutDashboard,
  Layers,
  LogOut,
  Menu,
  Settings,
  Clock,
  X,
} from 'lucide-react';
import { useAuth } from '../../auth/AuthProvider';
import { BrandMark } from '../../components/public/Brand';
import './admin.css';

const NAV = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/appointments', label: 'Appointments', icon: CalendarClock },
  { to: '/admin/services', label: 'Services', icon: Layers },
  { to: '/admin/hours', label: 'Business hours', icon: Clock },
  { to: '/admin/blocked', label: 'Blocked dates', icon: CalendarOff },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AdminLayout() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname]);

  const initials = (user?.email ?? '?').slice(0, 2).toUpperCase();

  return (
    <div className={`admin ${open ? 'is-nav-open' : ''}`}>
      <aside className="admin-side">
        <div className="admin-brand">
          <BrandMark size={28} />
          <div>
            <strong>Zoma</strong>
            <span>Studio admin</span>
          </div>
          <button type="button" className="btn btn-subtle btn-sm btn-icon admin-close" onClick={() => setOpen(false)} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <nav className="admin-nav" aria-label="Dashboard">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => (isActive ? 'is-active' : '')}>
              <Icon size={17} strokeWidth={1.8} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="admin-side-foot">
          <a href="/" target="_blank" rel="noreferrer" className="admin-site-link">
            <ExternalLink size={15} /> View website
          </a>
          <div className="admin-user">
            <span className="admin-avatar">{initials}</span>
            <div className="admin-user-text">
              <strong title={user?.email ?? ''}>{user?.email}</strong>
              <span>Administrator</span>
            </div>
            <button type="button" className="btn btn-subtle btn-sm btn-icon" onClick={() => void signOut()} aria-label="Sign out" title="Sign out">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      <div className="admin-scrim" onClick={() => setOpen(false)} />

      <div className="admin-body">
        <header className="admin-topbar">
          <button type="button" className="btn btn-subtle btn-icon admin-menu" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu size={20} />
          </button>
          <span className="admin-topbar-brand">
            <BrandMark size={24} /> Studio admin
          </span>
        </header>
        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="page-header">
      <div>
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </div>
      {actions ? <div className="page-actions">{actions}</div> : null}
    </div>
  );
}

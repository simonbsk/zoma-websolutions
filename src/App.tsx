import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthProvider';
import { RequireAdmin } from './auth/RequireAdmin';
import { SiteSettingsProvider } from './lib/SiteSettings';
import { PublicLayout } from './components/public/PublicLayout';
import { buttonClass } from './components/ui/Button';
import { HomePage } from './pages/public/HomePage';
import { BookingPage } from './pages/booking/BookingPage';
import { SuccessPage } from './pages/booking/SuccessPage';
import { LoginPage } from './pages/admin/LoginPage';
import { AdminLayout } from './pages/admin/AdminLayout';
import { OverviewPage } from './pages/admin/OverviewPage';
import { AppointmentsPage } from './pages/admin/AppointmentsPage';
import { ServicesPage } from './pages/admin/ServicesPage';
import { BusinessHoursPage } from './pages/admin/BusinessHoursPage';
import { BlockedDatesPage } from './pages/admin/BlockedDatesPage';
import { SettingsPage } from './pages/admin/SettingsPage';

function NotFound() {
  return (
    <div className="center-screen" style={{ textAlign: 'center', padding: 24 }}>
      <div>
        <p className="eyebrow" style={{ justifyContent: 'center' }}>
          404
        </p>
        <h1 className="serif" style={{ fontSize: 40, marginTop: 12 }}>
          This page doesn't exist.
        </h1>
        <Link to="/" className={buttonClass('dark')} style={{ marginTop: 24 }}>
          Back to homepage
        </Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SiteSettingsProvider>
          <Routes>
            {/* Public website */}
            <Route element={<PublicLayout />}>
              <Route index element={<HomePage />} />
            </Route>
            <Route element={<PublicLayout hideFooter />}>
              <Route path="book" element={<BookingPage />} />
              <Route path="book/success" element={<SuccessPage />} />
              <Route path="*" element={<NotFound />} />
            </Route>

            {/* Admin */}
            <Route path="admin/login" element={<LoginPage />} />
            <Route
              path="admin"
              element={
                <RequireAdmin>
                  <AdminLayout />
                </RequireAdmin>
              }
            >
              <Route index element={<OverviewPage />} />
              <Route path="appointments" element={<AppointmentsPage />} />
              <Route path="services" element={<ServicesPage />} />
              <Route path="hours" element={<BusinessHoursPage />} />
              <Route path="blocked" element={<BlockedDatesPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </SiteSettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

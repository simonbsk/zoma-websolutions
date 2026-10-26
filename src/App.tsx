import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthProvider';
import { RequireAdmin } from './auth/RequireAdmin';
import { SiteSettingsProvider } from './lib/SiteSettings';
import { PublicLayout } from './components/public/PublicLayout';
import { buttonClass } from './components/ui/Button';
import { HomePage } from './pages/public/HomePage';
import { StartPage } from './pages/public/StartPage';
import { CaseStudyPage } from './pages/public/CaseStudyPage';
import { ChecklistPage } from './pages/public/ChecklistPage';
import { BookingPage } from './pages/booking/BookingPage';
import { SuccessPage } from './pages/booking/SuccessPage';
import { LoginPage } from './pages/admin/LoginPage';
import { AdminLayout } from './pages/admin/AdminLayout';
import { OverviewPage } from './pages/admin/OverviewPage';
import { RequestsPage } from './pages/admin/RequestsPage';
import { AppointmentsPage } from './pages/admin/AppointmentsPage';
import { ServicesPage } from './pages/admin/ServicesPage';
import { BusinessHoursPage } from './pages/admin/BusinessHoursPage';
import { BlockedDatesPage } from './pages/admin/BlockedDatesPage';
import { SettingsPage } from './pages/admin/SettingsPage';
import { SubscribersPage } from './pages/admin/SubscribersPage';

function NotFound() {
  return (
    <div className="not-found">
      <p className="eyebrow">404</p>
      <h1>This page doesn’t exist.</h1>
      <Link to="/" className={buttonClass('dark')}>
        Back to homepage
      </Link>
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
            <Route element={<PublicLayout page="home" />}>
              <Route index element={<HomePage />} />
            </Route>
            {/* Only reachable through the "Start today" buttons (see StartLink). */}
            <Route element={<PublicLayout page="start" />}>
              <Route path="start" element={<StartPage />} />
            </Route>
            <Route element={<PublicLayout hideFooter />}>
              <Route path="book" element={<BookingPage />} />
              <Route path="book/success" element={<SuccessPage />} />
            </Route>
            <Route element={<PublicLayout />}>
              <Route path="work/:slug" element={<CaseStudyPage />} />
              <Route path="checklist" element={<ChecklistPage />} />
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
              <Route path="requests" element={<RequestsPage />} />
              <Route path="appointments" element={<AppointmentsPage />} />
              <Route path="services" element={<ServicesPage />} />
              <Route path="hours" element={<BusinessHoursPage />} />
              <Route path="blocked" element={<BlockedDatesPage />} />
              <Route path="subscribers" element={<SubscribersPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </SiteSettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

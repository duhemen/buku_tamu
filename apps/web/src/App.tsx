import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import Layout from '@/components/Layout';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import KioskPage from '@/pages/KioskPage';
import DashboardPublicPage from '@/pages/DashboardPublicPage';
import GuestCardPage from '@/pages/GuestCardPage';
import KartuLookupPage from '@/pages/KartuLookupPage';
import AdminPanelPage from '@/pages/AdminPanelPage';
import TVQueuePage from '@/pages/TVQueuePage';
import VerifyPage from '@/pages/VerifyPage';
import NotFoundPage from '@/pages/NotFoundPage';


function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);

  if (!hydrated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-slate-400 text-sm">Memuat...</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="dashboard" element={<DashboardPublicPage />} />
        <Route path="verify" element={<VerifyPage />} />
        <Route path="verify/:code" element={<VerifyPage />} />
        <Route
          path="admin"
          element={
            <ProtectedRoute>
              <AdminPanelPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="/kiosk" element={<KioskPage />} />
      <Route path="/kartu" element={<KartuLookupPage />} />
      <Route path="/kartu/:visitId" element={<GuestCardPage />} />
      <Route path="/tv" element={<TVQueuePage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
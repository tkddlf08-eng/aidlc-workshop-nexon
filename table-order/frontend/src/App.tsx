import { Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAdminAuthStore } from '@/admin/stores/useAdminAuthStore';
import LoadingSpinner from '@/shared/components/LoadingSpinner';
import AdminRoutes from '@/admin/routes';

export default function App() {
  const restoreSession = useAdminAuthStore((state) => state.restoreSession);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner className="min-h-screen" size="lg" />}>
        <Routes>
          <Route path="/admin/*" element={<AdminRoutes />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

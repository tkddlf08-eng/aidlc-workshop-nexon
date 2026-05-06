import { Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAdminAuthStore } from '@admin/stores/useAdminAuthStore';
import LoadingSpinner from '@shared/components/LoadingSpinner';
import AdminRoutes from '@admin/routes';

// Customer pages (lazy loaded)
import { lazy } from 'react';
const SetupPage = lazy(() => import('@customer/pages/SetupPage'));
const MenuPage = lazy(() => import('@customer/pages/MenuPage'));
const CartPage = lazy(() => import('@customer/pages/CartPage'));
const OrderConfirmPage = lazy(() => import('@customer/pages/OrderConfirmPage'));
const OrderSuccessPage = lazy(() => import('@customer/pages/OrderSuccessPage'));
const CustomerOrderHistoryPage = lazy(() => import('@customer/pages/OrderHistoryPage'));

// Customer layout components
const AuthGuard = lazy(() =>
  import('@customer/components/AuthGuard').then((m) => ({ default: m.AuthGuard }))
);
const MainLayout = lazy(() =>
  import('@customer/components/MainLayout').then((m) => ({ default: m.MainLayout }))
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const restoreSession = useAdminAuthStore((state) => state.restoreSession);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  return (
    <Suspense fallback={<LoadingSpinner className="min-h-screen" size="lg" />}>
      <Routes>
        {/* Admin Routes */}
        <Route path="/admin/*" element={<AdminRoutes />} />

        {/* Customer Routes */}
        <Route path="/setup" element={<SetupPage />} />
        <Route
          element={
            <Suspense fallback={<LoadingSpinner className="min-h-screen" size="lg" />}>
              <AuthGuard>
                <MainLayout />
              </AuthGuard>
            </Suspense>
          }
        >
          <Route path="/" element={<MenuPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/order-confirm" element={<OrderConfirmPage />} />
          <Route path="/order-success" element={<OrderSuccessPage />} />
          <Route path="/orders" element={<CustomerOrderHistoryPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

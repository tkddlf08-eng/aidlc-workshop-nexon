import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { AuthGuard } from '@customer/components/AuthGuard';
import { MainLayout } from '@customer/components/MainLayout';
import { PageLoadingSpinner } from '@shared/components/PageLoadingSpinner';

const SetupPage = lazy(() => import('@customer/pages/SetupPage'));
const MenuPage = lazy(() => import('@customer/pages/MenuPage'));
const CartPage = lazy(() => import('@customer/pages/CartPage'));
const OrderConfirmPage = lazy(() => import('@customer/pages/OrderConfirmPage'));
const OrderSuccessPage = lazy(() => import('@customer/pages/OrderSuccessPage'));
const OrderHistoryPage = lazy(() => import('@customer/pages/OrderHistoryPage'));

export const router = createBrowserRouter([
  {
    path: '/setup',
    element: (
      <Suspense fallback={<PageLoadingSpinner />}>
        <SetupPage />
      </Suspense>
    ),
  },
  {
    element: (
      <AuthGuard>
        <MainLayout />
      </AuthGuard>
    ),
    children: [
      {
        path: '/',
        element: (
          <Suspense fallback={<PageLoadingSpinner />}>
            <MenuPage />
          </Suspense>
        ),
      },
      {
        path: '/cart',
        element: (
          <Suspense fallback={<PageLoadingSpinner />}>
            <CartPage />
          </Suspense>
        ),
      },
      {
        path: '/order-confirm',
        element: (
          <Suspense fallback={<PageLoadingSpinner />}>
            <OrderConfirmPage />
          </Suspense>
        ),
      },
      {
        path: '/order-success',
        element: (
          <Suspense fallback={<PageLoadingSpinner />}>
            <OrderSuccessPage />
          </Suspense>
        ),
      },
      {
        path: '/orders',
        element: (
          <Suspense fallback={<PageLoadingSpinner />}>
            <OrderHistoryPage />
          </Suspense>
        ),
      },
    ],
  },
]);

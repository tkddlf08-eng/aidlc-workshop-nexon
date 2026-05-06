import { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useCustomerAuthStore } from '@customer/stores/useCustomerAuthStore';
import { PageLoadingSpinner } from '@shared/components/PageLoadingSpinner';

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, autoLogin, token } = useCustomerAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated()) {
        await autoLogin();
      }
      setIsChecking(false);
    };
    checkAuth();
  }, []);

  if (isChecking) {
    return <PageLoadingSpinner />;
  }

  if (!token) {
    return <Navigate to="/setup" replace />;
  }

  return <>{children}</>;
}

import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import ErrorBoundary from '@/shared/components/ErrorBoundary';
import LoadingSpinner from '@/shared/components/LoadingSpinner';
import ToastContainer from '@/shared/components/ToastContainer';
import ConfirmDialog from '@/shared/components/ConfirmDialog';
import { useUIStore } from '@/admin/stores/useUIStore';

export default function AdminLayout() {
  const { toasts, removeToast, confirmDialog, closeConfirm } = useUIStore();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 ml-60">
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner className="min-h-screen" size="lg" />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>

      <ToastContainer toasts={toasts} onClose={removeToast} />

      {confirmDialog && (
        <ConfirmDialog
          isOpen={true}
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmText={confirmDialog.confirmText}
          cancelText={confirmDialog.cancelText}
          variant={confirmDialog.variant}
          onConfirm={() => {
            confirmDialog.onConfirm();
            closeConfirm();
          }}
          onCancel={closeConfirm}
        />
      )}
    </div>
  );
}

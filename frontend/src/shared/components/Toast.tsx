import { Toaster } from 'react-hot-toast';

export function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 3000,
        style: {
          borderRadius: '8px',
          padding: '12px 16px',
          fontSize: '14px',
        },
        success: {
          duration: 2000,
          iconTheme: { primary: '#22c55e', secondary: '#fff' },
        },
        error: {
          duration: 4000,
          iconTheme: { primary: '#ef4444', secondary: '#fff' },
        },
      }}
    />
  );
}

import Toast, { type ToastData } from './Toast';

interface ToastContainerProps {
  toasts: ToastData[];
  onClose: (id: string) => void;
}

export default function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div
      className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-80"
      aria-live="polite"
      aria-label="알림"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  );
}

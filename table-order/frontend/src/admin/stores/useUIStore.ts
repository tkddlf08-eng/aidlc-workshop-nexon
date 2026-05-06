import { create } from 'zustand';
import type { ToastData } from '@/shared/components/Toast';

interface ConfirmDialogConfig {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  variant?: 'danger' | 'warning' | 'default';
}

interface UIState {
  toasts: ToastData[];
  confirmDialog: ConfirmDialogConfig | null;

  showToast: (type: ToastData['type'], message: string) => void;
  removeToast: (id: string) => void;
  showConfirm: (config: ConfirmDialogConfig) => void;
  closeConfirm: () => void;
}

const MAX_TOASTS = 3;
const DEFAULT_DURATION = 3000;
const ERROR_DURATION = 5000;

export const useUIStore = create<UIState>((set) => ({
  toasts: [],
  confirmDialog: null,

  showToast: (type, message) => {
    const id = crypto.randomUUID();
    const duration = type === 'error' ? ERROR_DURATION : DEFAULT_DURATION;

    set((state) => ({
      toasts: [...state.toasts, { id, type, message }].slice(-MAX_TOASTS),
    }));

    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, duration);
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  showConfirm: (config) => {
    set({ confirmDialog: config });
  },

  closeConfirm: () => {
    set({ confirmDialog: null });
  },
}));

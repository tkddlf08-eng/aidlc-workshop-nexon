import { ReactNode } from 'react';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  title: string;
  children: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'danger';
}

export function Modal({
  isOpen,
  title,
  children,
  onConfirm,
  onCancel,
  confirmText = '확인',
  cancelText = '취소',
  confirmVariant = 'primary',
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      data-testid="modal-overlay"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-xl p-6 mx-4 max-w-sm w-full shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold mb-3">{title}</h2>
        <div className="text-gray-600 mb-6">{children}</div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={onCancel}
            className="flex-1"
            data-testid="modal-cancel-button"
          >
            {cancelText}
          </Button>
          <Button
            variant={confirmVariant}
            onClick={onConfirm}
            className="flex-1"
            data-testid="modal-confirm-button"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}

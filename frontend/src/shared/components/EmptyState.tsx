import { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  message: string;
  action?: ReactNode;
}

export function EmptyState({ icon, message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4" data-testid="empty-state">
      {icon && <div className="text-gray-300 mb-4 text-5xl">{icon}</div>}
      <p className="text-gray-500 text-center mb-4">{message}</p>
      {action}
    </div>
  );
}

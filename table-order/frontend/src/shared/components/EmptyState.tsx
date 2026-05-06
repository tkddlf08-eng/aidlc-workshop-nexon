import { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: ReactNode;
  title?: string;
  description?: string;
  message?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, message, action }: EmptyStateProps) {
  const displayText = description || message;
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-gray-300 mb-4">
        {icon || <Inbox className="h-12 w-12" />}
      </div>
      {title && <h3 className="text-sm font-medium text-gray-900 mb-1">{title}</h3>}
      {displayText && <p className="text-sm text-gray-500 mb-3">{displayText}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}

export default EmptyState;

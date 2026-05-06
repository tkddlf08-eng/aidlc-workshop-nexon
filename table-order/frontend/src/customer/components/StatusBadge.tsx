import type { OrderStatus } from '@shared/api/types';
import { Badge } from '@shared/components/Badge';

interface StatusBadgeProps {
  status: OrderStatus;
}

const statusConfig: Record<OrderStatus, { label: string; variant: 'warning' | 'primary' | 'success' }> = {
  PENDING: { label: '대기중', variant: 'warning' },
  PREPARING: { label: '준비중', variant: 'primary' },
  COMPLETED: { label: '완료', variant: 'success' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  return <Badge label={config.label} variant={config.variant} />;
}

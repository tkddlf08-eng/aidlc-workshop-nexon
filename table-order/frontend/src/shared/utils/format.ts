import { format, formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

export function formatPrice(price: number): string {
  return price.toLocaleString('ko-KR') + '원';
}

export function formatDateTime(dateString: string): string {
  return format(new Date(dateString), 'yyyy-MM-dd HH:mm', { locale: ko });
}

export function formatTime(dateString: string): string {
  return format(new Date(dateString), 'HH:mm', { locale: ko });
}

export function formatRelativeTime(dateString: string): string {
  return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: ko });
}

export function formatDate(dateString: string): string {
  return format(new Date(dateString), 'yyyy-MM-dd', { locale: ko });
}

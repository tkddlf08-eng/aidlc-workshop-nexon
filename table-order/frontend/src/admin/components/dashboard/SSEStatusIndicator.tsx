interface SSEStatusIndicatorProps {
  status: 'connected' | 'reconnecting' | 'disconnected';
}

const statusConfig = {
  connected: { color: 'bg-green-500', label: '실시간 연결됨' },
  reconnecting: { color: 'bg-yellow-500 animate-pulse', label: '재연결 중...' },
  disconnected: { color: 'bg-red-500', label: '연결 끊김' },
};

export default function SSEStatusIndicator({ status }: SSEStatusIndicatorProps) {
  const config = statusConfig[status];

  return (
    <div className="flex items-center gap-2" data-testid="sse-status-indicator">
      <div className={`h-2 w-2 rounded-full ${config.color}`} />
      <span className="text-xs text-gray-500">{config.label}</span>
    </div>
  );
}

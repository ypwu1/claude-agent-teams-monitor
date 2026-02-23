'use client';
import type { ConnectionStatus as Status } from '@/hooks/useWebSocket';

const statusConfig: Record<Status, { color: string; label: string }> = {
  connected: { color: 'bg-green-500', label: 'Connected' },
  connecting: { color: 'bg-yellow-500', label: 'Connecting...' },
  disconnected: { color: 'bg-red-500', label: 'Disconnected' },
};

export default function ConnectionStatus({ status }: { status: Status }) {
  const config = statusConfig[status];
  return (
    <div className="flex items-center gap-2 text-xs text-[#71717a]">
      <span
        className={`inline-block h-2 w-2 rounded-full ${config.color} ${status === 'connecting' ? 'animate-pulse' : ''}`}
      />
      <span>{config.label}</span>
    </div>
  );
}

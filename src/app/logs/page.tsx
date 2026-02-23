'use client';
import { useWebSocket } from '@/hooks/useWebSocket';
import ConnectionStatus from '@/components/ConnectionStatus';
import LogViewer from '@/components/LogViewer';

export default function LogsPage() {
  const { logFiles, connectionStatus } = useWebSocket();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Debug Logs</h1>
          <p className="text-sm text-[#71717a] mt-0.5">
            View Claude Code debug session logs
          </p>
        </div>
        <ConnectionStatus status={connectionStatus} />
      </div>
      <LogViewer logFiles={logFiles} />
    </div>
  );
}

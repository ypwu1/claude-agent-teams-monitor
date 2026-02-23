'use client';
import { use } from 'react';
import Link from 'next/link';
import { useWebSocket } from '@/hooks/useWebSocket';
import ConnectionStatus from '@/components/ConnectionStatus';
import AgentBadge from '@/components/AgentBadge';
import MessageTimeline from '@/components/MessageTimeline';
import TaskBoard from '@/components/TaskBoard';

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

export default function TeamDetailPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = use(params);
  const teamName = decodeURIComponent(name);
  const { teams, connectionStatus } = useWebSocket();
  const team = teams.find((t) => t.config.name === teamName);

  if (!team) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="text-sm text-[#3b82f6] hover:text-[#60a5fa]"
          >
            &larr; Back to Dashboard
          </Link>
          <ConnectionStatus status={connectionStatus} />
        </div>
        <div className="rounded-lg bg-[#131318] border border-[#27272a] p-8 text-center">
          <p className="text-[#71717a]">
            Team &ldquo;{teamName}&rdquo; not found. It may have been removed or
            the WebSocket is still connecting.
          </p>
        </div>
      </div>
    );
  }

  const { config, inboxes, tasks } = team;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/"
            className="text-sm text-[#3b82f6] hover:text-[#60a5fa]"
          >
            &larr; Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-white mt-1">{config.name}</h1>
          {config.description && (
            <p className="text-sm text-[#71717a] mt-0.5">
              {config.description}
            </p>
          )}
          <p className="text-xs text-[#71717a] mt-1">
            Created {formatDate(config.createdAt)}
          </p>
        </div>
        <ConnectionStatus status={connectionStatus} />
      </div>

      {/* Agent members */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">
          Members ({config.members.length})
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {config.members.map((member, i) => (
            <AgentBadge key={member.agentId} member={member} index={i} />
          ))}
        </div>
      </div>

      {/* Tasks */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">
          Tasks ({tasks.length})
        </h2>
        <TaskBoard tasks={tasks} />
      </div>

      {/* Messages */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">
          Messages (
          {inboxes.reduce((sum, i) => sum + i.messages.length, 0)})
        </h2>
        <MessageTimeline inboxes={inboxes} members={config.members} />
      </div>
    </div>
  );
}

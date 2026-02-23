'use client';
import Link from 'next/link';
import type { TeamWithDetails } from '@/lib/types';
import { getAgentColor } from '@/lib/types';

function formatTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function TeamCard({ team }: { team: TeamWithDetails }) {
  const { config, tasks } = team;
  const pending = tasks.filter((t) => t.status === 'pending').length;
  const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
  const completed = tasks.filter((t) => t.status === 'completed').length;
  const totalMessages = team.inboxes.reduce(
    (sum, inbox) => sum + inbox.messages.length,
    0
  );

  return (
    <Link href={`/team/${encodeURIComponent(config.name)}`}>
      <div className="rounded-xl border border-[#27272a] bg-[#131318] p-5 hover:bg-[#1a1a22] hover:border-[#3b82f6]/30 transition-all cursor-pointer group">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-base font-semibold text-white group-hover:text-[#3b82f6] transition-colors">
              {config.name}
            </h3>
            {config.description && (
              <p className="text-xs text-[#71717a] mt-0.5 line-clamp-1">
                {config.description}
              </p>
            )}
          </div>
          <span className="text-xs text-[#71717a]">
            {formatTimeAgo(config.createdAt)}
          </span>
        </div>

        {/* Agent dots */}
        <div className="flex items-center gap-1.5 mb-4">
          {config.members.map((member, i) => (
            <div
              key={member.agentId}
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: getAgentColor(member, i) }}
              title={member.name}
            />
          ))}
          <span className="text-xs text-[#71717a] ml-1">
            {config.members.length} agents
          </span>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#71717a]" />
            <span className="text-[#71717a]">{pending} pending</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6]" />
            <span className="text-[#71717a]">{inProgress} active</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
            <span className="text-[#71717a]">{completed} done</span>
          </div>
          <div className="ml-auto text-[#71717a]">{totalMessages} msgs</div>
        </div>
      </div>
    </Link>
  );
}

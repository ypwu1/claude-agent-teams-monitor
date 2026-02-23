'use client';
import type { TeamMember } from '@/lib/types';
import { getAgentColor } from '@/lib/types';

interface AgentBadgeProps {
  member: TeamMember;
  index: number;
  showModel?: boolean;
}

export default function AgentBadge({
  member,
  index,
  showModel = true,
}: AgentBadgeProps) {
  const color = getAgentColor(member, index);

  return (
    <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[#131318] border border-[#27272a] hover:border-[#3b82f6]/30 transition-colors">
      <div
        className="w-3 h-3 rounded-full shrink-0"
        style={{ backgroundColor: color }}
      />
      <div className="min-w-0">
        <div className="text-sm font-medium text-white truncate">
          {member.name}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#71717a]">
          <span>{member.agentType}</span>
          {showModel && (
            <>
              <span>·</span>
              <span className="truncate">{member.model}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

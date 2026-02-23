'use client';
import type { AgentInbox, TeamMember } from '@/lib/types';
import { getAgentColor } from '@/lib/types';

function formatTime(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  } catch {
    return timestamp;
  }
}

interface MessageTimelineProps {
  inboxes: AgentInbox[];
  members: TeamMember[];
}

export default function MessageTimeline({
  inboxes,
  members,
}: MessageTimelineProps) {
  // Flatten and sort all messages by timestamp
  const allMessages = inboxes
    .flatMap((inbox) =>
      inbox.messages.map((msg) => ({
        ...msg,
        recipient: inbox.agentName,
      }))
    )
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

  const getMemberColor = (name: string): string => {
    const idx = members.findIndex((m) => m.name === name);
    if (idx >= 0) return getAgentColor(members[idx], idx);
    return '#71717a';
  };

  if (allMessages.length === 0) {
    return (
      <div className="text-center text-[#71717a] text-sm py-8">
        No messages yet
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
      {allMessages.map((msg, i) => (
        <div
          key={`${msg.timestamp}-${i}`}
          className="rounded-lg bg-[#0d0d12] border border-[#27272a] p-3 hover:border-[#27272a]/80 transition-colors"
        >
          <div className="flex items-center gap-2 mb-1.5">
            <div
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: getMemberColor(msg.from) }}
            />
            <span className="text-sm font-medium text-white">{msg.from}</span>
            <span className="text-xs text-[#71717a]">→</span>
            <span
              className="text-sm"
              style={{ color: getMemberColor(msg.recipient) }}
            >
              {msg.recipient}
            </span>
            <span className="text-xs text-[#71717a] ml-auto">
              {formatTime(msg.timestamp)}
            </span>
            {!msg.read && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6]" />
            )}
          </div>
          {msg.summary && (
            <p className="text-xs text-[#71717a] mb-1">{msg.summary}</p>
          )}
          <p className="text-sm text-[#e4e4e7] whitespace-pre-wrap line-clamp-4">
            {msg.text}
          </p>
        </div>
      ))}
    </div>
  );
}

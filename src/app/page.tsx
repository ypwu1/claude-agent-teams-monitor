'use client';
import { useWebSocket } from '@/hooks/useWebSocket';
import ConnectionStatus from '@/components/ConnectionStatus';
import TeamCard from '@/components/TeamCard';
import StatsChart from '@/components/StatsChart';

export default function Dashboard() {
  const { teams, stats, connectionStatus } = useWebSocket();

  const totalTasks = teams.reduce((sum, t) => sum + t.tasks.length, 0);
  const totalMessages = teams.reduce(
    (sum, t) => sum + t.inboxes.reduce((s, i) => s + i.messages.length, 0),
    0
  );
  const totalAgents = teams.reduce(
    (sum, t) => sum + t.config.members.length,
    0
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-[#71717a] mt-0.5">
            Monitor your Claude Code Agent Teams
          </p>
        </div>
        <ConnectionStatus status={connectionStatus} />
      </div>

      {/* Global stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-lg bg-[#131318] border border-[#27272a] p-4">
          <div className="text-2xl font-bold text-white">{teams.length}</div>
          <div className="text-xs text-[#71717a] mt-1">Active Teams</div>
        </div>
        <div className="rounded-lg bg-[#131318] border border-[#27272a] p-4">
          <div className="text-2xl font-bold text-white">{totalAgents}</div>
          <div className="text-xs text-[#71717a] mt-1">Total Agents</div>
        </div>
        <div className="rounded-lg bg-[#131318] border border-[#27272a] p-4">
          <div className="text-2xl font-bold text-white">{totalTasks}</div>
          <div className="text-xs text-[#71717a] mt-1">Total Tasks</div>
        </div>
        <div className="rounded-lg bg-[#131318] border border-[#27272a] p-4">
          <div className="text-2xl font-bold text-white">{totalMessages}</div>
          <div className="text-xs text-[#71717a] mt-1">Total Messages</div>
        </div>
      </div>

      {/* Team cards */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">Teams</h2>
        {teams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map((team) => (
              <TeamCard key={team.config.name} team={team} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg bg-[#131318] border border-[#27272a] p-8 text-center">
            <p className="text-[#71717a]">
              No teams found. Teams will appear when you create Agent Teams in
              Claude Code.
            </p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">
          Usage Statistics
        </h2>
        <StatsChart stats={stats} />
      </div>
    </div>
  );
}

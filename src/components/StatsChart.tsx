'use client';
import type { StatsCache } from '@/lib/types';

function formatCost(usd: number): string {
  return `$${usd.toFixed(2)}`;
}

export default function StatsChart({ stats }: { stats: StatsCache | null }) {
  if (!stats) {
    return (
      <div className="text-center text-[#71717a] text-sm py-8">
        No stats available
      </div>
    );
  }

  const totalCost = Object.values(stats.modelUsage).reduce(
    (sum, m) => sum + m.costUSD,
    0
  );

  // Get last 14 days of activity
  const recentActivity = stats.dailyActivity.slice(-14);
  const maxMessages = Math.max(
    ...recentActivity.map((d) => d.messageCount),
    1
  );

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-lg bg-[#131318] border border-[#27272a] p-4">
          <div className="text-2xl font-bold text-white">
            {stats.totalSessions.toLocaleString()}
          </div>
          <div className="text-xs text-[#71717a] mt-1">Total Sessions</div>
        </div>
        <div className="rounded-lg bg-[#131318] border border-[#27272a] p-4">
          <div className="text-2xl font-bold text-white">
            {stats.totalMessages.toLocaleString()}
          </div>
          <div className="text-xs text-[#71717a] mt-1">Total Messages</div>
        </div>
        <div className="rounded-lg bg-[#131318] border border-[#27272a] p-4">
          <div className="text-2xl font-bold text-white">
            {formatCost(totalCost)}
          </div>
          <div className="text-xs text-[#71717a] mt-1">Total Cost</div>
        </div>
        <div className="rounded-lg bg-[#131318] border border-[#27272a] p-4">
          <div className="text-2xl font-bold text-white">
            {Object.keys(stats.modelUsage).length}
          </div>
          <div className="text-xs text-[#71717a] mt-1">Models Used</div>
        </div>
      </div>

      {/* Daily activity chart */}
      {recentActivity.length > 0 && (
        <div className="rounded-lg bg-[#131318] border border-[#27272a] p-4">
          <h3 className="text-sm font-medium text-white mb-3">
            Daily Activity (Last 14 Days)
          </h3>
          <div className="flex items-end gap-1 h-24">
            {recentActivity.map((day) => {
              const height = (day.messageCount / maxMessages) * 100;
              return (
                <div
                  key={day.date}
                  className="flex-1 flex flex-col items-center gap-1"
                  title={`${day.date}: ${day.messageCount} messages`}
                >
                  <div
                    className="w-full rounded-t bg-[#3b82f6] hover:bg-[#60a5fa] transition-colors min-h-[2px]"
                    style={{ height: `${Math.max(height, 2)}%` }}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-[#71717a]">
              {recentActivity[0]?.date}
            </span>
            <span className="text-[10px] text-[#71717a]">
              {recentActivity[recentActivity.length - 1]?.date}
            </span>
          </div>
        </div>
      )}

      {/* Model usage breakdown */}
      <div className="rounded-lg bg-[#131318] border border-[#27272a] p-4">
        <h3 className="text-sm font-medium text-white mb-3">Model Usage</h3>
        <div className="space-y-2">
          {Object.entries(stats.modelUsage)
            .sort(([, a], [, b]) => b.costUSD - a.costUSD)
            .slice(0, 6)
            .map(([model, usage]) => {
              const pct =
                totalCost > 0 ? (usage.costUSD / totalCost) * 100 : 0;
              return (
                <div key={model}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-[#e4e4e7] truncate mr-2">
                      {model}
                    </span>
                    <span className="text-[#71717a] shrink-0">
                      {formatCost(usage.costUSD)}
                    </span>
                  </div>
                  <div className="h-1.5 bg-[#0d0d12] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#3b82f6] rounded-full"
                      style={{ width: `${Math.max(pct, 1)}%` }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

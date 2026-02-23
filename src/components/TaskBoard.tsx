'use client';
import type { Task } from '@/lib/types';

const columns: { key: Task['status']; label: string; dotColor: string }[] = [
  { key: 'pending', label: 'Pending', dotColor: 'bg-[#71717a]' },
  { key: 'in_progress', label: 'In Progress', dotColor: 'bg-[#3b82f6]' },
  { key: 'completed', label: 'Completed', dotColor: 'bg-[#22c55e]' },
];

function TaskCard({ task }: { task: Task }) {
  return (
    <div className="rounded-lg bg-[#0d0d12] border border-[#27272a] p-3 hover:border-[#3b82f6]/20 transition-colors">
      <div className="flex items-start justify-between gap-2 mb-1">
        <h4 className="text-sm font-medium text-white line-clamp-2">
          {task.subject}
        </h4>
        <span className="text-xs text-[#71717a] shrink-0">#{task.id}</span>
      </div>
      {task.description && (
        <p className="text-xs text-[#71717a] line-clamp-2 mb-2">
          {task.description}
        </p>
      )}
      <div className="flex items-center gap-2 flex-wrap">
        {task.owner && (
          <span className="text-xs px-1.5 py-0.5 rounded bg-[#1a1a22] text-[#e4e4e7]">
            {task.owner}
          </span>
        )}
        {task.blockedBy.length > 0 && (
          <span className="text-xs px-1.5 py-0.5 rounded bg-red-500/10 text-red-400">
            blocked by #{task.blockedBy.join(', #')}
          </span>
        )}
        {task.blocks.length > 0 && (
          <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-400">
            blocks #{task.blocks.join(', #')}
          </span>
        )}
      </div>
    </div>
  );
}

export default function TaskBoard({ tasks }: { tasks: Task[] }) {
  if (tasks.length === 0) {
    return (
      <div className="text-center text-[#71717a] text-sm py-8">
        No tasks yet
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {columns.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.key);
        return (
          <div key={col.key}>
            <div className="flex items-center gap-2 mb-3">
              <span className={`w-2 h-2 rounded-full ${col.dotColor}`} />
              <h3 className="text-sm font-medium text-white">{col.label}</h3>
              <span className="text-xs text-[#71717a] ml-auto">
                {colTasks.length}
              </span>
            </div>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {colTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
              {colTasks.length === 0 && (
                <div className="text-xs text-[#71717a] text-center py-4 border border-dashed border-[#27272a] rounded-lg">
                  Empty
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

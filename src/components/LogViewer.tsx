'use client';
import { useState, useEffect, useRef } from 'react';
import type { DebugLogFile } from '@/lib/types';

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / 1048576).toFixed(1)}MB`;
}

function formatTimeAgo(ms: number): string {
  const diff = Date.now() - ms;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function LogViewer({
  logFiles,
}: {
  logFiles: DebugLogFile[];
}) {
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [logLines, setLogLines] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedSession) return;
    setLoading(true);
    fetch(`/api/logs?sessionId=${encodeURIComponent(selectedSession)}`)
      .then((r) => r.json())
      .then((data) => {
        setLogLines(data.lines || []);
        setLoading(false);
        setTimeout(
          () => logEndRef.current?.scrollIntoView({ behavior: 'smooth' }),
          100
        );
      })
      .catch(() => {
        setLogLines([]);
        setLoading(false);
      });
  }, [selectedSession]);

  return (
    <div className="flex gap-4 h-[calc(100vh-12rem)]">
      {/* Log file list */}
      <div className="w-72 shrink-0 rounded-lg bg-[#131318] border border-[#27272a] overflow-hidden flex flex-col">
        <div className="p-3 border-b border-[#27272a]">
          <h3 className="text-sm font-medium text-white">Debug Sessions</h3>
          <p className="text-xs text-[#71717a] mt-0.5">
            {logFiles.length} sessions
          </p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {logFiles.map((file) => (
            <button
              key={file.sessionId}
              onClick={() => setSelectedSession(file.sessionId)}
              className={`w-full text-left px-3 py-2.5 border-b border-[#27272a]/50 hover:bg-[#1a1a22] transition-colors ${
                selectedSession === file.sessionId
                  ? 'bg-[#1a1a22] border-l-2 border-l-[#3b82f6]'
                  : ''
              }`}
            >
              <div className="text-xs font-mono text-[#e4e4e7] truncate">
                {file.sessionId.slice(0, 16)}...
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[#71717a]">
                <span>{formatSize(file.size)}</span>
                <span>·</span>
                <span>{formatTimeAgo(file.modifiedAt)}</span>
              </div>
            </button>
          ))}
          {logFiles.length === 0 && (
            <div className="text-center text-[#71717a] text-xs py-8">
              No debug logs found
            </div>
          )}
        </div>
      </div>

      {/* Log content */}
      <div className="flex-1 rounded-lg bg-[#0d0d12] border border-[#27272a] overflow-hidden flex flex-col">
        <div className="p-3 border-b border-[#27272a] flex items-center justify-between">
          <h3 className="text-sm font-medium text-white">
            {selectedSession
              ? `Session: ${selectedSession.slice(0, 20)}...`
              : 'Select a session'}
          </h3>
          {loading && (
            <span className="text-xs text-[#71717a] animate-pulse">
              Loading...
            </span>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-3 font-mono text-xs leading-5">
          {logLines.length > 0 ? (
            logLines.map((line, i) => (
              <div
                key={i}
                className="text-[#a1a1aa] hover:text-[#e4e4e7] hover:bg-[#131318] px-1 transition-colors"
              >
                <span className="text-[#3f3f46] select-none mr-3">
                  {String(i + 1).padStart(4, ' ')}
                </span>
                {line}
              </div>
            ))
          ) : (
            <div className="text-center text-[#71717a] py-12">
              {selectedSession
                ? 'No log content'
                : 'Select a session to view logs'}
            </div>
          )}
          <div ref={logEndRef} />
        </div>
      </div>
    </div>
  );
}

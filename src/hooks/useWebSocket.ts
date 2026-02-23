'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  TeamWithDetails,
  StatsCache,
  DebugLogFile,
  WSEvent,
  TeamConfig,
  Task,
  InboxMessage,
} from '@/lib/types';

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';

export function useWebSocket() {
  const [teams, setTeams] = useState<TeamWithDetails[]>([]);
  const [stats, setStats] = useState<StatsCache | null>(null);
  const [logFiles, setLogFiles] = useState<DebugLogFile[]>([]);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>('connecting');
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>(undefined);
  const reconnectAttemptRef = useRef(0);

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket('ws://localhost:3001');
      wsRef.current = ws;

      ws.onopen = () => {
        setConnectionStatus('connected');
        reconnectAttemptRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data) as WSEvent;
          switch (msg.type) {
            case 'initial_state': {
              const data = msg.data as {
                teams: TeamWithDetails[];
                stats: StatsCache | null;
                logFiles: DebugLogFile[];
              };
              setTeams(data.teams);
              setStats(data.stats);
              setLogFiles(data.logFiles);
              break;
            }
            case 'team_update': {
              const data = msg.data as {
                teamName: string;
                config: TeamConfig;
              };
              setTeams((prev) => {
                const idx = prev.findIndex(
                  (t) => t.config.name === data.teamName
                );
                if (idx >= 0) {
                  const updated = [...prev];
                  updated[idx] = { ...updated[idx], config: data.config };
                  return updated;
                }
                return [
                  ...prev,
                  { config: data.config, inboxes: [], tasks: [] },
                ];
              });
              break;
            }
            case 'task_update': {
              const data = msg.data as { teamName: string; tasks: Task[] };
              setTeams((prev) =>
                prev.map((t) =>
                  t.config.name === data.teamName
                    ? { ...t, tasks: data.tasks }
                    : t
                )
              );
              break;
            }
            case 'inbox_update': {
              const data = msg.data as {
                teamName: string;
                agentName: string;
                messages: InboxMessage[];
              };
              setTeams((prev) =>
                prev.map((t) => {
                  if (t.config.name !== data.teamName) return t;
                  const inboxes = [...t.inboxes];
                  const idx = inboxes.findIndex(
                    (i) => i.agentName === data.agentName
                  );
                  if (idx >= 0) {
                    inboxes[idx] = {
                      agentName: data.agentName,
                      messages: data.messages,
                    };
                  } else {
                    inboxes.push({
                      agentName: data.agentName,
                      messages: data.messages,
                    });
                  }
                  return { ...t, inboxes };
                })
              );
              break;
            }
            case 'stats_update': {
              setStats(msg.data as StatsCache);
              break;
            }
            case 'log_update': {
              const data = msg.data as { sessionId: string };
              setLogFiles((prev) => {
                const exists = prev.some(
                  (f) => f.sessionId === data.sessionId
                );
                if (!exists) {
                  return [
                    {
                      sessionId: data.sessionId,
                      fileName: `${data.sessionId}.txt`,
                      size: 0,
                      modifiedAt: Date.now(),
                    },
                    ...prev,
                  ];
                }
                return prev.map((f) =>
                  f.sessionId === data.sessionId
                    ? { ...f, modifiedAt: Date.now() }
                    : f
                );
              });
              break;
            }
          }
        } catch {
          // ignore parse errors
        }
      };

      ws.onclose = () => {
        setConnectionStatus('disconnected');
        const delay = Math.min(
          1000 * Math.pow(2, reconnectAttemptRef.current),
          30000
        );
        reconnectAttemptRef.current++;
        reconnectTimeoutRef.current = setTimeout(connect, delay);
      };

      ws.onerror = () => ws.close();
    } catch {
      setConnectionStatus('disconnected');
    }
  }, []);

  useEffect(() => {
    // REST API fallback for initial data
    fetch('/api/teams')
      .then((r) => r.json())
      .then(setTeams)
      .catch(() => {});
    fetch('/api/stats')
      .then((r) => r.json())
      .then((s) => s && setStats(s))
      .catch(() => {});

    connect();
    return () => {
      wsRef.current?.close();
      if (reconnectTimeoutRef.current)
        clearTimeout(reconnectTimeoutRef.current);
    };
  }, [connect]);

  return { teams, stats, logFiles, connectionStatus };
}

import express from 'express';
import cors from 'cors';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { watch } from 'chokidar';
import path from 'path';

import {
  getAllTeamsWithDetails,
  getTeamTasks,
  getTeamInboxes,
  parseTeamConfig,
  parseStatsCache,
  getDebugLogFiles,
  readDebugLog,
  PATHS,
} from '../src/lib/parsers';

import type {
  WSInitialState,
  WSTeamUpdate,
  WSTaskUpdate,
  WSInboxUpdate,
  WSStatsUpdate,
  WSLogUpdate,
} from '../src/lib/types';

// =============================================================================
// Express + HTTP Server
// =============================================================================

const PORT = 3001;
const app = express();

app.use(cors({ origin: 'http://localhost:3000' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const server = http.createServer(app);

// =============================================================================
// WebSocket Server
// =============================================================================

const wss = new WebSocketServer({ server });

function broadcast(data: object): void {
  const message = JSON.stringify(data);
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}

wss.on('connection', (ws) => {
  console.log(`[ws] Client connected (total: ${wss.clients.size})`);

  const initialState: WSInitialState = {
    type: 'initial_state',
    timestamp: new Date().toISOString(),
    data: {
      teams: getAllTeamsWithDetails(),
      stats: parseStatsCache(),
      logFiles: getDebugLogFiles(),
    },
  };

  ws.send(JSON.stringify(initialState));

  ws.on('close', () => {
    console.log(`[ws] Client disconnected (total: ${wss.clients.size})`);
  });
});

// =============================================================================
// Debounce helper
// =============================================================================

const debounceTimers = new Map<string, ReturnType<typeof setTimeout>>();

function debounced(key: string, fn: () => void, delayMs = 100): void {
  const existing = debounceTimers.get(key);
  if (existing) clearTimeout(existing);
  debounceTimers.set(
    key,
    setTimeout(() => {
      debounceTimers.delete(key);
      fn();
    }, delayMs)
  );
}

// =============================================================================
// Path parsing helpers
// =============================================================================

function extractTeamName(filePath: string): string | null {
  const teamsDir = PATHS.TEAMS_DIR + path.sep;
  if (!filePath.startsWith(teamsDir)) return null;
  const relative = filePath.slice(teamsDir.length);
  const parts = relative.split(path.sep);
  return parts[0] || null;
}

function extractTaskTeamName(filePath: string): string | null {
  const tasksDir = PATHS.TASKS_DIR + path.sep;
  if (!filePath.startsWith(tasksDir)) return null;
  const relative = filePath.slice(tasksDir.length);
  const parts = relative.split(path.sep);
  return parts[0] || null;
}

function extractAgentName(filePath: string): string | null {
  const basename = path.basename(filePath, '.json');
  return basename || null;
}

function extractSessionId(filePath: string): string | null {
  const basename = path.basename(filePath, '.txt');
  return basename || null;
}

// =============================================================================
// File Watchers (chokidar v5)
// =============================================================================

const teamConfigWatcher = watch(
  path.join(PATHS.TEAMS_DIR, '*', 'config.json'),
  { ignoreInitial: true }
);

teamConfigWatcher.on('all', (event, filePath) => {
  if (event !== 'change' && event !== 'add') return;
  const teamName = extractTeamName(filePath);
  if (!teamName) return;

  debounced(`team:${teamName}`, () => {
    console.log(`[watch] Team config changed: ${teamName}`);
    const config = parseTeamConfig(teamName);
    if (!config) return;

    const update: WSTeamUpdate = {
      type: 'team_update',
      timestamp: new Date().toISOString(),
      data: { teamName, config },
    };
    broadcast(update);
  });
});

const inboxWatcher = watch(
  path.join(PATHS.TEAMS_DIR, '*', 'inboxes', '*.json'),
  { ignoreInitial: true }
);

inboxWatcher.on('all', (event, filePath) => {
  if (event !== 'change' && event !== 'add') return;
  const teamName = extractTeamName(filePath);
  const agentName = extractAgentName(filePath);
  if (!teamName || !agentName) return;

  debounced(`inbox:${teamName}:${agentName}`, () => {
    console.log(`[watch] Inbox changed: ${teamName}/${agentName}`);
    const inboxes = getTeamInboxes(teamName);
    const inbox = inboxes.find((i) => i.agentName === agentName);

    const update: WSInboxUpdate = {
      type: 'inbox_update',
      timestamp: new Date().toISOString(),
      data: {
        teamName,
        agentName,
        messages: inbox?.messages ?? [],
      },
    };
    broadcast(update);
  });
});

const taskWatcher = watch(path.join(PATHS.TASKS_DIR, '*', '*.json'), {
  ignoreInitial: true,
});

taskWatcher.on('all', (event, filePath) => {
  if (event !== 'change' && event !== 'add') return;
  const teamName = extractTaskTeamName(filePath);
  if (!teamName) return;

  debounced(`tasks:${teamName}`, () => {
    console.log(`[watch] Tasks changed: ${teamName}`);
    const tasks = getTeamTasks(teamName);

    const update: WSTaskUpdate = {
      type: 'task_update',
      timestamp: new Date().toISOString(),
      data: { teamName, tasks },
    };
    broadcast(update);
  });
});

const statsWatcher = watch(PATHS.STATS_FILE, { ignoreInitial: true });

statsWatcher.on('all', (event) => {
  if (event !== 'change' && event !== 'add') return;

  debounced('stats', () => {
    console.log('[watch] Stats cache changed');
    const stats = parseStatsCache();
    if (!stats) return;

    const update: WSStatsUpdate = {
      type: 'stats_update',
      timestamp: new Date().toISOString(),
      data: stats,
    };
    broadcast(update);
  });
});

const debugWatcher = watch(path.join(PATHS.DEBUG_DIR, '*.txt'), {
  ignoreInitial: true,
});

debugWatcher.on('all', (event, filePath) => {
  if (event !== 'change' && event !== 'add') return;
  const sessionId = extractSessionId(filePath);
  if (!sessionId) return;

  debounced(`log:${sessionId}`, () => {
    console.log(`[watch] Debug log changed: ${sessionId}`);
    const logContent = readDebugLog(sessionId, 50);

    const update: WSLogUpdate = {
      type: 'log_update',
      timestamp: new Date().toISOString(),
      data: {
        sessionId,
        newLines: logContent.lines,
      },
    };
    broadcast(update);
  });
});

// =============================================================================
// Start Server
// =============================================================================

server.listen(PORT, () => {
  console.log(`[server] WebSocket server running on http://localhost:${PORT}`);
  console.log(`[server] Watching ${PATHS.CLAUDE_DIR} for changes`);
});

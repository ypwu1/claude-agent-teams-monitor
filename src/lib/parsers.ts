import * as fs from 'fs';
import * as path from 'path';
import type {
  TeamConfig,
  InboxMessage,
  AgentInbox,
  Task,
  StatsCache,
  HistoryEntry,
  DebugLogFile,
  DebugLogContent,
  TeamWithDetails,
} from './types';

const CLAUDE_DIR = path.join(process.env.HOME || '~', '.claude');
const TEAMS_DIR = path.join(CLAUDE_DIR, 'teams');
const TASKS_DIR = path.join(CLAUDE_DIR, 'tasks');
const DEBUG_DIR = path.join(CLAUDE_DIR, 'debug');
const STATS_FILE = path.join(CLAUDE_DIR, 'stats-cache.json');
const HISTORY_FILE = path.join(CLAUDE_DIR, 'history.jsonl');

// --- Safe JSON parsing ---

function safeReadJSON<T>(filePath: string): T | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

// --- Team Config ---

export function getTeamNames(): string[] {
  try {
    const entries = fs.readdirSync(TEAMS_DIR, { withFileTypes: true });
    return entries
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
      .filter((name) => {
        // Verify config.json exists
        return fs.existsSync(path.join(TEAMS_DIR, name, 'config.json'));
      });
  } catch {
    return [];
  }
}

export function parseTeamConfig(teamName: string): TeamConfig | null {
  return safeReadJSON<TeamConfig>(
    path.join(TEAMS_DIR, teamName, 'config.json')
  );
}

// --- Inbox Messages ---

export function parseInbox(
  teamName: string,
  agentName: string
): InboxMessage[] {
  const messages = safeReadJSON<InboxMessage[]>(
    path.join(TEAMS_DIR, teamName, 'inboxes', `${agentName}.json`)
  );
  return messages || [];
}

export function getTeamInboxes(teamName: string): AgentInbox[] {
  const inboxDir = path.join(TEAMS_DIR, teamName, 'inboxes');
  try {
    const files = fs.readdirSync(inboxDir);
    return files
      .filter((f) => f.endsWith('.json'))
      .map((f) => {
        const agentName = f.replace('.json', '');
        return {
          agentName,
          messages: parseInbox(teamName, agentName),
        };
      });
  } catch {
    return [];
  }
}

// --- Tasks ---

export function parseTask(teamName: string, taskId: string): Task | null {
  return safeReadJSON<Task>(path.join(TASKS_DIR, teamName, `${taskId}.json`));
}

export function getTeamTasks(teamName: string): Task[] {
  const taskDir = path.join(TASKS_DIR, teamName);
  try {
    const files = fs.readdirSync(taskDir);
    const tasks: Task[] = [];
    for (const f of files) {
      if (f.endsWith('.json') && f !== '.lock') {
        const task = safeReadJSON<Task>(path.join(taskDir, f));
        if (task) {
          tasks.push(task);
        }
      }
    }
    return tasks.sort(
      (a, b) => parseInt(a.id || '0') - parseInt(b.id || '0')
    );
  } catch {
    return [];
  }
}

// --- Stats Cache ---

export function parseStatsCache(): StatsCache | null {
  return safeReadJSON<StatsCache>(STATS_FILE);
}

// --- History ---

export function parseHistory(limit = 100): HistoryEntry[] {
  try {
    const content = fs.readFileSync(HISTORY_FILE, 'utf-8');
    const lines = content.trim().split('\n').filter(Boolean);
    const entries: HistoryEntry[] = [];
    const start = Math.max(0, lines.length - limit);
    for (let i = start; i < lines.length; i++) {
      try {
        entries.push(JSON.parse(lines[i]) as HistoryEntry);
      } catch {
        // Skip malformed lines
      }
    }
    return entries;
  } catch {
    return [];
  }
}

// --- Debug Logs ---

export function getDebugLogFiles(): DebugLogFile[] {
  try {
    const files = fs.readdirSync(DEBUG_DIR);
    return files
      .filter((f) => f.endsWith('.txt') && f !== 'latest')
      .map((f) => {
        const stat = fs.statSync(path.join(DEBUG_DIR, f));
        return {
          sessionId: f.replace('.txt', ''),
          fileName: f,
          size: stat.size,
          modifiedAt: stat.mtimeMs,
        };
      })
      .sort((a, b) => b.modifiedAt - a.modifiedAt);
  } catch {
    return [];
  }
}

export function readDebugLog(
  sessionId: string,
  tailLines = 200
): DebugLogContent {
  const filePath = path.join(DEBUG_DIR, `${sessionId}.txt`);
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const allLines = content.split('\n');
    const start = Math.max(0, allLines.length - tailLines);
    return {
      sessionId,
      lines: allLines.slice(start),
      totalLines: allLines.length,
    };
  } catch {
    return { sessionId, lines: [], totalLines: 0 };
  }
}

// --- Aggregated Team Data ---

export function getTeamWithDetails(teamName: string): TeamWithDetails | null {
  const config = parseTeamConfig(teamName);
  if (!config) return null;

  return {
    config,
    inboxes: getTeamInboxes(teamName),
    tasks: getTeamTasks(teamName),
  };
}

export function getAllTeamsWithDetails(): TeamWithDetails[] {
  const teamNames = getTeamNames();
  const teams: TeamWithDetails[] = [];
  for (const name of teamNames) {
    const team = getTeamWithDetails(name);
    if (team) teams.push(team);
  }
  return teams;
}

// --- Exported paths for chokidar ---

export const PATHS = {
  CLAUDE_DIR,
  TEAMS_DIR,
  TASKS_DIR,
  DEBUG_DIR,
  STATS_FILE,
  HISTORY_FILE,
};

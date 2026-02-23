// =============================================================================
// Claude Code Agent Teams Monitor - Type Definitions
// =============================================================================

// --- Team Config (from ~/.claude/teams/{name}/config.json) ---

export interface TeamMember {
  agentId: string;
  name: string;
  agentType: string;
  model: string;
  prompt?: string;
  color?: string;
  planModeRequired?: boolean;
  joinedAt: number;
  tmuxPaneId: string;
  cwd: string;
  subscriptions: string[];
  backendType?: string;
  isActive?: boolean;
}

export interface TeamConfig {
  name: string;
  description: string;
  createdAt: number;
  leadAgentId: string;
  leadSessionId: string;
  members: TeamMember[];
}

// --- Inbox Messages (from ~/.claude/teams/{name}/inboxes/{agent}.json) ---

export interface InboxMessage {
  from: string;
  text: string;
  summary?: string;
  timestamp: string;
  color?: string;
  read: boolean;
}

export interface AgentInbox {
  agentName: string;
  messages: InboxMessage[];
}

// --- Tasks (from ~/.claude/tasks/{name}/{id}.json) ---

export interface Task {
  id: string;
  subject: string;
  description: string;
  activeForm?: string;
  status: 'pending' | 'in_progress' | 'completed';
  owner?: string;
  blocks: string[];
  blockedBy: string[];
}

// --- Stats Cache (from ~/.claude/stats-cache.json) ---

export interface DailyActivity {
  date: string;
  messageCount: number;
  sessionCount: number;
  toolCallCount: number;
}

export interface DailyModelTokens {
  date: string;
  tokensByModel: Record<string, number>;
}

export interface ModelUsage {
  inputTokens: number;
  outputTokens: number;
  cacheReadInputTokens: number;
  cacheCreationInputTokens: number;
  webSearchRequests: number;
  costUSD: number;
  contextWindow: number;
  maxOutputTokens: number;
}

export interface StatsCache {
  version: number;
  lastComputedDate: string;
  dailyActivity: DailyActivity[];
  dailyModelTokens: DailyModelTokens[];
  modelUsage: Record<string, ModelUsage>;
  totalSessions: number;
  totalMessages: number;
  longestSession: {
    sessionId: string;
    duration: number;
    messageCount: number;
    timestamp: string;
  };
  firstSessionDate: string;
  hourCounts: Record<string, number>;
  totalSpeculationTimeSavedMs: number;
}

// --- Command History (from ~/.claude/history.jsonl) ---

export interface HistoryEntry {
  display: string;
  pastedContents: Record<string, unknown>;
  timestamp: number;
  project: string;
  sessionId: string;
}

// --- Debug Logs (from ~/.claude/debug/{session-id}.txt) ---

export interface DebugLogFile {
  sessionId: string;
  fileName: string;
  size: number;
  modifiedAt: number;
}

export interface DebugLogContent {
  sessionId: string;
  lines: string[];
  totalLines: number;
}

// --- WebSocket Events ---

export type WSEventType =
  | 'initial_state'
  | 'team_update'
  | 'task_update'
  | 'inbox_update'
  | 'stats_update'
  | 'log_update'
  | 'log_content';

export interface WSEvent {
  type: WSEventType;
  timestamp: string;
  data: unknown;
}

export interface WSInitialState {
  type: 'initial_state';
  timestamp: string;
  data: {
    teams: TeamWithDetails[];
    stats: StatsCache | null;
    logFiles: DebugLogFile[];
  };
}

export interface WSTeamUpdate {
  type: 'team_update';
  timestamp: string;
  data: {
    teamName: string;
    config: TeamConfig;
  };
}

export interface WSTaskUpdate {
  type: 'task_update';
  timestamp: string;
  data: {
    teamName: string;
    tasks: Task[];
  };
}

export interface WSInboxUpdate {
  type: 'inbox_update';
  timestamp: string;
  data: {
    teamName: string;
    agentName: string;
    messages: InboxMessage[];
  };
}

export interface WSStatsUpdate {
  type: 'stats_update';
  timestamp: string;
  data: StatsCache;
}

export interface WSLogUpdate {
  type: 'log_update';
  timestamp: string;
  data: {
    sessionId: string;
    newLines: string[];
  };
}

// --- Aggregated Types ---

export interface TeamWithDetails {
  config: TeamConfig;
  inboxes: AgentInbox[];
  tasks: Task[];
}

// --- Agent color mapping ---

export const AGENT_COLORS: Record<string, string> = {
  blue: '#3b82f6',
  green: '#22c55e',
  yellow: '#eab308',
  purple: '#a855f7',
  orange: '#f97316',
  red: '#ef4444',
  pink: '#ec4899',
  cyan: '#06b6d4',
  indigo: '#6366f1',
  teal: '#14b8a6',
};

export const DEFAULT_AGENT_COLORS = [
  '#3b82f6', // blue
  '#22c55e', // green
  '#eab308', // yellow
  '#a855f7', // purple
  '#f97316', // orange
  '#ef4444', // red
  '#ec4899', // pink
  '#06b6d4', // cyan
];

export function getAgentColor(member: TeamMember, index: number): string {
  if (member.color && AGENT_COLORS[member.color]) {
    return AGENT_COLORS[member.color];
  }
  return DEFAULT_AGENT_COLORS[index % DEFAULT_AGENT_COLORS.length];
}

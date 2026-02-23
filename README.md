# claude-agent-teams-monitor

A real-time dashboard for monitoring Claude Code Agent Teams. Watch your multi-agent workflows live — track team members, tasks, messages, and usage statistics as they change.

## Overview

When you run multi-agent teams in Claude Code, this dashboard gives you a live view of what's happening:

- **Teams** — see all active teams and their members
- **Tasks** — track task status (pending / in_progress / completed) and ownership
- **Messages** — view agent inbox messages and communication timelines
- **Stats** — visualize token usage, daily activity, and cost across models
- **Logs** — tail debug logs from active Claude Code sessions

Data is streamed via WebSocket and updates instantly as Claude Code writes to `~/.claude/`.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│  Next.js Frontend (port 3000)                        │
│  Dashboard · Team detail · Log viewer · Stats chart  │
└───────────────────┬─────────────────────────────────┘
                    │ WebSocket
┌───────────────────▼─────────────────────────────────┐
│  WebSocket Server (port 3001)                        │
│  Express + ws · chokidar file watchers               │
└───────────────────┬─────────────────────────────────┘
                    │ reads
┌───────────────────▼─────────────────────────────────┐
│  ~/.claude/                                          │
│  ├── teams/{name}/config.json                        │
│  ├── teams/{name}/inboxes/{agent}.json               │
│  ├── tasks/{name}/{id}.json                          │
│  ├── stats-cache.json                                │
│  └── debug/{session-id}.txt                          │
└─────────────────────────────────────────────────────┘
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm

### Install

```bash
pnpm install
```

### Run

Start both servers (Next.js and the WebSocket server) in separate terminals:

```bash
# Terminal 1 — WebSocket server (file watcher + data broadcaster)
pnpm ws

# Terminal 2 — Next.js frontend
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

The WebSocket server must be running for live updates. Without it, the dashboard will show a disconnected status but otherwise won't crash.

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start Next.js dev server with Turbopack |
| `pnpm ws` | Start WebSocket server |
| `pnpm build` | Build Next.js for production |
| `pnpm start` | Start Next.js production server |
| `pnpm test` | Run tests in watch mode (Vitest) |
| `pnpm test:run` | Run tests once |
| `pnpm lint` | Lint with ESLint |

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS 4
- **Backend**: Express 5, ws (WebSocket), chokidar (file watching)
- **Testing**: Vitest, React Testing Library
- **Language**: TypeScript

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Dashboard (home)
│   ├── team/[name]/          # Team detail page
│   ├── logs/                 # Log viewer page
│   └── api/                  # REST API routes (teams, stats, logs)
├── components/
│   ├── TeamCard.tsx           # Team summary card
│   ├── TaskBoard.tsx          # Kanban-style task board
│   ├── MessageTimeline.tsx    # Agent message history
│   ├── StatsChart.tsx         # Token usage / activity charts
│   ├── LogViewer.tsx          # Debug log tail viewer
│   ├── AgentBadge.tsx         # Agent avatar/badge
│   ├── Sidebar.tsx            # Navigation sidebar
│   └── ConnectionStatus.tsx   # WebSocket connection indicator
├── hooks/
│   └── useWebSocket.ts        # WebSocket state management
└── lib/
    ├── parsers.ts             # File parsers for ~/.claude/ data
    └── types.ts               # Shared TypeScript types
server/
└── ws-server.ts              # Express + WebSocket + chokidar server
```

# TaskTrader Pro — Architecture

## Overview

TaskTrader Pro is a trading-style task management web app for a web design + printing business. It reframes project work as "trades" — tasks have entry/exit dates, estimated vs actual hours (like buy/sell prices), and P&L tracking based on profitability. Dark theme inspired by Bloomberg Terminal / TradingView.

**Port:** 2030
**Stack:** React 18 + TypeScript + Vite + TailwindCSS + Zustand + Recharts + Framer Motion
**Backend:** None (localStorage + JSON export/import initially; backend-ready architecture)

## System Architecture

```
┌─────────────────────────────────────────────────────┐
│                   TaskTrader Pro                     │
│                   Port 2030                          │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │Dashboard │ │  Kanban  │ │Analytics │ │Clients │ │
│  │  Page    │ │  Board   │ │  Page    │ │  Page  │ │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └───┬────┘ │
│       │             │            │            │      │
│  ┌────┴─────────────┴────────────┴────────────┴───┐ │
│  │              Zustand Store Layer                │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐       │ │
│  │  │taskStore │ │clientStore│ │uiStore   │       │ │
│  │  └──────────┘ └──────────┘ └──────────┘       │ │
│  └────────────────────┬───────────────────────────┘ │
│                       │                              │
│  ┌────────────────────┴───────────────────────────┐ │
│  │           Persistence Layer                     │ │
│  │  localStorage + JSON import/export              │ │
│  └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

## Pages

### 1. Dashboard
- Hero cards: Active Tasks (positions), Today's Throughput, Weekly P&L
- Task ticker tape (scrolling bar of recent completions)
- Equity curve: cumulative profitability over time (Recharts)
- Top performers: team members or project categories ranked by throughput
- Recent activity feed

### 2. Kanban Board
- Columns: Backlog → In Progress → Review → Done
- Drag-and-drop cards (Framer Motion animations)
- Cards show: task name, client, estimated hours, priority tag, assignee avatar
- Quick-add task inline
- Column WIP limits with visual warnings
- Filter by client, priority, assignee

### 3. Analytics
- Revenue vs Cost chart (estimated hours × rate vs actual hours × rate)
- P&L by client (bar chart)
- P&L by project type (web design vs printing)
- Win rate: % of tasks completed under estimated hours
- Average "trade" duration
- Heatmap: task completions by day of week / hour

### 4. Clients
- Client list with search/filter
- Per-client stats: total tasks, revenue, avg completion time, satisfaction score
- Client detail view: task history, P&L timeline
- Add/edit client form

## Trading Metaphors

| Business Concept | Trading Equivalent |
|---|---|
| Task | Trade / Position |
| Start task | Open position / Entry |
| Complete task | Close position / Exit |
| Estimated hours | Target price |
| Actual hours | Fill price |
| Under budget | Profitable trade (green) |
| Over budget | Losing trade (red) |
| Hourly rate × hours saved | P&L |
| Tasks completed / total | Win rate |
| Active tasks | Open positions |
| Completed tasks | Closed trades |
| Client | Ticker / Symbol |
| Project | Portfolio |

## Tech Decisions

- **No backend initially**: All data in localStorage with JSON export/import for portability. Architecture supports adding a REST API later.
- **Zustand over Redux**: Simpler, less boilerplate, consistent with other projects in the workspace.
- **Recharts over lightweight-charts**: Better for bar charts, pie charts, heatmaps. Trading charts not needed here since we're visualizing business metrics.
- **Framer Motion**: Smooth drag-and-drop on Kanban, page transitions, card animations.
- **TailwindCSS**: Consistent with workspace convention. Dark theme with accent colors matching trading UI aesthetic.

## Color Palette

```
Background:     #0a0e17 (deep navy-black)
Surface:        #111827 (card backgrounds)
Border:         rgba(255,255,255,0.06)
Text Primary:   #e2e8f0
Text Muted:     #64748b
Accent Green:   #22c55e (profit, on-time, under budget)
Accent Red:     #ef4444 (loss, overdue, over budget)
Accent Blue:    #3b82f6 (info, links, active states)
Accent Amber:   #f59e0b (warnings, approaching deadline)
```

## Directory Structure

```
TaskTrader/
├── docs/
│   ├── ARCHITECTURE.md
│   ├── DECISIONS.md
│   ├── MODULES.md
│   ├── DATA_FLOW.md
│   ├── ROADMAP.md
│   └── PLUGINS.md
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   └── Layout.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── HeroCards.tsx
│   │   │   │   ├── TickerTape.tsx
│   │   │   │   ├── EquityCurve.tsx
│   │   │   │   └── ActivityFeed.tsx
│   │   │   ├── kanban/
│   │   │   │   ├── Board.tsx
│   │   │   │   ├── Column.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   └── AddTask.tsx
│   │   │   ├── analytics/
│   │   │   │   ├── RevenueChart.tsx
│   │   │   │   ├── ClientPnL.tsx
│   │   │   │   ├── WinRate.tsx
│   │   │   │   └── Heatmap.tsx
│   │   │   ├── clients/
│   │   │   │   ├── ClientList.tsx
│   │   │   │   ├── ClientDetail.tsx
│   │   │   │   └── ClientForm.tsx
│   │   │   └── shared/
│   │   │       ├── AnimatedNumber.tsx
│   │   │       ├── Badge.tsx
│   │   │       └── Modal.tsx
│   │   ├── stores/
│   │   │   ├── taskStore.ts
│   │   │   ├── clientStore.ts
│   │   │   └── uiStore.ts
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Kanban.tsx
│   │   │   ├── Analytics.tsx
│   │   │   └── Clients.tsx
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   ├── calculations.ts
│   │   │   └── storage.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── vite.config.ts
├── docker-compose.yml
├── Dockerfile
└── .dockerignore
```

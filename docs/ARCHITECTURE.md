# TaskTrader Pro — Architecture

## Overview

TaskTrader Pro is a trading-style task management web app for a web design + printing business. It reframes project work as "trades" — tasks have entry/exit dates, estimated vs actual hours (like buy/sell prices), and P&L tracking based on profitability. Supports both dark (Bloomberg Terminal) and light (neumorphic) themes.

**Port:** 2030
**Stack:** React 18 + TypeScript + Vite + TailwindCSS + Zustand + Recharts + Framer Motion
**Backend:** Express + SQLite (auto-sync) + localStorage fallback

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
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │Calendar  │ │Categories│ │  Goals   │ │Achieve-│ │
│  │  Page    │ │  Page    │ │  Page    │ │ ments  │ │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └───┬────┘ │
│       │             │            │            │      │
│  ┌────┴─────────────┴────────────┴────────────┴───┐ │
│  │              Zustand Store Layer                │ │
│  │  ┌──────────┐ ┌────────────┐ ┌──────────┐     │ │
│  │  │taskStore │ │gamification│ │uiStore   │     │ │
│  │  └──────────┘ └────────────┘ └──────────┘     │ │
│  └────────────────────┬───────────────────────────┘ │
│                       │                              │
│  ┌────────────────────┴───────────────────────────┐ │
│  │           Persistence Layer                     │ │
│  │  localStorage + Backend Sync (Express/SQLite)   │ │
│  └─────────────────────────────────────────────────┘ │
│                                                     │
│  ┌─────────────────────────────────────────────────┐ │
│  │           Plugin Layer                           │ │
│  │  plugins/baby-diary/ (removable)                │ │
│  └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

## Pages

### 1. Dashboard
- Hero cards: Active Tasks (positions), Today's Throughput, Weekly P&L
- Task ticker tape (scrolling bar of recent completions)
- Equity curve: cumulative profitability over time (Recharts)
- Metric cards: Open Profit, Realized Profit, Lost Revenue, Win Rate
- Mini Kanban preview with task cards
- Revenue breakdown by project type

### 2. Kanban Board
- 5 columns: Lead → In Progress → Waiting → Completed → Lost
- HTML5 drag-and-drop with Framer Motion animations
- Cards show: task name, client, estimated hours, priority badge, bookmark, progress
- Task edit modal (click to edit all fields)
- Task completion modal (enter actual hours on close)
- Column value totals and task counts

### 3. Analytics
- Revenue vs Cost chart (estimated hours × rate vs actual hours × rate)
- P&L by client (bar chart)
- P&L by project type (web design vs printing etc.)
- Win rate: % of tasks completed under estimated hours

### 4. New Task ("Open Position")
- Full form with title, description, client, category, priority, status
- Pricing mode toggle: hourly rate or fixed price
- Hours + minutes time estimation
- Due date picker
- Live revenue preview

### 5. Clients
- Client grid with search/filter
- Per-client stats: total tasks, revenue, P&L
- Add/edit client modal
- Neumorphic 3D card styling in light mode

### 6. Categories
- Dedicated category management page
- Add categories with name and color
- Per-category task count
- Delete categories

### 7. Calendar
- Monthly calendar view with Chicago timezone
- Tasks displayed on their due dates
- Meeting scheduling and display

### 8. Goals
- Revenue targets with animated progress bars

### 9. Achievements
- Achievement cards with rarity tiers (common, rare, epic, legendary)
- 3D card styling with colored borders

### 10. Settings
- Theme toggle (dark/light)
- Data import/export (JSON)
- Achievement grid
- XP and level display

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

- **Express + SQLite backend**: Auto-sync with localStorage fallback for offline support.
- **Zustand over Redux**: Simpler, less boilerplate, consistent with other projects in the workspace.
- **Recharts over lightweight-charts**: Better for bar charts, pie charts, heatmaps. Trading charts not needed here.
- **Framer Motion**: Smooth drag-and-drop on Kanban, page transitions, card animations.
- **TailwindCSS**: Dark and light themes via CSS custom properties and `data-theme` attribute.

## Color Palette

### Dark Theme
```
Background:     #0a0e17 (deep navy-black)
Surface:        #111827 (card backgrounds)
Border:         rgba(255,255,255,0.06)
Text Primary:   #e2e8f0
Text Muted:     #64748b
```

### Light Theme (Neumorphic)
```
Background:     #dde1e7 (soft gray)
Surface:        #dde1e7 (raised/inset shadows)
Shadows:        6px 6px 12px #b8bec7, -6px -6px 12px #ffffff
Text Primary:   #2d3436
Text Muted:     #636e72
```

### Accent Colors (both themes)
```
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
├── backend/
│   ├── index.js           # Express + SQLite API
│   ├── package.json
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   └── Layout.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── HeroCard.tsx
│   │   │   │   ├── TickerTape.tsx
│   │   │   │   ├── EquityCurve.tsx
│   │   │   │   ├── MetricCards.tsx
│   │   │   │   ├── MiniKanban.tsx
│   │   │   │   └── RevenueBreakdown.tsx
│   │   │   ├── kanban/
│   │   │   │   ├── Board.tsx
│   │   │   │   ├── Column.tsx
│   │   │   │   ├── TaskCard.tsx
│   │   │   │   └── TaskEditModal.tsx
│   │   │   ├── gamification/
│   │   │   │   ├── RewardPopup.tsx
│   │   │   │   └── AchievementToast.tsx
│   │   │   └── shared/
│   │   │       ├── AnimatedNumber.tsx
│   │   │       ├── Badge.tsx
│   │   │       ├── GlassCard.tsx
│   │   │       └── Modal.tsx
│   │   ├── stores/
│   │   │   ├── taskStore.ts
│   │   │   ├── gamificationStore.ts
│   │   │   └── uiStore.ts
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── TaskBoard.tsx
│   │   │   ├── Analytics.tsx
│   │   │   ├── NewTask.tsx
│   │   │   ├── Clients.tsx
│   │   │   ├── Categories.tsx
│   │   │   ├── Calendar.tsx
│   │   │   ├── Goals.tsx
│   │   │   ├── Achievements.tsx
│   │   │   └── Settings.tsx
│   │   ├── plugins/
│   │   │   └── baby-diary/
│   │   │       ├── BabyDiaryPage.tsx
│   │   │       ├── BabyDiaryButton.tsx
│   │   │       ├── babyDiaryStore.ts
│   │   │       └── types.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   ├── calculations.ts
│   │   │   ├── timezone.ts
│   │   │   ├── api.ts
│   │   │   ├── sync.ts
│   │   │   └── seedData.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── vite.config.ts
├── docker-compose.yml
├── nginx.conf
└── .dockerignore
```

# TaskTrader Pro — Data Flow

## Task Lifecycle

```
                    ┌──────────┐
                    │  CREATE  │
                    │  TASK    │
                    └────┬─────┘
                         │
                         ▼
    ┌──────────────────────────────────────────┐
    │              BACKLOG                      │
    │  status: "backlog"                        │
    │  No timer, just queued                    │
    └──────────────────┬───────────────────────┘
                       │ moveTask(id, "in_progress")
                       │ sets started_at = now()
                       ▼
    ┌──────────────────────────────────────────┐
    │           IN PROGRESS                     │
    │  status: "in_progress"                    │
    │  Timer running (actual_hours accumulates) │
    │  Shows as "Open Position" on Dashboard    │
    └──────────────────┬───────────────────────┘
                       │ moveTask(id, "review")
                       ▼
    ┌──────────────────────────────────────────┐
    │             REVIEW                        │
    │  status: "review"                         │
    │  Pending approval / QA                    │
    └──────────────────┬───────────────────────┘
                       │ completeTask(id, actual_hours)
                       │ sets completed_at = now()
                       │ calculates P&L
                       ▼
    ┌──────────────────────────────────────────┐
    │              DONE                         │
    │  status: "done"                           │
    │  P&L = (estimated - actual) × rate        │
    │  Shows as "Closed Trade" in history       │
    └──────────────────────────────────────────┘
```

## P&L Calculation Flow

```
Task completed with actual_hours
        │
        ▼
hours_saved = estimated_hours - actual_hours
        │
        ▼
pnl = hours_saved × hourly_rate
        │
        ├── pnl > 0  →  Profitable (green) — finished faster than estimated
        ├── pnl = 0  →  Break-even (neutral)
        └── pnl < 0  →  Loss (red) — took longer than estimated
```

**Example:**
- Estimated: 8 hours, Actual: 5 hours, Rate: $75/hr
- P&L = (8 - 5) × $75 = +$225 (profitable trade)

## Data Persistence Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Zustand     │────▶│  Middleware   │────▶│ localStorage │
│  Store       │     │  (persist)   │     │              │
│  (in-memory) │◀────│              │◀────│  (on disk)   │
└──────────────┘     └──────────────┘     └──────────────┘
                            │
                     ┌──────┴──────┐
                     │             │
                     ▼             ▼
              ┌───────────┐ ┌───────────┐
              │  Export    │ │  Import   │
              │  (JSON    │ │  (JSON    │
              │  download)│ │  upload)  │
              └───────────┘ └───────────┘
```

Zustand's `persist` middleware auto-syncs store state to localStorage on every change. Export/import provides manual backup and data transfer.

## Dashboard Data Flow

```
┌─────────────┐
│ taskStore    │
│             │
│ tasks[] ────┼──────┬──────────────────────────────────┐
│             │      │                                   │
└─────────────┘      ▼                                   ▼
              ┌──────────────┐                   ┌──────────────┐
              │  HeroCards   │                   │  EquityCurve │
              │              │                   │              │
              │ activeTasks  │                   │ cumulative   │
              │ todayPnL     │                   │ P&L over     │
              │ weeklyPnL    │                   │ time         │
              │ winRate      │                   └──────────────┘
              └──────────────┘
                     │
              ┌──────┴──────┐
              ▼             ▼
       ┌───────────┐ ┌───────────┐
       │TickerTape │ │ Activity  │
       │           │ │ Feed      │
       │ recent    │ │ status    │
       │ closings  │ │ changes   │
       └───────────┘ └───────────┘
```

## Kanban Drag-and-Drop Flow

```
User drags Card from Column A to Column B
        │
        ▼
Framer Motion Reorder captures new position
        │
        ▼
Board.tsx calls moveTask(id, newStatus)
        │
        ├── Updates task.status
        ├── Updates task.order (position in new column)
        ├── If moving to "in_progress": sets started_at
        └── If moving to "done": triggers completion modal
                │
                ▼
        User enters actual_hours
                │
                ▼
        completeTask(id, actual_hours)
                │
                ▼
        P&L calculated and stored
```

## Analytics Aggregation Flow

```
taskStore.tasks[]
        │
        ├── Filter by date range
        │
        ├──▶ aggregateByPeriod("week")  ──▶ RevenueChart
        ├──▶ groupBy("client_id")        ──▶ ClientPnL
        ├──▶ calculateWinRate()          ──▶ WinRate donut
        └──▶ groupBy("day_of_week", "hour") ──▶ Heatmap
```

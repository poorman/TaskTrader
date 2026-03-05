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
    │              LEAD                         │
    │  status: "lead"                           │
    │  Pipeline / prospect stage                │
    └──────────────────┬───────────────────────┘
                       │ moveTask(id, "in_progress")
                       │ sets startedAt = now()
                       ▼
    ┌──────────────────────────────────────────┐
    │           IN PROGRESS                     │
    │  status: "in_progress"                    │
    │  Active work, shows as "Open Position"    │
    └──────────────────┬───────────────────────┘
                       │ moveTask(id, "waiting")
                       ▼
    ┌──────────────────────────────────────────┐
    │             WAITING                       │
    │  status: "waiting"                        │
    │  Pending client response / review         │
    └──────────────────┬───────────────────────┘
                       │
              ┌────────┴────────┐
              ▼                 ▼
┌──────────────────┐  ┌──────────────────┐
│   COMPLETED      │  │     LOST         │
│   status:        │  │   status: "lost" │
│   "completed"    │  │   Client dropped │
│   P&L calculated │  │   Revenue = loss │
│   Closed trade   │  │                  │
└──────────────────┘  └──────────────────┘
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

**Fixed-price P&L:**
```
pnl = fixed_price - (actual_hours × effective_hourly_rate)
```

## Revenue Calculation

```
Hourly mode:  revenue = estimatedHours × hourlyRate
Fixed mode:   revenue = fixedPrice
              effectiveRate = fixedPrice / estimatedHours
```

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
              │  Backend   │ │  Export    │
              │  Sync      │ │  (JSON    │
              │  (Express/ │ │  download) │
              │  SQLite)   │ │           │
              └───────────┘ └───────────┘
```

**Sync flow on app load:**
1. `initSync()` fetches all data from backend API
2. If backend has data, it replaces localStorage state
3. If backend is unavailable, localStorage data is used
4. JSON export/import provides manual backup

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
              ┌──────┼──────┐
              ▼      ▼      ▼
       ┌─────────┐ ┌────────────┐ ┌─────────────────┐
       │Ticker   │ │ MiniKanban │ │ Revenue         │
       │Tape     │ │            │ │ Breakdown       │
       │recent   │ │ 5 columns  │ │ by project type │
       │closings │ │ preview    │ │                 │
       └─────────┘ └────────────┘ └─────────────────┘
```

## Kanban Drag-and-Drop Flow

```
User drags Card from Column A to Column B
        │
        ▼
HTML5 drag events captured by Column drop target
        │
        ▼
Board.tsx calls moveTask(id, newStatus)
        │
        ├── Updates task.status
        ├── If moving to "in_progress": sets startedAt
        ├── If moving to "completed": triggers completion modal
        │       │
        │       ▼
        │   User enters actual_hours
        │       │
        │       ▼
        │   completeTask(id, actual_hours)
        │       │
        │       ▼
        │   P&L calculated → gamification triggered → XP awarded
        │
        └── If moving to "lost": triggers lost confirmation modal
                │
                ▼
            loseTask(id, reason)
```

## Gamification Flow

```
Task completed
        │
        ▼
onTaskCompleted(task)
        │
        ├── Calculate base XP (50-100)
        ├── Roll variable multiplier (1%→10x, 4%→5x, 10%→3x, 20%→2x)
        ├── Apply streak multiplier
        ├── Add XP → check level up
        ├── Queue reward popup
        └── Check achievement conditions
                │
                ▼
        Display confetti + XP popup
        Display achievement toast (if unlocked)
```

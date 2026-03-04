# TaskTrader Pro — Modules

## Stores

### `taskStore.ts`
Central task management store. Handles CRUD operations, status transitions, and P&L calculations.

**State:**
- `tasks: Task[]` — all tasks
- `clients: Client[]` — all clients
- `categories: Category[]` — project type categories
- `goals: Goal[]` — revenue targets

**Actions:**
- `addTask(task)` — create new task, auto-set `createdAt`, calculate `revenue`
- `updateTask(id, partial)` — update task fields, recalculate revenue
- `deleteTask(id)` — remove task
- `moveTask(id, status)` — change task status (Kanban column move), auto-set `startedAt`
- `completeTask(id, actualHours)` — set status to "completed", calculate P&L
- `loseTask(id)` — mark as lost, set negative P&L
- `reorderTasks(status, orderedIds)` — reorder within a Kanban column
- `toggleBookmark(id)` — bookmark/unbookmark a task
- `addClient/updateClient/deleteClient` — client CRUD
- `addCategory/deleteCategory` — category CRUD
- `addGoal/deleteGoal` — goal CRUD
- `seed(tasks, clients)` — bulk replace for import/demo

### `gamificationStore.ts`
XP, leveling, streaks, achievements, and reward events.

**State:**
- `xp: number` — total experience points
- `level: number` — current level
- `streak: number` — consecutive active days
- `achievements: Achievement[]` — unlocked achievements
- `totalTasksCompleted: number`
- `pendingRewards: RewardEvent[]` — queue of reward popups to display

**Actions:**
- `onTaskCompleted(task)` — roll variable reward, add XP, queue popup
- `checkStreak()` — check/update daily streak on app load
- `dismissReward(id)` — remove reward popup from queue
- `checkAchievements(context)` — evaluate unlock conditions for all achievements

### `uiStore.ts`
UI state management.

**State:**
- `activePage: Page` — current page
- `sidebarCollapsed: boolean`
- `searchQuery: string`

**Actions:**
- `setPage(page)` — navigate to page
- `toggleSidebar()` — collapse/expand sidebar
- `setSearch(query)` — update search filter

## Components

### Layout
| Component | Purpose |
|-----------|---------|
| `Layout.tsx` | App shell with sidebar + header + content area + ambient gradient background |
| `Sidebar.tsx` | 8-page navigation, XP bar with level, streak counter, collapsible |
| `Header.tsx` | Page title, time range pills, search input, notification bell, avatar |

### Dashboard
| Component | Purpose |
|-----------|---------|
| `HeroCard.tsx` | Reusable metric card with animated number, glow, and sub-values |
| `EquityCurve.tsx` | Recharts dual-area chart (revenue + P&L) with custom tooltip |
| `MetricCards.tsx` | 4-card grid: Open Profit, Realized Profit, Lost Revenue, Win Rate |
| `MiniKanban.tsx` | Compact 5-column kanban preview with task cards |
| `RevenueBreakdown.tsx` | Revenue by project type with animated progress bars |
| `TickerTape.tsx` | Auto-scrolling ticker of recent completions |

### Kanban
| Component | Purpose |
|-----------|---------|
| `Board.tsx` | Full kanban container, routes drag events to store |
| `Column.tsx` | Drop target with header, value total, card list |
| `TaskCard.tsx` | Full task card with progress bar, priority badge, bookmark, hours |

### Gamification
| Component | Purpose |
|-----------|---------|
| `RewardPopup.tsx` | Bottom-center XP reward popup with confetti, variable multiplier display |
| `AchievementToast.tsx` | Top-right achievement unlock toasts with rarity-colored borders |

### Shared
| Component | Purpose |
|-----------|---------|
| `AnimatedNumber.tsx` | Smooth number transitions with ease-out cubic easing |
| `Badge.tsx` | `PriorityBadge` and `StatusBadge` with trading-style colors |
| `GlassCard.tsx` | Reusable glassmorphism card with Framer Motion entry + hover |
| `Modal.tsx` | Reusable modal with backdrop blur and spring animation |

### Pages (standalone)
| Page | Purpose |
|------|---------|
| `Dashboard.tsx` | Composes all dashboard components, calculates aggregate stats |
| `TaskBoard.tsx` | Wraps `Board` component |
| `Analytics.tsx` | 4 Recharts visualizations with quick-stat cards |
| `NewTask.tsx` | "Open Position" form with live revenue preview |
| `Clients.tsx` | Client grid with add/edit modal, per-client stats |
| `Categories.tsx` | Category list with add/delete |
| `Goals.tsx` | Revenue targets with animated progress bars |
| `Settings.tsx` | Trader profile, achievements grid, data import/export |

## Types

### `Task`
```typescript
interface Task {
  id: string;
  title: string;
  description?: string;
  clientId: string;
  projectType: "web_design" | "printing" | "branding" | "consulting" | "other";
  status: "lead" | "in_progress" | "waiting" | "completed" | "lost";
  priority: "low" | "medium" | "high" | "urgent";
  assignee?: string;
  estimatedHours: number;
  actualHours: number;
  hourlyRate: number;
  pnl: number;
  revenue: number;
  progress: number;         // 0-100
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  dueDate?: string;
  order: number;
  tags?: string[];
  bookmarked?: boolean;
}
```

### `Client`
```typescript
interface Client {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  defaultHourlyRate: number;
  notes?: string;
  createdAt: string;
  color: string;
}
```

### `Achievement`
```typescript
interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  xpReward: number;
  rarity: "common" | "rare" | "epic" | "legendary";
}
```

## Utilities

### `calculations.ts`
- `calculatePnL(estimated, actual, rate)` — compute task P&L
- `calculateRealizedPnL(tasks)` — sum P&L of completed tasks
- `calculateOpenProfit(tasks)` — projected profit on active tasks
- `calculateLostRevenue(tasks)` — total revenue of lost tasks
- `calculateWinRate(tasks)` — % of profitable completions
- `revenueByType(tasks)` — aggregate revenue by project type
- `buildDailySnapshots(tasks)` — cumulative daily data for equity curve
- `formatCurrency(value)` / `formatCurrencyFull(value)` — display helpers

### `gamification.ts`
- `xpForLevel(level)` / `getLevelFromXP(xp)` — exponential leveling curve
- `rollReward()` — variable reward with 1%/4%/10%/20% bonus tiers
- `getPositiveFrame(task)` — "losses disguised as wins" messaging
- `getStreakMessage(streak)` — milestone streak messages
- `ACHIEVEMENTS` — 10 achievement definitions (common → legendary)

### `seedData.ts`
- `SEED_CLIENTS` — 6 demo clients with colors and rates
- `SEED_TASKS` — 15 demo tasks across all statuses

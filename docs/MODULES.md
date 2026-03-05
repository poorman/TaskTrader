# TaskTrader Pro — Modules

## Stores

### `taskStore.ts`
Central task management store. Handles CRUD operations, status transitions, and P&L calculations.

**State:**
- `tasks: Task[]` — all tasks
- `clients: Client[]` — all clients
- `categories: Category[]` — project type categories (name + color)
- `goals: Goal[]` — revenue targets
- `meetings: Meeting[]` — scheduled meetings

**Actions:**
- `addTask(task)` — create new task, auto-set `createdAt`, calculate `revenue`
- `updateTask(id, partial)` — update task fields, recalculate revenue
- `deleteTask(id)` — remove task
- `moveTask(id, status)` — change task status (Kanban column move), auto-set `startedAt`
- `completeTask(id, actualHours)` — set status to "completed", calculate P&L
- `loseTask(id)` — mark as lost, set negative P&L
- `reorderTasks(status, orderedIds)` — reorder within a Kanban column
- `toggleBookmark(id)` — bookmark/unbookmark a task
- `addSubtask/toggleSubtask/deleteSubtask` — subtask CRUD
- `addClient/updateClient/deleteClient` — client CRUD
- `addCategory/deleteCategory` — category CRUD
- `addGoal/deleteGoal` — goal CRUD
- `addMeeting/updateMeeting/deleteMeeting/toggleMeetingDone` — meeting CRUD
- `seed(tasks, clients)` — bulk replace for import/demo

### `gamificationStore.ts`
XP, leveling, streaks, achievements, and reward events.

**State:**
- `xp: number` — total experience points
- `level: number` — current level
- `streak: number` — consecutive active days
- `achievements: Achievement[]` — unlocked achievements
- `totalTasksCompleted: number`
- `dailyCompleted: number` — tasks completed today
- `pendingRewards: RewardEvent[]` — queue of reward popups to display
- `multiplier: number` — current XP multiplier
- `multiplierExpiresAt?: string` — multiplier expiry

**Actions:**
- `onTaskCompleted(task)` — roll variable reward, add XP, queue popup
- `checkStreak()` — check/update daily streak on app load
- `syncDailyCompleted(tasks)` — reconcile daily count from task data
- `dismissReward(id)` — remove reward popup from queue
- `checkAchievements(context)` — evaluate unlock conditions for all achievements

### `uiStore.ts`
UI state management.

**State:**
- `activePage: Page` — current page
- `sidebarCollapsed: boolean`
- `theme: "dark" | "light"` — current theme
- `searchQuery: string`

**Actions:**
- `setPage(page)` — navigate to page
- `toggleSidebar()` — collapse/expand sidebar
- `setTheme(theme)` — switch theme (sets `data-theme` attribute)
- `setSearch(query)` — update search filter

## Components

### Layout
| Component | Purpose |
|-----------|---------|
| `Layout.tsx` | App shell with sidebar + header + content area + ambient gradient background |
| `Sidebar.tsx` | 10-page navigation, XP display with level, streak counter, collapsible |
| `Header.tsx` | Page title, search input, notification bell, achievements button, baby diary button, settings gear |

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
| `Column.tsx` | Drop target with header, value total, card list, completion/lost modals |
| `TaskCard.tsx` | Full task card with progress bar, priority badge, bookmark, hours |
| `TaskEditModal.tsx` | Full edit modal for task fields (title, description, client, category, pricing, due date) |

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

### Pages
| Page | Purpose |
|------|---------|
| `Dashboard.tsx` | Composes all dashboard components, calculates aggregate stats |
| `TaskBoard.tsx` | Wraps `Board` component |
| `Analytics.tsx` | 4 Recharts visualizations with quick-stat cards |
| `NewTask.tsx` | "Open Position" form with hourly/fixed pricing toggle, hours+minutes input |
| `Clients.tsx` | Client grid with add/edit modal, per-client stats, neumorphic cards |
| `Categories.tsx` | Dedicated category management page with add/delete and color picker |
| `Calendar.tsx` | Monthly calendar with Chicago timezone, task due dates, meetings |
| `Goals.tsx` | Revenue targets with animated progress bars |
| `Achievements.tsx` | Achievement cards with rarity tiers and 3D styling |
| `Settings.tsx` | Theme toggle, data import/export, achievement grid |

## Types

### `Task`
```typescript
interface Task {
  id: string;
  title: string;
  description?: string;
  clientId: string;
  projectType: ProjectType;       // dynamic from categories store
  status: "lead" | "in_progress" | "waiting" | "completed" | "lost";
  priority: "low" | "medium" | "high" | "urgent";
  estimatedHours: number;         // hours + minutes/60
  actualHours: number;
  hourlyRate: number;
  pnl: number;
  revenue: number;
  progress: number;               // 0-100
  pricingMode?: "hourly" | "fixed";
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  dueDate?: string;
  order: number;
  bookmarked?: boolean;
  subtasks?: Subtask[];
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
  avatar?: string;
}
```

### `Category`
```typescript
interface Category {
  id: string;
  name: string;
  color: string;
}
```

### `Meeting`
```typescript
interface Meeting {
  id: string;
  title: string;
  clientId: string;
  date: string;
  time: string;
  duration: number;
  notes?: string;
  type: "call" | "video" | "in_person" | "review";
  done: boolean;
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

### `timezone.ts`
- `todayLocal()` — today's date in "YYYY-MM-DD" format, America/Chicago timezone
- `tomorrowLocal()` — tomorrow's date in "YYYY-MM-DD" format, America/Chicago timezone
- `nowTimeLocal()` — current time in "HH:MM" format, America/Chicago timezone

### `api.ts` / `sync.ts`
- Backend sync utilities for Express/SQLite API
- Auto-sync on app load with localStorage fallback

### `seedData.ts`
- `SEED_CLIENTS` — 6 demo clients with colors and rates
- `SEED_TASKS` — 15 demo tasks across all statuses

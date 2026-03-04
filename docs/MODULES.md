# TaskTrader Pro — Modules

## Stores

### `taskStore.ts`
Central task management store. Handles CRUD operations, status transitions, and P&L calculations.

**State:**
- `tasks: Task[]` — all tasks
- `filter: TaskFilter` — current filter criteria (status, client, priority, assignee, date range)
- `sortBy: SortField` — current sort field

**Actions:**
- `addTask(task)` — create new task, auto-set `created_at`
- `updateTask(id, partial)` — update task fields
- `deleteTask(id)` — remove task
- `moveTask(id, status)` — change task status (Kanban column move)
- `startTask(id)` — set status to "in_progress", record `started_at`
- `completeTask(id, actual_hours)` — set status to "done", record `completed_at`, calculate P&L
- `setFilter(filter)` — update filter criteria
- `reorderTasks(status, ordered_ids)` — reorder within a Kanban column

**Computed:**
- `activeTasks` — tasks with status "in_progress"
- `todayCompleted` — tasks completed today
- `totalPnL` — sum of all completed task P&L
- `winRate` — % of completed tasks with positive P&L
- `tasksByStatus` — grouped for Kanban columns

### `clientStore.ts`
Client management store.

**State:**
- `clients: Client[]` — all clients

**Actions:**
- `addClient(client)` — create client
- `updateClient(id, partial)` — update client
- `deleteClient(id)` — remove client (soft delete if has tasks)

**Computed:**
- `clientStats(id)` — total tasks, revenue, avg completion time, P&L for a client
- `topClients` — ranked by revenue or P&L

### `uiStore.ts`
UI state management.

**State:**
- `sidebarCollapsed: boolean`
- `activePage: Page`
- `modalOpen: string | null`
- `theme: ThemeConfig`

## Components

### Layout
| Component | Purpose |
|-----------|---------|
| `Layout.tsx` | Main app shell with sidebar + header + content area |
| `Sidebar.tsx` | Navigation: Dashboard, Kanban, Analytics, Clients. Collapsible. |
| `Header.tsx` | Page title, search, quick-add task button, settings |

### Dashboard
| Component | Purpose |
|-----------|---------|
| `HeroCards.tsx` | 3 main metric cards (Active Tasks, Today's Throughput, Weekly P&L) with scrollable secondary stats |
| `TickerTape.tsx` | Horizontal scrolling bar showing recent completions like a stock ticker |
| `EquityCurve.tsx` | Recharts area chart showing cumulative P&L over time |
| `ActivityFeed.tsx` | Recent task status changes with timestamps |

### Kanban
| Component | Purpose |
|-----------|---------|
| `Board.tsx` | Kanban board container, manages columns and drag state |
| `Column.tsx` | Single column (Backlog/In Progress/Review/Done) with WIP limit indicator |
| `Card.tsx` | Task card with client, hours estimate, priority badge, assignee |
| `AddTask.tsx` | Inline task creation form within a column |

### Analytics
| Component | Purpose |
|-----------|---------|
| `RevenueChart.tsx` | Revenue vs Cost area/bar chart over time |
| `ClientPnL.tsx` | Horizontal bar chart of P&L per client |
| `WinRate.tsx` | Donut chart showing win/loss ratio |
| `Heatmap.tsx` | Grid heatmap of task completions by day/hour |

### Clients
| Component | Purpose |
|-----------|---------|
| `ClientList.tsx` | Searchable/filterable client table |
| `ClientDetail.tsx` | Full client view with task history and P&L timeline |
| `ClientForm.tsx` | Add/edit client modal form |

### Shared
| Component | Purpose |
|-----------|---------|
| `AnimatedNumber.tsx` | Smooth number transitions (reused pattern from MetaTrader) |
| `Badge.tsx` | Priority/status badges with trading-style colors |
| `Modal.tsx` | Reusable modal with Framer Motion enter/exit animations |

## Types

### `Task`
```typescript
interface Task {
  id: string;
  title: string;
  description?: string;
  client_id: string;
  project_type: "web_design" | "printing" | "branding" | "other";
  status: "backlog" | "in_progress" | "review" | "done";
  priority: "low" | "medium" | "high" | "urgent";
  assignee?: string;
  estimated_hours: number;
  actual_hours?: number;
  hourly_rate: number;
  pnl?: number;           // (estimated - actual) × hourly_rate
  created_at: string;
  started_at?: string;
  completed_at?: string;
  order: number;           // position within Kanban column
  tags?: string[];
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
  default_hourly_rate: number;
  notes?: string;
  created_at: string;
  color: string;           // assigned color for charts
}
```

## Utilities

### `calculations.ts`
- `calculatePnL(estimated, actual, rate)` — compute task P&L
- `calculateWinRate(tasks)` — % of profitable completions
- `calculateROI(tasks)` — total P&L / total estimated revenue
- `aggregateByPeriod(tasks, period)` — group tasks by day/week/month for charts

### `storage.ts`
- `loadState(key)` — read from localStorage with JSON parse
- `saveState(key, data)` — write to localStorage with JSON stringify
- `exportData()` — export all stores to a single JSON file (download)
- `importData(json)` — import and hydrate all stores from JSON file

# TaskTrader Pro

A trading-style task management web app designed for web design and printing businesses. Tasks are treated as "trades" — track estimated vs actual hours, measure P&L per task, and gamify your workflow with XP, streaks, and achievements.

![Port](https://img.shields.io/badge/port-2030-blue) ![React](https://img.shields.io/badge/React-18-61DAFB) ![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6) ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4)

## Features

### Dashboard
- Total P&L hero with realized/unrealized/lost breakdown
- Equity curve chart tracking cumulative revenue and profit
- Metric cards: Open Profit, Realized Profit, Lost Revenue, Win Rate
- Revenue breakdown by project type
- Scrolling ticker tape of recent task completions
- Projected month-end revenue

### Task Board (Kanban)
- 5-column drag-and-drop board: Lead → In Progress → Waiting on Client → Completed → Lost
- Task cards with priority badges, progress bars, client tags, and dollar values
- Bookmark tasks for quick reference

### P&L Analytics
- Revenue over time (area chart)
- P&L by client (horizontal bar chart)
- Win/loss ratio (donut chart)
- Revenue by project type (bar chart)

### Clients
- Client cards with contact info and per-client stats
- Add/edit/delete with color assignment
- Revenue, P&L, and task count per client

### Gamification
- **Variable Reward Schedule**: Random XP multipliers on task completion (1% chance of 10x jackpot, 4% for 5x, 10% for 3x)
- **Losses Disguised as Wins**: Positive framing for every outcome — over-budget tasks celebrated as "quality investments"
- **Streak Tracking**: Daily streak counter with milestone celebrations
- **10 Achievements**: From "First Blood" (common) to "Centurion" (legendary)
- **Confetti**: Canvas confetti bursts on task completion, scaled by reward rarity
- **XP & Leveling**: Exponential XP curve with level progression in sidebar

### Additional Pages
- **New Task**: "Open Position" form with live revenue preview
- **Categories**: Manage project types with icons and colors
- **Goals**: Set revenue targets with animated progress bars
- **Settings**: Trader profile, achievement showcase, JSON export/import, demo data loader

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Build | Vite 6 |
| Styling | TailwindCSS 3.4 |
| State | Zustand (persisted to localStorage) |
| Charts | Recharts |
| Animations | Framer Motion |
| Icons | Lucide React |
| Effects | canvas-confetti |
| Deploy | Docker + nginx |

## Quick Start

```bash
# Docker (recommended)
docker compose up -d --build
# Open http://localhost:2030

# Local development
cd frontend
npm install
npm run dev
# Open http://localhost:2030
```

Demo data loads automatically on first visit. Reset anytime from Settings → Load Demo Data.

## Trading Metaphors

| Business Concept | Trading Equivalent |
|---|---|
| Task | Trade / Position |
| Start task | Open position |
| Complete task | Close position |
| Estimated hours | Target price |
| Actual hours | Fill price |
| Under budget | Profitable trade (green) |
| Over budget | Losing trade (red) |
| Hours saved × rate | P&L |
| Active tasks | Open positions |
| Client | Ticker symbol |

## Data

All data persists in browser localStorage. Use Settings to:
- **Export**: Download all tasks and clients as JSON
- **Import**: Upload a previously exported JSON file
- **Clear**: Reset all data
- **Demo**: Load sample data with 15 tasks across 6 clients

## Project Structure

```
TaskTrader/
├── docs/              # Architecture documentation
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── dashboard/   # HeroCard, EquityCurve, MetricCards, MiniKanban, TickerTape
│       │   ├── gamification/# RewardPopup, AchievementToast
│       │   ├── kanban/      # Board, Column, TaskCard
│       │   ├── layout/      # Sidebar, Header, Layout
│       │   └── shared/      # AnimatedNumber, Badge, GlassCard, Modal
│       ├── pages/           # Dashboard, Analytics, TaskBoard, NewTask, Clients, etc.
│       ├── stores/          # Zustand stores (task, gamification, ui)
│       ├── types/           # TypeScript interfaces
│       └── utils/           # Calculations, gamification logic, seed data
├── docker-compose.yml
├── Dockerfile
└── nginx.conf
```

## License

MIT

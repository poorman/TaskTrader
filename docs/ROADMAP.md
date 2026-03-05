# TaskTrader Pro — Roadmap

## Phase 1: Core MVP (Complete)

- [x] Architecture documentation (6 doc files)
- [x] Project scaffolding (Vite + React 18 + TypeScript 5.6 + TailwindCSS 3.4)
- [x] Type definitions and Zustand stores (task, gamification, UI)
- [x] Layout shell (glassmorphism sidebar, header, page routing with Framer Motion)
- [x] Dashboard page (P&L hero, equity curve, metric cards, mini kanban, ticker tape, revenue breakdown)
- [x] Task Board — full Kanban with HTML drag-and-drop across 5 columns (Lead, In Progress, Waiting, Completed, Lost)
- [x] P&L Analytics page (revenue over time, P&L by client, win/loss pie, revenue by type)
- [x] Clients page with CRUD, search, per-client stats
- [x] Categories page (dedicated management page with add/delete and color picker)
- [x] Goals page with revenue targets and progress bars
- [x] Settings page (trader profile, achievements, XP display, theme toggle, data export/import)
- [x] New Task page ("Open Position" form with live revenue preview, hourly/fixed pricing)
- [x] Gamification engine (variable rewards, streaks, 10 achievements, confetti, positive framing)
- [x] localStorage persistence via Zustand persist middleware
- [x] JSON export/import from Settings
- [x] Docker deployment (nginx, port 2030)
- [x] Seed data (15 tasks, 6 clients) auto-loads on first visit

## Phase 1.5: UI Polish & Features (Complete)

- [x] Neumorphic light theme with theme toggle (dark/light)
- [x] Task edit modal with full field editing
- [x] Fixed-price and hourly pricing modes per task
- [x] Hours + minutes input for task time estimation
- [x] Calendar page with Chicago timezone support
- [x] Achievements page with 3D card styling
- [x] Client cards with neumorphic 3D depth
- [x] Task completion modal with actual hours entry
- [x] Subtask support (add/toggle/delete checklists within tasks)
- [x] Meeting scheduling on Calendar page
- [x] Task bookmarking
- [x] Backend sync support (Express/SQLite API with auto-sync)
- [x] Baby Diary plugin (removable plugin for daily entry tracking)

## Phase 2: Enhanced Tracking

- [ ] Time tracking: start/stop timer on active tasks
- [ ] Task templates: pre-filled tasks for common jobs (business card, logo, website)
- [ ] Recurring tasks: weekly/monthly repeat for maintenance clients
- [ ] File attachments: link design files, proofs, print specs
- [ ] Task comments / notes log

## Phase 3: Team Features

- [ ] Multiple assignees with avatar display
- [ ] Team performance leaderboard (like MetaTrader's Trader Performance)
- [ ] Workload heatmap per team member
- [ ] Notifications: task assigned, deadline approaching, overdue

## Phase 4: Backend + Multi-Device

- [x] REST API backend (Express + SQLite) — basic sync implemented
- [ ] PostgreSQL migration for production scale
- [ ] User authentication
- [ ] Real-time sync across devices (WebSocket)
- [ ] Role-based access (admin, designer, printer)

## Phase 5: Integrations

- [ ] Calendar sync (Google Calendar / Outlook)
- [ ] Invoice generation from completed tasks
- [ ] Email notifications
- [ ] Slack/Discord webhook alerts
- [ ] QuickBooks / FreshBooks integration for billing

## Phase 6: Advanced Analytics

- [ ] Profitability forecasting based on historical data
- [ ] Client lifetime value (CLV) tracking
- [ ] Seasonal demand patterns
- [ ] Capacity planning: projected workload vs team availability
- [ ] Custom report builder

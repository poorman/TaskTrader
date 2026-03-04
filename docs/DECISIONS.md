# TaskTrader Pro — Design Decisions

## D1: Client-Side Only (Phase 1)

**Decision:** No backend server. All data persists in localStorage with JSON import/export.

**Rationale:**
- Single-user or small-team use case (web design + printing business)
- Eliminates deployment complexity — just a static site served by nginx
- JSON export provides backup and data portability
- Architecture is backend-ready: Zustand stores use an abstracted persistence layer that can swap to REST API calls

**Trade-offs:**
- No multi-device sync (mitigated by JSON export/import)
- Data limited to ~5MB localStorage (sufficient for thousands of tasks)
- No real-time collaboration

## D2: Trading Metaphor as Core UX

**Decision:** Map every business concept to a trading equivalent (tasks=trades, hours=prices, profitability=P&L).

**Rationale:**
- Consistent with the workspace ecosystem aesthetic (MetaAlgo, MetaTrader)
- Gamification through financial language makes task management more engaging
- P&L framing encourages time-tracking discipline and profitability awareness
- Dark terminal-style UI is distinctive and professional

## D3: Zustand for State Management

**Decision:** Use Zustand with separate stores per domain (tasks, clients, UI).

**Rationale:**
- Workspace convention — all frontends use Zustand
- Minimal boilerplate compared to Redux
- Built-in persistence middleware for localStorage
- Easy to test and debug

## D4: Recharts for Data Visualization

**Decision:** Use Recharts instead of lightweight-charts.

**Rationale:**
- Lightweight-charts is optimized for candlestick/OHLC financial charts
- TaskTrader needs bar charts, area charts, pie charts, heatmaps — Recharts excels here
- Recharts integrates naturally with React component model
- Consistent API for all chart types

## D5: Framer Motion for Animations

**Decision:** Use Framer Motion for drag-and-drop Kanban, page transitions, and micro-interactions.

**Rationale:**
- First-class React integration with declarative API
- `Reorder` component handles drag-and-drop natively
- `AnimatePresence` for smooth mount/unmount transitions
- Layout animations for Kanban card reordering

## D6: Hourly Rate Model

**Decision:** P&L calculated as `(estimated_hours - actual_hours) × hourly_rate`.

**Rationale:**
- Simple, intuitive model for a service business
- Positive P&L = completed faster than estimated = profit
- Negative P&L = took longer than estimated = loss
- Per-client hourly rates support different pricing tiers
- Can extend to fixed-price projects later (P&L = fixed_price - actual_hours × internal_rate)

## D7: No Authentication (Phase 1)

**Decision:** No login system in initial release.

**Rationale:**
- Single-business tool, runs locally or behind company VPN
- Reduces complexity significantly
- Can add auth later if multi-user support needed

## D8: Docker Deployment

**Decision:** Serve via nginx in Docker on port 2030, consistent with workspace pattern.

**Rationale:**
- All workspace projects use Docker Compose
- Simple nginx container for static files
- Consistent with MetaAlgo (2020), MetaTrader (2022), SparkAI (2023) pattern

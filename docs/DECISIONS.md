# TaskTrader Pro — Design Decisions

## D1: Client-Side First with Backend Sync

**Decision:** localStorage as primary persistence with optional Express/SQLite backend sync.

**Rationale:**
- Single-user or small-team use case (web design + printing business)
- App works offline — localStorage is always available
- Backend sync adds multi-device support when available
- JSON export provides backup and data portability

**Trade-offs:**
- Backend is optional, not required
- No real-time collaboration (future WebSocket addition)

## D2: Trading Metaphor as Core UX

**Decision:** Map every business concept to a trading equivalent (tasks=trades, hours=prices, profitability=P&L).

**Rationale:**
- Consistent with the workspace ecosystem aesthetic (MetaAlgo, MetaTrader)
- Gamification through financial language makes task management more engaging
- P&L framing encourages time-tracking discipline and profitability awareness

## D3: Zustand for State Management

**Decision:** Use Zustand with separate stores per domain (tasks, gamification, UI).

**Rationale:**
- Workspace convention — all frontends use Zustand
- Minimal boilerplate compared to Redux
- Built-in persistence middleware for localStorage
- Plugin stores are fully independent (own localStorage keys)

## D4: Dual Theme Support (Dark + Light Neumorphic)

**Decision:** Support both dark (Bloomberg Terminal) and light (neumorphic) themes via CSS custom properties.

**Rationale:**
- Dark theme matches trading aesthetic
- Light neumorphic theme provides alternative for daytime use and client presentations
- CSS custom properties + `data-theme` attribute allows clean theme switching
- Neumorphic shadows (`6px 6px 12px #b8bec7, -6px -6px 12px #ffffff`) create 3D depth in light mode

## D5: Hourly + Fixed Pricing Models

**Decision:** Support both hourly rate and fixed-price task pricing.

**Rationale:**
- Hourly: P&L = (estimated - actual) × rate — natural fit for service work
- Fixed: revenue is set price, effective rate = fixed / hours — common for project quotes
- `pricingMode` field stored on task for accurate edit/display
- Effective hourly rate calculated for fixed-price tasks for analytics comparison

## D6: Plugin System (Folder-Based)

**Decision:** Plugins live in `frontend/src/plugins/<name>/` with marked core touch points.

**Rationale:**
- Clean separation — entire plugin can be deleted by removing folder + 3 marked lines
- Own zustand store with separate localStorage key — no data contamination
- Supports future SaaS conversion by removing personal plugins
- No runtime plugin loading complexity — simple imports with clear `// PLUGIN: <name>` markers

## D7: Chicago Timezone

**Decision:** All date operations use America/Chicago timezone via utility functions.

**Rationale:**
- Business operates in Chicago timezone
- Prevents UTC date boundary issues (e.g., calendar showing wrong day at night)
- Centralized in `utils/timezone.ts` for consistency

## D8: Categories as Dynamic Store Data

**Decision:** Categories managed in taskStore with dedicated Categories page. No icons, just name + color.

**Rationale:**
- Categories are user-defined, not hardcoded
- Dedicated management page is cleaner than inline editors
- Color dot is sufficient visual identifier
- Dropdown in NewTask and TaskEditModal reads from store for consistency

## D9: Docker Deployment

**Decision:** Serve via nginx + Express backend in Docker on port 2030.

**Rationale:**
- All workspace projects use Docker Compose
- nginx serves static frontend, proxies API to backend
- Consistent with MetaAlgo (2020), MetaTrader (2022), SparkAI (2023) pattern

## D10: Framer Motion for Animations

**Decision:** Use Framer Motion for drag-and-drop Kanban, page transitions, and micro-interactions.

**Rationale:**
- First-class React integration with declarative API
- `AnimatePresence` for smooth mount/unmount transitions
- Layout animations for Kanban card reordering
- Consistent animation quality throughout the app

## D11: Recharts for Data Visualization

**Decision:** Use Recharts for all charts.

**Rationale:**
- Lightweight-charts is for candlestick/OHLC — not needed here
- Recharts handles bar charts, area charts, pie charts natively
- Consistent API, good React integration

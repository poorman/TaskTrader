# TaskTrader Pro — Plugins & Extensions

## Plugin Architecture

TaskTrader Pro supports a folder-based plugin system. Plugins live in `frontend/src/plugins/<plugin-name>/` with their own stores, types, and components. Core app touch points are clearly marked with `// PLUGIN: <name>` comments for easy removal.

## Active Plugins

### Baby Diary (`plugins/baby-diary/`)

A daily diary for documenting baby care activities (feedings, diaper changes, playtime, sleep, baths). Designed for custody documentation with timestamps.

**Files:**
```
frontend/src/plugins/baby-diary/
├── BabyDiaryPage.tsx      # Full page with date navigator, quick-add, timeline, daily summary
├── BabyDiaryButton.tsx    # Header icon button (Baby icon) with today's entry count badge
├── babyDiaryStore.ts      # Separate zustand store (localStorage key: "tasktrader-plugin-babydiary")
└── types.ts               # DiaryEntry type and entry type definitions
```

**Core app touch points (3 total, all marked with `// PLUGIN: baby-diary`):**
1. `types/index.ts` — `"babydiary"` in Page union type
2. `App.tsx` — import + route entry
3. `Header.tsx` — import + render BabyDiaryButton

**Data model:**
```typescript
interface DiaryEntry {
  id: string;
  date: string;          // "YYYY-MM-DD" in Chicago timezone
  time: string;          // "HH:MM"
  type: "diaper" | "feeding" | "playtime" | "sleep" | "bath" | "other";
  notes: string;
  duration?: number;     // minutes
  createdAt: string;
}
```

**Removal instructions:**
1. Delete `frontend/src/plugins/baby-diary/` folder
2. Search for `// PLUGIN: baby-diary` and remove those lines (3 files)
3. Remove `"babydiary"` from `Page` type in `types/index.ts`
4. Done — zero leftover code or data

## Extension Points (Future)

### Project Type Plugins
New project types beyond the built-in categories:
- Photography, Video Production, Social Media, Signage
- Each can define custom fields and default templates

### Chart Plugins
Additional analytics visualizations:
- Burndown Chart, Velocity Chart, Client Radar, Forecast Chart

### Export Plugins
Additional export formats beyond JSON:
- CSV Export, PDF Report, Invoice Generator, Timesheet Export

### Integration Plugins
External service connectors:
- Google Calendar, Slack, QuickBooks, GitHub/GitLab

## Theme System

TaskTrader supports dark and light themes:
- **Dark**: Bloomberg Terminal / TradingView aesthetic
- **Light**: Neumorphic raised/inset shadow design
- Themes controlled via `data-theme` attribute and CSS custom properties
- Toggle available in Settings page and header

## Creating a New Plugin

1. Create folder: `frontend/src/plugins/<plugin-name>/`
2. Add own zustand store with unique localStorage key: `"tasktrader-plugin-<name>"`
3. Add page component and optional header button
4. Mark all core app touch points with `// PLUGIN: <name>` comments
5. Document removal instructions in this file

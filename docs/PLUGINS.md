# TaskTrader Pro — Plugins & Extensions

## Plugin Architecture

TaskTrader Pro is designed with a modular component structure that supports future plugin capabilities. Phase 1 does not include a runtime plugin system, but the architecture anticipates these extension points.

## Extension Points

### 1. Project Type Plugins

New project types beyond the built-in `web_design`, `printing`, `branding`, `other`:

- **Photography**: shoot scheduling, editing time, print fulfillment
- **Video Production**: pre-production, shooting, editing, rendering phases
- **Social Media**: content calendar, post scheduling, engagement tracking
- **Signage**: design, production, installation tracking

Each project type can define:
- Custom fields (e.g., print dimensions, paper stock for printing jobs)
- Default estimated hours templates
- Type-specific analytics views

### 2. Chart Plugins

Additional analytics visualizations:

- **Burndown Chart**: sprint-style remaining work visualization
- **Velocity Chart**: throughput trend over sprints/weeks
- **Client Radar**: multi-axis comparison of clients (volume, profitability, payment speed)
- **Forecast Chart**: projected revenue based on pipeline

### 3. Export Plugins

Additional export formats beyond JSON:

- **CSV Export**: for spreadsheet analysis
- **PDF Report**: formatted client-facing reports
- **Invoice Generator**: auto-create invoices from completed tasks
- **Timesheet Export**: formatted for payroll systems

### 4. Integration Plugins (Phase 5)

External service connectors:

- **Google Calendar**: sync task deadlines as calendar events
- **Slack**: post task updates to channels
- **QuickBooks**: push completed tasks as billable items
- **GitHub/GitLab**: link tasks to code repositories

## Custom Fields System (Future)

```typescript
interface CustomFieldDef {
  id: string;
  name: string;
  type: "text" | "number" | "select" | "date" | "boolean";
  options?: string[];       // for select type
  project_types?: string[]; // which project types show this field
  required?: boolean;
}
```

Custom fields would be stored in a `custom_fields` map on the Task type and rendered dynamically in task forms and detail views.

## Theme Plugins (Future)

While the default theme is dark trading-terminal style, the architecture supports theme swapping:

- **Light Mode**: for daytime/presentation use
- **Bloomberg**: classic Bloomberg Terminal green-on-black
- **Minimal**: clean white with subtle borders
- **Custom**: user-defined color palette

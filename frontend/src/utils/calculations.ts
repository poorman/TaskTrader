import type { Task, Category, DailySnapshot } from "../types";
import { toLocalDate, todayLocal } from "./timezone";
import type { TimeRange } from "../stores/uiStore";

/** Returns a cutoff ISO date string for filtering tasks by time range */
export function getTimeRangeCutoff(range: TimeRange): string {
  const now = new Date();
  switch (range) {
    case "Today": {
      const today = todayLocal();
      return today + "T00:00:00";
    }
    case "1W":
      now.setDate(now.getDate() - 7);
      break;
    case "1M":
      now.setMonth(now.getMonth() - 1);
      break;
    case "3M":
      now.setMonth(now.getMonth() - 3);
      break;
    case "1Y":
      now.setFullYear(now.getFullYear() - 1);
      break;
  }
  return now.toISOString();
}

/** Filter tasks that are relevant to the given time range */
export function filterTasksByTimeRange(tasks: Task[], range: TimeRange): Task[] {
  if (range === "1Y") return tasks; // show all for 1Y
  const cutoff = getTimeRangeCutoff(range);
  return tasks.filter((t) => {
    // Always include active tasks (not completed/lost)
    if (t.status !== "completed" && t.status !== "lost") return true;
    // For completed/lost, filter by completedAt date
    const date = t.completedAt || t.createdAt;
    return date >= cutoff;
  });
}

export function calculatePnL(
  estimatedHours: number,
  actualHours: number,
  hourlyRate: number
): number {
  return (estimatedHours - actualHours) * hourlyRate;
}

export function calculateRevenue(
  estimatedHours: number,
  hourlyRate: number
): number {
  return estimatedHours * hourlyRate;
}

export function calculateWinRate(tasks: Task[]): number {
  const completed = tasks.filter((t) => t.status === "completed");
  if (completed.length === 0) return 0;
  const wins = completed.filter((t) => t.pnl >= 0).length;
  return Math.round((wins / completed.length) * 100);
}

export function calculateTotalPnL(tasks: Task[]): number {
  return tasks
    .filter((t) => t.status === "completed" || t.status === "lost")
    .reduce((sum, t) => sum + t.pnl, 0);
}

export function calculateRealizedPnL(tasks: Task[]): number {
  return tasks
    .filter((t) => t.status === "completed")
    .reduce((sum, t) => sum + t.pnl, 0);
}

export function calculateOpenProfit(tasks: Task[]): number {
  return tasks
    .filter((t) => t.status === "in_progress" || t.status === "waiting" || t.status === "lead")
    .reduce((sum, t) => sum + t.revenue, 0);
}

export function calculateLostRevenue(tasks: Task[]): number {
  return tasks
    .filter((t) => t.status === "lost")
    .reduce((sum, t) => sum + t.revenue, 0);
}

export function revenueByType(
  tasks: Task[],
  categories?: Category[]
): { name: string; value: number }[] {
  const map: Record<string, number> = {};
  tasks
    .filter((t) => t.status === "completed")
    .forEach((t) => {
      // Resolve category name from UUID or slug
      const cat = categories?.find(
        (c) => c.id === t.projectType || c.name.toLowerCase().replace(/ /g, "_") === t.projectType
      );
      const name = cat?.name || (() => {
        const label = t.projectType.replace("_", " ");
        return label.charAt(0).toUpperCase() + label.slice(1);
      })();
      map[name] = (map[name] || 0) + t.revenue;
    });
  return Object.entries(map)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export function buildDailySnapshots(tasks: Task[]): DailySnapshot[] {
  const map: Record<string, DailySnapshot> = {};
  const closed = tasks.filter(
    (t) =>
      (t.status === "completed" || t.status === "lost") && t.completedAt
  );
  closed.forEach((t) => {
    const date = toLocalDate(t.completedAt!);
    if (!map[date]) {
      map[date] = {
        date,
        revenue: 0,
        cost: 0,
        pnl: 0,
        tasksCompleted: 0,
        tasksLost: 0,
      };
    }
    const snap = map[date];
    if (t.status === "completed") {
      snap.revenue += t.revenue;
      snap.cost += t.actualHours * t.hourlyRate;
      snap.pnl += t.pnl;
      snap.tasksCompleted++;
    } else {
      snap.pnl += t.pnl;
      snap.tasksLost++;
    }
  });
  const snapshots = Object.values(map).sort(
    (a, b) => a.date.localeCompare(b.date)
  );
  // Make cumulative
  let cumPnl = 0;
  let cumRevenue = 0;
  return snapshots.map((s) => {
    cumPnl += s.pnl;
    cumRevenue += s.revenue;
    return { ...s, pnl: cumPnl, revenue: cumRevenue };
  });
}

export function formatCurrency(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1000) {
    return (
      (value < 0 ? "-" : "") +
      "$" +
      (abs / 1000).toFixed(abs % 1000 === 0 ? 0 : 1) +
      "k"
    );
  }
  return (value < 0 ? "-" : "") + "$" + abs.toLocaleString();
}

export function formatCurrencyFull(value: number): string {
  const prefix = value >= 0 ? "+$" : "-$";
  return prefix + Math.abs(value).toLocaleString();
}

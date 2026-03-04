import type { Task, DailySnapshot } from "../types";

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
    .filter((t) => t.status === "in_progress" || t.status === "waiting")
    .reduce((sum, t) => {
      const projected =
        t.estimatedHours * t.hourlyRate - t.actualHours * t.hourlyRate;
      return sum + projected;
    }, 0);
}

export function calculateLostRevenue(tasks: Task[]): number {
  return tasks
    .filter((t) => t.status === "lost")
    .reduce((sum, t) => sum + t.revenue, 0);
}

export function revenueByType(
  tasks: Task[]
): { name: string; value: number }[] {
  const map: Record<string, number> = {};
  tasks
    .filter((t) => t.status === "completed")
    .forEach((t) => {
      const label = t.projectType.replace("_", " ");
      const name = label.charAt(0).toUpperCase() + label.slice(1);
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
    const date = t.completedAt!.slice(0, 10);
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

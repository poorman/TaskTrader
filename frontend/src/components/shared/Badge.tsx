import type { Priority, TaskStatus } from "../../types";

const PRIORITY_DOT_COLOR: Record<Priority, string> = {
  urgent: "#ff4466",
  high: "#ffaa00",
  medium: "#ffaa00",
  low: "#3b82f6",
};

const STATUS_STYLES: Record<TaskStatus, { bg: string; dot: string }> = {
  lead: { bg: "bg-accent-amber/10 text-accent-amber", dot: "bg-accent-amber" },
  in_progress: { bg: "bg-profit/10 text-profit", dot: "bg-profit" },
  waiting: { bg: "bg-gray-500/10 text-gray-400", dot: "bg-gray-400" },
  completed: { bg: "bg-profit/10 text-profit", dot: "bg-profit" },
  lost: { bg: "bg-loss/10 text-loss", dot: "bg-loss" },
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  const color = PRIORITY_DOT_COLOR[priority];
  return (
    <span className="relative inline-flex h-2.5 w-2.5">
      <span
        className="absolute inset-0 rounded-full opacity-60 animate-ping"
        style={{ backgroundColor: color }}
      />
      <span
        className="relative inline-flex h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: color }}
      />
    </span>
  );
}

export function StatusBadge({ status }: { status: TaskStatus }) {
  const style = STATUS_STYLES[status];
  const label = status.replace("_", " ");
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full ${style.bg}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {label}
    </span>
  );
}

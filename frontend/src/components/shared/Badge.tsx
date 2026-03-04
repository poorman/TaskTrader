import type { Priority, TaskStatus } from "../../types";

const PRIORITY_STYLES: Record<Priority, string> = {
  urgent: "bg-loss/20 text-loss border-loss/30",
  high: "bg-accent-amber/20 text-accent-amber border-accent-amber/30",
  medium: "bg-accent-blue/20 text-accent-blue border-accent-blue/30",
  low: "bg-white/5 text-gray-400 border-white/10",
};

const STATUS_STYLES: Record<TaskStatus, { bg: string; dot: string }> = {
  lead: { bg: "bg-accent-amber/10 text-accent-amber", dot: "bg-accent-amber" },
  in_progress: { bg: "bg-profit/10 text-profit", dot: "bg-profit" },
  waiting: { bg: "bg-gray-500/10 text-gray-400", dot: "bg-gray-400" },
  completed: { bg: "bg-profit/10 text-profit", dot: "bg-profit" },
  lost: { bg: "bg-loss/10 text-loss", dot: "bg-loss" },
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full border ${PRIORITY_STYLES[priority]}`}
    >
      {priority}
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

import { motion } from "framer-motion";
import { Bookmark, Clock, GripVertical } from "lucide-react";
import type { Task, Client } from "../../types";
import { PriorityBadge } from "../shared/Badge";
import { useTaskStore } from "../../stores/taskStore";

export default function TaskCard({
  task,
  client,
  dragControls,
}: {
  task: Task;
  client?: Client;
  dragControls?: boolean;
}) {
  const toggleBookmark = useTaskStore((s) => s.toggleBookmark);
  const isProfit = task.pnl >= 0;
  const progressColor =
    task.status === "lost"
      ? "#ff4466"
      : task.progress >= 80
        ? "#00ff88"
        : task.progress >= 50
          ? "#ffaa00"
          : "#3b82f6";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className="glass rounded-xl p-3.5 cursor-grab active:cursor-grabbing group hover:border-white/10 transition-all relative"
    >
      {dragControls && (
        <div className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-40 transition-opacity">
          <GripVertical size={12} className="text-gray-500" />
        </div>
      )}

      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0 pr-2">
          <h4 className="text-sm font-semibold text-white truncate">
            {task.title}
          </h4>
          <p className="text-[10px] text-gray-500 mt-0.5 flex items-center gap-1">
            {client && (
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: client.color }}
              />
            )}
            {client?.name || "Unknown"} · {task.projectType.replace("_", " ")}
          </p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleBookmark(task.id);
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-accent-amber shrink-0"
        >
          <Bookmark
            size={14}
            fill={task.bookmarked ? "#ffaa00" : "none"}
            className={task.bookmarked ? "text-accent-amber !opacity-100" : ""}
          />
        </button>
      </div>

      {/* Value + Progress */}
      <div className="flex items-center justify-between mb-2">
        <span
          className="text-base font-mono font-bold"
          style={{ color: task.status === "completed" || task.status === "lost" ? (isProfit ? "#00ff88" : "#ff4466") : "#e2e8f0" }}
        >
          {task.status === "completed" || task.status === "lost"
            ? `${task.pnl >= 0 ? "+" : ""}$${task.pnl.toLocaleString()}`
            : `$${task.revenue.toLocaleString()}`}
        </span>
        {task.status === "lost" && (
          <span className="text-[9px] font-bold text-loss bg-loss/15 px-2 py-0.5 rounded-full">
            Lost Deal
          </span>
        )}
        {task.status === "completed" && (
          <span className="text-[9px] font-bold text-profit bg-profit/15 px-2 py-0.5 rounded-full">
            Realized
          </span>
        )}
      </div>

      {/* Progress bar */}
      {task.progress > 0 && task.status !== "lost" && (
        <div className="h-1.5 rounded-full bg-white/5 overflow-hidden mb-2.5">
          <motion.div
            className="h-full rounded-full"
            style={{ background: progressColor }}
            initial={{ width: 0 }}
            animate={{ width: `${task.progress}%` }}
            transition={{ duration: 0.6 }}
          />
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <PriorityBadge priority={task.priority} />
        <div className="flex items-center gap-2">
          {task.estimatedHours > 0 && (
            <span className="text-[10px] text-gray-500 flex items-center gap-0.5">
              <Clock size={10} />
              {task.actualHours > 0
                ? `${task.actualHours}/${task.estimatedHours}h`
                : `${task.estimatedHours}h`}
            </span>
          )}
          {task.dueDate && (
            <span className="text-[10px] text-gray-500">
              {new Date(task.dueDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

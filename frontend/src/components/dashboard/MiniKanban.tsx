import { useState } from "react";
import { motion } from "framer-motion";
import { Bookmark } from "lucide-react";
import type { Task, Client, Category, TaskStatus } from "../../types";
import { PriorityBadge } from "../shared/Badge";
import { useTaskStore } from "../../stores/taskStore";
import { useUIStore } from "../../stores/uiStore";

const COLUMNS: { status: TaskStatus; label: string; dotColor: string }[] = [
  { status: "lead", label: "Lead", dotColor: "#ffaa00" },
  { status: "in_progress", label: "In Progress", dotColor: "rgb(var(--color-profit))" },
  { status: "waiting", label: "Waiting on Client", dotColor: "#64748b" },
  { status: "completed", label: "Completed", dotColor: "rgb(var(--color-profit))" },
  { status: "lost", label: "Lost", dotColor: "#ff4466" },
];

function TaskCard({
  task,
  client,
  categories,
  compact,
}: {
  task: Task;
  client?: Client;
  categories?: Category[];
  compact?: boolean;
}) {
  const toggleBookmark = useTaskStore((s) => s.toggleBookmark);
  const category = categories?.find(
    (c) => c.id === task.projectType || c.name.toLowerCase().replace(/ /g, "_") === task.projectType
  );
  const categoryLabel = category?.name || task.projectType.replace("_", " ");
  const isProfit = task.pnl >= 0;
  const progressColor =
    task.status === "lost"
      ? "#ff4466"
      : task.progress >= 80
        ? "rgb(var(--color-profit))"
        : task.progress >= 50
          ? "#ffaa00"
          : "#3b82f6";

  if (compact) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-lg px-2.5 py-1.5 cursor-grab active:cursor-grabbing group hover:border-white/10 transition-all"
      >
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-[10px] font-semibold text-white truncate flex-1">
            {task.title}
          </h4>
          <span className="text-[10px] font-mono font-bold shrink-0" style={{ color: isProfit ? "rgb(var(--color-profit))" : "#ff4466" }}>
            {task.status === "completed" || task.status === "lost"
              ? `${task.pnl >= 0 ? "+" : ""}$${task.pnl.toLocaleString()}`
              : `$${task.revenue.toLocaleString()}`}
          </span>
        </div>
        {/* Thin progress bar */}
        {task.progress > 0 && task.status !== "lost" && (
          <div className="h-0.5 rounded-full bg-white/5 overflow-hidden mt-1">
            <div
              className="h-full rounded-full"
              style={{ background: progressColor, width: `${task.progress}%` }}
            />
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass rounded-xl p-3 card-shine cursor-grab active:cursor-grabbing group hover:border-white/10 transition-all"
    >
      <div className="flex items-start justify-between mb-1.5">
        <h4 className="text-xs font-semibold text-white truncate pr-2">
          {task.title}
        </h4>
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleBookmark(task.id);
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-accent-amber"
        >
          <Bookmark
            size={12}
            fill={task.bookmarked ? "#ffaa00" : "none"}
            className={task.bookmarked ? "text-accent-amber opacity-100" : ""}
          />
        </button>
      </div>

      <p className="text-[10px] text-gray-500 mb-2">
        {client?.name || "Unknown"} · {categoryLabel}
      </p>

      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-mono font-bold" style={{ color: isProfit ? "rgb(var(--color-profit))" : "#ff4466" }}>
          {task.status === "completed" || task.status === "lost"
            ? `${task.pnl >= 0 ? "+" : ""}$${task.pnl.toLocaleString()}`
            : `$${task.revenue.toLocaleString()}`}
        </span>
        {task.progress > 0 && task.status !== "lost" && (
          <span className="text-[10px] font-mono text-gray-400 flex items-center gap-1">
            <span
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{ background: progressColor }}
            />
            {task.progress}%
          </span>
        )}
        {task.status === "lost" && (
          <span className="text-[9px] font-semibold text-loss bg-loss/10 px-1.5 py-0.5 rounded">
            Lost
          </span>
        )}
      </div>

      {/* Progress bar */}
      {task.progress > 0 && task.status !== "lost" && (
        <div className="h-1 rounded-full bg-white/5 overflow-hidden mb-2">
          <motion.div
            className="h-full rounded-full"
            style={{ background: progressColor }}
            initial={{ width: 0 }}
            animate={{ width: `${task.progress}%` }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
        </div>
      )}

      <div className="flex items-center justify-between">
        <PriorityBadge priority={task.priority} />
        {task.dueDate && (
          <span className="text-[9px] text-gray-500 font-medium">
            Due{" "}
            {new Date(task.dueDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        )}
      </div>
    </motion.div>
  );
}

export default function MiniKanban({
  tasks,
  clients,
  categories,
  onDrop,
}: {
  tasks: Task[];
  clients: Client[];
  categories?: Category[];
  onDrop?: (taskId: string, newStatus: TaskStatus) => void;
}) {
  const clientMap = Object.fromEntries(clients.map((c) => [c.id, c]));
  const moveTask = useTaskStore((s) => s.moveTask);
  const compactView = useUIStore((s) => s.compactView);
  const [dragOverCol, setDragOverCol] = useState<TaskStatus | null>(null);

  const handleDrop = (taskId: string, newStatus: TaskStatus) => {
    if (onDrop) {
      onDrop(taskId, newStatus);
    } else {
      moveTask(taskId, newStatus);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="overflow-x-auto no-scrollbar"
    >
      <div className="flex gap-3 min-w-max pb-2 pl-2">
        {COLUMNS.map((col) => {
          const colTasks = tasks
            .filter((t) => t.status === col.status)
            .sort((a, b) => a.order - b.order)
            .slice(0, compactView ? 5 : 3);
          const isDragOver = dragOverCol === col.status;
          return (
            <div
              key={col.status}
              className={`${compactView ? "w-48" : "w-56"} shrink-0 rounded-xl transition-all ${
                isDragOver ? "ring-1 ring-profit/30 bg-profit/[0.02]" : ""
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverCol(col.status);
              }}
              onDragLeave={() => setDragOverCol(null)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOverCol(null);
                const taskId = e.dataTransfer.getData("taskId");
                if (taskId) handleDrop(taskId, col.status);
              }}
            >
              <div className="flex items-center gap-2 mb-3 px-1">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: col.dotColor }}
                />
                <span className="text-xs font-semibold text-gray-300">
                  {col.label}
                </span>
                <span className="text-[10px] text-gray-500 font-mono ml-auto">
                  {tasks.filter((t) => t.status === col.status).length}
                </span>
              </div>
              <div className={compactView ? "space-y-1" : "space-y-2"}>
                {colTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("taskId", task.id);
                    }}
                  >
                    <TaskCard
                      task={task}
                      client={clientMap[task.clientId]}
                      categories={categories}
                      compact={compactView}
                    />
                  </div>
                ))}
                {colTasks.length === 0 && (
                  <div className={`glass rounded-xl text-center text-[10px] text-gray-500 ${compactView ? "p-2" : "p-4"}`}>
                    No tasks
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

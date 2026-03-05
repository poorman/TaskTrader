import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bookmark,
  Clock,
  GripVertical,
  ChevronDown,
  Plus,
  X,
  CheckCircle2,
  Circle,
} from "lucide-react";
import type { Task, Client } from "../../types";
import { PriorityBadge } from "../shared/Badge";
import { useTaskStore } from "../../stores/taskStore";
import { useUIStore } from "../../stores/uiStore";

export default function TaskCard({
  task,
  client,
  dragControls,
  onEdit,
}: {
  task: Task;
  client?: Client;
  dragControls?: boolean;
  onEdit?: (task: Task) => void;
}) {
  const toggleBookmark = useTaskStore((s) => s.toggleBookmark);
  const addSubtask = useTaskStore((s) => s.addSubtask);
  const toggleSubtask = useTaskStore((s) => s.toggleSubtask);
  const deleteSubtask = useTaskStore((s) => s.deleteSubtask);
  const theme = useUIStore((s) => s.theme);

  const [expanded, setExpanded] = useState(false);
  const [newSubtask, setNewSubtask] = useState("");

  const isProfit = task.pnl >= 0;
  const subtasks = task.subtasks || [];
  const doneCount = subtasks.filter((s) => s.done).length;
  const profitColor = theme === "light" ? "#2dce89" : "#00ff88";
  const lossColor = "#ff4466";
  const neutralColor = theme === "light" ? "#2d3436" : "#e2e8f0";
  const progressColor =
    task.status === "lost"
      ? lossColor
      : task.progress >= 80
        ? profitColor
        : task.progress >= 50
          ? "#ffaa00"
          : "#3b82f6";

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!newSubtask.trim()) return;
    addSubtask(task.id, newSubtask.trim());
    setNewSubtask("");
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      onClick={() => onEdit?.(task)}
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
          style={{ color: task.status === "completed" || task.status === "lost" ? (isProfit ? profitColor : lossColor) : neutralColor }}
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
      {(task.progress > 0 || subtasks.length > 0) && task.status !== "lost" && (
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

      {/* Subtask summary + expand toggle */}
      {(subtasks.length > 0 || task.status === "in_progress" || task.status === "lead") && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
          onMouseDown={(e) => e.stopPropagation()}
          className="w-full flex items-center justify-between text-[10px] text-gray-400 hover:text-gray-200 transition-colors mb-2.5 cursor-pointer"
        >
          <span className="flex items-center gap-1">
            {subtasks.length > 0 ? (
              <>
                <CheckCircle2 size={10} className="text-profit" />
                {doneCount}/{subtasks.length} subtasks
              </>
            ) : (
              <>
                <Plus size={10} />
                Add subtasks
              </>
            )}
          </span>
          <ChevronDown
            size={10}
            className={`transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </button>
      )}

      {/* Expanded subtask list */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="space-y-1 mb-2">
              {subtasks.map((st) => (
                <div
                  key={st.id}
                  className="flex items-center gap-1.5 group/st"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSubtask(task.id, st.id);
                    }}
                    className="shrink-0"
                  >
                    {st.done ? (
                      <CheckCircle2
                        size={13}
                        className="text-profit"
                      />
                    ) : (
                      <Circle
                        size={13}
                        className="text-gray-500 hover:text-gray-300"
                      />
                    )}
                  </button>
                  <span
                    className={`text-[11px] flex-1 truncate ${
                      st.done
                        ? "text-gray-500 line-through"
                        : "text-gray-300"
                    }`}
                  >
                    {st.title}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSubtask(task.id, st.id);
                    }}
                    className="opacity-0 group-hover/st:opacity-100 transition-opacity shrink-0"
                  >
                    <X
                      size={10}
                      className="text-gray-500 hover:text-loss"
                    />
                  </button>
                </div>
              ))}
            </div>
            <form
              onSubmit={handleAddSubtask}
              className="flex gap-1 mb-2.5"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="text"
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                onMouseDown={(e) => e.stopPropagation()}
                placeholder="Add subtask..."
                className="flex-1 text-[11px] px-2 py-1 rounded-lg bg-white/[0.03] border border-glass-border text-white placeholder-gray-600 focus:outline-none focus:border-profit/30"
              />
              <button
                type="submit"
                className="text-profit hover:text-white transition-colors shrink-0"
              >
                <Plus size={14} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

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

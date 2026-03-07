import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  MoreHorizontal,
  ArrowUpDown,
  DollarSign,
  Clock,
  AlertTriangle,
  CalendarDays,
} from "lucide-react";
import type { Task, Client, Category, TaskStatus } from "../../types";
import { useTaskStore } from "../../stores/taskStore";
import { useUIStore } from "../../stores/uiStore";
import TaskCard from "./TaskCard";

type SortMode = "order" | "value" | "priority" | "hours" | "due";

const PRIORITY_ORDER: Record<string, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

interface Props {
  status: TaskStatus;
  label: string;
  dotColor: string;
  tasks: Task[];
  clients: Client[];
  categories?: Category[];
  onDrop: (taskId: string, newStatus: TaskStatus) => void;
  onEditTask?: (task: Task) => void;
}

export default function Column({
  status,
  label,
  dotColor,
  tasks,
  clients,
  categories,
  onDrop,
  onEditTask,
}: Props) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>("order");
  const menuRef = useRef<HTMLDivElement>(null);
  const reorderTasks = useTaskStore((s) => s.reorderTasks);
  const theme = useUIStore((s) => s.theme);

  const clientMap = Object.fromEntries(clients.map((c) => [c.id, c]));
  const total = tasks.reduce(
    (s, t) =>
      s +
      (t.status === "completed" || t.status === "lost" ? t.pnl : t.revenue),
    0
  );

  // Close menu on click outside
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const sortedTasks = [...tasks].sort((a, b) => {
    switch (sortMode) {
      case "value":
        return (b.revenue || 0) - (a.revenue || 0);
      case "priority":
        return (PRIORITY_ORDER[a.priority] ?? 9) - (PRIORITY_ORDER[b.priority] ?? 9);
      case "hours":
        return (a.estimatedHours || 0) - (b.estimatedHours || 0);
      case "due":
        return (a.dueDate || "z").localeCompare(b.dueDate || "z");
      default:
        return a.order - b.order;
    }
  });

  const handleSort = (mode: SortMode) => {
    setSortMode(mode);
    // Persist new order to store
    const sorted = [...tasks].sort((a, b) => {
      switch (mode) {
        case "value":
          return (b.revenue || 0) - (a.revenue || 0);
        case "priority":
          return (PRIORITY_ORDER[a.priority] ?? 9) - (PRIORITY_ORDER[b.priority] ?? 9);
        case "hours":
          return (a.estimatedHours || 0) - (b.estimatedHours || 0);
        case "due":
          return (a.dueDate || "z").localeCompare(b.dueDate || "z");
        default:
          return a.order - b.order;
      }
    });
    reorderTasks(status, sorted.map((t) => t.id));
    setMenuOpen(false);
  };

  const sortOptions: { mode: SortMode; label: string; icon: React.ReactNode }[] = [
    { mode: "order", label: "Default Order", icon: <ArrowUpDown size={12} /> },
    { mode: "value", label: "Highest Value", icon: <DollarSign size={12} /> },
    { mode: "priority", label: "Priority", icon: <AlertTriangle size={12} /> },
    { mode: "hours", label: "Est. Hours", icon: <Clock size={12} /> },
    { mode: "due", label: "Due Date", icon: <CalendarDays size={12} /> },
  ];

  return (
    <div
      className={`flex flex-col min-w-[250px] w-[250px] shrink-0 rounded-2xl transition-all ${
        isDragOver ? "ring-1 ring-profit/30 bg-profit/[0.02]" : ""
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        const taskId = e.dataTransfer.getData("taskId");
        if (taskId) onDrop(taskId, status);
      }}
    >
      {/* Column header */}
      <div className="glass rounded-xl px-3 py-2.5 mb-3">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ background: dotColor }}
          />
          <span className="text-xs font-semibold text-gray-200 flex-1">
            {label}
          </span>
          <span className="text-[10px] font-mono text-gray-500">
            {tasks.length}
          </span>
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`p-0.5 transition-colors ${
                menuOpen ? "text-white" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <MoreHorizontal size={14} />
            </button>
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-7 z-50 w-44 rounded-xl border border-glass-border overflow-hidden"
                style={theme === "dark"
                  ? { background: "rgba(13,18,30,0.97)", backdropFilter: "blur(20px)" }
                  : { background: "rgb(224,229,236)", boxShadow: "6px 6px 12px #b8bec7, -6px -6px 12px #ffffff" }
                }
              >
                <div className="px-3 py-2 border-b border-glass-border">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                    Sort By
                  </span>
                </div>
                {sortOptions.map((opt) => (
                  <button
                    key={opt.mode}
                    onClick={() => handleSort(opt.mode)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-[11px] transition-colors ${
                      sortMode === opt.mode
                        ? "text-white bg-white/[0.06]"
                        : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
                    }`}
                  >
                    <span className="text-gray-500">{opt.icon}</span>
                    {opt.label}
                    {sortMode === opt.mode && (
                      <span className="ml-auto text-[9px] text-profit font-bold">✓</span>
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        </div>
        {/* Total value */}
        <span
          className="text-xs font-mono font-bold mt-1 block"
          style={{ color: total >= 0 ? dotColor : "#ff4466" }}
        >
          {total >= 0 ? "+" : ""}${total.toLocaleString()}
        </span>
      </div>

      {/* Cards */}
      <div className="flex-1 space-y-3 px-4 pt-2 pb-2 overflow-y-auto no-scrollbar max-h-[calc(100vh-300px)]">
        <AnimatePresence mode="popLayout">
          {sortedTasks.map((task) => (
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
                dragControls
                onEdit={onEditTask}
              />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

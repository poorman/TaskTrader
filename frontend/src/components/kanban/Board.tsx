import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useTaskStore } from "../../stores/taskStore";
import { useUIStore } from "../../stores/uiStore";
import { useGamificationStore } from "../../stores/gamificationStore";
import { calculateWinRate, filterTasksByTimeRange } from "../../utils/calculations";
import type { Task, TaskStatus } from "../../types";
import Column from "./Column";
import Modal from "../shared/Modal";
import TaskEditModal from "./TaskEditModal";

const COLUMNS: { status: TaskStatus; label: string; dotColor: string }[] = [
  { status: "lead", label: "Lead", dotColor: "#e6960a" },
  { status: "in_progress", label: "In Progress", dotColor: "#2dce89" },
  { status: "waiting", label: "Waiting on Client", dotColor: "#64748b" },
  { status: "completed", label: "Completed", dotColor: "#22c55e" },
  { status: "lost", label: "Lost", dotColor: "#ff4466" },
];

export default function Board() {
  const allTasks = useTaskStore((s) => s.tasks);
  const clients = useTaskStore((s) => s.clients);
  const categories = useTaskStore((s) => s.categories);
  const searchQuery = useUIStore((s) => s.searchQuery);
  const timeRange = useUIStore((s) => s.timeRange);

  const tasks = useMemo(() => {
    let filtered = filterTasksByTimeRange(allTasks, timeRange);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((t) =>
        t.title.toLowerCase().includes(q) ||
        clients.find((c) => c.id === t.clientId)?.name.toLowerCase().includes(q) ||
        t.projectType.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [allTasks, clients, searchQuery, timeRange]);
  const moveTask = useTaskStore((s) => s.moveTask);
  const completeTask = useTaskStore((s) => s.completeTask);
  const onTaskCompleted = useGamificationStore((s) => s.onTaskCompleted);
  const onTaskReopened = useGamificationStore((s) => s.onTaskReopened);
  const checkAchievements = useGamificationStore((s) => s.checkAchievements);
  const gamification = useGamificationStore();

  const [completionModal, setCompletionModal] = useState<{
    taskId: string;
    title: string;
    estimatedHours: number;
    actualHours: number;
    hourlyRate: number;
    revenue: number;
  } | null>(null);
  const [inputHours, setInputHours] = useState(0);
  const [inputRate, setInputRate] = useState(0);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const handleDrop = (taskId: string, newStatus: TaskStatus) => {
    if (newStatus === "completed") {
      const task = allTasks.find((t) => t.id === taskId);
      if (!task) return;
      setCompletionModal({
        taskId,
        title: task.title,
        estimatedHours: task.estimatedHours,
        actualHours: task.actualHours,
        hourlyRate: task.hourlyRate,
        revenue: task.revenue,
      });
      setInputHours(task.actualHours > 0 ? task.actualHours : 0);
      setInputRate(task.hourlyRate);
    } else {
      // If moving FROM completed/lost back to active, reverse gamification
      const task = allTasks.find((t) => t.id === taskId);
      if (task && (task.status === "completed" || task.status === "lost")) {
        onTaskReopened();
      }
      moveTask(taskId, newStatus);
    }
  };

  const handleComplete = () => {
    if (!completionModal) return;
    completeTask(completionModal.taskId, inputHours, inputRate);

    // Trigger gamification
    const pnl = completionModal.revenue - inputHours * inputRate;
    onTaskCompleted({
      pnl,
      status: "completed",
      estimatedHours: completionModal.estimatedHours,
      actualHours: inputHours,
      revenue: completionModal.revenue,
    });

    // Check achievements
    const completed = allTasks.filter((t) => t.status === "completed");
    const totalRevenue = completed.reduce((s, t) => s + t.revenue, 0) +
      completionModal.revenue;
    checkAchievements({
      totalCompleted: completed.length + 1,
      totalRevenue,
      winRate: calculateWinRate([
        ...allTasks,
        { pnl, status: "completed" } as never,
      ]),
      streak: gamification.streak,
      fastestRatio:
        inputHours / completionModal.estimatedHours,
    });

    setCompletionModal(null);
  };

  const previewPnL = completionModal
    ? completionModal.revenue - inputHours * inputRate
    : 0;

  const activeTasks = tasks.filter((t) => t.status === "in_progress" || t.status === "lead" || t.status === "waiting");
  const completedTasks = tasks.filter((t) => t.status === "completed");
  const pipeline = activeTasks.reduce((s, t) => s + t.revenue, 0);
  const realized = completedTasks.reduce((s, t) => s + t.pnl, 0);

  return (
    <>
      {/* Board header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-4 px-1 pt-1"
      >
        <div className="flex items-center gap-4">
          <div className="glass rounded-xl px-4 py-2 flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Pipeline</span>
            <span className="text-sm font-mono font-bold" style={{ color: "#e6960a" }}>${pipeline.toLocaleString()}</span>
          </div>
          <div className="glass rounded-xl px-4 py-2 flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Realized</span>
            <span className={`text-sm font-mono font-bold ${realized >= 0 ? "text-profit" : "text-loss"}`}>
              {realized >= 0 ? "+" : ""}${realized.toLocaleString()}
            </span>
          </div>
          <div className="glass rounded-xl px-4 py-2 flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Active</span>
            <span className="text-sm font-mono font-bold text-accent-blue">{activeTasks.length}</span>
          </div>
        </div>
      </motion.div>
      <div className="flex gap-4 overflow-x-auto no-scrollbar pt-2 pb-4 pl-3 h-full">
        {COLUMNS.map((col) => (
          <Column
            key={col.status}
            status={col.status}
            label={col.label}
            dotColor={col.dotColor}
            tasks={tasks.filter((t) => t.status === col.status)}
            clients={clients}
            categories={categories}
            onDrop={handleDrop}
            onEditTask={setEditingTask}
          />
        ))}
      </div>

      {/* Completion Modal */}
      <Modal
        open={!!completionModal}
        onClose={() => setCompletionModal(null)}
        title="Close Position"
      >
        {completionModal && (
          <div className="space-y-4">
            <p className="text-sm text-gray-300">
              Completing: <span className="font-semibold text-white">{completionModal.title}</span>
            </p>

            <div className="grid grid-cols-3 gap-3">
              <div className="glass rounded-xl p-3">
                <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Revenue</p>
                <p className="text-lg font-mono font-bold text-profit">
                  ${completionModal.revenue.toLocaleString()}
                </p>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 block">
                  Actual Hours
                </label>
                <input
                  type="number"
                  value={inputHours}
                  onChange={(e) => setInputHours(Number(e.target.value))}
                  min={0}
                  step={0.5}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-glass-border text-white text-lg font-mono font-bold focus:outline-none focus:border-profit/30"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 block">
                  Cost ($/hr)
                </label>
                <input
                  type="number"
                  value={inputRate}
                  onChange={(e) => setInputRate(Number(e.target.value))}
                  min={0}
                  step={1}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-glass-border text-white text-lg font-mono font-bold focus:outline-none focus:border-profit/30"
                />
              </div>
            </div>

            {/* P&L Preview */}
            <div
              className="glass rounded-xl p-4 text-center"
              style={{
                borderColor: previewPnL >= 0 ? "rgba(0,255,136,0.2)" : "rgba(255,68,102,0.2)",
                boxShadow: `0 0 20px ${previewPnL >= 0 ? "rgba(0,255,136,0.08)" : "rgba(255,68,102,0.08)"}`,
              }}
            >
              <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
                Realized P&L
              </p>
              <p
                className="text-2xl font-mono font-bold"
                style={{ color: previewPnL >= 0 ? "rgb(var(--color-profit))" : "#ff4466" }}
              >
                {previewPnL >= 0 ? "+" : ""}${previewPnL.toLocaleString()}
              </p>
              <p className="text-[10px] text-gray-500 mt-1">
                ${completionModal.revenue.toLocaleString()} − ({inputHours}h × ${inputRate}/hr)
              </p>
            </div>

            <button
              onClick={handleComplete}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-profit to-accent-cyan text-surface-0 font-display font-bold text-sm transition-all hover:shadow-lg hover:shadow-profit/20"
            >
              Close Position
            </button>
          </div>
        )}
      </Modal>

      {/* Edit Task Modal */}
      <TaskEditModal
        task={editingTask}
        onClose={() => setEditingTask(null)}
      />
    </>
  );
}

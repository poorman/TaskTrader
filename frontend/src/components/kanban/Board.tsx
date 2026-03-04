import { useState } from "react";
import { useTaskStore } from "../../stores/taskStore";
import { useGamificationStore } from "../../stores/gamificationStore";
import { calculateWinRate } from "../../utils/calculations";
import type { TaskStatus } from "../../types";
import Column from "./Column";
import Modal from "../shared/Modal";

const COLUMNS: { status: TaskStatus; label: string; dotColor: string }[] = [
  { status: "lead", label: "Lead", dotColor: "#ffaa00" },
  { status: "in_progress", label: "In Progress", dotColor: "#00ff88" },
  { status: "waiting", label: "Waiting on Client", dotColor: "#64748b" },
  { status: "completed", label: "Completed", dotColor: "#22c55e" },
  { status: "lost", label: "Lost", dotColor: "#ff4466" },
];

export default function Board() {
  const tasks = useTaskStore((s) => s.tasks);
  const clients = useTaskStore((s) => s.clients);
  const moveTask = useTaskStore((s) => s.moveTask);
  const completeTask = useTaskStore((s) => s.completeTask);
  const onTaskCompleted = useGamificationStore((s) => s.onTaskCompleted);
  const checkAchievements = useGamificationStore((s) => s.checkAchievements);
  const gamification = useGamificationStore();

  const [completionModal, setCompletionModal] = useState<{
    taskId: string;
    title: string;
    estimatedHours: number;
    actualHours: number;
    hourlyRate: number;
  } | null>(null);
  const [inputHours, setInputHours] = useState(0);

  const handleDrop = (taskId: string, newStatus: TaskStatus) => {
    if (newStatus === "completed") {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;
      setCompletionModal({
        taskId,
        title: task.title,
        estimatedHours: task.estimatedHours,
        actualHours: task.actualHours,
        hourlyRate: task.hourlyRate,
      });
      setInputHours(task.actualHours > 0 ? task.actualHours : 0);
    } else {
      moveTask(taskId, newStatus);
    }
  };

  const handleComplete = () => {
    if (!completionModal) return;
    completeTask(completionModal.taskId, inputHours);

    // Trigger gamification
    const pnl = (completionModal.estimatedHours - inputHours) * completionModal.hourlyRate;
    onTaskCompleted({
      pnl,
      status: "completed",
      estimatedHours: completionModal.estimatedHours,
      actualHours: inputHours,
      revenue: completionModal.estimatedHours * completionModal.hourlyRate,
    });

    // Check achievements
    const completed = tasks.filter((t) => t.status === "completed");
    const totalRevenue = completed.reduce((s, t) => s + t.revenue, 0) +
      completionModal.estimatedHours * completionModal.hourlyRate;
    checkAchievements({
      totalCompleted: completed.length + 1,
      totalRevenue,
      winRate: calculateWinRate([
        ...tasks,
        { pnl, status: "completed" } as never,
      ]),
      streak: gamification.streak,
      fastestRatio:
        inputHours / completionModal.estimatedHours,
    });

    setCompletionModal(null);
  };

  const previewPnL = completionModal
    ? (completionModal.estimatedHours - inputHours) * completionModal.hourlyRate
    : 0;

  return (
    <>
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 h-full">
        {COLUMNS.map((col) => (
          <Column
            key={col.status}
            status={col.status}
            label={col.label}
            dotColor={col.dotColor}
            tasks={tasks.filter((t) => t.status === col.status)}
            clients={clients}
            onDrop={handleDrop}
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

            <div className="grid grid-cols-2 gap-3">
              <div className="glass rounded-xl p-3">
                <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Estimated</p>
                <p className="text-lg font-mono font-bold text-gray-300">
                  {completionModal.estimatedHours}h
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
                  min={0.5}
                  step={0.5}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-glass-border text-white text-lg font-mono font-bold focus:outline-none focus:border-profit/30"
                  autoFocus
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
                style={{ color: previewPnL >= 0 ? "#00ff88" : "#ff4466" }}
              >
                {previewPnL >= 0 ? "+" : ""}${previewPnL.toLocaleString()}
              </p>
              <p className="text-[10px] text-gray-500 mt-1">
                ({completionModal.estimatedHours} - {inputHours}) × ${completionModal.hourlyRate}/hr
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
    </>
  );
}

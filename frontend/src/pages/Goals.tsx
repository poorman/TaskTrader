import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Target, Trash2 } from "lucide-react";
import { useTaskStore } from "../stores/taskStore";

export default function Goals() {
  const goals = useTaskStore((s) => s.goals);
  const tasks = useTaskStore((s) => s.tasks);
  const addGoal = useTaskStore((s) => s.addGoal);
  const deleteGoal = useTaskStore((s) => s.deleteGoal);

  const [title, setTitle] = useState("");
  const [target, setTarget] = useState(5000);
  const [deadline, setDeadline] = useState("");
  const [showForm, setShowForm] = useState(false);

  const totalRevenue = tasks
    .filter((t) => t.status === "completed")
    .reduce((s, t) => s + t.revenue, 0);

  const handleAdd = () => {
    if (!title.trim() || !deadline) return;
    addGoal({ title: title.trim(), targetRevenue: target, deadline });
    setTitle("");
    setTarget(5000);
    setDeadline("");
    setShowForm(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold flex items-center gap-2">
          <Target size={18} className="text-accent-amber" />
          Revenue Goals
        </h2>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-accent-amber to-accent-purple text-white font-semibold text-xs"
        >
          <Plus size={14} />
          New Goal
        </motion.button>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="glass rounded-2xl p-5 overflow-hidden"
          >
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1 block">Goal Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Q1 Revenue Target"
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-glass-border text-white text-sm focus:outline-none focus:border-profit/30" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1 block">Target ($)</label>
                  <input type="number" value={target} onChange={(e) => setTarget(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-glass-border text-white text-sm focus:outline-none focus:border-profit/30" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1 block">Deadline</label>
                  <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-glass-border text-white text-sm focus:outline-none focus:border-profit/30" />
                </div>
              </div>
              <motion.button whileTap={{ scale: 0.98 }} onClick={handleAdd}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-accent-amber to-accent-purple text-white font-semibold text-sm">
                Set Goal
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Goals list */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {goals.map((g, i) => {
            const pct = Math.min(
              (totalRevenue / g.targetRevenue) * 100,
              100
            );
            const daysLeft = Math.max(
              0,
              Math.ceil(
                (new Date(g.deadline).getTime() - Date.now()) / 86400000
              )
            );
            const isComplete = pct >= 100;
            const color = isComplete
              ? "#00ff88"
              : pct >= 70
                ? "#ffaa00"
                : "#3b82f6";

            return (
              <motion.div
                key={g.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: i * 0.08 }}
                className="glass rounded-2xl p-5 group relative"
                style={{
                  boxShadow: isComplete
                    ? "0 0 20px rgba(0,255,136,0.1)"
                    : undefined,
                }}
              >
                <button
                  onClick={() => deleteGoal(g.id)}
                  className="absolute top-3 right-3 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-loss/10 text-gray-500 hover:text-loss transition-all"
                >
                  <Trash2 size={12} />
                </button>

                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-display font-semibold text-sm">
                    {isComplete ? "🏆 " : ""}
                    {g.title}
                  </h3>
                  <span className="text-[10px] text-gray-500">
                    {daysLeft}d left
                  </span>
                </div>

                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-lg font-mono font-bold" style={{ color }}>
                    ${totalRevenue.toLocaleString()}
                  </span>
                  <span className="text-xs text-gray-500">
                    / ${g.targetRevenue.toLocaleString()}
                  </span>
                  <span
                    className="text-xs font-mono font-bold ml-auto"
                    style={{ color }}
                  >
                    {pct.toFixed(0)}%
                  </span>
                </div>

                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {goals.length === 0 && (
          <div className="glass rounded-2xl p-8 text-center">
            <Target size={32} className="mx-auto text-gray-600 mb-3" />
            <p className="text-sm text-gray-400">No goals set yet</p>
            <p className="text-[11px] text-gray-500 mt-1">
              Set revenue targets to track your progress
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

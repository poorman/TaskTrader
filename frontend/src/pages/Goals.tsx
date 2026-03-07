import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Target, Trash2, Edit3, Check, X } from "lucide-react";
import { useTaskStore } from "../stores/taskStore";
import { useUIStore } from "../stores/uiStore";

export default function Goals() {
  const goals = useTaskStore((s) => s.goals);
  const tasks = useTaskStore((s) => s.tasks);
  const addGoal = useTaskStore((s) => s.addGoal);
  const updateGoal = useTaskStore((s) => s.updateGoal);
  const deleteGoal = useTaskStore((s) => s.deleteGoal);

  const [title, setTitle] = useState("");
  const [target, setTarget] = useState(5000);
  const [deadline, setDeadline] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editTarget, setEditTarget] = useState(0);
  const [editDeadline, setEditDeadline] = useState("");
  const theme = useUIStore((s) => s.theme);
  const isLight = theme === "light";
  const profitHex = isLight ? "#2dce89" : "#00ff88";

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

  const handleStartEdit = (g: typeof goals[0]) => {
    setEditingId(g.id);
    setEditTitle(g.title);
    setEditTarget(g.targetRevenue);
    setEditDeadline(g.deadline);
  };

  const handleSaveEdit = () => {
    if (!editingId || !editTitle.trim()) return;
    updateGoal(editingId, { title: editTitle.trim(), targetRevenue: editTarget, deadline: editDeadline });
    setEditingId(null);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold flex items-center gap-2">
          <Target size={18} className="text-profit" />
          Revenue Goals
        </h2>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-profit to-accent-cyan text-surface-0 font-semibold text-xs"
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
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-profit to-accent-cyan text-surface-0 font-semibold text-sm">
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
            const color = profitHex;

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
                {/* Action buttons on hover */}
                <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {editingId !== g.id && (
                    <button
                      onClick={() => handleStartEdit(g)}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all"
                    >
                      <Edit3 size={12} />
                    </button>
                  )}
                  <button
                    onClick={() => deleteGoal(g.id)}
                    className="p-1.5 rounded-lg hover:bg-loss/10 text-gray-500 hover:text-loss transition-all"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>

                {editingId === g.id ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-glass-border text-white text-sm font-semibold focus:outline-none focus:border-profit/30"
                      autoFocus
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <div className="relative">
                        <input
                          type="number"
                          value={editTarget}
                          onChange={(e) => setEditTarget(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-glass-border text-white text-sm focus:outline-none focus:border-profit/30"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-gray-500">target $</span>
                      </div>
                      <input
                        type="date"
                        value={editDeadline}
                        onChange={(e) => setEditDeadline(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-glass-border text-white text-sm focus:outline-none focus:border-profit/30"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveEdit}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-profit/20 text-profit text-xs font-semibold hover:bg-profit/30 transition-colors"
                      >
                        <Check size={12} /> Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 text-xs hover:text-white transition-colors"
                      >
                        <X size={12} /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
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
                  </>
                )}

                <div
                  className={`h-2 rounded-full overflow-hidden ${editingId === g.id ? "mt-4" : ""}`}
                  style={isLight ? {
                    background: "rgb(218 223 230)",
                    boxShadow: "inset 2px 2px 4px #b8bec7, inset -2px -2px 4px #ffffff",
                  } : {
                    background: "rgba(255,255,255,0.05)",
                  }}
                >
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background: color,
                      boxShadow: isLight ? `0 0 6px ${color}60` : undefined,
                    }}
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

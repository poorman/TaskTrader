import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2 } from "lucide-react";
import type { Task, ProjectType, Priority } from "../../types";
import { useTaskStore } from "../../stores/taskStore";

interface Props {
  task: Task | null;
  onClose: () => void;
}

export default function TaskEditModal({ task, onClose }: Props) {
  const clients = useTaskStore((s) => s.clients);
  const categories = useTaskStore((s) => s.categories);
  const updateTask = useTaskStore((s) => s.updateTask);
  const deleteTask = useTaskStore((s) => s.deleteTask);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [clientId, setClientId] = useState("");
  const [projectType, setProjectType] = useState<ProjectType>("web_design");
  const [priority, setPriority] = useState<Priority>("medium");
  const [estHours, setEstHours] = useState(0);
  const [estMinutes, setEstMinutes] = useState(0);
  const estimatedHours = estHours + estMinutes / 60;
  const [hourlyRate, setHourlyRate] = useState(0);
  const [dueDate, setDueDate] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pricingMode, setPricingMode] = useState<"hourly" | "fixed">("hourly");
  const [fixedPrice, setFixedPrice] = useState(0);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setClientId(task.clientId);
      setProjectType(task.projectType);
      setPriority(task.priority);
      setEstHours(Math.floor(task.estimatedHours));
      setEstMinutes(Math.round((task.estimatedHours % 1) * 60));
      setHourlyRate(task.hourlyRate);
      setDueDate(task.dueDate || "");
      setConfirmDelete(false);

      // Use stored pricingMode, fall back to heuristic for legacy tasks
      if (task.pricingMode) {
        setPricingMode(task.pricingMode);
      } else {
        const computedRevenue = task.estimatedHours * task.hourlyRate;
        setPricingMode(Math.abs(task.revenue - computedRevenue) > 0.01 ? "fixed" : "hourly");
      }
      setFixedPrice(task.revenue);
    }
  }, [task]);

  if (!task) return null;

  const revenue =
    pricingMode === "fixed" ? fixedPrice : estimatedHours * hourlyRate;
  const effectiveRate =
    pricingMode === "fixed" && estimatedHours > 0
      ? fixedPrice / estimatedHours
      : hourlyRate;
  const isTerminal = task.status === "completed" || task.status === "lost";

  const handleSave = () => {
    if (!title.trim()) return;
    updateTask(task.id, {
      title: title.trim(),
      description: description.trim() || undefined,
      clientId,
      projectType,
      priority,
      estimatedHours,
      hourlyRate: effectiveRate,
      dueDate: dueDate || undefined,
      revenue,
      pricingMode,
    });
    onClose();
  };

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    deleteTask(task.id);
    onClose();
  };

  const inputClass =
    "w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-glass-border text-white text-sm placeholder-gray-500 focus:outline-none focus:border-profit/30 transition-colors";
  const labelClass =
    "text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1 block";

  return (
    <AnimatePresence>
      {task && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg glass rounded-2xl border border-glass-border overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-glass-border">
              <h3 className="font-display text-sm font-semibold text-white">
                Edit Position
              </h3>
              <button
                onClick={onClose}
                className="p-1 text-gray-500 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="px-5 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Title */}
              <div>
                <label className={labelClass}>Task Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={inputClass}
                  disabled={isTerminal}
                />
              </div>

              {/* Description */}
              <div>
                <label className={labelClass}>Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className={`${inputClass} resize-none`}
                  disabled={isTerminal}
                />
              </div>

              {/* Client + Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Client</label>
                  <select
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className={inputClass}
                    disabled={isTerminal}
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id} className="bg-surface-2">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Project Type / Category</label>
                  <select
                    value={projectType}
                    onChange={(e) =>
                      setProjectType(e.target.value as ProjectType)
                    }
                    className={inputClass}
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id} className="bg-surface-2">
                        {cat.name}
                      </option>
                    ))}
                    <option value="other" className="bg-surface-2">Other</option>
                  </select>
                </div>
              </div>

              {/* Priority + Due */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className={inputClass}
                    disabled={isTerminal}
                  >
                    <option value="low" className="bg-surface-2">Low</option>
                    <option value="medium" className="bg-surface-2">Medium</option>
                    <option value="high" className="bg-surface-2">High</option>
                    <option value="urgent" className="bg-surface-2">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className={inputClass}
                    disabled={isTerminal}
                  />
                </div>
              </div>

              {/* Pricing Mode Toggle */}
              {!isTerminal && (
                <div>
                  <label className={labelClass}>Pricing</label>
                  <div className="flex gap-1 glass rounded-xl p-1 w-fit">
                    <button
                      type="button"
                      onClick={() => setPricingMode("hourly")}
                      className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all ${
                        pricingMode === "hourly"
                          ? "bg-white/10 text-white"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      Hourly Rate
                    </button>
                    <button
                      type="button"
                      onClick={() => setPricingMode("fixed")}
                      className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all ${
                        pricingMode === "fixed"
                          ? "bg-white/10 text-white"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      Fixed Price
                    </button>
                  </div>
                </div>
              )}

              {/* Hours + Rate/Price */}
              {pricingMode === "hourly" ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Est. Time</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="number"
                          value={estHours}
                          onChange={(e) => setEstHours(Math.max(0, Number(e.target.value)))}
                          min={0}
                          className={inputClass}
                          disabled={isTerminal}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-500">hr</span>
                      </div>
                      <div className="relative flex-1">
                        <input
                          type="number"
                          value={estMinutes}
                          onChange={(e) => setEstMinutes(Math.max(0, Math.min(59, Number(e.target.value))))}
                          min={0}
                          max={59}
                          step={5}
                          className={inputClass}
                          disabled={isTerminal}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-500">min</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Hourly Rate ($)</label>
                    <input
                      type="number"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(Number(e.target.value))}
                      min={0}
                      className={inputClass}
                      disabled={isTerminal}
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Fixed Price ($)</label>
                    <input
                      type="number"
                      value={fixedPrice}
                      onChange={(e) => setFixedPrice(Number(e.target.value))}
                      min={1}
                      className={inputClass}
                      disabled={isTerminal}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Est. Time</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="number"
                          value={estHours}
                          onChange={(e) => setEstHours(Math.max(0, Number(e.target.value)))}
                          min={0}
                          className={inputClass}
                          disabled={isTerminal}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-500">hr</span>
                      </div>
                      <div className="relative flex-1">
                        <input
                          type="number"
                          value={estMinutes}
                          onChange={(e) => setEstMinutes(Math.max(0, Math.min(59, Number(e.target.value))))}
                          min={0}
                          max={59}
                          step={5}
                          className={inputClass}
                          disabled={isTerminal}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-500">min</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Revenue preview */}
              <div className="glass rounded-xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                    Revenue
                  </span>
                  {pricingMode === "fixed" && estimatedHours > 0 && (
                    <span className="text-[9px] text-gray-500 ml-2">
                      (${effectiveRate.toFixed(0)}/hr effective)
                    </span>
                  )}
                </div>
                <span className="text-lg font-mono font-bold text-profit">
                  ${revenue.toLocaleString()}
                </span>
              </div>

              {/* Task info (read-only) */}
              <div className="flex gap-4 text-[10px] text-gray-500">
                <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                {task.startedAt && (
                  <span>Started: {new Date(task.startedAt).toLocaleDateString()}</span>
                )}
                {task.completedAt && (
                  <span>Closed: {new Date(task.completedAt).toLocaleDateString()}</span>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-5 py-4 border-t border-glass-border">
              <button
                onClick={handleDelete}
                className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
                  confirmDelete
                    ? "bg-loss/20 text-loss"
                    : "text-gray-500 hover:text-loss hover:bg-loss/10"
                }`}
              >
                <Trash2 size={12} />
                {confirmDelete ? "Confirm Delete" : "Delete"}
              </button>
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-1.5 text-xs font-medium text-gray-400 hover:text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-1.5 text-xs font-bold rounded-lg bg-gradient-to-r from-profit to-accent-cyan text-surface-0 transition-all hover:shadow-lg hover:shadow-profit/20"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

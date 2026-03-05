import { useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useTaskStore } from "../stores/taskStore";
import { useUIStore } from "../stores/uiStore";
import type { ProjectType, Priority, TaskStatus } from "../types";
import { tomorrowLocal } from "../utils/timezone";

export default function NewTask() {
  const clients = useTaskStore((s) => s.clients);
  const categories = useTaskStore((s) => s.categories);
  const addTask = useTaskStore((s) => s.addTask);
  const setPage = useUIStore((s) => s.setPage);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [clientId, setClientId] = useState(clients[0]?.id || "");
  const [projectType, setProjectType] = useState<ProjectType>("web_design");
  const [priority, setPriority] = useState<Priority>("medium");
  const [estHours, setEstHours] = useState(8);
  const [estMinutes, setEstMinutes] = useState(0);
  const estimatedHours = estHours + estMinutes / 60;
  const [hourlyRate, setHourlyRate] = useState(
    clients.find((c) => c.id === clientId)?.defaultHourlyRate || 75
  );
  const [dueDate, setDueDate] = useState(tomorrowLocal());
  const [status, setStatus] = useState<TaskStatus>("lead");
  const [pricingMode, setPricingMode] = useState<"hourly" | "fixed">("hourly");
  const [fixedPrice, setFixedPrice] = useState(0);

  const revenue =
    pricingMode === "fixed" ? fixedPrice : estimatedHours * hourlyRate;
  const effectiveRate =
    pricingMode === "fixed" && estimatedHours > 0
      ? fixedPrice / estimatedHours
      : hourlyRate;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !clientId) return;
    addTask({
      title: title.trim(),
      description: description.trim() || undefined,
      clientId,
      projectType,
      status,
      priority,
      estimatedHours,
      hourlyRate: effectiveRate,
      dueDate: dueDate || undefined,
      pricingMode,
      ...(pricingMode === "fixed" ? { revenue: fixedPrice } : {}),
    });
    setPage("taskboard");
  };

  const inputClass =
    "w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-glass-border text-white text-sm placeholder-gray-500 focus:outline-none focus:border-profit/30 transition-colors";
  const labelClass =
    "text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5 block";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <div className="glass rounded-2xl p-4 sm:p-6">
        <h2 className="font-display text-lg font-semibold mb-6">
          Open New Position
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className={labelClass}>Task Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Website Redesign"
              className={inputClass}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className={labelClass}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional details..."
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* Row: Client + Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className={labelClass}>Client (Ticker)</label>
              <select
                value={clientId}
                onChange={(e) => {
                  setClientId(e.target.value);
                  const c = clients.find((c) => c.id === e.target.value);
                  if (c) setHourlyRate(c.defaultHourlyRate);
                }}
                className={inputClass}
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
                onChange={(e) => setProjectType(e.target.value as ProjectType)}
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

          {/* Row: Priority + Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className={labelClass}>Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className={inputClass}
              >
                <option value="low" className="bg-surface-2">Low</option>
                <option value="medium" className="bg-surface-2">Medium</option>
                <option value="high" className="bg-surface-2">High</option>
                <option value="urgent" className="bg-surface-2">Urgent</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Initial Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className={inputClass}
              >
                <option value="lead" className="bg-surface-2">Lead</option>
                <option value="in_progress" className="bg-surface-2">In Progress</option>
              </select>
            </div>
          </div>

          {/* Pricing Mode Toggle */}
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

          {/* Row: Hours + Rate/Price + Due */}
          {pricingMode === "hourly" ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
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
                  min={1}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <label className={labelClass}>Fixed Price ($)</label>
                <input
                  type="number"
                  value={fixedPrice}
                  onChange={(e) => setFixedPrice(Number(e.target.value))}
                  min={1}
                  className={inputClass}
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
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-500">min</span>
                  </div>
                </div>
              </div>
              <div>
                <label className={labelClass}>Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          )}

          {/* Revenue preview */}
          <div className="glass rounded-xl p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-400 font-medium">
                Estimated Revenue
              </span>
              {pricingMode === "fixed" && estimatedHours > 0 && (
                <span className="text-[10px] text-gray-500 ml-2">
                  (${effectiveRate.toFixed(0)}/hr effective)
                </span>
              )}
            </div>
            <span className="text-xl font-mono font-bold text-profit">
              ${revenue.toLocaleString()}
            </span>
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-profit to-accent-cyan text-surface-0 font-display font-bold text-sm flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-profit/20"
          >
            <Plus size={16} />
            Open Position
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
}

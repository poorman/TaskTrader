import { useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useTaskStore } from "../stores/taskStore";
import { useUIStore } from "../stores/uiStore";
import type { ProjectType, Priority, TaskStatus } from "../types";

export default function NewTask() {
  const clients = useTaskStore((s) => s.clients);
  const addTask = useTaskStore((s) => s.addTask);
  const setPage = useUIStore((s) => s.setPage);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [clientId, setClientId] = useState(clients[0]?.id || "");
  const [projectType, setProjectType] = useState<ProjectType>("web_design");
  const [priority, setPriority] = useState<Priority>("medium");
  const [estimatedHours, setEstimatedHours] = useState(8);
  const [hourlyRate, setHourlyRate] = useState(
    clients.find((c) => c.id === clientId)?.defaultHourlyRate || 75
  );
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState<TaskStatus>("lead");

  const revenue = estimatedHours * hourlyRate;

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
      hourlyRate,
      dueDate: dueDate || undefined,
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
      <div className="glass rounded-2xl p-6">
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
          <div className="grid grid-cols-2 gap-4">
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
              <label className={labelClass}>Project Type</label>
              <select
                value={projectType}
                onChange={(e) => setProjectType(e.target.value as ProjectType)}
                className={inputClass}
              >
                <option value="web_design" className="bg-surface-2">Web Design</option>
                <option value="printing" className="bg-surface-2">Printing</option>
                <option value="branding" className="bg-surface-2">Branding</option>
                <option value="consulting" className="bg-surface-2">Consulting</option>
                <option value="other" className="bg-surface-2">Other</option>
              </select>
            </div>
          </div>

          {/* Row: Priority + Status */}
          <div className="grid grid-cols-2 gap-4">
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

          {/* Row: Hours + Rate + Due */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Est. Hours</label>
              <input
                type="number"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(Number(e.target.value))}
                min={0.5}
                step={0.5}
                className={inputClass}
              />
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

          {/* Revenue preview */}
          <div className="glass rounded-xl p-4 flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">
              Estimated Revenue
            </span>
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

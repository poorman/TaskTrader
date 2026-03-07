import { motion } from "framer-motion";
import type { Task, Category } from "../../types";
import { revenueByType } from "../../utils/calculations";

const TYPE_COLORS: Record<string, string> = {
  "Web design": "#3b82f6",
  "Printing": "#22c55e",
  "Branding": "#a855f7",
  "Consulting": "#ffaa00",
  "Other": "#06b6d4",
};

export default function RevenueBreakdown({ tasks, categories }: { tasks: Task[]; categories?: Category[] }) {
  const data = revenueByType(tasks, categories);
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35 }}
      className="glass rounded-2xl p-3 sm:p-5"
    >
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
        Revenue Breakdown
      </h3>
      <div className="space-y-3">
        {data.map((d, i) => {
          const pct = total > 0 ? (d.value / total) * 100 : 0;
          const cat = categories?.find((c) => c.name === d.name);
          const color = cat?.color || TYPE_COLORS[d.name] || "#64748b";
          return (
            <div key={d.name}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-300">{d.name}</span>
                <span
                  className="text-xs font-mono font-bold"
                  style={{ color }}
                >
                  ${d.value.toLocaleString()}
                </span>
              </div>
              <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, delay: 0.4 + i * 0.1 }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

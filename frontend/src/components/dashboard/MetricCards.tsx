import { motion } from "framer-motion";
import AnimatedNumber from "../shared/AnimatedNumber";
import { useUIStore } from "../../stores/uiStore";

interface MetricData {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  color: string;
  icon: React.ReactNode;
}

export default function MetricCards({ metrics }: { metrics: MetricData[] }) {
  const compactView = useUIStore((s) => s.compactView);
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
      {metrics.map((m, i) => (
        <motion.div
          key={m.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
          className={`metric-card glass card-shine relative overflow-hidden group ${
            compactView ? "rounded-xl p-2 sm:p-2.5" : "rounded-2xl p-3 sm:p-4"
          }`}
        >
          {!compactView && (
            <div
              className="absolute -top-8 -right-8 w-20 h-20 rounded-full blur-2xl opacity-15 group-hover:opacity-25 transition-opacity pointer-events-none"
              style={{ background: m.color }}
            />
          )}
          <p className={`font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5 ${
            compactView ? "text-[9px] mb-1" : "text-[10px] mb-2"
          }`}>
            <span className="metric-icon" style={{ color: m.color }}>{m.icon}</span>
            {m.label}
          </p>
          <AnimatedNumber
            value={Math.abs(m.value)}
            prefix={m.value < 0 ? `-${m.prefix ?? "$"}` : (m.prefix ?? "$")}
            suffix={m.suffix ?? ""}
            className={`font-display font-bold ${compactView ? "text-base" : "text-xl"}`}
            decimals={m.suffix === "%" ? 0 : 0}
          />
        </motion.div>
      ))}
    </div>
  );
}

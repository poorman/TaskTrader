import { motion } from "framer-motion";
import AnimatedNumber from "../shared/AnimatedNumber";

interface MetricData {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  color: string;
  icon: string;
}

export default function MetricCards({ metrics }: { metrics: MetricData[] }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {metrics.map((m, i) => (
        <motion.div
          key={m.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
          className="glass rounded-2xl p-4 card-shine relative overflow-hidden group"
          style={{
            boxShadow: `0 0 20px ${m.color}10, 0 0 40px ${m.color}05`,
          }}
        >
          <div
            className="absolute -top-8 -right-8 w-20 h-20 rounded-full blur-2xl opacity-15 group-hover:opacity-25 transition-opacity pointer-events-none"
            style={{ background: m.color }}
          />
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1">
            <span>{m.icon}</span>
            {m.label}
          </p>
          <AnimatedNumber
            value={Math.abs(m.value)}
            prefix={m.value < 0 ? `-${m.prefix ?? "$"}` : (m.prefix ?? "$")}
            suffix={m.suffix ?? ""}
            className="text-xl font-display font-bold"
            decimals={m.suffix === "%" ? 0 : 0}
          />
        </motion.div>
      ))}
    </div>
  );
}

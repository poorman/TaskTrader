import { motion } from "framer-motion";
import AnimatedNumber from "../shared/AnimatedNumber";

interface Props {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  color: string;
  glowClass: string;
  icon?: string;
  delay?: number;
  subValues?: { label: string; value: string; color?: string }[];
}

export default function HeroCard({
  label,
  value,
  prefix = "$",
  suffix = "",
  color,
  glowClass,
  icon,
  delay = 0,
  subValues,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`glass rounded-2xl p-5 card-shine relative overflow-hidden ${glowClass}`}
    >
      {/* Ambient glow */}
      <div
        className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ background: color }}
      />

      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1 flex items-center gap-1.5">
        {icon && <span className="text-sm">{icon}</span>}
        {label}
      </p>
      <div className="flex items-baseline gap-1" style={{ color }}>
        <AnimatedNumber
          value={value}
          prefix={value >= 0 ? prefix : `-${prefix}`}
          suffix={suffix}
          className="text-3xl font-display font-bold"
        />
      </div>

      {subValues && (
        <div className="mt-3 flex items-center gap-3 text-[11px] text-gray-400">
          {subValues.map((sv) => (
            <span key={sv.label} className="flex items-center gap-1">
              <span>{sv.label}:</span>
              <span
                className="font-mono font-semibold"
                style={{ color: sv.color }}
              >
                {sv.value}
              </span>
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}

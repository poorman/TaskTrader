import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { motion } from "framer-motion";
import type { DailySnapshot } from "../../types";
import { useUIStore } from "../../stores/uiStore";

interface Props {
  data: DailySnapshot[];
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: DailySnapshot }>;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const theme = useUIStore.getState().theme;
  return (
    <div
      className="glass rounded-xl px-4 py-3 text-xs space-y-1"
      style={
        theme === "dark"
          ? { background: "rgba(17,24,39,0.95)", border: "1px solid rgba(255,255,255,0.1)" }
          : {}
      }
    >
      <p className="text-gray-300 font-semibold">
        {new Date(d.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })}
      </p>
      <p className="text-profit font-mono">
        {d.tasksCompleted} Tasks Completed: $
        {d.revenue.toLocaleString()}
      </p>
      {d.tasksLost > 0 && (
        <p className="text-loss font-mono">
          {d.tasksLost} Task Lost: -${Math.abs(d.pnl).toLocaleString()}
        </p>
      )}
    </div>
  );
}

export default function EquityCurve({ data }: Props) {
  const theme = useUIStore((s) => s.theme);
  const dotStroke = theme === "dark" ? "#060a13" : "#e0e5ec";
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass rounded-2xl p-5"
    >
      <div className="h-[180px] sm:h-[220px] md:h-[240px] relative">
        {data.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">
            Complete tasks to see your equity curve
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="pnlGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00ff88" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#00ff88" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffaa00" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#ffaa00" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={theme === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.06)"}
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fill: "#64748b", fontSize: 10, fontFamily: "Manrope" }}
              tickFormatter={(v: string) =>
                new Date(v).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#64748b", fontSize: 10, fontFamily: "Fira Code" }}
              tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
              axisLine={false}
              tickLine={false}
              width={50}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#ffaa00"
              strokeWidth={2}
              fill="url(#revGrad)"
              dot={false}
              activeDot={{ r: 4, fill: "#ffaa00", stroke: dotStroke, strokeWidth: 2 }}
            />
            <Area
              type="monotone"
              dataKey="pnl"
              stroke="#00ff88"
              strokeWidth={2}
              fill="url(#pnlGrad)"
              dot={false}
              activeDot={{ r: 4, fill: "#00ff88", stroke: dotStroke, strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

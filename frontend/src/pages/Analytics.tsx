import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, DollarSign, BarChart3, Clock, ChevronDown } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { useTaskStore } from "../stores/taskStore";
import { useUIStore } from "../stores/uiStore";
import {
  calculateRealizedPnL,
  revenueByType,
  buildDailySnapshots,
} from "../utils/calculations";
import AnimatedNumber from "../components/shared/AnimatedNumber";

const COLORS = ["#3b82f6", "#22c55e", "#a855f7", "#ffaa00", "#06b6d4"];

const TOOLTIP_DARK = { background: "rgba(17,24,39,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 11 };
const TOOLTIP_LIGHT = { background: "rgb(224,229,236)", border: "none", borderRadius: 12, fontSize: 11, boxShadow: "3px 3px 6px #b8bec7, -3px -3px 6px #ffffff", color: "#2d3436" };
const GRID_DARK = "rgba(255,255,255,0.04)";
const GRID_LIGHT = "rgba(0,0,0,0.06)";

export default function Analytics() {
  const tasks = useTaskStore((s) => s.tasks);
  const clients = useTaskStore((s) => s.clients);
  const categories = useTaskStore((s) => s.categories);
  const theme = useUIStore((s) => s.theme);
  const tooltipStyle = theme === "dark" ? TOOLTIP_DARK : TOOLTIP_LIGHT;
  const gridStroke = theme === "dark" ? GRID_DARK : GRID_LIGHT;
  const profitColor = theme === "light" ? "#2dce89" : "#00ff88";

  const stats = useMemo(() => {
    const completed = tasks.filter((t) => t.status === "completed");
    const lost = tasks.filter((t) => t.status === "lost");
    const realized = calculateRealizedPnL(tasks);
    const typeData = revenueByType(tasks, categories);
    const dailySnapshots = buildDailySnapshots(tasks);

    // Build cumulative snapshots — only completed task PnL (exclude lost)
    let cumRevenue = 0;
    const snapshots = dailySnapshots.map((s) => {
      cumRevenue += s.pnl; // pnl only includes completed tasks
      return { ...s, cumRevenue };
    });

    // P&L by client
    const clientPnL = clients
      .map((c) => {
        const clientTasks = completed.filter((t) => t.clientId === c.id);
        return {
          name: c.name,
          pnl: clientTasks.reduce((s, t) => s + t.pnl, 0),
          revenue: clientTasks.reduce((s, t) => s + t.revenue, 0),
          color: c.color,
        };
      })
      .filter((c) => c.revenue > 0)
      .sort((a, b) => b.pnl - a.pnl);

    // Win/loss: wins = completed with pnl >= 0, losses = completed with pnl < 0 + lost tasks
    const wins = completed.filter((t) => t.pnl >= 0).length;
    const losses = completed.filter((t) => t.pnl < 0).length + lost.length;
    const totalClosed = wins + losses;
    const actualWinRate = totalClosed > 0 ? Math.round((wins / totalClosed) * 100) : 0;

    // Avg trade duration
    const durations = completed
      .filter((t) => t.startedAt && t.completedAt)
      .map(
        (t) =>
          (new Date(t.completedAt!).getTime() -
            new Date(t.startedAt!).getTime()) /
          86400000
      );
    const avgDuration =
      durations.length > 0
        ? durations.reduce((a, b) => a + b, 0) / durations.length
        : 0;

    // Build task lists for win/loss detail
    const winTasks = completed.filter((t) => t.pnl >= 0);
    const lossTasks = [...completed.filter((t) => t.pnl < 0), ...lost];

    return {
      winRate: actualWinRate,
      realized,
      typeData,
      snapshots,
      clientPnL,
      wins,
      losses,
      totalCompleted: completed.length,
      avgDuration,
      winTasks,
      lossTasks,
    };
  }, [tasks, clients, categories]);

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto">
      {/* Quick stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
        {[
          { label: "Win Rate", value: stats.winRate, prefix: "", suffix: "%", color: "#ffaa00", icon: <Target size={14} /> },
          { label: "Realized P&L", value: stats.realized, prefix: "$", suffix: "", color: "rgb(var(--color-profit))", icon: <DollarSign size={14} /> },
          { label: "Total Trades", value: stats.totalCompleted, prefix: "", suffix: "", color: "#3b82f6", icon: <BarChart3 size={14} /> },
          { label: "Avg Duration", value: stats.avgDuration, prefix: "", suffix: "d", color: "#a855f7", icon: <Clock size={14} /> },
        ].map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass rounded-2xl p-4 card-shine"
          >
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
              {m.icon} {m.label}
            </p>
            <AnimatedNumber
              value={m.value}
              prefix={m.prefix ?? "$"}
              suffix={m.suffix ?? ""}
              decimals={m.suffix === "d" ? 1 : 0}
              className="text-xl font-display font-bold"
            />
          </motion.div>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Revenue over time */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-5"
        >
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
            Revenue Over Time
          </h3>
          <div className="h-[180px] sm:h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.snapshots}>
                <defs>
                  <linearGradient id="revGradA" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false}
                  tickFormatter={(v: string) => new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })} />
                <YAxis tick={{ fill: "#64748b", fontSize: 10, fontFamily: "Fira Code" }} axisLine={false} tickLine={false}
                  tickFormatter={(v: number) => `$${v.toLocaleString()}`} width={60} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="cumRevenue" stroke="#3b82f6" strokeWidth={2} fill="url(#revGradA)" dot={false} name="Revenue" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* P&L by client */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-5"
        >
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
            P&L by Client
          </h3>
          <div className="h-[180px] sm:h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.clientPnL} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} horizontal={false} />
                <XAxis type="number" tick={{ fill: "#64748b", fontSize: 10, fontFamily: "Fira Code" }} axisLine={false} tickLine={false}
                  tickFormatter={(v: number) => `$${v}`} />
                <YAxis type="category" dataKey="name" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} width={100} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="pnl" radius={[0, 6, 6, 0]}>
                  {stats.clientPnL.map((entry, i) => (
                    <Cell key={i} fill={entry.pnl >= 0 ? profitColor : "#ff4466"} fillOpacity={0.7} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Win Rate pie + detail */}
        <WinLossWidget
          theme={theme}
          profitColor={profitColor}
          tooltipStyle={tooltipStyle}
          winRate={stats.winRate}
          wins={stats.wins}
          losses={stats.losses}
          winTasks={stats.winTasks}
          lossTasks={stats.lossTasks}
          clients={clients}
        />

        {/* Revenue by type */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass rounded-2xl p-5"
        >
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
            Revenue by Type
          </h3>
          <div className="h-[180px] sm:h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.typeData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 10, fontFamily: "Fira Code" }} axisLine={false} tickLine={false}
                  tickFormatter={(v: number) => `$${v.toLocaleString()}`} width={60} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {stats.typeData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.7} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

import type { Task, Client } from "../types";

function WinLossWidget({
  theme, profitColor, tooltipStyle, winRate, wins, losses, winTasks, lossTasks, clients,
}: {
  theme: string; profitColor: string; tooltipStyle: Record<string, unknown>;
  winRate: number; wins: number; losses: number;
  winTasks: Task[]; lossTasks: Task[]; clients: Client[];
}) {
  const [expanded, setExpanded] = useState(false);
  const clientName = (id: string) => clients.find((c) => c.id === id)?.name || "Unknown";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="glass rounded-2xl p-5"
    >
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
        Win / Loss Ratio
      </h3>
      <div className="h-[180px] sm:h-[220px] flex items-center justify-center relative">
        {theme === "light" ? (
          <NeuCircularGauge value={winRate} wins={wins} losses={losses} />
        ) : (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: "Wins", value: Math.max(wins, 0) },
                    { name: "Losses", value: Math.max(losses, 0) },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={wins > 0 && losses > 0 ? 4 : 0}
                  dataKey="value"
                  strokeWidth={0}
                >
                  <Cell fill={profitColor} />
                  <Cell fill="#ff4466" />
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center">
              <p className="text-2xl font-display font-bold text-white">
                {winRate}%
              </p>
              <p className="text-[10px] text-gray-400">Win Rate</p>
              <p className="text-[9px] text-gray-500 mt-0.5">{wins}W / {losses}L</p>
            </div>
          </>
        )}
      </div>
      {/* Expandable detail */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-center gap-1 text-[10px] text-gray-400 hover:text-gray-200 transition-colors mt-2 cursor-pointer"
      >
        <span>{expanded ? "Hide" : "Show"} details</span>
        <ChevronDown size={10} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-3">
              {winTasks.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-profit mb-1.5">
                    Wins ({winTasks.length})
                  </p>
                  <div className="space-y-1">
                    {winTasks.map((t) => (
                      <div key={t.id} className="flex items-center justify-between text-[11px]">
                        <span className="text-gray-300 truncate flex-1 mr-2">{t.title}</span>
                        <span className="text-[10px] text-gray-500 mr-2">{clientName(t.clientId)}</span>
                        <span className="font-mono text-profit shrink-0">+${t.pnl.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {lossTasks.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-loss mb-1.5">
                    Losses ({lossTasks.length})
                  </p>
                  <div className="space-y-1">
                    {lossTasks.map((t) => (
                      <div key={t.id} className="flex items-center justify-between text-[11px]">
                        <span className="text-gray-300 truncate flex-1 mr-2">{t.title}</span>
                        <span className="text-[10px] text-gray-500 mr-2">{clientName(t.clientId)}</span>
                        <span className="font-mono text-loss shrink-0">
                          {t.status === "lost" ? `-$${t.revenue.toLocaleString()}` : `-$${Math.abs(t.pnl).toLocaleString()}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/** Neumorphic circular gauge for light mode — matches Figma reference */
function NeuCircularGauge({ value, wins, losses }: { value: number; wins: number; losses: number }) {
  const size = 180;
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (value / 100) * circumference;
  const center = size / 2;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Neumorphic inset track */}
      <svg width={size} height={size} className="absolute" style={{ filter: "drop-shadow(2px 2px 4px #b8bec7) drop-shadow(-2px -2px 4px #ffffff)" }}>
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgb(218,223,230)"
          strokeWidth={stroke}
        />
      </svg>
      {/* Gradient progress arc */}
      <svg width={size} height={size} className="absolute" style={{ transform: "rotate(-90deg)" }}>
        <defs>
          <linearGradient id="neuGaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2dce89" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="url(#neuGaugeGrad)"
          strokeWidth={stroke}
          strokeDasharray={`${progress} ${circumference - progress}`}
          strokeLinecap="round"
        />
      </svg>
      {/* Center text */}
      <div className="relative text-center z-10">
        <p className="text-2xl font-display font-bold" style={{ color: "#2d3436" }}>
          {value}%
        </p>
        <p className="text-[10px]" style={{ color: "#7f8c8d" }}>Win Rate</p>
        <p className="text-[9px] mt-0.5" style={{ color: "#95a5a6" }}>
          {wins}W / {losses}L
        </p>
      </div>
    </div>
  );
}

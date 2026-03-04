import { useMemo } from "react";
import { motion } from "framer-motion";
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
import {
  calculateWinRate,
  calculateRealizedPnL,
  revenueByType,
  buildDailySnapshots,
} from "../utils/calculations";
import AnimatedNumber from "../components/shared/AnimatedNumber";

const COLORS = ["#3b82f6", "#22c55e", "#a855f7", "#ffaa00", "#06b6d4"];

export default function Analytics() {
  const tasks = useTaskStore((s) => s.tasks);
  const clients = useTaskStore((s) => s.clients);

  const stats = useMemo(() => {
    const completed = tasks.filter((t) => t.status === "completed");
    const winRate = calculateWinRate(tasks);
    const realized = calculateRealizedPnL(tasks);
    const typeData = revenueByType(tasks);
    const snapshots = buildDailySnapshots(tasks);

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

    // Win/loss data for pie
    const wins = completed.filter((t) => t.pnl >= 0).length;
    const losses = completed.filter((t) => t.pnl < 0).length;

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

    return {
      winRate,
      realized,
      typeData,
      snapshots,
      clientPnL,
      wins,
      losses,
      totalCompleted: completed.length,
      avgDuration,
    };
  }, [tasks, clients]);

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto">
      {/* Quick stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Win Rate", value: stats.winRate, suffix: "%", color: "#ffaa00", icon: "🎯" },
          { label: "Realized P&L", value: stats.realized, prefix: "$", color: "#00ff88", icon: "💰" },
          { label: "Total Trades", value: stats.totalCompleted, prefix: "", color: "#3b82f6", icon: "📊" },
          { label: "Avg Duration", value: stats.avgDuration, suffix: "d", color: "#a855f7", icon: "⏱" },
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
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.snapshots}>
                <defs>
                  <linearGradient id="revGradA" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false}
                  tickFormatter={(v: string) => new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })} />
                <YAxis tick={{ fill: "#64748b", fontSize: 10, fontFamily: "Fira Code" }} axisLine={false} tickLine={false}
                  tickFormatter={(v: number) => `$${v.toLocaleString()}`} width={60} />
                <Tooltip contentStyle={{ background: "rgba(17,24,39,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 11 }} />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fill="url(#revGradA)" dot={false} />
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
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.clientPnL} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                <XAxis type="number" tick={{ fill: "#64748b", fontSize: 10, fontFamily: "Fira Code" }} axisLine={false} tickLine={false}
                  tickFormatter={(v: number) => `$${v}`} />
                <YAxis type="category" dataKey="name" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} width={100} />
                <Tooltip contentStyle={{ background: "rgba(17,24,39,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 11 }} />
                <Bar dataKey="pnl" radius={[0, 6, 6, 0]}>
                  {stats.clientPnL.map((entry, i) => (
                    <Cell key={i} fill={entry.pnl >= 0 ? "#00ff88" : "#ff4466"} fillOpacity={0.7} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Win Rate pie */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-2xl p-5"
        >
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
            Win / Loss Ratio
          </h3>
          <div className="h-[220px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: "Wins", value: stats.wins },
                    { name: "Losses", value: stats.losses },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  strokeWidth={0}
                >
                  <Cell fill="#00ff88" />
                  <Cell fill="#ff4466" />
                </Pie>
                <Tooltip contentStyle={{ background: "rgba(17,24,39,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center">
              <p className="text-2xl font-display font-bold text-white">
                {stats.winRate}%
              </p>
              <p className="text-[10px] text-gray-400">Win Rate</p>
            </div>
          </div>
        </motion.div>

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
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.typeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 10, fontFamily: "Fira Code" }} axisLine={false} tickLine={false}
                  tickFormatter={(v: number) => `$${v.toLocaleString()}`} width={60} />
                <Tooltip contentStyle={{ background: "rgba(17,24,39,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 11 }} />
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

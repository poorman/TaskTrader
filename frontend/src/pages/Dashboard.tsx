import { useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, DollarSign, TrendingDown, Target, Clock } from "lucide-react";
import { useTaskStore } from "../stores/taskStore";
import { useUIStore } from "../stores/uiStore";

import {
  calculateRealizedPnL,
  calculateOpenProfit,
  calculateLostRevenue,
  calculateWinRate,
  buildDailySnapshots,
  formatCurrencyFull,
  filterTasksByTimeRange,
} from "../utils/calculations";
import { toLocalDate } from "../utils/timezone";
import EquityCurve from "../components/dashboard/EquityCurve";
import MetricCards from "../components/dashboard/MetricCards";
import MiniKanban from "../components/dashboard/MiniKanban";
import RevenueBreakdown from "../components/dashboard/RevenueBreakdown";
import TickerTape from "../components/dashboard/TickerTape";
import AnimatedNumber from "../components/shared/AnimatedNumber";

export default function Dashboard() {
  const allTasks = useTaskStore((s) => s.tasks);
  const clients = useTaskStore((s) => s.clients);
  const categories = useTaskStore((s) => s.categories);
  const theme = useUIStore((s) => s.theme);
  const timeRange = useUIStore((s) => s.timeRange);
  const isLight = theme === "light";
  const profitColor = "rgb(var(--color-profit))";
  const lossColor = "#ff4466";

  const tasks = useMemo(() => filterTasksByTimeRange(allTasks, timeRange), [allTasks, timeRange]);

  const stats = useMemo(() => {
    const realized = calculateRealizedPnL(tasks);
    const open = calculateOpenProfit(tasks);
    const lost = calculateLostRevenue(tasks);
    const winRate = calculateWinRate(tasks);
    const totalPnL = realized + open;
    const todayStr = toLocalDate(new Date().toISOString());
    const completedToday = tasks.filter(
      (t) =>
        t.status === "completed" &&
        t.completedAt && toLocalDate(t.completedAt) === todayStr
    );
    const todayPnL = completedToday.reduce((s, t) => s + t.pnl, 0);
    const snapshots = buildDailySnapshots(tasks);

    // Avg hourly rate from completed tasks
    const completedAll = tasks.filter((t) => t.status === "completed");
    const totalHours = completedAll.reduce((s, t) => s + (t.actualHours || 0), 0);
    const totalRevenue = completedAll.reduce((s, t) => s + t.revenue, 0);
    const avgHourlyRate = totalHours > 0 ? totalRevenue / totalHours : 0;

    // Projected month close
    const avgDailyRevenue =
      completedAll.length > 0
        ? completedAll.reduce((s, t) => s + t.revenue, 0) / 30
        : 0;
    const daysLeft =
      new Date(
        new Date().getFullYear(),
        new Date().getMonth() + 1,
        0
      ).getDate() - new Date().getDate();
    const projected =
      completedAll.reduce((s, t) => s + t.revenue, 0) +
      avgDailyRevenue * daysLeft;

    return {
      realized,
      open,
      lost,
      winRate,
      totalPnL,
      todayPnL,
      snapshots,
      projected,
      avgHourlyRate,
    };
  }, [tasks]);

  const metricData = [
    {
      label: "Pipeline",
      value: stats.open,
      color: profitColor,
      icon: <TrendingUp size={14} />,
    },
    {
      label: "Realized Profit",
      value: stats.realized,
      color: "#3b82f6",
      icon: <DollarSign size={14} />,
    },
    {
      label: "Lost Revenue",
      value: stats.lost,
      prefix: "$",
      color: "#ff4466",
      icon: <TrendingDown size={14} />,
    },
    {
      label: "Win Rate",
      value: stats.winRate,
      prefix: "",
      suffix: "%",
      color: "#ffaa00",
      icon: <Target size={14} />,
    },
    {
      label: "Avg Hourly Rate",
      value: stats.avgHourlyRate,
      prefix: "$",
      suffix: "/hr",
      color: "#a855f7",
      icon: <Clock size={14} />,
    },
  ];

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto">
      {/* Hero: P&L + Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-stretch gap-3 sm:gap-4"
      >
        {/* Left: Total P&L */}
        <div
          className="glass rounded-2xl p-4 sm:p-5 flex flex-col justify-center sm:w-[22%] sm:shrink-0 relative overflow-hidden"
        >
          {!isLight && (
            <div
              className="absolute -top-16 -right-16 w-40 h-40 rounded-full blur-[60px] opacity-10 pointer-events-none"
              style={{
                background: stats.realized >= 0
                  ? "linear-gradient(135deg, rgb(var(--color-profit)), #06b6d4)"
                  : "linear-gradient(135deg, #ff4466, #a855f7)",
              }}
            />
          )}
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
            Total Realized P&L
          </p>
          <div
            className="text-xl sm:text-2xl font-display font-bold"
            style={{ color: stats.realized >= 0 ? profitColor : lossColor }}
          >
            <AnimatedNumber
              value={stats.realized}
              prefix={stats.realized >= 0 ? "+$" : "-$"}
              className=""
            />
          </div>
        </div>

        {/* Right: 3 stat cards */}
        <div className="flex-1 grid grid-cols-3 gap-2 sm:gap-3">
          {[
            { label: "Realized", value: formatCurrencyFull(stats.realized), color: isLight ? "#2dce89" : profitColor },
            { label: "Pipeline", value: `$${stats.open.toLocaleString()}`, color: "#3b82f6" },
            { label: "Lost", value: `-$${stats.lost.toLocaleString()}`, color: lossColor },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="rounded-2xl p-3 sm:p-4 flex flex-col justify-center min-w-0 overflow-hidden"
              style={isLight ? {
                background: "linear-gradient(145deg, #e8edf4, #dde2e9)",
                boxShadow: "6px 6px 12px #b8bec7, -6px -6px 12px #ffffff",
              } : {
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                boxShadow: `0 0 20px ${item.color}08`,
              }}
            >
              <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1 truncate">
                {item.label}
              </p>
              <p
                className="text-sm sm:text-lg font-mono font-bold truncate"
                style={{ color: item.color }}
              >
                {item.value}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Equity Curve */}
      <EquityCurve data={stats.snapshots} />

      {/* Metric Cards */}
      <MetricCards metrics={metricData} />

      {/* Mini Kanban (full width) */}
      <MiniKanban tasks={tasks} clients={clients} categories={categories} />

      {/* Revenue Breakdown */}
      <RevenueBreakdown tasks={tasks} categories={categories} />

      {/* Ticker Tape */}
      <TickerTape tasks={tasks} clients={clients} />

      {/* Footer stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 glass rounded-2xl p-3 sm:p-4"
      >
        <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
          <div className="text-xs text-gray-400">
            Realized P&L:{" "}
            <span className="font-mono font-bold text-profit">
              {formatCurrencyFull(stats.realized)}
            </span>
          </div>
          <div className="text-xs text-gray-400">
            Pipeline:{" "}
            <span className="font-mono font-bold text-accent-blue">
              ${stats.open.toLocaleString()}
            </span>
          </div>
        </div>
        <div className="text-xs text-gray-400">
          Projected:{" "}
          <span className="font-mono font-bold text-white text-sm sm:text-base ml-1">
            ${Math.round(stats.projected).toLocaleString()}
          </span>
        </div>
      </motion.div>
    </div>
  );
}

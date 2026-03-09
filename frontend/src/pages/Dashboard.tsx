import { useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, DollarSign, TrendingDown, Target, Clock } from "lucide-react";
import { useTaskStore } from "../stores/taskStore";
import { useUIStore } from "../stores/uiStore";

import {
  calculateRealizedPnL,
  calculateOpenProfit,
  calculateLostRevenue,
  calculatePotentialRevenue,
  calculateWinRate,
  buildDailySnapshots,
  formatCurrencyFull,
  filterTasksByTimeRange,
} from "../utils/calculations";
import { toLocalDate } from "../utils/timezone";
import EquityCurve from "../components/dashboard/EquityCurve";
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
    const potential = calculatePotentialRevenue(tasks);
    const winRate = calculateWinRate(tasks);
    const todayStr = toLocalDate(new Date().toISOString());
    const completedToday = tasks.filter(
      (t) =>
        t.status === "completed" &&
        t.completedAt && toLocalDate(t.completedAt) === todayStr
    );
    const todayPnL = completedToday.reduce((s, t) => s + t.pnl, 0);
    const snapshots = buildDailySnapshots(tasks);

    // Avg hourly rate from ALL completed tasks (not time-filtered)
    const allCompleted = allTasks.filter((t) => t.status === "completed");
    const totalHours = allCompleted.reduce((s, t) => s + (t.actualHours || 0), 0);
    const totalRevenue = allCompleted.reduce((s, t) => s + t.revenue, 0);
    const avgHourlyRate = totalHours > 0 ? totalRevenue / totalHours : 0;

    // Projected month close (from all completed, not filtered)
    const avgDailyRevenue =
      allCompleted.length > 0
        ? allCompleted.reduce((s, t) => s + t.revenue, 0) / 30
        : 0;
    const daysLeft =
      new Date(
        new Date().getFullYear(),
        new Date().getMonth() + 1,
        0
      ).getDate() - new Date().getDate();
    const projected =
      allCompleted.reduce((s, t) => s + t.revenue, 0) +
      avgDailyRevenue * daysLeft;

    const lostCount = tasks.filter((t) => t.status === "lost").length;

    return {
      realized,
      open,
      lost,
      potential,
      winRate,
      todayPnL,
      snapshots,
      projected,
      avgHourlyRate,
      lostCount,
    };
  }, [tasks, allTasks]);

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto">
      {/* 5 Hero Cards */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3"
      >
        {/* 1. Realized P&L — with today's P&L subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass rounded-2xl p-3 sm:p-4 card-shine relative overflow-hidden col-span-2 sm:col-span-1"
        >
          {!isLight && (
            <div
              className="absolute -top-8 -right-8 w-20 h-20 rounded-full blur-2xl opacity-15 pointer-events-none"
              style={{ background: stats.realized >= 0 ? profitColor : lossColor }}
            />
          )}
          <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1 flex items-center gap-1.5">
            <span style={{ color: profitColor }}><DollarSign size={14} /></span>
            Realized P&L
          </p>
          <div
            className="text-lg sm:text-xl font-display font-bold"
            style={{ color: stats.realized >= 0 ? profitColor : lossColor }}
          >
            <AnimatedNumber
              value={stats.realized}
              prefix={stats.realized >= 0 ? "+$" : "-$"}
              className=""
            />
          </div>
          {stats.todayPnL !== 0 && (
            <p className="text-[9px] text-gray-500 mt-0.5 font-mono">
              Today: <span style={{ color: stats.todayPnL >= 0 ? profitColor : lossColor }}>
                {stats.todayPnL >= 0 ? "+" : ""}${stats.todayPnL.toLocaleString()}
              </span>
            </p>
          )}
        </motion.div>

        {/* 2. Pipeline — with projected subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-3 sm:p-4 card-shine relative overflow-hidden"
        >
          {!isLight && (
            <div className="absolute -top-8 -right-8 w-20 h-20 rounded-full blur-2xl opacity-15 pointer-events-none" style={{ background: "#3b82f6" }} />
          )}
          <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1 flex items-center gap-1.5">
            <span style={{ color: "#3b82f6" }}><TrendingUp size={14} /></span>
            Pipeline
          </p>
          <p className="text-lg sm:text-xl font-display font-bold" style={{ color: "#3b82f6" }}>
            ${stats.open.toLocaleString()}
          </p>
          <p className="text-[9px] text-gray-500 mt-0.5 font-mono">
            Projected: <span className="text-gray-300">${Math.round(stats.projected).toLocaleString()}</span>
          </p>
        </motion.div>

        {/* 3. Potential — with win rate subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass rounded-2xl p-3 sm:p-4 card-shine relative overflow-hidden"
        >
          {!isLight && (
            <div className="absolute -top-8 -right-8 w-20 h-20 rounded-full blur-2xl opacity-15 pointer-events-none" style={{ background: "#a855f7" }} />
          )}
          <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1 flex items-center gap-1.5">
            <span style={{ color: "#a855f7" }}><Target size={14} /></span>
            Potential
          </p>
          <p className="text-lg sm:text-xl font-display font-bold" style={{ color: "#a855f7" }}>
            ${stats.potential.toLocaleString()}
          </p>
          <p className="text-[9px] text-gray-500 mt-0.5 font-mono">
            Win rate: <span style={{ color: "#ffaa00" }}>{stats.winRate}%</span>
          </p>
        </motion.div>

        {/* 4. Lost Revenue — with count subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-3 sm:p-4 card-shine relative overflow-hidden"
        >
          {!isLight && (
            <div className="absolute -top-8 -right-8 w-20 h-20 rounded-full blur-2xl opacity-15 pointer-events-none" style={{ background: lossColor }} />
          )}
          <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1 flex items-center gap-1.5">
            <span style={{ color: lossColor }}><TrendingDown size={14} /></span>
            Lost
          </p>
          <p className="text-lg sm:text-xl font-display font-bold" style={{ color: lossColor }}>
            -${stats.lost.toLocaleString()}
          </p>
          <p className="text-[9px] text-gray-500 mt-0.5 font-mono">
            {stats.lostCount} task{stats.lostCount !== 1 ? "s" : ""} lost
          </p>
        </motion.div>

        {/* 5. Avg Hourly Rate — from all completed tasks */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass rounded-2xl p-3 sm:p-4 card-shine relative overflow-hidden"
        >
          {!isLight && (
            <div className="absolute -top-8 -right-8 w-20 h-20 rounded-full blur-2xl opacity-15 pointer-events-none" style={{ background: "#ffaa00" }} />
          )}
          <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1 flex items-center gap-1.5">
            <span style={{ color: "#ffaa00" }}><Clock size={14} /></span>
            Avg Rate
          </p>
          <p className="text-lg sm:text-xl font-display font-bold" style={{ color: "#ffaa00" }}>
            ${Math.round(stats.avgHourlyRate)}/hr
          </p>
          <p className="text-[9px] text-gray-500 mt-0.5 font-mono">
            All time
          </p>
        </motion.div>
      </motion.div>

      {/* Equity Curve */}
      <EquityCurve data={stats.snapshots} />

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

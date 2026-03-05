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
} from "../utils/calculations";
import { toLocalDate } from "../utils/timezone";
import EquityCurve from "../components/dashboard/EquityCurve";
import MetricCards from "../components/dashboard/MetricCards";
import MiniKanban from "../components/dashboard/MiniKanban";
import RevenueBreakdown from "../components/dashboard/RevenueBreakdown";
import TickerTape from "../components/dashboard/TickerTape";
import AnimatedNumber from "../components/shared/AnimatedNumber";

export default function Dashboard() {
  const tasks = useTaskStore((s) => s.tasks);
  const clients = useTaskStore((s) => s.clients);
  const theme = useUIStore((s) => s.theme);
  const profitColor = theme === "light" ? "#2dce89" : "#00ff88";
  const lossColor = "#ff4466";

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
      {/* Hero: Total P&L Today */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6 relative overflow-hidden"
      >
        <div
          className="absolute -top-20 -right-20 w-60 h-60 rounded-full blur-[80px] opacity-10 pointer-events-none"
          style={{
            background:
              stats.totalPnL >= 0
                ? "linear-gradient(135deg, #00ff88, #06b6d4)"
                : "linear-gradient(135deg, #ff4466, #a855f7)",
          }}
        />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
              Total Realized P&L
            </p>
            <div
              className="text-2xl sm:text-4xl font-display font-bold"
              style={{ color: stats.realized >= 0 ? profitColor : lossColor }}
            >
              <AnimatedNumber
                value={stats.realized}
                prefix={stats.realized >= 0 ? "+$" : "-$"}
                className=""
              />
            </div>
          </div>
          <div className="text-right space-y-1">
            <p className="text-[11px] text-gray-400">
              Realized:{" "}
              <span className="font-mono text-profit font-semibold">
                {formatCurrencyFull(stats.realized)}
              </span>
            </p>
            <p className="text-[11px] text-gray-400">
              Pipeline:{" "}
              <span className="font-mono text-accent-blue font-semibold">
                ${stats.open.toLocaleString()}
              </span>
            </p>
            <p className="text-[11px] text-gray-400">
              Lost:{" "}
              <span className="font-mono text-loss font-semibold">
                -${stats.lost.toLocaleString()}
              </span>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Equity Curve */}
      <EquityCurve data={stats.snapshots} />

      {/* Metric Cards */}
      <MetricCards metrics={metricData} />

      {/* Mini Kanban (full width) */}
      <MiniKanban tasks={tasks} clients={clients} />

      {/* Revenue Breakdown */}
      <RevenueBreakdown tasks={tasks} />

      {/* Ticker Tape */}
      <TickerTape tasks={tasks} clients={clients} />

      {/* Footer stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex items-center justify-between glass rounded-2xl p-4"
      >
        <div className="flex items-center gap-6">
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
          Projected Month Close:{" "}
          <span className="font-mono font-bold text-white text-base ml-1">
            ${Math.round(stats.projected).toLocaleString()}
          </span>
        </div>
      </motion.div>
    </div>
  );
}

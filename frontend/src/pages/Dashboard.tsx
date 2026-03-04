import { useMemo } from "react";
import { motion } from "framer-motion";
import { useTaskStore } from "../stores/taskStore";
import {
  calculateRealizedPnL,
  calculateOpenProfit,
  calculateLostRevenue,
  calculateWinRate,
  buildDailySnapshots,
  formatCurrencyFull,
} from "../utils/calculations";
import EquityCurve from "../components/dashboard/EquityCurve";
import MetricCards from "../components/dashboard/MetricCards";
import MiniKanban from "../components/dashboard/MiniKanban";
import RevenueBreakdown from "../components/dashboard/RevenueBreakdown";
import TickerTape from "../components/dashboard/TickerTape";
import AnimatedNumber from "../components/shared/AnimatedNumber";

export default function Dashboard() {
  const tasks = useTaskStore((s) => s.tasks);
  const clients = useTaskStore((s) => s.clients);

  const stats = useMemo(() => {
    const realized = calculateRealizedPnL(tasks);
    const open = calculateOpenProfit(tasks);
    const lost = calculateLostRevenue(tasks);
    const winRate = calculateWinRate(tasks);
    const totalPnL = realized + open;
    const completedToday = tasks.filter(
      (t) =>
        t.status === "completed" &&
        t.completedAt?.startsWith(new Date().toISOString().slice(0, 10))
    );
    const todayPnL = completedToday.reduce((s, t) => s + t.pnl, 0);
    const snapshots = buildDailySnapshots(tasks);

    // Projected month close
    const completedAll = tasks.filter((t) => t.status === "completed");
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
    };
  }, [tasks]);

  const metricData = [
    {
      label: "Open Profit",
      value: stats.open,
      color: "#00ff88",
      icon: "📈",
    },
    {
      label: "Realized Profit",
      value: stats.realized,
      color: "#3b82f6",
      icon: "💰",
    },
    {
      label: "Lost Revenue",
      value: stats.lost,
      prefix: "$",
      color: "#ff4466",
      icon: "📉",
    },
    {
      label: "Win Rate",
      value: stats.winRate,
      prefix: "",
      suffix: "%",
      color: "#ffaa00",
      icon: "🎯",
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
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
              Total P&L Today
            </p>
            <div
              className="text-4xl font-display font-bold"
              style={{ color: stats.totalPnL >= 0 ? "#00ff88" : "#ff4466" }}
            >
              <AnimatedNumber
                value={stats.todayPnL}
                prefix={stats.todayPnL >= 0 ? "+$" : "-$"}
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
              Unrealized:{" "}
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

      {/* Bottom row: Mini Kanban + Revenue Breakdown */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-5">
        <div className="min-w-0 overflow-hidden">
          <MiniKanban tasks={tasks} clients={clients} />
        </div>
        <RevenueBreakdown tasks={tasks} />
      </div>

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
            Open Profit:{" "}
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

import { motion } from "framer-motion";
import { useGamificationStore } from "../stores/gamificationStore";
import { useUIStore } from "../stores/uiStore";
import { ACHIEVEMENTS, RARITY_COLORS, getLevelFromXP } from "../utils/gamification";
import { Lock, CheckCircle2, Flame, Target, Trophy, Zap } from "lucide-react";

const RARITY_LABELS: Record<string, string> = {
  common: "Common",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legendary",
};

export default function Achievements() {
  const {
    xp,
    streak,
    totalTasksCompleted,
    achievements: unlocked,
    dailyCompleted,
    dailyTarget,
  } = useGamificationStore();
  const theme = useUIStore((s) => s.theme);
  const isLight = theme === "light";
  const levelInfo = getLevelFromXP(xp);
  const xpPct = (levelInfo.currentXP / levelInfo.nextLevelXP) * 100;
  const dailyPct = Math.min(100, (dailyCompleted / dailyTarget) * 100);

  // Theme-aware colors — must be hex for gradient/shadow concatenation
  const amber = isLight ? "#c47d0a" : "#ffaa00";
  const green = isLight ? "#2dce89" : "#00ff88";

  return (
    <div className="max-w-[1000px] mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className={`text-2xl font-display font-bold ${isLight ? "text-gray-800" : "text-white"}`}>
          Achievements & Prizes
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {unlocked.length}/{ACHIEVEMENTS.length} unlocked
        </p>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={<Zap size={20} />}
          label="Level"
          value={`Level ${levelInfo.level}`}
          sub={`${levelInfo.currentXP}/${levelInfo.nextLevelXP} XP`}
          progress={xpPct}
          color={green}
          delay={0.1}
        />
        <StatCard
          icon={<Flame size={20} />}
          label="Streak"
          value={`${streak} days`}
          sub="Complete 3 tasks/day"
          progress={0}
          color={amber}
          delay={0.15}
        />
        <StatCard
          icon={<Target size={20} />}
          label="Daily Goal"
          value={`${dailyCompleted}/${dailyTarget}`}
          sub={dailyCompleted >= dailyTarget ? "Target hit!" : `${dailyTarget - dailyCompleted} more to go`}
          progress={dailyPct}
          color={dailyCompleted >= dailyTarget ? green : "#3b82f6"}
          delay={0.2}
        />
        <StatCard
          icon={<Trophy size={20} />}
          label="Total Completed"
          value={`${totalTasksCompleted}`}
          sub={`${xp.toLocaleString()} total XP`}
          progress={0}
          color="#a855f7"
          delay={0.25}
        />
      </div>

      {/* Daily target prize callout */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-2xl p-5 relative overflow-hidden"
        style={isLight ? undefined : {
          borderColor: dailyCompleted >= dailyTarget
            ? "rgba(0,255,136,0.2)"
            : "rgba(255,170,0,0.15)",
        }}
      >
        {!isLight && (
          <div
            className="absolute -top-16 -right-16 w-40 h-40 rounded-full blur-[60px] opacity-10 pointer-events-none"
            style={{
              background: dailyCompleted >= dailyTarget ? green : amber,
            }}
          />
        )}
        <div className="flex items-center gap-4 relative z-10">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0"
            style={isLight ? {
              background: `linear-gradient(145deg, #e8edf4, #d4d9e0)`,
              boxShadow: `4px 4px 8px #b8bec7, -4px -4px 8px #ffffff`,
            } : {
              background: dailyCompleted >= dailyTarget
                ? "rgba(0,255,136,0.15)"
                : "rgba(255,170,0,0.1)",
            }}
          >
            {dailyCompleted >= dailyTarget ? "🏆" : "🎯"}
          </div>
          <div className="flex-1">
            <h3 className={`text-sm font-display font-bold ${isLight ? "text-gray-800" : "text-white"}`}>
              {dailyCompleted >= dailyTarget
                ? "Daily Target Complete!"
                : "Daily Challenge: Complete 3 Tasks"}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {dailyCompleted >= dailyTarget
                ? "You earned +75 XP bonus today. Keep the streak alive tomorrow!"
                : `Complete ${dailyTarget - dailyCompleted} more task${dailyTarget - dailyCompleted !== 1 ? "s" : ""} today to earn +75 XP bonus and maintain your streak.`}
            </p>
            <div
              className="h-2 rounded-full overflow-hidden mt-2 max-w-xs"
              style={isLight ? {
                background: `rgb(218 223 230)`,
                boxShadow: `inset 2px 2px 4px #b8bec7, inset -2px -2px 4px #ffffff`,
              } : {
                background: `rgba(255,255,255,0.05)`,
              }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: dailyCompleted >= dailyTarget ? green : amber,
                  boxShadow: isLight ? `0 0 6px ${(dailyCompleted >= dailyTarget ? green : amber)}60` : undefined,
                }}
                initial={{ width: 0 }}
                animate={{ width: `${dailyPct}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-display font-bold" style={{
              color: dailyCompleted >= dailyTarget ? green : amber,
            }}>
              {dailyCompleted}/{dailyTarget}
            </p>
            <p className="text-[10px] text-gray-500">today</p>
          </div>
        </div>
      </motion.div>

      {/* Achievement grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ACHIEVEMENTS.map((a, i) => {
          const isUnlocked = unlocked.some((u) => u.id === a.id);
          const unlockedData = unlocked.find((u) => u.id === a.id);
          const rarityColor = RARITY_COLORS[a.rarity];

          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className={`glass rounded-xl p-4 flex items-start gap-4 relative overflow-hidden transition-all ${
                isUnlocked
                  ? "hover:border-white/10"
                  : "opacity-60"
              }`}
              style={isLight ? {
                background: isUnlocked
                  ? "linear-gradient(145deg, #e8edf4, #dde2e9)"
                  : "linear-gradient(145deg, #e2e7ee, #d8dde4)",
                boxShadow: isUnlocked
                  ? `6px 6px 12px #b8bec7, -6px -6px 12px #ffffff`
                  : `4px 4px 8px #b8bec7, -4px -4px 8px #ffffff`,
                borderColor: "transparent",
              } : {
                borderColor: isUnlocked ? `${rarityColor}30` : undefined,
                boxShadow: isUnlocked
                  ? `0 0 20px ${rarityColor}08`
                  : undefined,
              }}
            >
              {/* Glow */}
              {isUnlocked && !isLight && (
                <div
                  className="absolute -top-10 -right-10 w-24 h-24 rounded-full blur-2xl opacity-10 pointer-events-none"
                  style={{ background: rarityColor }}
                />
              )}

              {/* Icon */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 relative"
                style={isLight ? {
                  background: "linear-gradient(145deg, #e8edf4, #d4d9e0)",
                  boxShadow: isUnlocked
                    ? `3px 3px 6px #b8bec7, -3px -3px 6px #ffffff`
                    : `inset 2px 2px 4px #b8bec7, inset -2px -2px 4px #ffffff`,
                } : {
                  background: isUnlocked
                    ? `${rarityColor}15`
                    : "rgba(255,255,255,0.03)",
                }}
              >
                {isUnlocked ? (
                  a.icon
                ) : (
                  <Lock size={18} className="text-gray-600" />
                )}
                {/* Green checkmark overlay for unlocked */}
                {isUnlocked && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 + i * 0.05, type: "spring", stiffness: 400, damping: 15 }}
                    className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{
                      background: green,
                      boxShadow: isLight
                        ? `2px 2px 4px #b8bec7, 0 0 6px ${green}40`
                        : `0 0 8px ${green}40`,
                    }}
                  >
                    <CheckCircle2 size={12} className="text-white" strokeWidth={3} />
                  </motion.div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h4
                    className="text-sm font-display font-bold truncate"
                    style={{ color: isUnlocked ? (isLight ? "#1f2937" : "white") : "#6b7280" }}
                  >
                    {a.title}
                  </h4>
                  <span
                    className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full shrink-0"
                    style={{
                      color: rarityColor,
                      background: `${rarityColor}15`,
                    }}
                  >
                    {RARITY_LABELS[a.rarity]}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500">{a.description}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-[10px] font-mono font-semibold text-profit">
                    +{a.xpReward} XP
                  </span>
                  {isUnlocked && unlockedData?.unlockedAt && (
                    <span className="text-[10px] text-gray-600 flex items-center gap-1">
                      <CheckCircle2 size={10} className="text-profit" />
                      {new Date(unlockedData.unlockedAt).toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric" }
                      )}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  progress,
  color,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  progress: number;
  color: string;
  delay: number;
}) {
  const theme = useUIStore((s) => s.theme);
  const isLight = theme === "light";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="achievement-stat glass rounded-2xl p-5 relative"
      style={isLight ? undefined : { boxShadow: `0 0 20px ${color}08` }}
    >
      {!isLight && (
        <div
          className="absolute -top-8 -right-8 w-20 h-20 rounded-full blur-2xl opacity-10 pointer-events-none"
          style={{ background: color }}
        />
      )}
      {/* 3D raised icon container */}
      <div
        className="achievement-icon-3d w-11 h-11 rounded-xl flex items-center justify-center mb-3"
        style={isLight ? {
          background: `linear-gradient(145deg, #e8edf4, #d4d9e0)`,
          boxShadow: `4px 4px 8px #b8bec7, -4px -4px 8px #ffffff, inset 0 1px 0 rgba(255,255,255,0.6)`,
        } : {
          background: `${color}15`,
          boxShadow: `0 4px 12px ${color}20, 0 0 0 1px ${color}10`,
        }}
      >
        <span style={{ color, filter: isLight ? `drop-shadow(0 1px 2px ${color}40)` : undefined }}>
          {icon}
        </span>
      </div>
      <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">
        {label}
      </span>
      <p className={`text-xl font-display font-bold ${isLight ? "text-gray-800" : "text-white"}`}>{value}</p>
      <p className="text-[10px] text-gray-500 mt-0.5">{sub}</p>
      {progress > 0 && (
        <div
          className="h-1.5 rounded-full overflow-hidden mt-3"
          style={isLight ? {
            background: `rgb(218 223 230)`,
            boxShadow: `inset 2px 2px 4px #b8bec7, inset -2px -2px 4px #ffffff`,
          } : {
            background: `rgba(255,255,255,0.05)`,
          }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{
              background: isLight
                ? `linear-gradient(90deg, ${color}, ${color}cc)`
                : color,
              boxShadow: isLight ? `0 0 6px ${color}60` : undefined,
            }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
      )}
    </motion.div>
  );
}

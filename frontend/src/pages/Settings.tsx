import { motion } from "framer-motion";
import { Download, Upload, Trash2, RotateCcw } from "lucide-react";
import { useTaskStore } from "../stores/taskStore";
import { useGamificationStore } from "../stores/gamificationStore";
import { SEED_TASKS, SEED_CLIENTS } from "../utils/seedData";
import { getLevelFromXP, ACHIEVEMENTS } from "../utils/gamification";
import { RARITY_COLORS } from "../utils/gamification";

export default function Settings() {
  const tasks = useTaskStore((s) => s.tasks);
  const clients = useTaskStore((s) => s.clients);
  const seed = useTaskStore((s) => s.seed);
  const gamification = useGamificationStore();
  const levelInfo = getLevelFromXP(gamification.xp);

  const handleExport = () => {
    const data = JSON.stringify({ tasks, clients }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tasktrader-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (data.tasks && data.clients) {
          seed(data.tasks, data.clients);
        }
      } catch {
        alert("Invalid JSON file");
      }
    };
    reader.readAsText(file);
  };

  const handleLoadDemo = () => {
    seed(SEED_TASKS, SEED_CLIENTS);
  };

  const handleClearAll = () => {
    if (confirm("Are you sure? This will delete all tasks and clients.")) {
      seed([], []);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile / XP */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6"
      >
        <h2 className="font-display font-semibold text-sm mb-4">
          Trader Profile
        </h2>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-profit to-accent-cyan flex items-center justify-center text-xl font-bold text-surface-0">
            {levelInfo.level}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">
              Level {levelInfo.level} Trader
            </p>
            <p className="text-xs text-gray-400">
              {gamification.xp} total XP ·{" "}
              {gamification.totalTasksCompleted} trades closed
            </p>
            <div className="h-2 rounded-full bg-white/5 mt-2 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-profit to-accent-cyan"
                animate={{
                  width: `${(levelInfo.currentXP / levelInfo.nextLevelXP) * 100}%`,
                }}
              />
            </div>
            <p className="text-[10px] text-gray-500 mt-1">
              {levelInfo.currentXP} / {levelInfo.nextLevelXP} XP to next level
            </p>
          </div>
        </div>

        {/* Streak */}
        {gamification.streak > 0 && (
          <div className="glass rounded-xl p-3 flex items-center gap-2 text-sm">
            <span className="text-lg">🔥</span>
            <span className="text-accent-amber font-bold">
              {gamification.streak}-day streak
            </span>
          </div>
        )}
      </motion.div>

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-2xl p-6"
      >
        <h2 className="font-display font-semibold text-sm mb-4">
          Achievements ({gamification.achievements.length}/{ACHIEVEMENTS.length})
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {ACHIEVEMENTS.map((a) => {
            const unlocked = gamification.achievements.find(
              (u) => u.id === a.id
            );
            return (
              <div
                key={a.id}
                className={`glass rounded-xl p-3 flex items-center gap-2 ${
                  unlocked ? "" : "opacity-40"
                }`}
                style={
                  unlocked
                    ? {
                        borderColor: RARITY_COLORS[a.rarity] + "30",
                        boxShadow: `0 0 12px ${RARITY_COLORS[a.rarity]}10`,
                      }
                    : {}
                }
              >
                <span className="text-xl">{a.icon}</span>
                <div>
                  <p
                    className="text-[11px] font-bold"
                    style={{
                      color: unlocked ? RARITY_COLORS[a.rarity] : "#64748b",
                    }}
                  >
                    {a.title}
                  </p>
                  <p className="text-[9px] text-gray-500">{a.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Data Management */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-2xl p-6"
      >
        <h2 className="font-display font-semibold text-sm mb-4">
          Data Management
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-2 py-3 rounded-xl glass-hover border border-glass-border text-sm text-gray-300 hover:text-white transition-colors"
          >
            <Download size={14} />
            Export JSON
          </button>
          <label className="flex items-center justify-center gap-2 py-3 rounded-xl glass-hover border border-glass-border text-sm text-gray-300 hover:text-white transition-colors cursor-pointer">
            <Upload size={14} />
            Import JSON
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
          <button
            onClick={handleLoadDemo}
            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-accent-blue/10 border border-accent-blue/20 text-sm text-accent-blue hover:bg-accent-blue/20 transition-colors"
          >
            <RotateCcw size={14} />
            Load Demo Data
          </button>
          <button
            onClick={handleClearAll}
            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-loss/10 border border-loss/20 text-sm text-loss hover:bg-loss/20 transition-colors"
          >
            <Trash2 size={14} />
            Clear All Data
          </button>
        </div>
      </motion.div>
    </div>
  );
}

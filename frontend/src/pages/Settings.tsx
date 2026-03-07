import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Upload, Trash2, RotateCcw, Plus, Edit3, Check, X } from "lucide-react";
import { useTaskStore } from "../stores/taskStore";
import { useGamificationStore } from "../stores/gamificationStore";
import { SEED_TASKS, SEED_CLIENTS } from "../utils/seedData";
import { getLevelFromXP, ACHIEVEMENTS } from "../utils/gamification";
import { api } from "../utils/api";

export default function Settings() {
  const tasks = useTaskStore((s) => s.tasks);
  const clients = useTaskStore((s) => s.clients);
  const categories = useTaskStore((s) => s.categories);
  const addCategory = useTaskStore((s) => s.addCategory);
  const updateCategory = useTaskStore((s) => s.updateCategory);
  const deleteCategory = useTaskStore((s) => s.deleteCategory);
  const seed = useTaskStore((s) => s.seed);
  const gamification = useGamificationStore();
  const levelInfo = getLevelFromXP(gamification.xp);

  const [catName, setCatName] = useState("");
  const [catColor, setCatColor] = useState("#3b82f6");
  const [editCatId, setEditCatId] = useState<string | null>(null);
  const [editCatName, setEditCatName] = useState("");
  const [editCatColor, setEditCatColor] = useState("");

  const handleAddCategory = () => {
    if (!catName.trim()) return;
    addCategory({ name: catName.trim(), color: catColor });
    setCatName("");
  };

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
    localStorage.removeItem("tasktrader-cleared");
    seed(SEED_TASKS, SEED_CLIENTS);
  };

  const handleClearAll = async () => {
    if (confirm("Are you sure? This will delete ALL data including tasks, clients, and achievements.")) {
      try {
        // 1. Clear backend FIRST (awaited, so it's confirmed before reload)
        await api.saveState({ tasks: [], clients: [], categories: [], goals: [], meetings: [] });
        await api.saveKey("gamification", { xp: 0, level: 1, streak: 0, lastActiveDate: "", achievements: [], totalTasksCompleted: 0, multiplier: 1, dailyCompleted: 0, dailyTarget: 3 });
      } catch (err) {
        console.warn("Failed to clear backend data:", err);
      }
      // 2. Clear localStorage so Zustand persist can't restore stale data
      localStorage.removeItem("tasktrader-tasks");
      localStorage.removeItem("tasktrader-gamification");
      // 3. Mark as intentionally cleared so App.tsx won't auto-seed
      localStorage.setItem("tasktrader-cleared", "1");
      // 4. Force full reload — fresh state from empty backend + empty localStorage
      window.location.reload();
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
                className="glass rounded-xl p-3 flex items-center gap-2"
              >
                <div className="relative shrink-0">
                  <span className="text-xl">{a.icon}</span>
                  {unlocked && (
                    <span
                      className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                      style={{ background: "#2dce89", boxShadow: "0 0 6px #2dce8960" }}
                    >
                      ✓
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-[11px] font-bold text-gray-700">
                    {a.title}
                  </p>
                  <p className="text-[9px] text-gray-500">{a.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Categories */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass rounded-2xl p-6"
      >
        <h2 className="font-display font-semibold text-sm mb-4">
          Categories
        </h2>
        {/* Add form */}
        <div className="flex items-end gap-3 mb-4">
          <div className="flex-1">
            <input
              type="text"
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              placeholder="New category name"
              className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-glass-border text-white text-sm focus:outline-none focus:border-profit/30"
              onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
            />
          </div>
          <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border-2 border-glass-border cursor-pointer" style={{ background: catColor }}>
            <input
              type="color"
              value={catColor}
              onChange={(e) => setCatColor(e.target.value)}
              className="w-14 h-14 -ml-2 -mt-2 cursor-pointer opacity-0"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddCategory}
            className="p-2.5 rounded-xl bg-profit/20 text-profit hover:bg-profit/30 transition-colors shrink-0"
          >
            <Plus size={16} />
          </motion.button>
        </div>
        {/* List */}
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {categories.map((cat) => {
              const count = tasks.filter(
                (t) => t.projectType === cat.id || t.projectType === cat.name.toLowerCase().replace(/ /g, "_")
              ).length;
              return (
                <motion.div
                  key={cat.id}
                  layout
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  className="glass rounded-xl p-3 flex items-center justify-between group"
                >
                  {editCatId === cat.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 border-2 border-glass-border cursor-pointer" style={{ background: editCatColor }}>
                        <input
                          type="color"
                          value={editCatColor}
                          onChange={(e) => setEditCatColor(e.target.value)}
                          className="w-10 h-10 -ml-1.5 -mt-1.5 cursor-pointer opacity-0"
                        />
                      </div>
                      <input
                        type="text"
                        value={editCatName}
                        onChange={(e) => setEditCatName(e.target.value)}
                        className="flex-1 px-2 py-1 rounded-lg bg-white/[0.03] border border-glass-border text-white text-sm focus:outline-none focus:border-profit/30"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            if (editCatName.trim()) updateCategory(cat.id, { name: editCatName.trim(), color: editCatColor });
                            setEditCatId(null);
                          }
                          if (e.key === "Escape") setEditCatId(null);
                        }}
                      />
                      <button
                        onClick={() => {
                          if (editCatName.trim()) updateCategory(cat.id, { name: editCatName.trim(), color: editCatColor });
                          setEditCatId(null);
                        }}
                        className="p-1.5 rounded-lg bg-profit/20 text-profit hover:bg-profit/30 transition-colors"
                      >
                        <Check size={12} />
                      </button>
                      <button
                        onClick={() => setEditCatId(null)}
                        className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ background: cat.color }}
                        />
                        <div>
                          <span className="text-sm font-semibold text-white">{cat.name}</span>
                          <span className="text-[10px] text-gray-500 ml-2">
                            {count} task{count !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setEditCatId(cat.id);
                            setEditCatName(cat.name);
                            setEditCatColor(cat.color);
                          }}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all"
                        >
                          <Edit3 size={12} />
                        </button>
                        <button
                          onClick={() => deleteCategory(cat.id)}
                          className="p-1.5 rounded-lg hover:bg-loss/10 text-gray-500 hover:text-loss transition-all"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
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

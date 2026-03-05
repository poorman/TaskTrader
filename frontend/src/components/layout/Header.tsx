import { useState, useRef, useEffect } from "react";
import { Search, Bell, User, Menu, Sun, Moon, Plus, Trophy, Settings } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useUIStore } from "../../stores/uiStore";
import { useTaskStore } from "../../stores/taskStore";
import type { Page } from "../../types";
import BabyDiaryButton from "../../plugins/baby-diary/BabyDiaryButton"; // PLUGIN: baby-diary

const PAGE_TITLES: Record<Page, string> = {
  dashboard: "Dashboard",
  analytics: "P&L Analytics",
  taskboard: "Task Board",
  newtask: "New Task",
  clients: "Clients",
  calendar: "Calendar",
  categories: "Categories",
  goals: "Goals",
  achievements: "Achievements",
  settings: "Settings",
  babydiary: "Baby Diary", // PLUGIN: baby-diary
};

const TIME_RANGES = ["Today", "1W", "1M", "3M", "1Y"];

export default function Header() {
  const { activePage, searchQuery, setSearch, setMobileMenu, setPage, theme, toggleTheme } = useUIStore();
  const tasks = useTaskStore((s) => s.tasks);
  const clients = useTaskStore((s) => s.clients);
  const [showResults, setShowResults] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const filteredTasks = searchQuery.trim().length > 0
    ? tasks.filter((t) =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        clients.find((c) => c.id === t.clientId)?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.projectType.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 6)
    : [];

  // Close dropdowns on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Build recent notifications from tasks
  const recentTasks = [...tasks]
    .filter((t) => t.completedAt || t.startedAt)
    .sort((a, b) => {
      const da = a.completedAt || a.startedAt || "";
      const db = b.completedAt || b.startedAt || "";
      return db.localeCompare(da);
    })
    .slice(0, 5);

  const handleSelectTask = () => {
    setPage("taskboard");
    setShowResults(false);
  };

  return (
    <header className="h-14 flex items-center justify-between px-3 sm:px-6 border-b border-glass-border shrink-0">
      <div className="flex items-center gap-2">
        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileMenu(true)}
          className="md:hidden p-2 rounded-xl text-gray-400 hover:text-white transition-colors"
        >
          <Menu size={20} />
        </button>
        <h1 className="font-display font-semibold text-base text-white/90 hidden md:block">
          {PAGE_TITLES[activePage]}
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Time range pills */}
        <div className="hidden lg:flex items-center gap-1 glass rounded-xl px-1 py-1">
          {TIME_RANGES.map((r, i) => (
            <button
              key={r}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                i === 0
                  ? "bg-white/10 text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative" ref={searchRef}>
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 z-10"
          />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => {
              setSearch(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => searchQuery.trim() && setShowResults(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && filteredTasks.length > 0) {
                handleSelectTask();
              }
            }}
            className="w-32 sm:w-48 pl-8 pr-3 py-2 text-xs rounded-xl glass bg-transparent border border-glass-border text-white placeholder-gray-500 focus:outline-none focus:border-profit/30 transition-colors"
          />
          {/* Search results dropdown */}
          <AnimatePresence>
            {showResults && filteredTasks.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-10 z-50 w-72 rounded-xl glass border border-glass-border overflow-hidden"
              >
                <div className="px-3 py-2 border-b border-glass-border">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                    {filteredTasks.length} task{filteredTasks.length !== 1 ? "s" : ""} found
                  </span>
                </div>
                {filteredTasks.map((task) => {
                  const client = clients.find((c) => c.id === task.clientId);
                  return (
                    <button
                      key={task.id}
                      onClick={handleSelectTask}
                      className="w-full px-3 py-2.5 text-left hover:bg-white/5 transition-colors flex items-center gap-2"
                    >
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ background: task.status === "completed" ? "#22c55e" : task.status === "lost" ? "#ff4466" : task.status === "in_progress" ? "#00ff88" : "#ffaa00" }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{task.title}</p>
                        <p className="text-[10px] text-gray-500">{client?.name || "Unknown"} · ${task.revenue.toLocaleString()}</p>
                      </div>
                    </button>
                  );
                })}
                <button
                  onClick={handleSelectTask}
                  className="w-full px-3 py-2 text-[10px] text-center text-profit hover:bg-white/5 transition-colors border-t border-glass-border"
                >
                  View all on Task Board →
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* New Task button */}
        <button
          onClick={() => setPage("newtask")}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-profit to-accent-cyan text-surface-0 text-xs font-bold transition-all hover:shadow-lg hover:shadow-profit/20"
        >
          <Plus size={14} />
          <span className="hidden sm:inline">New Task</span>
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="relative p-2 rounded-xl glass-hover transition-all text-gray-400 hover:text-white"
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Achievements */}
        <button
          onClick={() => setPage("achievements")}
          className={`relative p-2 rounded-xl glass-hover transition-colors ${
            activePage === "achievements" ? "text-accent-amber" : "text-gray-400 hover:text-white"
          }`}
          title="Achievements"
        >
          <Trophy size={16} />
        </button>

        {/* PLUGIN: baby-diary */}
        <BabyDiaryButton />

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl glass-hover transition-colors text-gray-400 hover:text-white"
          >
            <Bell size={16} />
            {recentTasks.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-loss text-[9px] font-bold flex items-center justify-center text-white">
                {recentTasks.length}
              </span>
            )}
          </button>
          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-10 z-50 w-72 rounded-xl glass border border-glass-border overflow-hidden"
              >
                <div className="px-3 py-2 border-b border-glass-border">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                    Recent Activity
                  </span>
                </div>
                {recentTasks.length > 0 ? recentTasks.map((task) => {
                  const client = clients.find((c) => c.id === task.clientId);
                  const isCompleted = task.status === "completed";
                  const isLost = task.status === "lost";
                  return (
                    <button
                      key={task.id}
                      onClick={() => { setPage("taskboard"); setShowNotifications(false); }}
                      className="w-full px-3 py-2.5 text-left hover:bg-white/5 transition-colors flex items-center gap-2"
                    >
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ background: isCompleted ? "#22c55e" : isLost ? "#ff4466" : "#2dce89" }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{task.title}</p>
                        <p className="text-[10px] text-gray-500">
                          {client?.name || "Unknown"} · {isCompleted ? "Completed" : isLost ? "Lost" : "In Progress"}
                        </p>
                      </div>
                    </button>
                  );
                }) : (
                  <div className="px-3 py-4 text-center text-[11px] text-gray-500">
                    No recent activity
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Settings */}
        <button
          onClick={() => setPage("settings")}
          className={`relative p-2 rounded-xl glass-hover transition-colors ${
            activePage === "settings" ? "text-white" : "text-gray-400 hover:text-white"
          }`}
          title="Settings"
        >
          <Settings size={16} />
        </button>

        {/* Avatar */}
        <button className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-purple to-accent-blue flex items-center justify-center">
          <User size={14} className="text-white" />
        </button>
      </div>
    </header>
  );
}

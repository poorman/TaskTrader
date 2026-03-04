import { motion } from "framer-motion";
import {
  LayoutDashboard,
  BarChart3,
  KanbanSquare,
  PlusCircle,
  Users,
  Tag,
  Target,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
} from "lucide-react";
import { useUIStore } from "../../stores/uiStore";
import { useGamificationStore } from "../../stores/gamificationStore";
import { getLevelFromXP } from "../../utils/gamification";
import type { Page } from "../../types";

const NAV_ITEMS: { page: Page; icon: typeof LayoutDashboard; label: string }[] =
  [
    { page: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { page: "analytics", icon: BarChart3, label: "P&L Analytics" },
    { page: "taskboard", icon: KanbanSquare, label: "Task Board" },
    { page: "newtask", icon: PlusCircle, label: "New Task" },
    { page: "clients", icon: Users, label: "Clients" },
    { page: "categories", icon: Tag, label: "Categories" },
    { page: "goals", icon: Target, label: "Goals" },
    { page: "settings", icon: Settings, label: "Settings" },
  ];

export default function Sidebar() {
  const { activePage, setPage, sidebarCollapsed, toggleSidebar } = useUIStore();
  const { xp, streak } = useGamificationStore();
  const levelInfo = getLevelFromXP(xp);
  const xpPct = (levelInfo.currentXP / levelInfo.nextLevelXP) * 100;

  return (
    <motion.aside
      className="h-full flex flex-col glass border-r border-glass-border"
      animate={{ width: sidebarCollapsed ? 64 : 220 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 h-14 border-b border-glass-border shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-profit to-accent-cyan flex items-center justify-center shrink-0">
          <Zap size={16} className="text-surface-0" />
        </div>
        {!sidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="overflow-hidden"
          >
            <span className="font-display font-bold text-sm tracking-tight">
              Task<span className="text-profit">Trader</span>
            </span>
            <span className="text-[10px] text-gray-500 ml-1 font-medium">
              Pro
            </span>
          </motion.div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto no-scrollbar">
        {NAV_ITEMS.map(({ page, icon: Icon, label }) => {
          const active = activePage === page;
          return (
            <button
              key={page}
              onClick={() => setPage(page)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                active
                  ? "text-white"
                  : "text-gray-400 hover:text-gray-200 hover:bg-white/[0.03]"
              }`}
            >
              {active && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl glass-active"
                  style={{
                    boxShadow:
                      "0 0 20px rgba(0,255,136,0.06), inset 0 1px 0 rgba(255,255,255,0.05)",
                  }}
                  transition={{
                    type: "spring",
                    damping: 25,
                    stiffness: 400,
                  }}
                />
              )}
              <Icon
                size={18}
                className={`relative z-10 shrink-0 ${
                  active ? "text-profit" : ""
                }`}
              />
              {!sidebarCollapsed && (
                <span className="relative z-10 truncate">{label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* XP Bar + Level */}
      {!sidebarCollapsed && (
        <div className="px-3 pb-2">
          <div className="glass rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-gray-400 font-medium">
                Level {levelInfo.level}
              </span>
              <span className="text-profit font-mono font-semibold">
                {levelInfo.currentXP}/{levelInfo.nextLevelXP} XP
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-profit to-accent-cyan"
                initial={{ width: 0 }}
                animate={{ width: `${xpPct}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            {streak > 0 && (
              <div className="flex items-center gap-1 text-[10px] text-accent-amber">
                <span>🔥</span>
                <span className="font-semibold">{streak}-day streak</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Collapse toggle */}
      <button
        onClick={toggleSidebar}
        className="h-10 flex items-center justify-center border-t border-glass-border text-gray-500 hover:text-gray-300 transition-colors shrink-0"
      >
        {sidebarCollapsed ? (
          <ChevronRight size={16} />
        ) : (
          <ChevronLeft size={16} />
        )}
      </button>
    </motion.aside>
  );
}

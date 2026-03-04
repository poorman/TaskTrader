import { Search, Bell, User } from "lucide-react";
import { useUIStore } from "../../stores/uiStore";
import type { Page } from "../../types";

const PAGE_TITLES: Record<Page, string> = {
  dashboard: "Dashboard",
  analytics: "P&L Analytics",
  taskboard: "Task Board",
  newtask: "New Task",
  clients: "Clients",
  categories: "Categories",
  goals: "Goals",
  settings: "Settings",
};

const TIME_RANGES = ["Today", "1W", "1M", "3M", "1Y"];

export default function Header() {
  const { activePage, searchQuery, setSearch } = useUIStore();

  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-glass-border shrink-0">
      <h1 className="font-display font-semibold text-base text-white/90 hidden md:block">
        {PAGE_TITLES[activePage]}
      </h1>

      <div className="flex items-center gap-3">
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
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearch(e.target.value)}
            className="w-48 pl-8 pr-3 py-2 text-xs rounded-xl glass bg-transparent border border-glass-border text-white placeholder-gray-500 focus:outline-none focus:border-profit/30 transition-colors"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-xl glass-hover transition-colors text-gray-400 hover:text-white">
          <Bell size={16} />
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-loss text-[9px] font-bold flex items-center justify-center text-white">
            8
          </span>
        </button>

        {/* Avatar */}
        <button className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-purple to-accent-blue flex items-center justify-center">
          <User size={14} className="text-white" />
        </button>
      </div>
    </header>
  );
}

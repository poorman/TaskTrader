import { create } from "zustand";
import type { Page } from "../types";

export type Theme = "dark" | "light";
export type TimeRange = "Today" | "1W" | "1M" | "3M" | "1Y";

interface UIStore {
  activePage: Page;
  sidebarCollapsed: boolean;
  mobileMenuOpen: boolean;
  searchQuery: string;
  theme: Theme;
  timeRange: TimeRange;
  compactView: boolean;
  setPage: (page: Page) => void;
  toggleSidebar: () => void;
  setMobileMenu: (open: boolean) => void;
  setSearch: (q: string) => void;
  toggleTheme: () => void;
  setTimeRange: (range: TimeRange) => void;
  toggleCompactView: () => void;
}

export const useUIStore = create<UIStore>()((set) => ({
  activePage: "dashboard",
  sidebarCollapsed: false,
  mobileMenuOpen: false,
  searchQuery: "",
  theme: (localStorage.getItem("tasktrader-theme") as Theme) || "dark",
  timeRange: "Today" as TimeRange,
  compactView: localStorage.getItem("tasktrader-compact") === "true",
  setPage: (page) => set({ activePage: page, mobileMenuOpen: false }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setMobileMenu: (open) => set({ mobileMenuOpen: open }),
  setSearch: (q) => set({ searchQuery: q }),
  toggleTheme: () =>
    set((s) => {
      const next: Theme = s.theme === "dark" ? "light" : "dark";
      localStorage.setItem("tasktrader-theme", next);
      document.documentElement.setAttribute("data-theme", next);
      return { theme: next };
    }),
  setTimeRange: (range) => set({ timeRange: range }),
  toggleCompactView: () =>
    set((s) => {
      const next = !s.compactView;
      localStorage.setItem("tasktrader-compact", String(next));
      return { compactView: next };
    }),
}));

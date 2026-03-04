import { create } from "zustand";
import type { Page } from "../types";

interface UIStore {
  activePage: Page;
  sidebarCollapsed: boolean;
  searchQuery: string;
  setPage: (page: Page) => void;
  toggleSidebar: () => void;
  setSearch: (q: string) => void;
}

export const useUIStore = create<UIStore>()((set) => ({
  activePage: "dashboard",
  sidebarCollapsed: false,
  searchQuery: "",
  setPage: (page) => set({ activePage: page }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSearch: (q) => set({ searchQuery: q }),
}));

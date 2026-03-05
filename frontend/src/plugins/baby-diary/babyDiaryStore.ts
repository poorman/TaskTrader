import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DiaryEntry } from "./types";

function uuid() {
  return crypto.randomUUID?.() ?? Date.now().toString(36) + Math.random().toString(36).slice(2);
}

interface BabyDiaryStore {
  entries: DiaryEntry[];
  addEntry: (entry: Omit<DiaryEntry, "id" | "createdAt">) => string;
  updateEntry: (id: string, partial: Partial<DiaryEntry>) => void;
  deleteEntry: (id: string) => void;
  getEntriesForDate: (date: string) => DiaryEntry[];
}

export const useBabyDiaryStore = create<BabyDiaryStore>()(
  persist(
    (set, get) => ({
      entries: [],

      addEntry: (partial) => {
        const id = uuid();
        set((s) => ({
          entries: [
            ...s.entries,
            { ...partial, id, createdAt: new Date().toISOString() },
          ],
        }));
        return id;
      },

      updateEntry: (id, partial) =>
        set((s) => ({
          entries: s.entries.map((e) =>
            e.id === id ? { ...e, ...partial } : e
          ),
        })),

      deleteEntry: (id) =>
        set((s) => ({
          entries: s.entries.filter((e) => e.id !== id),
        })),

      getEntriesForDate: (date) =>
        get()
          .entries.filter((e) => e.date === date)
          .sort((a, b) => a.time.localeCompare(b.time)),
    }),
    { name: "tasktrader-plugin-babydiary" }
  )
);

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Task, TaskStatus, Client, Category, Goal } from "../types";
import { v4 as uuid } from "uuid";

interface TaskStore {
  tasks: Task[];
  clients: Client[];
  categories: Category[];
  goals: Goal[];

  // Task CRUD
  addTask: (task: Omit<Task, "id" | "createdAt" | "order" | "pnl" | "revenue" | "progress" | "actualHours">) => string;
  updateTask: (id: string, partial: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (id: string, status: TaskStatus) => void;
  completeTask: (id: string, actualHours: number) => void;
  loseTask: (id: string, reason?: string) => void;
  reorderTasks: (status: TaskStatus, orderedIds: string[]) => void;
  toggleBookmark: (id: string) => void;

  // Client CRUD
  addClient: (client: Omit<Client, "id" | "createdAt">) => string;
  updateClient: (id: string, partial: Partial<Client>) => void;
  deleteClient: (id: string) => void;

  // Category CRUD
  addCategory: (cat: Omit<Category, "id">) => string;
  deleteCategory: (id: string) => void;

  // Goal CRUD
  addGoal: (goal: Omit<Goal, "id" | "createdAt" | "currentRevenue">) => string;
  deleteGoal: (id: string) => void;

  // Bulk seed
  seed: (tasks: Task[], clients: Client[]) => void;
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set) => ({
      tasks: [],
      clients: [],
      categories: [
        { id: "web_design", name: "Web Design", color: "#3b82f6", icon: "🌐" },
        { id: "printing", name: "Printing", color: "#22c55e", icon: "🖨️" },
        { id: "branding", name: "Branding", color: "#a855f7", icon: "✨" },
        { id: "consulting", name: "Consulting", color: "#ffaa00", icon: "💡" },
      ],
      goals: [],

      addTask: (partial) => {
        const id = uuid();
        const now = new Date().toISOString();
        set((s) => ({
          tasks: [
            ...s.tasks,
            {
              ...partial,
              id,
              createdAt: now,
              order: s.tasks.filter((t) => t.status === partial.status).length,
              pnl: 0,
              revenue: partial.estimatedHours * partial.hourlyRate,
              progress: 0,
              actualHours: 0,
            },
          ],
        }));
        return id;
      },

      updateTask: (id, partial) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  ...partial,
                  revenue:
                    (partial.estimatedHours ?? t.estimatedHours) *
                    (partial.hourlyRate ?? t.hourlyRate),
                }
              : t
          ),
        })),

      deleteTask: (id) =>
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

      moveTask: (id, status) =>
        set((s) => ({
          tasks: s.tasks.map((t) => {
            if (t.id !== id) return t;
            const now = new Date().toISOString();
            // When moved to completed, auto-calculate P&L using actual hours (or estimated if none tracked)
            if (status === "completed") {
              const actual = t.actualHours > 0 ? t.actualHours : t.estimatedHours;
              const pnl = (t.estimatedHours - actual) * t.hourlyRate;
              return {
                ...t,
                status,
                actualHours: actual,
                pnl,
                progress: 100,
                completedAt: now,
              };
            }
            // When moved to lost, set negative P&L
            if (status === "lost") {
              return {
                ...t,
                status,
                pnl: -(t.actualHours > 0 ? t.actualHours * t.hourlyRate : t.revenue),
                progress: 0,
                completedAt: now,
              };
            }
            return {
              ...t,
              status,
              startedAt:
                status === "in_progress" && !t.startedAt ? now : t.startedAt,
              // Clear completedAt if moving back from completed/lost
              completedAt: undefined,
            };
          }),
        })),

      completeTask: (id, actualHours) =>
        set((s) => ({
          tasks: s.tasks.map((t) => {
            if (t.id !== id) return t;
            const pnl = (t.estimatedHours - actualHours) * t.hourlyRate;
            return {
              ...t,
              status: "completed" as TaskStatus,
              actualHours,
              pnl,
              progress: 100,
              completedAt: new Date().toISOString(),
            };
          }),
        })),

      loseTask: (id, _reason) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status: "lost" as TaskStatus,
                  pnl: -t.revenue,
                  progress: 0,
                  completedAt: new Date().toISOString(),
                }
              : t
          ),
        })),

      reorderTasks: (status, orderedIds) =>
        set((s) => ({
          tasks: s.tasks.map((t) => {
            if (t.status !== status) return t;
            const idx = orderedIds.indexOf(t.id);
            return idx >= 0 ? { ...t, order: idx } : t;
          }),
        })),

      toggleBookmark: (id) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id ? { ...t, bookmarked: !t.bookmarked } : t
          ),
        })),

      addClient: (partial) => {
        const id = uuid();
        set((s) => ({
          clients: [
            ...s.clients,
            { ...partial, id, createdAt: new Date().toISOString() },
          ],
        }));
        return id;
      },

      updateClient: (id, partial) =>
        set((s) => ({
          clients: s.clients.map((c) =>
            c.id === id ? { ...c, ...partial } : c
          ),
        })),

      deleteClient: (id) =>
        set((s) => ({ clients: s.clients.filter((c) => c.id !== id) })),

      addCategory: (partial) => {
        const id = uuid();
        set((s) => ({ categories: [...s.categories, { ...partial, id }] }));
        return id;
      },

      deleteCategory: (id) =>
        set((s) => ({
          categories: s.categories.filter((c) => c.id !== id),
        })),

      addGoal: (partial) => {
        const id = uuid();
        set((s) => ({
          goals: [
            ...s.goals,
            { ...partial, id, createdAt: new Date().toISOString(), currentRevenue: 0 },
          ],
        }));
        return id;
      },

      deleteGoal: (id) =>
        set((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),

      seed: (tasks, clients) => set({ tasks, clients }),
    }),
    { name: "tasktrader-tasks" }
  )
);

export type ProjectType =
  | "web_design"
  | "printing"
  | "branding"
  | "consulting"
  | "other";

export type TaskStatus =
  | "lead"
  | "in_progress"
  | "waiting"
  | "completed"
  | "lost";

export type Priority = "low" | "medium" | "high" | "urgent";

export interface Task {
  id: string;
  title: string;
  description?: string;
  clientId: string;
  projectType: ProjectType;
  status: TaskStatus;
  priority: Priority;
  assignee?: string;
  estimatedHours: number;
  actualHours: number;
  hourlyRate: number;
  pnl: number;
  revenue: number; // estimatedHours * hourlyRate
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  dueDate?: string;
  order: number;
  tags?: string[];
  progress: number; // 0-100
  bookmarked?: boolean;
}

export interface Client {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  defaultHourlyRate: number;
  notes?: string;
  createdAt: string;
  color: string;
  avatar?: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface Goal {
  id: string;
  title: string;
  targetRevenue: number;
  currentRevenue: number;
  deadline: string;
  createdAt: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  xpReward: number;
  rarity: "common" | "rare" | "epic" | "legendary";
}

export interface GamificationState {
  xp: number;
  level: number;
  streak: number;
  lastActiveDate: string;
  achievements: Achievement[];
  totalTasksCompleted: number;
  multiplier: number;
  multiplierExpiresAt?: string;
}

export type Page =
  | "dashboard"
  | "analytics"
  | "taskboard"
  | "newtask"
  | "clients"
  | "categories"
  | "goals"
  | "settings";

export interface DailySnapshot {
  date: string;
  revenue: number;
  cost: number;
  pnl: number;
  tasksCompleted: number;
  tasksLost: number;
}

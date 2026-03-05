export type DiaryEntryType = "diaper" | "feeding" | "playtime" | "sleep" | "bath" | "other";

export interface DiaryEntry {
  id: string;
  date: string;       // "YYYY-MM-DD" in Chicago timezone
  time: string;       // "HH:MM"
  type: DiaryEntryType;
  notes: string;
  duration?: number;  // Minutes
  createdAt: string;  // ISO timestamp
}

export const ENTRY_TYPES: {
  type: DiaryEntryType;
  label: string;
  icon: string;
  color: string;
}[] = [
  { type: "feeding", label: "Feed", icon: "🍼", color: "#3b82f6" },
  { type: "diaper", label: "Diaper", icon: "🧷", color: "#f59e0b" },
  { type: "playtime", label: "Play", icon: "🎮", color: "#22c55e" },
  { type: "sleep", label: "Sleep", icon: "😴", color: "#8b5cf6" },
  { type: "bath", label: "Bath", icon: "🛁", color: "#06b6d4" },
  { type: "other", label: "Other", icon: "📝", color: "#6b7280" },
];

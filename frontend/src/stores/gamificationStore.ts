import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Achievement, GamificationState } from "../types";
import {
  ACHIEVEMENTS,
  getLevelFromXP,
  rollReward,
  getPositiveFrame,
  getStreakMessage,
} from "../utils/gamification";

interface RewardEvent {
  id: string;
  xp: number;
  message: string;
  multiplierLabel: string;
  isJackpot: boolean;
  positiveFrame: string;
  timestamp: number;
}

interface GamificationStore extends GamificationState {
  pendingRewards: RewardEvent[];
  // Actions
  onTaskCompleted: (task: {
    pnl: number;
    status: string;
    estimatedHours: number;
    actualHours: number;
    revenue: number;
  }) => void;
  checkStreak: () => void;
  dismissReward: (id: string) => void;
  checkAchievements: (context: {
    totalCompleted: number;
    totalRevenue: number;
    winRate: number;
    streak: number;
    fastestRatio: number; // actualHours/estimatedHours
  }) => void;
}

export const useGamificationStore = create<GamificationStore>()(
  persist(
    (set, get) => ({
      xp: 0,
      level: 1,
      streak: 0,
      lastActiveDate: "",
      achievements: [],
      totalTasksCompleted: 0,
      multiplier: 1,
      pendingRewards: [],

      onTaskCompleted: (task) => {
        const reward = rollReward();
        const streakBonus = get().streak >= 3 ? 1.5 : 1;
        const totalXP = Math.floor(
          (reward.baseXP + reward.bonus) * streakBonus
        );
        const positiveFrame = getPositiveFrame(task);
        const id = Date.now().toString() + Math.random().toString(36).slice(2);

        set((s) => {
          const newXP = s.xp + totalXP;
          const levelInfo = getLevelFromXP(newXP);
          const today = new Date().toISOString().slice(0, 10);

          return {
            xp: newXP,
            level: levelInfo.level,
            totalTasksCompleted: s.totalTasksCompleted + 1,
            lastActiveDate: today,
            pendingRewards: [
              ...s.pendingRewards,
              {
                id,
                xp: totalXP,
                message: `+${totalXP} XP`,
                multiplierLabel: reward.multiplierLabel,
                isJackpot: reward.isJackpot,
                positiveFrame,
                timestamp: Date.now(),
              },
            ],
          };
        });
      },

      checkStreak: () => {
        const today = new Date().toISOString().slice(0, 10);
        const last = get().lastActiveDate;
        if (last === today) return;

        const yesterday = new Date(Date.now() - 86400000)
          .toISOString()
          .slice(0, 10);
        set((s) => {
          const newStreak = last === yesterday ? s.streak + 1 : 1;
          const msg = getStreakMessage(newStreak);
          const newRewards = msg
            ? [
                ...s.pendingRewards,
                {
                  id: "streak-" + Date.now(),
                  xp: newStreak * 10,
                  message: msg,
                  multiplierLabel: "",
                  isJackpot: false,
                  positiveFrame: "",
                  timestamp: Date.now(),
                },
              ]
            : s.pendingRewards;
          return {
            streak: newStreak,
            lastActiveDate: today,
            xp: s.xp + (msg ? newStreak * 10 : 0),
            pendingRewards: newRewards,
          };
        });
      },

      dismissReward: (id) =>
        set((s) => ({
          pendingRewards: s.pendingRewards.filter((r) => r.id !== id),
        })),

      checkAchievements: (ctx) => {
        const unlocked = get().achievements;
        const newAchievements: Achievement[] = [];

        for (const a of ACHIEVEMENTS) {
          if (unlocked.some((u) => u.id === a.id)) continue;
          let earned = false;
          switch (a.id) {
            case "first_blood":
              earned = ctx.totalCompleted >= 1;
              break;
            case "hat_trick":
              earned = ctx.totalCompleted >= 3;
              break; // simplified
            case "speed_demon":
              earned = ctx.fastestRatio <= 0.5;
              break;
            case "money_maker":
              earned = ctx.totalRevenue >= 1000;
              break;
            case "streak_5":
              earned = ctx.streak >= 5;
              break;
            case "ten_bagger":
              earned = ctx.totalCompleted >= 10;
              break;
            case "perfectionist":
              earned = ctx.winRate >= 80 && ctx.totalCompleted >= 20;
              break;
            case "whale":
              earned = ctx.totalRevenue >= 10000;
              break;
            case "centurion":
              earned = ctx.totalCompleted >= 100;
              break;
            case "streak_30":
              earned = ctx.streak >= 30;
              break;
          }
          if (earned) {
            newAchievements.push({
              ...a,
              unlockedAt: new Date().toISOString(),
            });
          }
        }

        if (newAchievements.length > 0) {
          set((s) => ({
            achievements: [...s.achievements, ...newAchievements],
            xp: s.xp + newAchievements.reduce((sum, a) => sum + a.xpReward, 0),
            pendingRewards: [
              ...s.pendingRewards,
              ...newAchievements.map((a) => ({
                id: "ach-" + a.id,
                xp: a.xpReward,
                message: `Achievement: ${a.title}!`,
                multiplierLabel: a.icon,
                isJackpot: a.rarity === "legendary",
                positiveFrame: a.description,
                timestamp: Date.now(),
              })),
            ],
          }));
        }
      },
    }),
    { name: "tasktrader-gamification" }
  )
);

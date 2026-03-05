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
import { todayLocal, yesterdayLocal } from "../utils/timezone";

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
  dailyCompleted: number; // tasks completed today
  dailyTarget: number; // tasks needed per day for streak (3)
  // Actions
  onTaskCompleted: (task: {
    pnl: number;
    status: string;
    estimatedHours: number;
    actualHours: number;
    revenue: number;
  }) => void;
  onTaskReopened: () => void;
  checkStreak: () => void;
  syncDailyCompleted: (tasks: { status: string; completedAt?: string }[]) => void;
  dismissReward: (id: string) => void;
  checkAchievements: (context: {
    totalCompleted: number;
    totalRevenue: number;
    winRate: number;
    streak: number;
    fastestRatio: number; // actualHours/estimatedHours
  }) => void;
  resetGamification: () => void;
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
      dailyCompleted: 0,
      dailyTarget: 3,

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
          const today = todayLocal();
          const newDaily = (s.lastActiveDate === today ? s.dailyCompleted : 0) + 1;
          const rewards = [
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
          ];

          // Daily target prize: 3 tasks/day
          let bonusXP = 0;
          if (newDaily === s.dailyTarget) {
            bonusXP = 75;
            rewards.push({
              id: "daily-" + Date.now(),
              xp: bonusXP,
              message: `+${bonusXP} XP — Daily Target Hit!`,
              multiplierLabel: "3/3 TODAY!",
              isJackpot: false,
              positiveFrame: "You crushed your daily goal!",
              timestamp: Date.now() + 1,
            });
          }

          return {
            xp: newXP + bonusXP,
            level: getLevelFromXP(newXP + bonusXP).level,
            totalTasksCompleted: s.totalTasksCompleted + 1,
            dailyCompleted: newDaily,
            lastActiveDate: today,
            pendingRewards: rewards,
          };
        });
      },

      onTaskReopened: () => {
        // Reverse: deduct base XP (25) and decrement counters
        set((s) => {
          const today = todayLocal();
          const deduct = 25;
          const newXP = Math.max(0, s.xp - deduct);
          const levelInfo = getLevelFromXP(newXP);
          const newDaily = s.lastActiveDate === today
            ? Math.max(0, s.dailyCompleted - 1)
            : s.dailyCompleted;
          return {
            xp: newXP,
            level: levelInfo.level,
            totalTasksCompleted: Math.max(0, s.totalTasksCompleted - 1),
            dailyCompleted: newDaily,
          };
        });
      },

      syncDailyCompleted: (tasks) => {
        const today = todayLocal();
        const completedToday = tasks.filter(
          (t) =>
            t.status === "completed" &&
            t.completedAt &&
            new Date(t.completedAt).toLocaleDateString("en-CA", {
              timeZone: "America/Chicago",
            }) === today
        ).length;
        const current = get().dailyCompleted;
        if (completedToday > current) {
          set({ dailyCompleted: completedToday, lastActiveDate: today });
        }
      },

      checkStreak: () => {
        const today = todayLocal();
        const last = get().lastActiveDate;
        if (last === today) return;

        const yesterday = yesterdayLocal();
        set((s) => {
          // Streak only continues if yesterday hit the daily target (3 tasks)
          const hitTargetYesterday = last === yesterday && s.dailyCompleted >= s.dailyTarget;
          const newStreak = hitTargetYesterday ? s.streak + 1 : (last === yesterday ? s.streak : 0);
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
            dailyCompleted: 0, // reset for new day
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
      resetGamification: () =>
        set({
          xp: 0,
          level: 1,
          streak: 0,
          lastActiveDate: "",
          achievements: [],
          totalTasksCompleted: 0,
          multiplier: 1,
          pendingRewards: [],
          dailyCompleted: 0,
        }),
    }),
    {
      name: "tasktrader-gamification",
      version: 2,
      migrate: () => ({
        xp: 0,
        level: 1,
        streak: 0,
        lastActiveDate: "",
        achievements: [],
        totalTasksCompleted: 0,
        multiplier: 1,
        pendingRewards: [],
        dailyCompleted: 0,
        dailyTarget: 3,
      }),
    }
  )
);

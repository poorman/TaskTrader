import type { Achievement } from "../types";

// XP required per level (exponential curve)
export function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

export function getLevelFromXP(totalXP: number): {
  level: number;
  currentXP: number;
  nextLevelXP: number;
} {
  let level = 1;
  let remaining = totalXP;
  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level);
    level++;
  }
  return { level, currentXP: remaining, nextLevelXP: xpForLevel(level) };
}

// Variable reward: random XP bonus (slot machine mechanic)
export function rollReward(): {
  baseXP: number;
  bonus: number;
  multiplierLabel: string;
  isJackpot: boolean;
} {
  const baseXP = 25;
  const roll = Math.random();

  if (roll < 0.01) {
    // 1% - JACKPOT!
    return {
      baseXP,
      bonus: baseXP * 10,
      multiplierLabel: "10x JACKPOT!",
      isJackpot: true,
    };
  } else if (roll < 0.05) {
    // 4% - big bonus
    return {
      baseXP,
      bonus: baseXP * 5,
      multiplierLabel: "5x BONUS!",
      isJackpot: false,
    };
  } else if (roll < 0.15) {
    // 10% - nice bonus
    return {
      baseXP,
      bonus: baseXP * 3,
      multiplierLabel: "3x COMBO!",
      isJackpot: false,
    };
  } else if (roll < 0.35) {
    // 20% - small bonus
    return {
      baseXP,
      bonus: baseXP * 2,
      multiplierLabel: "2x NICE!",
      isJackpot: false,
    };
  } else {
    return { baseXP, bonus: baseXP, multiplierLabel: "", isJackpot: false };
  }
}

// Losses disguised as wins - positive framing for negative outcomes
export function getPositiveFrame(task: {
  pnl: number;
  status: string;
}): string {
  const messages = {
    completed_loss: [
      "Task delivered! Client satisfied.",
      "Quality investment! Experience gained.",
      "Shipped it! Building reputation.",
      "Done & delivered! Momentum up!",
      "Completed! Consistency is key.",
    ],
    lost: [
      "Pipeline cleared! Focus sharpened.",
      "Strategic pivot! Resources freed.",
      "Learning opportunity captured!",
      "Capacity unlocked for bigger deals!",
      "Market adjusted. Next one's a winner!",
    ],
    completed_win: [
      "Profit locked in! Great trade!",
      "Under budget! Efficiency bonus!",
      "Clean execution. Pure profit!",
      "Money in the bank!",
      "Crushed it! Max returns!",
    ],
  };

  let pool: string[];
  if (task.status === "lost") {
    pool = messages.lost;
  } else if (task.pnl < 0) {
    pool = messages.completed_loss;
  } else {
    pool = messages.completed_win;
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

// Streak messages
export function getStreakMessage(streak: number): string | null {
  if (streak === 3) return "3-day streak! You're on fire!";
  if (streak === 5) return "5-day streak! Unstoppable!";
  if (streak === 7) return "WEEKLY WARRIOR! 7-day streak!";
  if (streak === 14) return "TWO WEEKS STRONG! Legend!";
  if (streak === 30) return "MONTHLY MASTER! 30 days!";
  if (streak > 0 && streak % 10 === 0)
    return `${streak}-DAY STREAK! Incredible!`;
  return null;
}

// Achievement definitions
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_blood",
    title: "First Blood",
    description: "Complete your first task",
    icon: "🎯",
    xpReward: 50,
    rarity: "common",
  },
  {
    id: "hat_trick",
    title: "Hat Trick",
    description: "Complete 3 tasks in one day",
    icon: "🎩",
    xpReward: 100,
    rarity: "common",
  },
  {
    id: "speed_demon",
    title: "Speed Demon",
    description: "Complete a task 50% under estimated time",
    icon: "⚡",
    xpReward: 150,
    rarity: "rare",
  },
  {
    id: "money_maker",
    title: "Money Maker",
    description: "Earn $1,000 in profit",
    icon: "💰",
    xpReward: 200,
    rarity: "rare",
  },
  {
    id: "streak_5",
    title: "Hot Streak",
    description: "Maintain a 5-day task streak",
    icon: "🔥",
    xpReward: 250,
    rarity: "rare",
  },
  {
    id: "ten_bagger",
    title: "Ten Bagger",
    description: "Complete 10 tasks",
    icon: "📈",
    xpReward: 300,
    rarity: "rare",
  },
  {
    id: "perfectionist",
    title: "Perfectionist",
    description: "80%+ win rate with 20+ tasks",
    icon: "💎",
    xpReward: 500,
    rarity: "epic",
  },
  {
    id: "whale",
    title: "Whale",
    description: "Earn $10,000 in total revenue",
    icon: "🐋",
    xpReward: 750,
    rarity: "epic",
  },
  {
    id: "centurion",
    title: "Centurion",
    description: "Complete 100 tasks",
    icon: "👑",
    xpReward: 1000,
    rarity: "legendary",
  },
  {
    id: "streak_30",
    title: "Iron Will",
    description: "30-day task streak",
    icon: "🏆",
    xpReward: 1500,
    rarity: "legendary",
  },
];

export const RARITY_COLORS: Record<string, string> = {
  common: "#94a3b8",
  rare: "#3b82f6",
  epic: "#a855f7",
  legendary: "#ffaa00",
};

import { api } from "./api";
import { useTaskStore } from "../stores/taskStore";
import { useGamificationStore } from "../stores/gamificationStore";
import { useBabyDiaryStore } from "../plugins/baby-diary/babyDiaryStore";

let saveTimer: ReturnType<typeof setTimeout> | null = null;
let gamSaveTimer: ReturnType<typeof setTimeout> | null = null;
let babySaveTimer: ReturnType<typeof setTimeout> | null = null;
let initialized = false;

/** Debounced save of task store data to backend */
function debounceSaveTaskData() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    const s = useTaskStore.getState();
    api.saveState({
      tasks: s.tasks,
      clients: s.clients,
      categories: s.categories,
      goals: s.goals,
      meetings: s.meetings,
    }).catch((err) => console.warn("Sync save failed:", err));
  }, 500);
}

/** Debounced save of gamification data to backend */
function debounceSaveGamification() {
  if (gamSaveTimer) clearTimeout(gamSaveTimer);
  gamSaveTimer = setTimeout(() => {
    const g = useGamificationStore.getState();
    api.saveKey("gamification", {
      xp: g.xp,
      level: g.level,
      streak: g.streak,
      lastActiveDate: g.lastActiveDate,
      achievements: g.achievements,
      totalTasksCompleted: g.totalTasksCompleted,
      multiplier: g.multiplier,
      dailyCompleted: g.dailyCompleted,
      dailyTarget: g.dailyTarget,
    }).catch((err) => console.warn("Gamification sync failed:", err));
  }, 500);
}

/** Debounced save of baby diary data to backend */
function debounceSaveBabyDiary() {
  if (babySaveTimer) clearTimeout(babySaveTimer);
  babySaveTimer = setTimeout(() => {
    const b = useBabyDiaryStore.getState();
    api.saveKey("babydiary", b.entries)
      .catch((err) => console.warn("Baby diary sync failed:", err));
  }, 500);
}

/** Initialize: fetch from backend, hydrate stores, subscribe to changes */
export async function initSync(): Promise<boolean> {
  if (initialized) return true;

  try {
    const state = await api.getState();
    const taskStore = useTaskStore.getState();
    const gamStore = useGamificationStore.getState();

    // Hydrate task store if backend has data
    if (state.tasks && Array.isArray(state.tasks) && state.tasks.length > 0) {
      useTaskStore.setState({
        tasks: state.tasks as any[],
        clients: (state.clients as any[]) ?? taskStore.clients,
        categories: (state.categories as any[]) ?? taskStore.categories,
        goals: (state.goals as any[]) ?? taskStore.goals,
        meetings: (state.meetings as any[]) ?? taskStore.meetings,
      });
    } else if (taskStore.tasks.length > 0) {
      // Backend is empty but localStorage has data — push it up
      await api.saveState({
        tasks: taskStore.tasks,
        clients: taskStore.clients,
        categories: taskStore.categories,
        goals: taskStore.goals,
        meetings: taskStore.meetings,
      });
    }

    // Hydrate gamification store if backend has data
    if (state.gamification && typeof state.gamification === "object") {
      const g = state.gamification as any;
      useGamificationStore.setState({
        xp: g.xp ?? gamStore.xp,
        level: g.level ?? gamStore.level,
        streak: g.streak ?? gamStore.streak,
        lastActiveDate: g.lastActiveDate ?? gamStore.lastActiveDate,
        achievements: g.achievements ?? gamStore.achievements,
        totalTasksCompleted: g.totalTasksCompleted ?? gamStore.totalTasksCompleted,
        multiplier: g.multiplier ?? gamStore.multiplier,
        dailyCompleted: g.dailyCompleted ?? gamStore.dailyCompleted,
        dailyTarget: g.dailyTarget ?? gamStore.dailyTarget,
      });
    } else if (gamStore.xp > 0 || gamStore.totalTasksCompleted > 0) {
      // Push existing gamification to backend
      await api.saveKey("gamification", {
        xp: gamStore.xp,
        level: gamStore.level,
        streak: gamStore.streak,
        lastActiveDate: gamStore.lastActiveDate,
        achievements: gamStore.achievements,
        totalTasksCompleted: gamStore.totalTasksCompleted,
        multiplier: gamStore.multiplier,
        dailyCompleted: gamStore.dailyCompleted,
        dailyTarget: gamStore.dailyTarget,
      });
    }

    // Hydrate baby diary store if backend has data
    const babyStore = useBabyDiaryStore.getState();
    if (state.babydiary && Array.isArray(state.babydiary) && state.babydiary.length > 0) {
      useBabyDiaryStore.setState({ entries: state.babydiary as any[] });
    } else if (babyStore.entries.length > 0) {
      await api.saveKey("babydiary", babyStore.entries);
    }

    // Subscribe to future changes
    useTaskStore.subscribe(debounceSaveTaskData);
    useGamificationStore.subscribe(debounceSaveGamification);
    useBabyDiaryStore.subscribe(debounceSaveBabyDiary);

    initialized = true;
    console.log("Backend sync initialized");
    return true;
  } catch (err) {
    console.warn("Backend unavailable, using localStorage only:", err);
    return false;
  }
}

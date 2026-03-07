import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import TaskBoard from "./pages/TaskBoard";
import Analytics from "./pages/Analytics";
import NewTask from "./pages/NewTask";
import Clients from "./pages/Clients";
import Categories from "./pages/Categories";
import Goals from "./pages/Goals";
import Calendar from "./pages/Calendar";
import Achievements from "./pages/Achievements";
import Settings from "./pages/Settings";
import BabyDiaryPage from "./plugins/baby-diary/BabyDiaryPage"; // PLUGIN: baby-diary
import RewardPopup from "./components/gamification/RewardPopup";
import AchievementToast from "./components/gamification/AchievementToast";
import { useUIStore } from "./stores/uiStore";
import { useTaskStore } from "./stores/taskStore";
import { useGamificationStore } from "./stores/gamificationStore";
import { SEED_TASKS, SEED_CLIENTS } from "./utils/seedData";
import { initSync } from "./utils/sync";

function PageContent() {
  const activePage = useUIStore((s) => s.activePage);

  const pages: Record<string, JSX.Element> = {
    dashboard: <Dashboard />,
    analytics: <Analytics />,
    taskboard: <TaskBoard />,
    newtask: <NewTask />,
    clients: <Clients />,
    calendar: <Calendar />,
    categories: <Categories />,
    goals: <Goals />,
    achievements: <Achievements />,
    settings: <Settings />,
    babydiary: <BabyDiaryPage />, // PLUGIN: baby-diary
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activePage}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8, pointerEvents: "none" as const }}
        transition={{ duration: 0.2 }}
      >
        {pages[activePage] || <Dashboard />}
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  const seed = useTaskStore((s) => s.seed);
  const checkStreak = useGamificationStore((s) => s.checkStreak);
  const syncDailyCompleted = useGamificationStore((s) => s.syncDailyCompleted);

  // Sync with backend on load, then seed if first visit (not after explicit clear)
  useEffect(() => {
    initSync().finally(() => {
      const currentTasks = useTaskStore.getState().tasks;
      const wasCleared = localStorage.getItem("tasktrader-cleared");
      if (currentTasks.length === 0 && !wasCleared) {
        seed(SEED_TASKS, SEED_CLIENTS);
      }
      checkStreak();
      // Reconcile daily completed count from actual task data
      syncDailyCompleted(useTaskStore.getState().tasks);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Layout>
        <PageContent />
      </Layout>
      <RewardPopup />
      <AchievementToast />
    </>
  );
}

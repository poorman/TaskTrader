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
import Settings from "./pages/Settings";
import RewardPopup from "./components/gamification/RewardPopup";
import AchievementToast from "./components/gamification/AchievementToast";
import { useUIStore } from "./stores/uiStore";
import { useTaskStore } from "./stores/taskStore";
import { useGamificationStore } from "./stores/gamificationStore";
import { SEED_TASKS, SEED_CLIENTS } from "./utils/seedData";

function PageContent() {
  const activePage = useUIStore((s) => s.activePage);

  const pages: Record<string, JSX.Element> = {
    dashboard: <Dashboard />,
    analytics: <Analytics />,
    taskboard: <TaskBoard />,
    newtask: <NewTask />,
    clients: <Clients />,
    categories: <Categories />,
    goals: <Goals />,
    settings: <Settings />,
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activePage}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
      >
        {pages[activePage] || <Dashboard />}
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  const tasks = useTaskStore((s) => s.tasks);
  const seed = useTaskStore((s) => s.seed);
  const checkStreak = useGamificationStore((s) => s.checkStreak);

  // Auto-seed on first load
  useEffect(() => {
    if (tasks.length === 0) {
      seed(SEED_TASKS, SEED_CLIENTS);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Check streak on load
  useEffect(() => {
    checkStreak();
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

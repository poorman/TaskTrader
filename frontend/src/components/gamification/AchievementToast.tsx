import { motion, AnimatePresence } from "framer-motion";
import { useGamificationStore } from "../../stores/gamificationStore";
import { RARITY_COLORS } from "../../utils/gamification";

export default function AchievementToast() {
  const achievements = useGamificationStore((s) => s.achievements);
  // Show only achievements unlocked in last 10 seconds
  const recent = achievements.filter(
    (a) =>
      a.unlockedAt &&
      Date.now() - new Date(a.unlockedAt).getTime() < 10000
  );

  return (
    <div className="fixed top-20 right-6 z-[90] space-y-3">
      <AnimatePresence>
        {recent.map((a) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="glass rounded-xl px-4 py-3 flex items-center gap-3 min-w-[260px]"
            style={{
              borderColor: RARITY_COLORS[a.rarity] + "40",
              boxShadow: `0 0 20px ${RARITY_COLORS[a.rarity]}15`,
            }}
          >
            <span className="text-2xl">{a.icon}</span>
            <div>
              <p
                className="text-xs font-bold font-display"
                style={{ color: RARITY_COLORS[a.rarity] }}
              >
                {a.title}
              </p>
              <p className="text-[10px] text-gray-400">{a.description}</p>
              <p className="text-[9px] text-profit font-mono mt-0.5">
                +{a.xpReward} XP
              </p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

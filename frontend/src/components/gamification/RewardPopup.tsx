import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { useGamificationStore } from "../../stores/gamificationStore";

export default function RewardPopup() {
  const pendingRewards = useGamificationStore((s) => s.pendingRewards);
  const dismissReward = useGamificationStore((s) => s.dismissReward);
  const reward = pendingRewards[0];

  useEffect(() => {
    if (!reward) return;

    // Fire confetti for any reward
    const colors = reward.isJackpot
      ? ["#ffaa00", "#ff4466", "#00ff88", "#a855f7", "#3b82f6"]
      : ["#00ff88", "#06b6d4"];

    confetti({
      particleCount: reward.isJackpot ? 150 : 40,
      spread: reward.isJackpot ? 100 : 60,
      origin: { y: 0.7 },
      colors,
      gravity: 0.8,
      scalar: reward.isJackpot ? 1.5 : 1,
    });

    // Auto-dismiss after delay
    const timer = setTimeout(
      () => dismissReward(reward.id),
      reward.isJackpot ? 4000 : 2500
    );
    return () => clearTimeout(timer);
  }, [reward, dismissReward]);

  return (
    <AnimatePresence>
      {reward && (
        <motion.div
          key={reward.id}
          className="fixed bottom-8 left-1/2 z-[100]"
          initial={{ opacity: 0, y: 40, x: "-50%", scale: 0.8 }}
          animate={{ opacity: 1, y: 0, x: "-50%", scale: 1 }}
          exit={{ opacity: 0, y: -20, x: "-50%", scale: 0.9 }}
          transition={{ type: "spring", damping: 15, stiffness: 300 }}
        >
          <div
            className={`glass rounded-2xl px-6 py-4 flex items-center gap-4 relative overflow-hidden ${
              reward.isJackpot ? "ring-2 ring-accent-amber/50" : ""
            }`}
            style={{
              background: reward.isJackpot
                ? "linear-gradient(135deg, rgba(255,170,0,0.15), rgba(168,85,247,0.1))"
                : "rgba(17,24,39,0.95)",
              borderColor: reward.isJackpot
                ? "rgba(255,170,0,0.3)"
                : "rgba(255,255,255,0.1)",
            }}
          >
            {/* Shimmer on jackpot */}
            {reward.isJackpot && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer bg-[length:200%_100%]" />
            )}

            {/* XP badge */}
            <motion.div
              initial={{ rotate: -15, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", damping: 10, stiffness: 200, delay: 0.1 }}
              className="relative"
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold ${
                  reward.isJackpot
                    ? "bg-gradient-to-br from-accent-amber to-accent-purple text-white"
                    : "bg-profit/20 text-profit"
                }`}
              >
                {reward.multiplierLabel || "XP"}
              </div>
            </motion.div>

            <div className="relative z-10">
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className={`text-sm font-display font-bold ${
                  reward.isJackpot ? "text-accent-amber" : "text-profit"
                }`}
              >
                {reward.message}
              </motion.p>
              {reward.positiveFrame && (
                <motion.p
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 }}
                  className="text-xs text-gray-400 mt-0.5"
                >
                  {reward.positiveFrame}
                </motion.p>
              )}
              {reward.multiplierLabel && (
                <motion.p
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="text-[10px] font-bold text-accent-amber mt-1"
                >
                  {reward.multiplierLabel}
                </motion.p>
              )}
            </div>

            <button
              onClick={() => dismissReward(reward.id)}
              className="ml-4 text-gray-500 hover:text-white transition-colors text-xs relative z-10"
            >
              ×
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

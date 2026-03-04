import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  glowColor?: string;
  delay?: number;
  onClick?: () => void;
  hover?: boolean;
}

export default function GlassCard({
  children,
  className = "",
  glowColor,
  delay = 0,
  onClick,
  hover = true,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={
        hover
          ? { scale: 1.01, transition: { duration: 0.2 } }
          : undefined
      }
      onClick={onClick}
      className={`glass rounded-2xl card-shine ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
      style={
        glowColor
          ? {
              boxShadow: `0 0 24px ${glowColor}15, 0 0 48px ${glowColor}08`,
            }
          : undefined
      }
    >
      {children}
    </motion.div>
  );
}

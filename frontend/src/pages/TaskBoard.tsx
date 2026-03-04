import { motion } from "framer-motion";
import Board from "../components/kanban/Board";

export default function TaskBoard() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full"
    >
      <Board />
    </motion.div>
  );
}

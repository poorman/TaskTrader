import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { MoreHorizontal } from "lucide-react";
import type { Task, Client, TaskStatus } from "../../types";
import TaskCard from "./TaskCard";

interface Props {
  status: TaskStatus;
  label: string;
  dotColor: string;
  tasks: Task[];
  clients: Client[];
  onDrop: (taskId: string, newStatus: TaskStatus) => void;
}

export default function Column({
  status,
  label,
  dotColor,
  tasks,
  clients,
  onDrop,
}: Props) {
  const [isDragOver, setIsDragOver] = useState(false);
  const clientMap = Object.fromEntries(clients.map((c) => [c.id, c]));
  const total = tasks.reduce(
    (s, t) =>
      s +
      (t.status === "completed" || t.status === "lost" ? t.pnl : t.revenue),
    0
  );

  return (
    <div
      className={`flex flex-col min-w-[240px] w-[240px] shrink-0 rounded-2xl transition-all ${
        isDragOver ? "ring-1 ring-profit/30 bg-profit/[0.02]" : ""
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        const taskId = e.dataTransfer.getData("taskId");
        if (taskId) onDrop(taskId, status);
      }}
    >
      {/* Column header */}
      <div className="flex items-center gap-2 px-2 mb-3">
        <span
          className="w-2.5 h-2.5 rounded-full shrink-0"
          style={{
            background: dotColor,
            boxShadow: `0 0 8px ${dotColor}60`,
          }}
        />
        <span className="text-xs font-semibold text-gray-200 flex-1">
          {label}
        </span>
        <span className="text-[10px] font-mono text-gray-500">
          {tasks.length}
        </span>
        <button className="p-0.5 text-gray-500 hover:text-gray-300 transition-colors">
          <MoreHorizontal size={14} />
        </button>
      </div>

      {/* Total value */}
      <div className="px-2 mb-3">
        <span
          className="text-xs font-mono font-bold"
          style={{ color: total >= 0 ? dotColor : "#ff4466" }}
        >
          {total >= 0 ? "+" : ""}${total.toLocaleString()}
        </span>
      </div>

      {/* Cards */}
      <div className="flex-1 space-y-2 px-1 overflow-y-auto no-scrollbar max-h-[calc(100vh-300px)]">
        <AnimatePresence mode="popLayout">
          {tasks
            .sort((a, b) => a.order - b.order)
            .map((task) => (
              <div
                key={task.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("taskId", task.id);
                }}
              >
                <TaskCard
                  task={task}
                  client={clientMap[task.clientId]}
                  dragControls
                />
              </div>
            ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

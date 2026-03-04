import { useTaskStore } from "../../stores/taskStore";
import type { TaskStatus } from "../../types";
import Column from "./Column";

const COLUMNS: { status: TaskStatus; label: string; dotColor: string }[] = [
  { status: "lead", label: "Lead", dotColor: "#ffaa00" },
  { status: "in_progress", label: "In Progress", dotColor: "#00ff88" },
  { status: "waiting", label: "Waiting on Client", dotColor: "#64748b" },
  { status: "completed", label: "Completed", dotColor: "#22c55e" },
  { status: "lost", label: "Lost", dotColor: "#ff4466" },
];

export default function Board() {
  const tasks = useTaskStore((s) => s.tasks);
  const clients = useTaskStore((s) => s.clients);
  const moveTask = useTaskStore((s) => s.moveTask);

  const handleDrop = (taskId: string, newStatus: TaskStatus) => {
    moveTask(taskId, newStatus);
  };

  return (
    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 h-full">
      {COLUMNS.map((col) => (
        <Column
          key={col.status}
          status={col.status}
          label={col.label}
          dotColor={col.dotColor}
          tasks={tasks.filter((t) => t.status === col.status)}
          clients={clients}
          onDrop={handleDrop}
        />
      ))}
    </div>
  );
}

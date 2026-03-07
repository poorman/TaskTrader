import type { Task, Client } from "../../types";

export default function TickerTape({
  tasks,
  clients,
}: {
  tasks: Task[];
  clients: Client[];
}) {
  const clientMap = Object.fromEntries(clients.map((c) => [c.id, c]));
  const recentClosed = tasks
    .filter(
      (t) =>
        (t.status === "completed" || t.status === "lost") && t.completedAt
    )
    .sort(
      (a, b) =>
        new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime()
    )
    .slice(0, 12);

  if (recentClosed.length === 0) return null;

  const items = [...recentClosed, ...recentClosed]; // duplicate for seamless loop

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="ticker-wrap py-2.5 px-4">
        <div className="inline-flex gap-6 animate-ticker">
          {items.map((t, i) => {
            const client = clientMap[t.clientId];
            const isWin = t.pnl >= 0;
            return (
              <span
                key={`${t.id}-${i}`}
                className="inline-flex items-center gap-2 text-[11px] whitespace-nowrap"
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{
                    background: isWin ? "rgb(var(--color-profit))" : "#ff4466",
                    boxShadow: `0 0 6px ${isWin ? "rgba(0,255,136,0.5)" : "rgba(255,68,102,0.5)"}`,
                  }}
                />
                <span className="text-gray-400 font-medium">
                  {client?.name || "Unknown"}
                </span>
                <span className="text-white font-semibold">{t.title}</span>
                <span
                  className="font-mono font-bold"
                  style={{ color: isWin ? "rgb(var(--color-profit))" : "#ff4466" }}
                >
                  {isWin ? "+" : ""}${t.pnl.toLocaleString()}
                </span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

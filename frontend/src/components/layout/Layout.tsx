import { type ReactNode, useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useUIStore } from "../../stores/uiStore";

export default function Layout({ children }: { children: ReactNode }) {
  const theme = useUIStore((s) => s.theme);

  // Sync data-theme attribute on mount and when theme changes
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <div className="flex h-screen bg-surface-0 relative overflow-hidden noise">
      {/* Background ambient gradient (hidden in light theme via CSS) */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          background:
            theme === "dark"
              ? "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0,255,136,0.04), transparent), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(59,130,246,0.03), transparent)"
              : "none",
        }}
      />
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 relative">
        <Header />
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

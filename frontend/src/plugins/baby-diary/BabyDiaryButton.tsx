import { Baby } from "lucide-react";
import { useUIStore } from "../../stores/uiStore";
import { useBabyDiaryStore } from "./babyDiaryStore";
import { todayLocal } from "../../utils/timezone";

export default function BabyDiaryButton() {
  const { activePage, setPage } = useUIStore();
  const entries = useBabyDiaryStore((s) => s.entries);
  const todayCount = entries.filter((e) => e.date === todayLocal()).length;

  return (
    <button
      onClick={() => setPage("babydiary")}
      className={`relative p-2 rounded-xl glass-hover transition-colors ${
        activePage === "babydiary"
          ? "text-pink-400"
          : "text-gray-400 hover:text-white"
      }`}
      title="Baby Diary"
    >
      <Baby size={16} />
      {todayCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-pink-500 text-[9px] font-bold flex items-center justify-center text-white">
          {todayCount}
        </span>
      )}
    </button>
  );
}

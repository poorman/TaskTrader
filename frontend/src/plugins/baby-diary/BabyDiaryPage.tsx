import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Trash2, Clock, Edit3, Check, X } from "lucide-react";
import { useBabyDiaryStore } from "./babyDiaryStore";
import { ENTRY_TYPES } from "./types";
import type { DiaryEntryType, DiaryEntry } from "./types";
import { todayLocal } from "../../utils/timezone";
import { useUIStore } from "../../stores/uiStore";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return `${DAYS[date.getDay()]}, ${MONTHS[date.getMonth()]} ${d}`;
}

function shiftDate(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d + days);
  const yy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

function nowTime(): string {
  return new Date().toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Chicago",
  });
}

export default function BabyDiaryPage() {
  const entries = useBabyDiaryStore((s) => s.entries);
  const addEntry = useBabyDiaryStore((s) => s.addEntry);
  const updateEntry = useBabyDiaryStore((s) => s.updateEntry);
  const deleteEntry = useBabyDiaryStore((s) => s.deleteEntry);
  const theme = useUIStore((s) => s.theme);
  const isLight = theme === "light";

  const today = todayLocal();
  const [selectedDate, setSelectedDate] = useState(today);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTime, setEditTime] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editDuration, setEditDuration] = useState<number | undefined>();

  const dayEntries = useMemo(
    () =>
      entries
        .filter((e) => e.date === selectedDate)
        .sort((a, b) => b.time.localeCompare(a.time)),
    [entries, selectedDate]
  );

  const handleQuickAdd = (type: DiaryEntryType) => {
    addEntry({
      date: selectedDate,
      time: nowTime(),
      type,
      notes: "",
    });
  };

  const handleStartEdit = (entry: DiaryEntry) => {
    setEditingId(entry.id);
    setEditTime(entry.time);
    setEditNotes(entry.notes);
    setEditDuration(entry.duration);
  };

  const handleSaveEdit = () => {
    if (!editingId) return;
    updateEntry(editingId, { time: editTime, notes: editNotes, duration: editDuration });
    setEditingId(null);
  };

  // Daily summary
  const summary = useMemo(() => {
    const counts: Record<DiaryEntryType, number> = {
      feeding: 0, diaper: 0, playtime: 0, sleep: 0, bath: 0, other: 0,
    };
    let totalDuration = 0;
    for (const e of dayEntries) {
      counts[e.type]++;
      if (e.duration) totalDuration += e.duration;
    }
    return { counts, totalDuration };
  }, [dayEntries]);

  const isToday = selectedDate === today;

  return (
    <div className="max-w-[700px] mx-auto space-y-5">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2">
          <span className="text-2xl">👶</span> Baby Diary
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {dayEntries.length} {dayEntries.length === 1 ? "entry" : "entries"} {isToday ? "today" : `on ${formatDate(selectedDate)}`}
        </p>
      </motion.div>

      {/* Date Navigator */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="glass rounded-2xl p-4 flex items-center justify-between"
      >
        <button
          onClick={() => setSelectedDate(shiftDate(selectedDate, -1))}
          className="p-2 rounded-xl glass-hover text-gray-400 hover:text-white transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="text-center">
          <p className="font-display font-bold text-white text-sm">
            {formatDate(selectedDate)}
          </p>
          {isToday && (
            <span className="text-[10px] text-pink-400 font-semibold uppercase tracking-wider">
              Today
            </span>
          )}
        </div>
        <button
          onClick={() => {
            if (selectedDate < today) setSelectedDate(shiftDate(selectedDate, 1));
          }}
          className={`p-2 rounded-xl glass-hover transition-colors ${
            selectedDate >= today
              ? "text-gray-600 cursor-not-allowed"
              : "text-gray-400 hover:text-white"
          }`}
          disabled={selectedDate >= today}
        >
          <ChevronRight size={18} />
        </button>
      </motion.div>

      {/* Quick-add buttons */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-3 sm:grid-cols-6 gap-2"
      >
        {ENTRY_TYPES.map((et) => (
          <button
            key={et.type}
            onClick={() => handleQuickAdd(et.type)}
            className="glass rounded-xl p-3 flex flex-col items-center gap-1.5 hover:bg-white/5 transition-all group"
            style={{
              borderColor: `${et.color}20`,
            }}
          >
            <span className="text-xl group-hover:scale-110 transition-transform">
              {et.icon}
            </span>
            <span className="text-[10px] font-semibold text-gray-400 group-hover:text-white transition-colors">
              {et.label}
            </span>
          </button>
        ))}
      </motion.div>

      {/* Timeline */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {dayEntries.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass rounded-2xl p-8 text-center"
            >
              <p className="text-3xl mb-2">👶</p>
              <p className="text-sm text-gray-400">
                No entries for {isToday ? "today" : formatDate(selectedDate)}.
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Tap a button above to log an activity.
              </p>
            </motion.div>
          ) : (
            dayEntries.map((entry, i) => {
              const typeInfo = ENTRY_TYPES.find((t) => t.type === entry.type)!;
              const isEditing = editingId === entry.id;

              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ delay: i * 0.03 }}
                  className="glass rounded-xl p-4 flex items-start gap-3 group relative"
                  style={{ borderColor: `${typeInfo.color}15` }}
                >
                  {/* Time */}
                  <div className="flex flex-col items-center shrink-0">
                    {isEditing ? (
                      <input
                        type="time"
                        value={editTime}
                        onChange={(e) => setEditTime(e.target.value)}
                        className="w-20 px-1 py-1 rounded-lg bg-white/[0.03] border border-glass-border text-white text-xs font-mono font-bold text-center focus:outline-none focus:border-profit/30"
                      />
                    ) : (
                      <>
                        <Clock size={10} className="text-gray-500 mb-0.5" />
                        <span className="text-xs font-mono font-bold text-white">
                          {entry.time}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Type icon */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                    style={
                      isLight
                        ? {
                            background: `linear-gradient(145deg, #e8edf4, #d4d9e0)`,
                            boxShadow: `3px 3px 6px #b8bec7, -3px -3px 6px #ffffff`,
                          }
                        : {
                            background: `${typeInfo.color}15`,
                          }
                    }
                  >
                    {typeInfo.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className="text-xs font-display font-bold"
                        style={{ color: typeInfo.color }}
                      >
                        {typeInfo.label}
                      </span>
                      {entry.duration && (
                        <span className="text-[10px] text-gray-500">
                          {entry.duration} min
                        </span>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="space-y-2 mt-1">
                        <input
                          type="text"
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          placeholder="Add notes..."
                          className="w-full px-2 py-1.5 rounded-lg bg-white/[0.03] border border-glass-border text-white text-xs focus:outline-none focus:border-profit/30"
                          autoFocus
                        />
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={editDuration ?? ""}
                            onChange={(e) =>
                              setEditDuration(
                                e.target.value ? Number(e.target.value) : undefined
                              )
                            }
                            placeholder="Duration (min)"
                            min={1}
                            className="w-28 px-2 py-1.5 rounded-lg bg-white/[0.03] border border-glass-border text-white text-xs focus:outline-none focus:border-profit/30"
                          />
                          <button
                            onClick={handleSaveEdit}
                            className="p-1.5 rounded-lg bg-profit/20 text-profit hover:bg-profit/30 transition-colors"
                          >
                            <Check size={12} />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white transition-colors"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[11px] text-gray-400">
                        {entry.notes || (
                          <span className="italic text-gray-600">No notes</span>
                        )}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  {!isEditing && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        onClick={() => handleStartEdit(entry)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all"
                      >
                        <Edit3 size={12} />
                      </button>
                      <button
                        onClick={() => deleteEntry(entry.id)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-loss hover:bg-loss/10 transition-all"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Daily Summary */}
      {dayEntries.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-5"
        >
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-3">
            Daily Summary
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {ENTRY_TYPES.map((et) => {
              const count = summary.counts[et.type];
              return (
                <div key={et.type} className="text-center">
                  <span className="text-lg">{et.icon}</span>
                  <p
                    className="text-lg font-display font-bold mt-0.5"
                    style={{ color: count > 0 ? et.color : "#4b5563" }}
                  >
                    {count}
                  </p>
                  <p className="text-[9px] text-gray-500">{et.label}</p>
                </div>
              );
            })}
          </div>
          {summary.totalDuration > 0 && (
            <p className="text-[10px] text-gray-500 text-center mt-3 pt-3 border-t border-glass-border">
              Total tracked time:{" "}
              <span className="font-mono font-semibold text-white">
                {Math.floor(summary.totalDuration / 60)}h {summary.totalDuration % 60}m
              </span>
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
}

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Trash2, Clock, Edit3, Check, X, Calendar } from "lucide-react";
import { useBabyDiaryStore } from "./babyDiaryStore";
import { ENTRY_TYPES } from "./types";
import type { DiaryEntryType, DiaryEntry } from "./types";
import { todayLocal } from "../../utils/timezone";
import { useUIStore } from "../../stores/uiStore";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_FULL = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

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

function toDateStr(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function nowTime(): string {
  return new Date().toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Chicago",
  });
}

/* ─── Mini Calendar Component ─── */
function MiniCalendar({
  selectedDate,
  onSelectDate,
  today,
  entriesByDate,
  isLight,
}: {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  today: string;
  entriesByDate: Record<string, number>;
  isLight: boolean;
}) {
  const [selY, selM] = selectedDate.split("-").map(Number);
  const [viewYear, setViewYear] = useState(selY);
  const [viewMonth, setViewMonth] = useState(selM - 1);

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(viewYear - 1); setViewMonth(11); }
    else setViewMonth(viewMonth - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(viewYear + 1); setViewMonth(0); }
    else setViewMonth(viewMonth + 1);
  };

  const cells: { day: number; dateStr: string; inMonth: boolean; isFuture: boolean }[] = [];

  // Previous month trailing days
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const m = viewMonth === 0 ? 11 : viewMonth - 1;
    const y = viewMonth === 0 ? viewYear - 1 : viewYear;
    cells.push({ day: d, dateStr: toDateStr(y, m, d), inMonth: false, isFuture: false });
  }
  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    const ds = toDateStr(viewYear, viewMonth, d);
    cells.push({ day: d, dateStr: ds, inMonth: true, isFuture: ds > today });
  }
  // Next month leading days
  const remaining = 7 - (cells.length % 7);
  if (remaining < 7) {
    for (let d = 1; d <= remaining; d++) {
      const m = viewMonth === 11 ? 0 : viewMonth + 1;
      const y = viewMonth === 11 ? viewYear + 1 : viewYear;
      cells.push({ day: d, dateStr: toDateStr(y, m, d), inMonth: false, isFuture: toDateStr(y, m, d) > today });
    }
  }

  // 3D neumorphic styles
  const calendarBg = isLight
    ? { background: "linear-gradient(145deg, #e8edf4, #dde2e9)", boxShadow: "8px 8px 16px #b8bec7, -8px -8px 16px #ffffff", borderRadius: "20px" }
    : {};
  const navBtnStyle = isLight
    ? { background: "linear-gradient(145deg, #e6ebf2, #d8dde4)", boxShadow: "3px 3px 6px #b8bec7, -3px -3px 6px #ffffff" }
    : {};
  const monthLabelStyle = isLight
    ? { background: "linear-gradient(145deg, #d8dde4, #e6ebf2)", boxShadow: "inset 2px 2px 4px #b8bec7, inset -2px -2px 4px #ffffff", borderRadius: "12px", padding: "6px 16px" }
    : {};

  const getCellStyle = (isSelected: boolean, isToday: boolean, inMonth: boolean, isFuture: boolean) => {
    if (!isLight) return {};
    if (isFuture) return { opacity: 0.35 };
    if (isSelected) {
      return {
        background: "linear-gradient(145deg, #f0b0c8, #e899b5)",
        boxShadow: "inset 3px 3px 6px #c4788f, inset -3px -3px 6px #ffcadf",
        borderRadius: "14px",
      };
    }
    if (isToday) {
      return {
        background: "linear-gradient(145deg, #d8dde4, #e6ebf2)",
        boxShadow: "inset 2px 2px 4px #b8bec7, inset -2px -2px 4px #ffffff",
        borderRadius: "14px",
      };
    }
    if (inMonth) {
      return {
        background: "linear-gradient(145deg, #e8edf4, #dce1e8)",
        boxShadow: "3px 3px 6px #b8bec7, -3px -3px 6px #ffffff",
        borderRadius: "14px",
      };
    }
    return { opacity: 0.4 };
  };

  return (
    <div className={isLight ? "p-5" : "glass rounded-2xl p-4"} style={calendarBg}>
      {/* Month nav */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className={`p-2 rounded-xl transition-all ${isLight ? "text-gray-600 hover:text-gray-900" : "text-gray-400 hover:text-white"}`}
          style={navBtnStyle}
        >
          <ChevronLeft size={16} />
        </button>
        <div style={monthLabelStyle}>
          <span className={`font-display font-bold text-sm ${isLight ? "text-gray-700" : "text-white"}`}>
            {MONTHS_FULL[viewMonth]} {viewYear}
          </span>
        </div>
        <button
          onClick={nextMonth}
          className={`p-2 rounded-xl transition-all ${isLight ? "text-gray-600 hover:text-gray-900" : "text-gray-400 hover:text-white"}`}
          style={navBtnStyle}
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {DAYS_SHORT.map((d) => (
          <div key={d} className={`text-center text-[9px] font-bold uppercase tracking-wider py-1 ${isLight ? "text-gray-500" : "text-gray-500"}`}>
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-2">
        {cells.map((cell, i) => {
          const isSelected = cell.dateStr === selectedDate;
          const isToday = cell.dateStr === today;
          const count = entriesByDate[cell.dateStr] || 0;
          const hasEntries = count > 0;
          const cellStyle = getCellStyle(isSelected, isToday, cell.inMonth, cell.isFuture);

          return (
            <button
              key={i}
              onClick={() => !cell.isFuture && onSelectDate(cell.dateStr)}
              disabled={cell.isFuture}
              className={`relative aspect-square flex flex-col items-center justify-center text-xs font-medium transition-all ${
                isLight
                  ? cell.isFuture
                    ? "text-gray-400 cursor-not-allowed"
                    : isSelected
                      ? "text-white font-bold"
                      : isToday
                        ? "text-gray-700 font-bold"
                        : cell.inMonth
                          ? "text-gray-600 hover:scale-[1.05] active:scale-95"
                          : "text-gray-400"
                  : cell.isFuture
                    ? "text-gray-600 cursor-not-allowed"
                    : isSelected
                      ? "bg-pink-500/20 text-pink-400 font-bold rounded-xl"
                      : isToday
                        ? "bg-white/10 text-white font-bold rounded-xl"
                        : cell.inMonth
                          ? "text-gray-300 hover:bg-white/5 rounded-xl"
                          : "text-gray-600 hover:bg-white/5 rounded-xl"
              }`}
              style={cellStyle}
            >
              {cell.day}
              {hasEntries && (
                <span
                  className={`absolute bottom-1.5 w-1.5 h-1.5 rounded-full ${
                    isSelected && isLight ? "bg-white" : "bg-pink-400"
                  }`}
                  style={isLight && !isSelected ? { boxShadow: "0 0 4px #ec4899" } : {}}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function BabyDiaryPage() {
  const entries = useBabyDiaryStore((s) => s.entries);
  const addEntry = useBabyDiaryStore((s) => s.addEntry);
  const updateEntry = useBabyDiaryStore((s) => s.updateEntry);
  const deleteEntry = useBabyDiaryStore((s) => s.deleteEntry);
  const theme = useUIStore((s) => s.theme);
  const isLight = theme === "light";

  const today = todayLocal();
  const [selectedDate, setSelectedDate] = useState(today);
  const [showCalendar, setShowCalendar] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTime, setEditTime] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editDurHours, setEditDurHours] = useState(0);
  const [editDurMinutes, setEditDurMinutes] = useState(0);

  const dayEntries = useMemo(
    () =>
      entries
        .filter((e) => e.date === selectedDate)
        .sort((a, b) => a.time.localeCompare(b.time)),
    [entries, selectedDate]
  );

  // Count entries per date for calendar dots
  const entriesByDate = useMemo(() => {
    const map: Record<string, number> = {};
    for (const e of entries) {
      map[e.date] = (map[e.date] || 0) + 1;
    }
    return map;
  }, [entries]);

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
    setEditDurHours(entry.duration ? Math.floor(entry.duration / 60) : 0);
    setEditDurMinutes(entry.duration ? entry.duration % 60 : 0);
  };

  const handleSaveEdit = () => {
    if (!editingId) return;
    const totalMinutes = editDurHours * 60 + editDurMinutes;
    updateEntry(editingId, { time: editTime, notes: editNotes, duration: totalMinutes || undefined });
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
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2">
            <span className="text-2xl">👶</span> Baby Diary
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {dayEntries.length} {dayEntries.length === 1 ? "entry" : "entries"} {isToday ? "today" : `on ${formatDate(selectedDate)}`}
          </p>
        </div>
        <button
          onClick={() => setShowCalendar(!showCalendar)}
          className={`p-2.5 rounded-xl transition-all ${
            showCalendar
              ? "bg-pink-500/20 text-pink-400"
              : "glass text-gray-400 hover:text-white"
          }`}
        >
          <Calendar size={18} />
        </button>
      </motion.div>

      {/* Date Navigator — toggleable between bar and calendar */}
      <AnimatePresence mode="wait">
        {showCalendar ? (
          <motion.div
            key="calendar"
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <MiniCalendar
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              today={today}
              entriesByDate={entriesByDate}
              isLight={isLight}
            />
          </motion.div>
        ) : (
          <motion.div
            key="bar"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
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
        )}
      </AnimatePresence>

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
                          {entry.duration >= 60
                            ? `${Math.floor(entry.duration / 60)}h${entry.duration % 60 > 0 ? ` ${entry.duration % 60}m` : ""}`
                            : `${entry.duration}m`}
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
                          <div className="flex gap-1 items-center">
                            <div className="relative">
                              <input
                                type="number"
                                value={editDurHours}
                                onChange={(e) => setEditDurHours(Math.max(0, Number(e.target.value)))}
                                min={0}
                                className="w-14 px-2 py-1.5 rounded-lg bg-white/[0.03] border border-glass-border text-white text-xs focus:outline-none focus:border-profit/30"
                              />
                              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-gray-500">hr</span>
                            </div>
                            <div className="relative">
                              <input
                                type="number"
                                value={editDurMinutes}
                                onChange={(e) => setEditDurMinutes(Math.max(0, Math.min(59, Number(e.target.value))))}
                                min={0}
                                max={59}
                                step={5}
                                className="w-14 px-2 py-1.5 rounded-lg bg-white/[0.03] border border-glass-border text-white text-xs focus:outline-none focus:border-profit/30"
                              />
                              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-gray-500">min</span>
                            </div>
                          </div>
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

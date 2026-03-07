import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Phone,
  Video,
  MapPin,
  FileCheck,
  X,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { useTaskStore } from "../stores/taskStore";
import { todayLocal } from "../utils/timezone";
import type { Meeting } from "../types";
import Modal from "../components/shared/Modal";

const MEETING_ICONS: Record<Meeting["type"], typeof Phone> = {
  call: Phone,
  video: Video,
  in_person: MapPin,
  review: FileCheck,
};

const MEETING_COLORS: Record<Meeting["type"], string> = {
  call: "#3b82f6",
  video: "#a855f7",
  in_person: "rgb(var(--color-profit))",
  review: "#ffaa00",
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function Calendar() {
  const meetings = useTaskStore((s) => s.meetings);
  const clients = useTaskStore((s) => s.clients);
  const addMeeting = useTaskStore((s) => s.addMeeting);
  const deleteMeeting = useTaskStore((s) => s.deleteMeeting);
  const toggleMeetingDone = useTaskStore((s) => s.toggleMeetingDone);

  const todayChicago = todayLocal(); // "YYYY-MM-DD" in America/Chicago
  const [todayYear, todayMonth] = todayChicago.split("-").map(Number);
  const [viewYear, setViewYear] = useState(todayYear);
  const [viewMonth, setViewMonth] = useState(todayMonth - 1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showNewMeeting, setShowNewMeeting] = useState(false);

  // New meeting form
  const [form, setForm] = useState({
    title: "",
    clientId: "",
    date: "",
    time: "10:00",
    duration: 30,
    notes: "",
    type: "call" as Meeting["type"],
  });

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfWeek(viewYear, viewMonth);

  const meetingsByDate = useMemo(() => {
    const map: Record<string, Meeting[]> = {};
    meetings.forEach((m) => {
      if (!map[m.date]) map[m.date] = [];
      map[m.date].push(m);
    });
    return map;
  }, [meetings]);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const todayStr = todayChicago;

  const handleCreateMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.date) return;
    addMeeting({
      title: form.title.trim(),
      clientId: form.clientId,
      date: form.date,
      time: form.time,
      duration: form.duration,
      notes: form.notes || undefined,
      type: form.type,
    });
    setForm({
      title: "",
      clientId: "",
      date: "",
      time: "10:00",
      duration: 30,
      notes: "",
      type: "call",
    });
    setShowNewMeeting(false);
  };

  const openNewForDate = (dateStr: string) => {
    setForm((f) => ({ ...f, date: dateStr }));
    setShowNewMeeting(true);
  };

  const selectedMeetings = selectedDate ? meetingsByDate[selectedDate] || [] : [];

  return (
    <div className="max-w-[1200px] mx-auto space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-display font-bold text-white">
            Calendar
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {meetings.length} meeting{meetings.length !== 1 ? "s" : ""} scheduled
          </p>
        </div>
        <button
          onClick={() => {
            setForm((f) => ({ ...f, date: todayStr }));
            setShowNewMeeting(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-profit to-accent-cyan text-surface-0 font-display font-bold text-sm transition-all hover:shadow-lg hover:shadow-profit/20"
        >
          <Plus size={16} />
          New Meeting
        </button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        {/* Calendar Grid */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-5"
        >
          {/* Month nav */}
          <div className="flex items-center justify-between mb-5">
            <button
              onClick={prevMonth}
              className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <h2 className="text-lg font-display font-bold text-white">
              {MONTHS[viewMonth]} {viewYear}
            </h2>
            <button
              onClick={nextMonth}
              className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map((d) => (
              <div
                key={d}
                className="text-center text-[10px] font-semibold uppercase tracking-wider text-gray-500 py-1"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells before first day */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const dayMeetings = meetingsByDate[dateStr] || [];
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selectedDate;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(dateStr === selectedDate ? null : dateStr)}
                  onDoubleClick={() => openNewForDate(dateStr)}
                  className={`aspect-square rounded-xl p-1 flex flex-col items-center justify-start transition-all relative ${
                    isSelected
                      ? "bg-profit/10 border border-profit/30"
                      : isToday
                        ? "bg-white/[0.04] border border-white/10"
                        : "hover:bg-white/[0.03] border border-transparent"
                  }`}
                >
                  <span
                    className={`text-xs font-mono ${
                      isToday
                        ? "text-profit font-bold"
                        : isSelected
                          ? "text-white font-semibold"
                          : "text-gray-300"
                    }`}
                  >
                    {day}
                  </span>
                  {dayMeetings.length > 0 && (
                    <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
                      {dayMeetings.slice(0, 3).map((m) => (
                        <div
                          key={m.id}
                          className="w-1.5 h-1.5 rounded-full"
                          style={{
                            background: m.done
                              ? "#4b5563"
                              : MEETING_COLORS[m.type],
                          }}
                        />
                      ))}
                      {dayMeetings.length > 3 && (
                        <span className="text-[8px] text-gray-500">
                          +{dayMeetings.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Right panel: Selected day or upcoming meetings */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-5 space-y-4"
        >
          <h3 className="text-sm font-display font-bold text-white">
            {selectedDate
              ? new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })
              : "Upcoming Meetings"}
          </h3>

          <AnimatePresence mode="wait">
            {selectedDate ? (
              <motion.div
                key={selectedDate}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-2"
              >
                {selectedMeetings.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-500 mb-3">No meetings</p>
                    <button
                      onClick={() => openNewForDate(selectedDate)}
                      className="text-xs text-profit hover:text-white transition-colors flex items-center gap-1 mx-auto"
                    >
                      <Plus size={12} />
                      Schedule one
                    </button>
                  </div>
                ) : (
                  selectedMeetings
                    .sort((a, b) => a.time.localeCompare(b.time))
                    .map((m) => (
                      <MeetingCard
                        key={m.id}
                        meeting={m}
                        clientName={
                          clients.find((c) => c.id === m.clientId)?.name
                        }
                        onToggle={() => toggleMeetingDone(m.id)}
                        onDelete={() => deleteMeeting(m.id)}
                      />
                    ))
                )}
                {selectedMeetings.length > 0 && (
                  <button
                    onClick={() => openNewForDate(selectedDate)}
                    className="w-full py-2 rounded-xl border border-dashed border-glass-border text-gray-500 hover:text-gray-300 hover:border-gray-500 transition-all text-xs flex items-center justify-center gap-1"
                  >
                    <Plus size={12} />
                    Add Meeting
                  </button>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="upcoming"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-2"
              >
                {meetings
                  .filter((m) => !m.done && m.date >= todayStr)
                  .sort((a, b) =>
                    a.date === b.date
                      ? a.time.localeCompare(b.time)
                      : a.date.localeCompare(b.date)
                  )
                  .slice(0, 8)
                  .map((m) => (
                    <MeetingCard
                      key={m.id}
                      meeting={m}
                      clientName={
                        clients.find((c) => c.id === m.clientId)?.name
                      }
                      onToggle={() => toggleMeetingDone(m.id)}
                      onDelete={() => deleteMeeting(m.id)}
                      showDate
                    />
                  ))}
                {meetings.filter((m) => !m.done && m.date >= todayStr)
                  .length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-8">
                    No upcoming meetings
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* New Meeting Modal */}
      <Modal
        open={showNewMeeting}
        onClose={() => setShowNewMeeting(false)}
        title="Schedule Meeting"
      >
        <form onSubmit={handleCreateMeeting} className="space-y-4">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 block">
              Title
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Meeting title..."
              className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-glass-border text-white text-sm focus:outline-none focus:border-profit/30"
              autoFocus
            />
          </div>

          <ClientDropdown
            clients={clients}
            value={form.clientId}
            onChange={(id) => setForm((f) => ({ ...f, clientId: id }))}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 block">
                Date
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((f) => ({ ...f, date: e.target.value }))
                }
                className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-glass-border text-white text-sm focus:outline-none focus:border-profit/30"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 block">
                Time
              </label>
              <input
                type="time"
                value={form.time}
                onChange={(e) =>
                  setForm((f) => ({ ...f, time: e.target.value }))
                }
                className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-glass-border text-white text-sm focus:outline-none focus:border-profit/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 block">
                Duration (min)
              </label>
              <input
                type="number"
                value={form.duration}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    duration: Number(e.target.value),
                  }))
                }
                min={15}
                step={15}
                className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-glass-border text-white text-sm focus:outline-none focus:border-profit/30"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 block">
                Type
              </label>
              <div className="flex gap-1.5">
                {(
                  ["call", "video", "in_person", "review"] as Meeting["type"][]
                ).map((t) => {
                  const Icon = MEETING_ICONS[t];
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, type: t }))}
                      className={`flex-1 py-2 rounded-lg flex items-center justify-center transition-all ${
                        form.type === t
                          ? "bg-white/10 border border-white/20"
                          : "bg-white/[0.03] border border-glass-border hover:bg-white/5"
                      }`}
                      title={t.replace("_", " ")}
                    >
                      <Icon
                        size={14}
                        style={{
                          color:
                            form.type === t
                              ? MEETING_COLORS[t]
                              : "#6b7280",
                        }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 block">
              Notes
            </label>
            <textarea
              value={form.notes}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
              rows={2}
              placeholder="Optional notes..."
              className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-glass-border text-white text-sm focus:outline-none focus:border-profit/30 resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-profit to-accent-cyan text-surface-0 font-display font-bold text-sm transition-all hover:shadow-lg hover:shadow-profit/20"
          >
            Schedule Meeting
          </button>
        </form>
      </Modal>
    </div>
  );
}

function ClientDropdown({
  clients,
  value,
  onChange,
}: {
  clients: { id: string; name: string; color: string }[];
  value: string;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = clients.find((c) => c.id === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <label className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 block">
        Client
      </label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-glass-border text-sm focus:outline-none focus:border-profit/30 flex items-center justify-between transition-colors"
      >
        {selected ? (
          <span className="flex items-center gap-2 text-white">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: selected.color }}
            />
            {selected.name}
          </span>
        ) : (
          <span className="text-gray-500">Select client...</span>
        )}
        <ChevronsUpDown size={14} className="text-gray-500" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-1 rounded-xl border border-glass-border overflow-hidden"
            style={{ background: "rgba(13,18,30,0.97)", backdropFilter: "blur(20px)" }}
          >
            <div className="max-h-48 overflow-y-auto py-1">
              <button
                type="button"
                onClick={() => { onChange(""); setOpen(false); }}
                className="w-full px-3 py-2 text-left text-sm text-gray-500 hover:bg-white/5 transition-colors"
              >
                No client
              </button>
              {clients.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => { onChange(c.id); setOpen(false); }}
                  className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-white/5 transition-colors ${
                    c.id === value ? "text-profit" : "text-white"
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ background: c.color }}
                  />
                  {c.name}
                  {c.id === value && (
                    <Check size={12} className="ml-auto text-profit" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MeetingCard({
  meeting,
  clientName,
  onToggle,
  onDelete,
  showDate,
}: {
  meeting: Meeting;
  clientName?: string;
  onToggle: () => void;
  onDelete: () => void;
  showDate?: boolean;
}) {
  const Icon = MEETING_ICONS[meeting.type];
  const color = MEETING_COLORS[meeting.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className={`glass rounded-xl p-3 flex items-start gap-3 group transition-all ${
        meeting.done ? "opacity-50" : ""
      }`}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: `${color}15` }}
      >
        <Icon size={14} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <h4
          className={`text-sm font-semibold truncate ${
            meeting.done ? "text-gray-500 line-through" : "text-white"
          }`}
        >
          {meeting.title}
        </h4>
        <p className="text-[10px] text-gray-500 mt-0.5">
          {showDate && (
            <>
              {new Date(meeting.date + "T12:00:00").toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
              {" · "}
            </>
          )}
          {meeting.time} · {meeting.duration}min
          {clientName && ` · ${clientName}`}
        </p>
        {meeting.notes && (
          <p className="text-[10px] text-gray-600 mt-1 truncate">
            {meeting.notes}
          </p>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onToggle}
          className="p-1 rounded-lg hover:bg-white/5 transition-colors"
          title={meeting.done ? "Mark undone" : "Mark done"}
        >
          <Check
            size={14}
            className={meeting.done ? "text-profit" : "text-gray-500"}
          />
        </button>
        <button
          onClick={onDelete}
          className="p-1 rounded-lg hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-all"
        >
          <X size={14} className="text-gray-500 hover:text-loss" />
        </button>
      </div>
    </motion.div>
  );
}

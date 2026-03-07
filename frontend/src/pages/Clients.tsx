import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Mail, Phone, Edit2, Trash2 } from "lucide-react";
import { useTaskStore } from "../stores/taskStore";
import { useUIStore } from "../stores/uiStore";
import Modal from "../components/shared/Modal";

export default function Clients() {
  const clients = useTaskStore((s) => s.clients);
  const tasks = useTaskStore((s) => s.tasks);
  const addClient = useTaskStore((s) => s.addClient);
  const updateClient = useTaskStore((s) => s.updateClient);
  const deleteClient = useTaskStore((s) => s.deleteClient);

  const theme = useUIStore((s) => s.theme);
  const isLight = theme === "light";
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    defaultHourlyRate: 75,
    color: "#3b82f6",
  });

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.company?.toLowerCase().includes(search.toLowerCase())
  );

  const clientStats = (clientId: string) => {
    const ct = tasks.filter((t) => t.clientId === clientId);
    const completed = ct.filter((t) => t.status === "completed");
    return {
      total: ct.length,
      completed: completed.length,
      revenue: completed.reduce((s, t) => s + t.revenue, 0),
      pnl: completed.reduce((s, t) => s + t.pnl, 0),
    };
  };

  const openAdd = () => {
    setEditId(null);
    setForm({ name: "", company: "", email: "", phone: "", defaultHourlyRate: 75, color: "#3b82f6" });
    setModalOpen(true);
  };

  const openEdit = (id: string) => {
    const c = clients.find((c) => c.id === id);
    if (!c) return;
    setEditId(id);
    setForm({
      name: c.name,
      company: c.company || "",
      email: c.email || "",
      phone: c.phone || "",
      defaultHourlyRate: c.defaultHourlyRate,
      color: c.color,
    });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editId) {
      updateClient(editId, form);
    } else {
      addClient(form);
    }
    setModalOpen(false);
  };

  const inputClass =
    "w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-glass-border text-white text-sm placeholder-gray-500 focus:outline-none focus:border-profit/30 transition-colors";

  return (
    <div className="max-w-[1000px] mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-4 py-2 rounded-xl glass bg-transparent border border-glass-border text-white text-sm placeholder-gray-500 focus:outline-none focus:border-profit/30 w-full sm:w-64"
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-profit to-accent-cyan text-surface-0 font-semibold text-xs"
        >
          <Plus size={14} />
          Add Client
        </motion.button>
      </div>

      {/* Client grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((c, i) => {
            const s = clientStats(c.id);
            return (
              <motion.div
                key={c.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
                className="client-card glass rounded-2xl p-4 card-shine group relative"
              >
                {/* Actions */}
                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(c.id)}
                    className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-colors"
                  >
                    <Edit2 size={12} />
                  </button>
                  <button
                    onClick={() => {
                      if (s.total === 0) deleteClient(c.id);
                    }}
                    className="p-1.5 rounded-lg hover:bg-loss/10 text-gray-500 hover:text-loss transition-colors"
                    title={s.total > 0 ? "Has tasks" : "Delete"}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>

                {/* Client info */}
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
                    style={isLight ? {
                      background: `linear-gradient(145deg, #e8edf4, #d4d9e0)`,
                      boxShadow: `3px 3px 6px #b8bec7, -3px -3px 6px #ffffff`,
                      color: "#636e72",
                    } : {
                      background: c.color + "20",
                      color: c.color,
                    }}
                  >
                    {c.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      {c.name}
                    </h3>
                    {c.company && (
                      <p className="text-[10px] text-gray-500">{c.company}</p>
                    )}
                  </div>
                </div>

                {/* Contact */}
                <div className="space-y-1 mb-3 text-[11px] text-gray-400">
                  {c.email && (
                    <p className="flex items-center gap-1.5">
                      <Mail size={10} /> {c.email}
                    </p>
                  )}
                  {c.phone && (
                    <p className="flex items-center gap-1.5">
                      <Phone size={10} /> {c.phone}
                    </p>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-glass-border">
                  <div>
                    <p className="text-[9px] text-gray-500 uppercase">Tasks</p>
                    <p className="text-sm font-mono font-bold text-white">
                      {s.total}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] text-gray-500 uppercase">
                      Revenue
                    </p>
                    <p className="text-sm font-mono font-bold text-accent-blue">
                      ${s.revenue.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] text-gray-500 uppercase">P&L</p>
                    <p
                      className="text-sm font-mono font-bold"
                      style={{ color: s.pnl >= 0 ? "rgb(var(--color-profit))" : "#ff4466" }}
                    >
                      {s.pnl >= 0 ? "+" : ""}${s.pnl.toLocaleString()}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editId ? "Edit Client" : "Add Client"}
      >
        <div className="space-y-4">
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1 block">
              Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputClass}
              placeholder="Client name"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1 block">Company</label>
              <input type="text" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1 block">Rate ($/hr)</label>
              <input type="number" value={form.defaultHourlyRate} onChange={(e) => setForm({ ...form, defaultHourlyRate: Number(e.target.value) })} className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1 block">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1 block">Phone</label>
              <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1 block">Color</label>
            <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="w-10 h-10 rounded-lg bg-transparent cursor-pointer" />
          </div>
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleSave}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-profit to-accent-cyan text-surface-0 font-semibold text-sm"
          >
            {editId ? "Update" : "Add"} Client
          </motion.button>
        </div>
      </Modal>
    </div>
  );
}

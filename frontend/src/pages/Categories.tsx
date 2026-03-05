import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2 } from "lucide-react";
import { useTaskStore } from "../stores/taskStore";

export default function Categories() {
  const categories = useTaskStore((s) => s.categories);
  const tasks = useTaskStore((s) => s.tasks);
  const addCategory = useTaskStore((s) => s.addCategory);
  const deleteCategory = useTaskStore((s) => s.deleteCategory);

  const [name, setName] = useState("");
  const [color, setColor] = useState("#3b82f6");

  const handleAdd = () => {
    if (!name.trim()) return;
    addCategory({ name: name.trim(), color });
    setName("");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Add form */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-5"
      >
        <h2 className="font-display font-semibold text-sm mb-4">
          Add Category
        </h2>
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1 block">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Category name"
              className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-glass-border text-white text-sm focus:outline-none focus:border-profit/30"
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1 block">
              Color
            </label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-10 h-10 rounded-lg bg-transparent cursor-pointer"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAdd}
            className="p-2.5 rounded-xl bg-profit/20 text-profit hover:bg-profit/30 transition-colors"
          >
            <Plus size={16} />
          </motion.button>
        </div>
      </motion.div>

      {/* Categories list */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {categories.map((cat, i) => {
            const count = tasks.filter(
              (t) => t.projectType === cat.id || t.projectType === cat.name.toLowerCase().replace(" ", "_")
            ).length;
            return (
              <motion.div
                key={cat.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: i * 0.05 }}
                className="glass rounded-xl p-4 flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ background: cat.color }}
                  />
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      {cat.name}
                    </h3>
                    <p className="text-[10px] text-gray-500">
                      {count} task{count !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => deleteCategory(cat.id)}
                  className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-loss/10 text-gray-500 hover:text-loss transition-all"
                >
                  <Trash2 size={12} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

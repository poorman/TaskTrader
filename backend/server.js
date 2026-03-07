import express from "express";
import Database from "better-sqlite3";
import cors from "cors";
import { existsSync, mkdirSync } from "fs";

const DATA_DIR = process.env.DATA_DIR || "./data";
if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(`${DATA_DIR}/tasktrader.db`);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// --- Schema ---
db.exec(`
  CREATE TABLE IF NOT EXISTS kv (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT DEFAULT (datetime('now'))
  );
`);

// Store keys: "tasks", "clients", "categories", "goals", "meetings", "gamification"

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

const getStmt = db.prepare("SELECT value FROM kv WHERE key = ?");
const upsertStmt = db.prepare(`
  INSERT INTO kv (key, value, updated_at) VALUES (?, ?, datetime('now'))
  ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
`);

// GET /api/state — returns full app state
app.get("/api/state", (_req, res) => {
  const keys = ["tasks", "clients", "categories", "goals", "meetings", "gamification", "babydiary"];
  const state = {};
  for (const key of keys) {
    const row = getStmt.get(key);
    state[key] = row ? JSON.parse(row.value) : null;
  }
  res.json(state);
});

// PUT /api/state — saves full app state (or partial)
app.put("/api/state", (req, res) => {
  const allowed = ["tasks", "clients", "categories", "goals", "meetings", "gamification", "babydiary"];
  const saveMany = db.transaction((data) => {
    for (const key of allowed) {
      if (data[key] !== undefined) {
        upsertStmt.run(key, JSON.stringify(data[key]));
      }
    }
  });
  saveMany(req.body);
  res.json({ ok: true });
});

// PUT /api/state/:key — save a single key
app.put("/api/state/:key", (req, res) => {
  const allowed = ["tasks", "clients", "categories", "goals", "meetings", "gamification", "babydiary"];
  if (!allowed.includes(req.params.key)) {
    return res.status(400).json({ error: "Invalid key" });
  }
  upsertStmt.run(req.params.key, JSON.stringify(req.body));
  res.json({ ok: true });
});

// GET /api/state/:key — get a single key
app.get("/api/state/:key", (req, res) => {
  const row = getStmt.get(req.params.key);
  if (!row) return res.json(null);
  res.json(JSON.parse(row.value));
});

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`TaskTrader API running on port ${PORT}`);
});

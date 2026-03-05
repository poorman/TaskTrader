const BASE = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
  return res.json();
}

export interface AppState {
  tasks: unknown[] | null;
  clients: unknown[] | null;
  categories: unknown[] | null;
  goals: unknown[] | null;
  meetings: unknown[] | null;
  gamification: unknown | null;
}

export const api = {
  /** Fetch full state from backend */
  getState: () => request<AppState>("/state"),

  /** Save full state (or partial keys) to backend */
  saveState: (data: Partial<AppState>) =>
    request("/state", { method: "PUT", body: JSON.stringify(data) }),

  /** Save a single key */
  saveKey: (key: string, data: unknown) =>
    request(`/state/${key}`, { method: "PUT", body: JSON.stringify(data) }),

  /** Health check */
  health: () => request<{ status: string }>("/health"),
};

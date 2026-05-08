import { useState, useCallback } from "react";

// ═══════════════════════════════════════════════════
//  STORAGE
// ═══════════════════════════════════════════════════
const ls = {
  get: (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { } }
};

export default function usePersist(key, init) {
  const [s, set] = useState(() => ls.get(key, init));
  const save = useCallback(v => set(p => { const n = typeof v === "function" ? v(p) : v; ls.set(key, n); return n; }), [key]);
  return [s, save];
}

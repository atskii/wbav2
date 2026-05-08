import { useState, useCallback } from "react";

export default function useToasts() {
  const [ts, setTs] = useState([]);
  const add = useCallback((msg, type = "ok") => {
    const id = Date.now() + Math.random();
    setTs(p => [...p, { id, msg, type }]);
    setTimeout(() => setTs(p => p.filter(t => t.id !== id)), 4000);
  }, []);
  const rm = useCallback(id => setTs(p => p.filter(t => t.id !== id)), []);
  return { ts, add, rm };
}

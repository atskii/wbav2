import { X } from "lucide-react";

export default function Toasts({ ts, rm }) {
  return (
    <div className="fixed top-5 right-5 z-[9999] space-y-2 max-w-xs pointer-events-none">
      {ts.map(t => (
        <div key={t.id} className={`flex items-start gap-3 px-5 py-4 rounded-2xl shadow-2xl text-sm font-medium pointer-events-auto border ${t.type === "warn" ? "bg-red-600 text-white border-red-500" : "bg-[#1E5C36] text-white border-[#164a2c]"
          } transition-all duration-300 animate-in slide-in-from-right`}>
          <span className="flex-1 leading-relaxed">{t.msg}</span>
          <button onClick={() => rm(t.id)} className="opacity-60 hover:opacity-100 flex-shrink-0 mt-0.5"><X size={14} /></button>
        </div>
      ))}
    </div>
  );
}

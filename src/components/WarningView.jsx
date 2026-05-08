import { Phone, Clock, ExternalLink, Settings } from "lucide-react";
import { CONTACTS } from "../lib/constants";

export default function WarningView({ loading, user }) {
  const H = { fontFamily: "'Lora',serif" };
  return (
    <div className="p-10 max-w-6xl mx-auto w-full pb-32">
      <header className="mb-10">
        <p className="text-[#5A7368] font-bold text-sm mb-1">Cześć {user?.name || "Natalia"}!</p>
        <h1 style={H} className="text-4xl font-bold text-[#1A2F22] mb-4">System ostrzegania</h1>
        <p className="text-[#5A7368] text-sm max-w-3xl leading-relaxed">
          Wsparcie jest bliżej, niż myślisz. Jeśli czujesz, że potrzebujesz wsparcia, skontaktuj się z osobami, które są gotowe Ci pomóc. Poniżej znajdziesz listę organizacji oferujących bezpłatną pomoc.
        </p>
      </header>
      <div className="bg-amber-50 border border-amber-100 p-6 rounded-2xl flex gap-4 items-start mb-12 shadow-sm">
        <div className="bg-white p-2 rounded-xl shadow-sm"><Settings size={20} className="text-amber-500 animate-pulse" /></div>
        <p className="text-[11px] font-medium text-amber-800 leading-relaxed">
          <span className="font-black uppercase tracking-wider block mb-1">Ważna informacja</span>
          Ta informacja nie jest diagnozą, ale ważnym sygnałem ostrzegawczym. Warto przyjrzeć się swojemu planowi dnia, wprowadzić drobne zmiany i jeśli czujesz, że sytuacja się utrzymuje — rozważyć rozmowę ze specjalistą.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {CONTACTS.map((c, i) => (
          <div key={i} className="bg-white border border-[#E8DDD0] rounded-[2.5rem] p-8 shadow-sm hover:shadow-md transition-all group">
            <p className="text-[10px] font-black uppercase text-[#9FB5AD] tracking-[0.15em] mb-1">{c.org}</p>
            <h3 style={H} className="text-xl font-bold text-[#1A2F22] mb-4 group-hover:text-[#2D9E6B] transition-colors">{c.name}</h3>
            <p className="text-xs text-[#5A7368] leading-[1.7] mb-8 min-h-[4rem]">{c.desc}</p>
            <div className="flex items-center justify-between pt-6 border-t border-[#F5EFE6]">
              <div className="flex items-center gap-2"><Phone size={14} className="text-[#2D9E6B]" /><span className="text-sm font-black text-[#1A2F22]">{c.phone}</span></div>
              <div className="flex items-center gap-2"><Clock size={14} className="text-[#9FB5AD]" /><span className="text-[11px] font-bold text-[#5A7368]">{c.hours}</span></div>
              <a href={c.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[#9FB5AD] hover:text-[#2D9E6B] transition-colors"><ExternalLink size={14} /><span className="text-[11px] font-bold">{c.url.replace("https://", "")}</span></a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

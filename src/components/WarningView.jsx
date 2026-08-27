import { Phone, Clock, ExternalLink, Settings } from "lucide-react";
import { CONTACTS } from "../lib/constants";

export default function WarningView({ loading, user }) {

  return (
    <div className="h-full w-full overflow-y-auto">
      <div className="p-4 sm:p-10 max-w-6xl mx-auto w-full pb-32">
        <header className="mb-10">
          <p className="text-[#5A7368] font-bold text-sm mb-1">Cześć {user?.name || "Natalia"}!</p>
          <h1 className="font-lora text-4xl font-bold text-[#1A2F22] mb-4">Pomoc</h1>
          <p className="text-[#5A7368] text-sm max-w-3xl leading-relaxed">
          Wsparcie jest bliżej, niż myślisz. Jeśli czujesz, że potrzebujesz wsparcia, skontaktuj się z osobami, które są gotowe Ci pomóc. Poniżej znajdziesz listę organizacji oferujących bezpłatną pomoc.
        </p>
      </header>
      <div className="bg-amber-50 border border-amber-100 p-6 rounded-2xl flex flex-col sm:flex-row gap-4 items-start mb-12 shadow-sm">
        <div className="bg-white p-2 rounded-xl shadow-sm self-start"><Settings size={20} className="text-amber-500 animate-pulse" /></div>
        <p className="text-[11px] font-medium text-amber-800 leading-relaxed">
          <span className="font-black uppercase tracking-wider block mb-1">Ważna informacja</span>
          Ta informacja nie jest diagnozą, ale ważnym sygnałem ostrzegawczym. Warto przyjrzeć się swojemu planowi dnia, wprowadzić drobne zmiany i jeśli czujesz, że sytuacja się utrzymuje — rozważyć rozmowę ze specjalistą.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {CONTACTS.map((c, i) => (
          <div key={i} className="bg-white border border-[#E8DDD0] rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-8 shadow-sm hover:shadow-md transition-all group flex flex-col">
            <p className="text-[10px] font-black uppercase text-[#9FB5AD] tracking-[0.15em] mb-1">{c.org}</p>
            <h3 className="font-lora text-xl font-bold text-[#1A2F22] mb-4 group-hover:text-[#2D9E6B] transition-colors">{c.name}</h3>
            <p className="text-xs text-[#5A7368] leading-[1.7] mb-8 min-h-0 sm:min-h-[4rem] flex-grow">{c.desc}</p>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-[#F5EFE6]">
              <a href={`tel:${c.phone.replace(/\s+/g, '')}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <Phone size={14} className="text-[#2D9E6B] flex-shrink-0" />
                <span className="text-sm font-black text-[#1A2F22]">{c.phone}</span>
              </a>
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-[#9FB5AD] flex-shrink-0" />
                <span className="text-[11px] font-bold text-[#5A7368]">{c.hours}</span>
              </div>
              <a href={c.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[#9FB5AD] hover:text-[#2D9E6B] transition-colors">
                <ExternalLink size={14} className="flex-shrink-0" />
                <span className="text-[11px] font-bold break-all">{c.url.replace("https://", "")}</span>
              </a>
            </div>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}

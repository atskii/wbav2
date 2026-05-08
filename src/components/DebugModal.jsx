import { useState } from "react";
import { X } from "lucide-react";

export default function DebugModal({ onClose, actions }) {
  const [activeTab, setActiveTab] = useState("scenarios");
  const tabs = [
    { id: "scenarios", label: "Ostrzeżenia" },
    { id: "tasks", label: "Zadania" },
    { id: "moods", label: "Nastroje" },
    { id: "time", label: "Czas" }
  ];
  const scenarios = [
    { id: 1, name: "1. Ostre wyczerpanie emocjonalne", desc: "Symuluje 3 dni z rzędu z krytycznie niskim nastrojem (np. 😫). Średnia z 3 dni spada poniżej 2.0." },
    { id: 2, name: "2. Spłaszczenie emocjonalne", desc: "Symuluje 7 dni monotonii, gdzie nastrój to ciągłe 😐. Bardzo niska wariancja i brak lepszych dni." },
    { id: 3, name: "3. Brak regeneracji po weekendzie", desc: "Cofa czas do poniedziałku i ustawia nastrój poniedziałkowy gorszy/równy nastrojowi z piątku." },
    { id: 4, name: "4. Inercja emocjonalna", desc: "Symuluje 5 dni tkwiących w martwym punkcie (wahania między 😟 a 😐, brak dobrych dni)." }
  ];
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-[#1A2F22]/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl border border-white/20 animate-in zoom-in-95 duration-300 flex flex-col max-h-[85vh]" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="font-bold text-[#1A2F22] text-xl">Panel Debug (Shift+D)</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-all"><X size={20} className="text-[#9FB5AD]" /></button>
        </div>
        <div className="flex px-6 pt-4 border-b border-gray-100 gap-6 overflow-x-auto">
          {tabs.map(t => (<button key={t.id} onClick={() => setActiveTab(t.id)} className={`pb-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${activeTab === t.id ? 'border-[#2D9E6B] text-[#1E5C36]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>{t.label}</button>))}
        </div>
        <div className="p-6 overflow-y-auto">
          {activeTab === "scenarios" && (
            <div className="space-y-4">
              <p className="text-sm text-[#5A7368] mb-4">Wybierz jeden ze scenariuszy, aby automatycznie spreparować historię i wyzwolić powiadomienie.</p>
              {scenarios.map(s => (
                <div key={s.id} className="flex flex-col gap-2 p-4 bg-[#F5EFE6] rounded-xl border border-[#E8DDD0]">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-[#1E5C36]">{s.name}</h4>
                    <button onClick={() => actions.triggerScenario(s.id)} className="px-4 py-2 bg-[#2D9E6B] text-white text-xs font-bold rounded-lg hover:bg-[#1E5C36] transition-colors whitespace-nowrap ml-4 shadow-sm">Odpal</button>
                  </div>
                  <p className="text-xs text-[#5A7368] leading-relaxed pr-16">{s.desc}</p>
                </div>
              ))}
            </div>
          )}
          {activeTab === "tasks" && (
            <div className="space-y-4">
              <div className="p-4 border border-gray-100 rounded-xl flex items-center justify-between"><div><h4 className="font-bold text-[#1A2F22] mb-1">Dodaj zadania z bazy</h4><p className="text-xs text-gray-500">Dodaje losowe, niewykorzystane zadania do backlogu.</p></div><button onClick={actions.addRandomTasks} className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-200">Uruchom</button></div>
              <div className="p-4 border border-gray-100 rounded-xl flex items-center justify-between"><div><h4 className="font-bold text-red-600 mb-1">Wyczyść wszystkie zadania</h4><p className="text-xs text-gray-500">Usuwa całkowicie listę zadań i harmonogramu w aplikacji.</p></div><button onClick={actions.clearTasks} className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 text-xs font-bold rounded-lg hover:bg-red-100">Uruchom</button></div>
            </div>
          )}
          {activeTab === "moods" && (
            <div className="space-y-4">
              <div className="p-4 border border-gray-100 rounded-xl flex items-center justify-between"><div><h4 className="font-bold text-[#1A2F22] mb-1">Generuj losową historię</h4><p className="text-xs text-gray-500">Zapełnia 15 dni wstecz losowymi nastrojami.</p></div><button onClick={actions.generateFakeMoods} className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-200">Uruchom</button></div>
              <div className="p-4 border border-gray-100 rounded-xl flex items-center justify-between"><div><h4 className="font-bold text-red-600 mb-1">Wyczyść nastroje</h4><p className="text-xs text-gray-500">Usuwa całą zarejestrowaną dotąd historię nastrojów z bazy.</p></div><button onClick={actions.clearMoods} className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 text-xs font-bold rounded-lg hover:bg-red-100">Uruchom</button></div>
            </div>
          )}
          {activeTab === "time" && (
            <div className="space-y-4">
              <div className="p-4 border border-gray-100 rounded-xl flex items-center justify-between"><div><h4 className="font-bold text-[#1A2F22] mb-1">Cofnij o 1 dzień</h4><p className="text-xs text-gray-500">Oszukuje zegar aplikacji, cofając go o równe 24 godziny.</p></div><button onClick={actions.timeTravelBack} className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-200">Cofnij</button></div>
              <div className="p-4 border border-gray-100 rounded-xl flex items-center justify-between"><div><h4 className="font-bold text-[#1A2F22] mb-1">Przewiń o 1 dzień do przodu</h4><p className="text-xs text-gray-500">Oszukuje zegar aplikacji, przyspieszając go o 24 godziny.</p></div><button onClick={actions.timeTravelForward} className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-200">Przyspiesz</button></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

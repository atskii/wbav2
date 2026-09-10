import { useState } from "react";
import { X } from "lucide-react";

export default function DebugModal({ onClose, actions }) {
  const [activeTab, setActiveTab] = useState("scenarios");
  const tabs = [
    { id: "scenarios", label: "Ostrzeżenia" },
    { id: "tasks", label: "Zadania" },
    { id: "moods", label: "Nastroje" },
    { id: "tokens", label: "Monety AI" },
    { id: "streak", label: "Streak (Seria)" },
    { id: "time", label: "Czas" },
    { id: "account", label: "Konto" }
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
          {activeTab === "tokens" && (
            <div className="space-y-4">
              <div className="p-4 border border-gray-100 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-[#1A2F22] mb-1">Dodaj +5 monet AI</h4>
                  <p className="text-xs text-gray-500">Zwiększa bieżące saldo monet o 5 sztuk.</p>
                </div>
                <button onClick={() => actions.addAiTokens(5)} className="px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold rounded-lg hover:bg-amber-100 transition-colors">
                  +5 Monet
                </button>
              </div>
              <div className="p-4 border border-gray-100 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-[#1A2F22] mb-1">Zresetuj do 10 monet AI</h4>
                  <p className="text-xs text-gray-500">Przywraca domyślny pakiet startowy 10 monet.</p>
                </div>
                <button onClick={actions.resetAiTokens} className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-200 transition-colors">
                  Ustaw 10
                </button>
              </div>
              <div className="p-4 border border-gray-100 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-rose-600 mb-1">Wyzeruj monety (0 monet)</h4>
                  <p className="text-xs text-gray-500">Symuluje brak tokenów do testowania blokad AI.</p>
                </div>
                <button onClick={actions.zeroAiTokens} className="px-4 py-2 bg-rose-50 text-rose-600 border border-rose-200 text-xs font-bold rounded-lg hover:bg-rose-100 transition-colors">
                  Wyzeruj (0)
                </button>
              </div>
            </div>
          )}
          {activeTab === "streak" && (
            <div className="space-y-4">
              <div className="p-4 border border-gray-100 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-[#1A2F22] mb-1">Popup "Zdobyłeś serię" (mały)</h4>
                  <p className="text-xs text-gray-500">Odpala małą animację pojawiającą się po wykonaniu zadania.</p>
                </div>
                <button onClick={actions.testStreakAnimationAuto} className="px-4 py-2 bg-orange-50 text-orange-600 border border-orange-200 text-xs font-bold rounded-lg hover:bg-orange-100 transition-colors whitespace-nowrap ml-4">
                  Testuj
                </button>
              </div>
              <div className="p-4 border border-gray-100 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-[#1A2F22] mb-1">Testuj Animację Streaku (duży)</h4>
                  <p className="text-xs text-gray-500">Odpala pełnoekranową animację płomieni i confetti.</p>
                </div>
                <button onClick={actions.testStreakAnimation} className="px-4 py-2 bg-orange-50 text-orange-600 border border-orange-200 text-xs font-bold rounded-lg hover:bg-orange-100 transition-colors whitespace-nowrap ml-4">
                  Testuj
                </button>
              </div>
              <div className="p-4 border border-gray-100 rounded-xl flex items-center justify-between gap-4">
                <div className="flex-1">
                  <h4 className="font-bold text-[#1A2F22] mb-1">Zmień dni streaku (Seria)</h4>
                  <p className="text-xs text-gray-500">Umożliwia ustawienie dowolnego dnia streaku dla testów nagród.</p>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    min="1" 
                    max="999" 
                    defaultValue="5"
                    id="debug-streak-input"
                    className="w-16 px-2 py-1.5 border border-gray-200 rounded text-sm text-center focus:outline-none focus:border-[#2D9E6B]"
                  />
                  <button 
                    onClick={() => {
                      const val = parseInt(document.getElementById('debug-streak-input').value, 10);
                      if (!isNaN(val)) actions.setStreakDay(val);
                    }} 
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Ustaw
                  </button>
                </div>
              </div>
              <div className="p-4 border border-orange-100 bg-orange-50/50 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-orange-800 text-sm mb-0.5">Zresetuj odebrane nagrody streaku</h4>
                  <p className="text-xs text-orange-600/90">Czyści historię odebranych nagród, aby móc testować ich odbieranie od nowa.</p>
                </div>
                <button 
                  onClick={actions.resetClaimedStreakRewards} 
                  className="px-3 py-1.5 bg-orange-100 hover:bg-orange-200 text-orange-800 border border-orange-300 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ml-4"
                >
                  Resetuj nagrody
                </button>
              </div>
              <div className="p-4 border border-gray-100 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-[#1A2F22] mb-1">Animacja odblokowania rośliny</h4>
                  <p className="text-xs text-gray-500">Odpala animację odblokowania kaktusa.</p>
                </div>
                <button onClick={() => actions.testPlantUnlock('cactus')} className="px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-200 text-xs font-bold rounded-lg hover:bg-emerald-100 transition-colors whitespace-nowrap ml-4">
                  Testuj
                </button>
              </div>
            </div>
          )}
          {activeTab === "time" && (
            <div className="space-y-4">
              <div className="p-4 border border-gray-100 rounded-xl flex items-center justify-between"><div><h4 className="font-bold text-[#1A2F22] mb-1">Cofnij o 1 dzień</h4><p className="text-xs text-gray-500">Oszukuje zegar aplikacji, cofając go o równe 24 godziny.</p></div><button onClick={actions.timeTravelBack} className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-200">Cofnij</button></div>
              <div className="p-4 border border-gray-100 rounded-xl flex items-center justify-between"><div><h4 className="font-bold text-[#1A2F22] mb-1">Przewiń o 1 dzień do przodu</h4><p className="text-xs text-gray-500">Oszukuje zegar aplikacji, przyspieszając go o 24 godziny.</p></div><button onClick={actions.timeTravelForward} className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-200">Przyspiesz</button></div>
            </div>
          )}
          {activeTab === "account" && (
            <div className="space-y-4">
              <div className="p-4 border border-red-200 bg-red-50 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-red-600 mb-1">Totalna czystka (Hard Reset)</h4>
                  <p className="text-xs text-red-500">Usuwa wszystkie zadania, nastroje oraz preferencje. Wymusza ponowny onboarding (nowe konto).</p>
                </div>
                <button onClick={actions.totalWipe} className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 ml-4 whitespace-nowrap shadow-sm">
                  Wyczyść wszystko
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

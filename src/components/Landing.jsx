import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowRight } from "lucide-react";
import NavigationMenu4 from "./ui/navigation-menu-4";

const SECTION_IDS = [
  "home",
  "produkt",
  "wypalenie",
  "o-nas",
  "kontakt",
];

// ═══════════════════════════════════════════════════
//  LANDING PAGE
// ═══════════════════════════════════════════════════
export default function Landing({ onCTA }) {
  const fontInter = { fontFamily: "'Inter', sans-serif" };
  const fontDM = { fontFamily: "'DM Sans', sans-serif" };
  const [activeSection, setActiveSection] = useState("home");
  const isProgrammaticScroll = useRef(false);
  const scrollTimeoutRef = useRef(null);

  const scrollToSection = useCallback((sectionId) => {
    setActiveSection(sectionId);

    const el = document.getElementById(sectionId);
    if (!el) return;

    isProgrammaticScroll.current = true;
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    const top = Math.max(0, el.getBoundingClientRect().top + window.scrollY - 72);
    window.scrollTo({ top, behavior: "smooth" });

    scrollTimeoutRef.current = setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, 750);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (isProgrammaticScroll.current) return;

      const scrollBottom = window.innerHeight + window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      if (docHeight - scrollBottom <= 60) {
        setActiveSection("kontakt");
        return;
      }

      const checkY = window.scrollY + 160;
      let current = "home";
      for (const id of SECTION_IDS) {
        const el = document.getElementById(id);
        if (!el) continue;
        const offsetTop = el.getBoundingClientRect().top + window.scrollY;
        if (checkY >= offsetTop) {
          current = id;
        }
      }
      setActiveSection(current);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div style={fontInter} className="min-h-screen bg-[#FCFCFD] text-[#151515] overflow-x-clip relative">
      {/* Navbar */}
      <NavigationMenu4
        onCTA={onCTA}
        activeSection={activeSection}
        onNavigate={scrollToSection}
      />

      {/* Hero */}
      <section id="home" className="scroll-mt-20 py-12 md:py-20 px-4 md:px-8 max-w-7xl mx-auto flex flex-col md:grid md:grid-cols-2 gap-10 md:gap-16 items-center">
        <div className="max-w-xl order-1 md:order-1 text-left">
          <h1 className="text-[32px] md:text-5xl font-bold text-[#151515] leading-[1.2] mb-6 md:mb-8">
            Zdrowa produktywność bez wypalenia – zorganizuj swój dzień z Wellbeing App
          </h1>
          <p className="text-[#151515] text-base md:text-xl leading-relaxed mb-8">
            Oferujemy prosty sposób, aby wspierać pracowników w radzeniu sobie ze stresem i wypaleniem zawodowym, zwiększać ich zaangażowanie i tworzyć zdrowszą, bardziej efektywną kulturę pracy.
          </p>
          <button onClick={() => onCTA("login")} className="w-full md:w-auto inline-flex justify-center items-center gap-2 px-6 py-3.5 bg-[#0E6630] text-white rounded-lg font-medium hover:bg-[#0b5025] transition-colors">
            Zrób pierwszy krok <ArrowRight size={20} />
          </button>
        </div>
        <div className="flex justify-center order-2 md:order-2 w-full">
          <img src="/Frame 256.png" alt="Hero ilustracja" width="502" height="502" className="w-full max-w-md h-auto object-contain" />
        </div>
      </section>

      {/* Benefits */}
      <section id="produkt" className="scroll-mt-20 py-12 md:py-20 px-4 md:px-8 bg-[#FFEDE6]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center md:items-center mb-10 md:mb-16">
            <span className="inline-block px-4 py-1 border border-[#F2733C] text-[#F2733C] rounded-full text-sm font-semibold mb-4 md:mb-6">Nasz produkt</span>
            <h2 className="text-[24px] md:text-4xl font-bold text-center text-[#151515]">Największe korzyści</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                image: "/benefit_planner.png",
                alt: "Ilustracja indywidualnego planera zadań",
                title: "Indywidualny planer, który pomaga organizować dzień i unikać przeciążenia"
              },
              {
                image: "/benefit_signals.png",
                alt: "Ilustracja automatycznych sygnałów stresu i wypalenia",
                title: "Automatyczne sygnały, gdy Twój poziom stresu lub wypalenia rośnie"
              },
              {
                image: "/benefit_tips.png",
                alt: "Ilustracja personalizowanych wskazówek dobrostanu",
                title: "Personalizowane wskazówki, jak zadbać o swój dobrostan i energię"
              }
            ].map((f, i) => (
              <div key={i} className="bg-white p-6 md:p-7 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-start text-left border border-[#F2733C]/10 group">
                <div className="w-full aspect-square bg-[#F8F4E9] rounded-xl overflow-hidden mb-5 md:mb-6 flex items-center justify-center border border-[#E8DDD0]/60">
                  <img
                    src={f.image}
                    alt={f.alt}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                  />
                </div>
                <p className="text-base md:text-xl font-medium text-[#151515] leading-relaxed">{f.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="opinie" className="scroll-mt-20 py-12 md:py-20 px-4 md:px-8 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-10 md:gap-16">
          <div className="flex-1 flex flex-col items-start text-left">
            <span className="inline-block px-4 py-1 border border-[#0E6630] text-[#0E6630] rounded-full text-sm font-semibold mb-4 md:mb-6">Opinie</span>
            <h2 className="text-[24px] md:text-4xl font-bold text-[#151515] mb-6 md:mb-8 leading-tight">Co mówią nasi użytkownicy</h2>
            <p className="text-base md:text-lg text-[#151515] mb-6 md:mb-8 leading-relaxed max-w-lg">
              "Tydzień korzystania z Wellbeing app i nareszcie czuję się zorganizowana"
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                <img src="/avatarLP.png" alt="Anna Kowalska" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="font-medium text-sm md:text-base text-[#151515]">Anna Kowalska</p>
                <p className="text-xs md:text-sm text-[#5A5A5A]">Wykładowczyni na UW</p>
              </div>
            </div>
          </div>
          <div className="flex-1 flex justify-center w-full">
            <img src="/comowiaonas.png" alt="Opinie użytkowników" className="w-full max-w-lg aspect-[4/3] object-cover rounded-2xl md:rounded-3xl border border-[#E8DDD0]" />
          </div>
        </div>
      </section>

      {/* Wypalenie */}
      <section id="wypalenie" className="scroll-mt-20 py-12 md:py-20 px-4 md:px-8 bg-[#E8F5EC]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-10 md:gap-16">
          <div className="flex-1 flex justify-center order-2 md:order-1 w-full">
            <img src="/kluczykwypalenie.png" alt="Problem wypalenia" className="w-full max-w-lg aspect-square object-contain rounded-2xl md:rounded-3xl" />
          </div>
          <div className="flex-1 order-1 md:order-2 flex flex-col items-start text-left">
            <span className="inline-block px-4 py-1 border border-[#0E6630] text-[#0E6630] rounded-full text-sm font-semibold mb-4 md:mb-6">Wypalenie</span>
            <h2 className="text-[24px] md:text-4xl font-bold text-[#151515] mb-6 md:mb-8 leading-tight">Problem, który chcemy rozwiązać</h2>
            <p className="text-[#151515] text-base md:text-lg leading-relaxed mb-4 md:mb-6">
              Wiele firm boryka się ze wzrostem wypalenia zawodowego wśród pracowników, co prowadzi do spadku efektywności, większej absencji i rotacji w zespole. Często brakuje narzędzi, które pozwalałyby w porę zauważyć przeciążenie i odpowiednio wspierać pracowników.
            </p>
            <p className="text-[#0E6630] font-semibold text-base md:text-lg leading-relaxed">
              Nasza aplikacja pomaga w tym wyzwaniu, oferując indywidualne planery, raporty i system ostrzegania przed wypaleniem. Dzięki temu HR może proaktywnie wspierać dobrostan zespołu i budować zdrowszą, bardziej efektywną kulturę pracy.
            </p>
          </div>
        </div>
      </section>

      {/* Co oferujemy */}
      <section id="co-oferujemy" className="scroll-mt-20 py-12 md:py-20 px-4 md:px-8 bg-[#E8F5EC] relative overflow-hidden">
        {/* Miejsce na grafikę w prawym dolnym rogu (np. niebieski ludzik) */}
        <div className="absolute bottom-0 right-0 w-32 h-32 md:w-[350px] md:h-[350px] pointer-events-none z-0 opacity-50 md:opacity-100">
          <img src="/blue_figure.png" alt="Ilustracja postaci" className="w-full h-full object-contain object-bottom right-0 bottom-0 absolute" />
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="flex flex-col items-center text-center mb-10 md:mb-16">
            <span className="inline-block px-4 py-1 border border-[#0E6630] text-[#0E6630] rounded-full text-sm font-semibold mb-4 md:mb-6">Co oferujemy</span>
            <h2 className="text-[24px] md:text-4xl font-bold text-[#151515] mb-4 md:mb-6">Nasza aplikacja</h2>
            <p className="text-base md:text-xl text-[#151515] max-w-3xl leading-relaxed">
              Jesteś pracownikiem, team leaderem czy menedżerem? Bez względu na rolę, nasza aplikacja wellbeing wspomoże Cię w efektywnym planowaniu dnia i zapobieganiu wypaleniu. Tylko 5-10 minut dziennie – spersonalizowana pod Ciebie, dla realnych rezultatów.
            </p>
          </div>
          <div className="flex flex-col gap-4 md:gap-6 relative z-10 w-full items-center">
            {/* Top row - 3 items */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 w-full">
              {[
                { icon: <img src="/checklist.png" alt="Task planer" className="w-6 h-6 md:w-8 md:h-8 object-contain" />, title: "Task planer", desc: "Układa zadania w harmonogram spersonalizowany pod Ciebie." },
                { icon: <img src="/sentiment_satisfied.png" alt="Monitor nastroju" className="w-6 h-6 md:w-8 md:h-8 object-contain" />, title: "Monitor nastroju", desc: "Krótka, codzienna skala 5 stopniowa, która zbiera to, jak się czujesz w pracy." },
                { icon: <img src="/query_stats.png" alt="Analiza trendów" className="w-6 h-6 md:w-8 md:h-8 object-contain" />, title: "Analiza trendów", desc: "Czytelny obraz, co dzieje się z Twoim nastrojem i obciążeniem tydzień po tygodniu." }
              ].map((c, i) => (
                <div key={i} className="bg-white p-6 md:p-8 rounded-2xl md:text-center text-left shadow-sm flex flex-col items-center md:items-center">
                  <div className="mb-3 md:mb-4">{c.icon}</div>
                  <h3 className="font-bold text-[#151515] text-base md:text-lg mb-2 md:mb-3 text-center">{c.title}</h3>
                  <p className="text-sm md:text-sm text-[#151515] leading-relaxed px-2 text-center">{c.desc}</p>
                </div>
              ))}
            </div>
            {/* Bottom row - 2 items */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full max-w-3xl">
              {[
                { icon: <img src="/support.png" alt="System ostrzegania" className="w-6 h-6 md:w-8 md:h-8 object-contain" />, title: "System ostrzegania", desc: "Delikatny sygnał, gdy dane od dłuższego czasu wskazują możliwe symptomy wypalenia." },
                { icon: <img src="/for_you.png" alt="Bezpieczne rekomendacje" className="w-6 h-6 md:w-8 md:h-8 object-contain" />, title: "Bezpieczne rekomendacje", desc: "Linki do rzetelnych źródeł i instytucji, jeśli uznasz, że potrzebujesz dodatkowego wsparcia." }
              ].map((c, i) => (
                <div key={i} className="bg-white p-6 md:p-8 rounded-2xl shadow-sm flex flex-col items-center">
                  <div className="mb-3 md:mb-4">{c.icon}</div>
                  <h3 className="font-bold text-[#151515] text-base md:text-lg mb-2 md:mb-3 text-center">{c.title}</h3>
                  <p className="text-sm md:text-sm text-[#151515] leading-relaxed px-2 text-center">{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Nasza wizja */}
      <section id="o-nas" className="scroll-mt-20 py-16 md:py-24 px-4 md:px-8 bg-[#0E6630] text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10 flex flex-col items-center">
          <span className="inline-block px-4 py-1 border border-white text-white rounded-full text-sm font-semibold mb-6 md:mb-8">Nasza wizja</span>
          <p className="text-lg md:text-3xl font-bold text-white leading-relaxed">
            Jeśli codziennie zmagasz się z natłokiem zadań, pomożemy Ci je zorganizować i wychwycić wczesne symptomy wypalenia. Aplikacja dostosowuje się do Ciebie na podstawie wywiadu i danych o nastroju, oferując spersonalizowany planer oraz monitorowanie. Dostarczamy rekomendacje do sprawdzonych źródeł pomocy – rządowych instytucji czy specjalistów – bo zależy nam na Twoim dobrostanie.
          </p>
        </div>
      </section>

      {/* Rozwiązanie problemu */}
      <section id="rozwiazanie" className="scroll-mt-20 py-12 md:py-20 px-4 md:px-8 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-10 md:gap-16">
          <div className="flex-1 flex flex-col items-start text-left">
            <span className="inline-block px-4 py-1 border border-[#2F7377] text-[#2F7377] rounded-full text-sm font-semibold mb-4 md:mb-6 w-max">Rozwiązanie problemu</span>
            <h2 className="text-[24px] md:text-4xl font-bold text-[#151515] leading-tight mb-4 md:mb-8">Zaprojektowaliśmy aplikację Dla Ciebie</h2>
          </div>
          <div className="flex-1 flex flex-col gap-4 md:gap-6 relative z-10">
            {[
              "Wpisujesz zadania z priorytetami, a AI tworzy zoptymalizowany harmonogram dopasowany do Twojego aktualnego samopoczucia – dostępne na mobile i desktop.",
              "Codziennie oceniasz nastrój w prostej skali, aplikacja analizuje emocje i czas pracy, sygnalizując ryzyka z indywidualnymi wskazówkami.",
              "To Twój osobisty asystent równowagi – wypróbuj i przekonaj się o zmianie."
            ].map((text, i) => (
              <div key={i} className="bg-[#E4F6F8] p-5 md:p-6 rounded-xl text-[#151515] text-sm md:text-lg leading-relaxed shadow-sm">
                {text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Kontakt */}
      <section id="kontakt" className="scroll-mt-20 py-12 md:py-20 px-4 md:px-8 bg-[#F5EFE6] relative overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          {/* Miejsce na grafikę tła */}
          <img src="/kontakt_tlo.png" alt="Tło kontaktowe" className="w-full h-full object-cover object-bottom" />
        </div>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-10 md:gap-16 relative z-10">
          <div className="flex-1 flex flex-col items-start text-left">
            <span className="inline-block px-4 py-1 border border-[#0E6630] text-[#0E6630] rounded-full text-sm font-semibold mb-4 md:mb-6">Kontakt</span>
            <h2 style={fontDM} className="text-[32px] md:text-5xl font-bold text-[#0D0D0D] tracking-tight mb-4 md:mb-6">Skontaktuj się z nami</h2>
            <p className="text-[#151515] text-base md:text-lg leading-relaxed max-w-md">
              Masz pytania? Napisz do nas – pokażemy demo, porozmawiamy o możliwym wdrożeniu i przedstawimy, jak realnie może to zwiększyć efektywność pracy zespołu. Skontaktuj się z nami, a wspólnie dopasujemy najlepsze podejście dla Twojej organizacji.
            </p>
          </div>
          <div className="flex-1 w-full">
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-gray-100 w-full">
              <div className="space-y-5 md:space-y-6">
                <div>
                  <label className="block text-[#151515] text-sm md:text-base font-medium mb-1 md:mb-2">Imię</label>
                  <input type="text" placeholder="Twoje imię" className="w-full px-4 py-2.5 md:py-3 border border-[#D6D6D6] rounded-lg focus:outline-none focus:border-[#0E6630] text-sm md:text-base" />
                </div>
                <div>
                  <label className="block text-[#151515] text-sm md:text-base font-medium mb-1 md:mb-2">Email</label>
                  <input type="email" placeholder="Wpisz e-mail" className="w-full px-4 py-2.5 md:py-3 border border-[#D6D6D6] rounded-lg focus:outline-none focus:border-[#0E6630] text-sm md:text-base" />
                </div>
                <div>
                  <label className="block text-[#151515] text-sm md:text-base font-medium mb-1 md:mb-2">Twoja wiadomość</label>
                  <textarea placeholder="Napisz..." rows={4} className="w-full px-4 py-2.5 md:py-3 border border-[#D6D6D6] rounded-lg focus:outline-none focus:border-[#0E6630] resize-none text-sm md:text-base" />
                </div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" className="mt-1 w-4 h-4 md:w-5 md:h-5 border-[#DFDBDB] rounded accent-[#0E6630] shrink-0" />
                  <span className="text-[#151515] text-xs md:text-sm mt-0.5">Akceptuję <a href="/regulamin" className="underline">regulamin</a></span>
                </label>
                <button className="flex justify-center items-center gap-2 px-6 py-3 bg-[#0E6630] text-white font-medium rounded-lg hover:bg-[#0b5025] transition-colors w-full md:w-auto mt-2">
                  Wyślij <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-8 md:py-12 px-4 md:px-8 border-t border-gray-100">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-8 md:gap-12 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center justify-between w-full gap-6">
            <a href="#home" onClick={(e) => { e.preventDefault(); scrollToSection("home"); }} className="flex items-center hover:opacity-90 transition-opacity">
              <img src="/logo WBA.svg" alt="Wellbeing app" width="387" height="50" className="h-7 md:h-8 w-auto object-contain" />
            </a>
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
              <a href="#home" onClick={(e) => { e.preventDefault(); scrollToSection("home"); }} className="text-[#5A5A5A] text-sm md:text-base font-medium hover:text-[#0E6630]">Home</a>
              <a href="#produkt" onClick={(e) => { e.preventDefault(); scrollToSection("produkt"); }} className="text-[#5A5A5A] text-sm md:text-base font-medium hover:text-[#0E6630]">Produkt</a>
              <a href="#wypalenie" onClick={(e) => { e.preventDefault(); scrollToSection("wypalenie"); }} className="text-[#5A5A5A] text-sm md:text-base font-medium hover:text-[#0E6630]">Wypalenie</a>
              <a href="#o-nas" onClick={(e) => { e.preventDefault(); scrollToSection("o-nas"); }} className="text-[#5A5A5A] text-sm md:text-base font-medium hover:text-[#0E6630]">O nas</a>
              <a href="#kontakt" onClick={(e) => { e.preventDefault(); scrollToSection("kontakt"); }} className="text-[#5A5A5A] text-sm md:text-base font-medium hover:text-[#0E6630]">Kontakt</a>
            </div>
          </div>
          <div className="w-full h-px bg-[#F6F6F6]" />
          <div className="w-full flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 text-xs md:text-sm text-[#121212] order-2 md:order-1">
              <a href="/polityka-prywatnosci" className="underline hover:text-[#0E6630]">Polityka prywatności</a>
              <a href="/regulamin" className="underline hover:text-[#0E6630]">Regulamin</a>
              <a href="#" className="underline hover:text-[#0E6630]">Pliki cookies</a>
            </div>
            <p className="text-[#121212] text-xs md:text-sm order-1 md:order-2">© 2026 Nasza Aplikacja Wellbeing</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

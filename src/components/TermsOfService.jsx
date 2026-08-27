import React from 'react';
import { FileText, ArrowLeft } from 'lucide-react';

export default function TermsOfService({ onBack }) {
  return (
    <div className="min-h-screen bg-[#FDFBF7] p-6 md:p-12 text-[#1A2F22] font-sans">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-[#E8DDD0]">
        <button 
          onClick={onBack}
          className="mb-8 flex items-center gap-2 text-[#5A7368] hover:text-[#1E5C36] transition-colors font-semibold cursor-pointer"
        >
          <ArrowLeft size={18} /> Powrót do aplikacji
        </button>
        
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-[#E8F4ED] rounded-xl flex items-center justify-center text-[#2D9E6B]">
            <FileText size={24} />
          </div>
          <h1 className="text-3xl font-black text-[#1A2F22]">Regulamin Świadczenia Usług (Terms of Service)</h1>
        </div>

        <div className="space-y-6 text-sm leading-relaxed text-[#4A5D53]">
          <p><strong>Ostatnia aktualizacja:</strong> 27 sierpnia 2026</p>
          
          <p>
            Witamy w aplikacji <strong>Wellbeing App</strong> ("Aplikacja", "My"). Poniższy Regulamin określa zasady, na jakich możesz korzystać z naszej Aplikacji. 
            Korzystając z Aplikacji, akceptujesz warunki niniejszego Regulaminu. Jeśli się z nimi nie zgadzasz, prosimy o niekorzystanie z naszych usług.
          </p>

          <h2 className="text-xl font-bold text-[#1A2F22] mt-8 mb-4">1. Cel i charakter Aplikacji</h2>
          <p>
            Wellbeing App to narzędzie wspomagające organizację czasu, zarządzanie zadaniami oraz monitorowanie nastroju. Aplikacja ma charakter pomocniczy i edukacyjny, nie zastępuje jednak profesjonalnej porady medycznej ani psychologicznej.
          </p>

          <h2 className="text-xl font-bold text-[#1A2F22] mt-8 mb-4">2. Korzystanie z Aplikacji</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Aby korzystać z Aplikacji, musisz podać poprawny adres e-mail i zalogować się. Jesteś odpowiedzialny za bezpieczeństwo swojego konta.</li>
            <li>Zgadzasz się korzystać z Aplikacji zgodnie z prawem oraz jej przeznaczeniem. Zabrania się działań mających na celu uszkodzenie Aplikacji lub przeciążenie naszych serwerów.</li>
            <li>Aplikacja integruje się z Google Calendar za Twoją zgodą, wyłącznie w celu odczytu nadchodzących wydarzeń, co zostało szczegółowo opisane w naszej Polityce Prywatności.</li>
          </ul>

          <h2 className="text-xl font-bold text-[#1A2F22] mt-8 mb-4">3. Własność intelektualna</h2>
          <p>
            Wszelkie prawa do Aplikacji, jej kodu źródłowego, designu, logotypów i tekstów (z wyłączeniem danych wprowadzonych przez Ciebie oraz danych z usług zewnętrznych) należą do twórcy Wellbeing App i są chronione prawem autorskim.
          </p>

          <h2 className="text-xl font-bold text-[#1A2F22] mt-8 mb-4">4. Dostępność i Ograniczenie odpowiedzialności</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Staramy się, aby Aplikacja działała bez przerw i błędów, jednak nie możemy zagwarantować jej 100% niezawodności.</li>
            <li>Nie ponosimy odpowiedzialności za ewentualną utratę danych (np. zadań czy wpisów dotyczących nastroju) wynikającą z awarii serwerów, przerw w dostępie do internetu czy siły wyższej.</li>
            <li>Usługa jest dostarczana "w stanie takim, w jakim jest" (as is), bez jakichkolwiek gwarancji.</li>
          </ul>

          <h2 className="text-xl font-bold text-[#1A2F22] mt-8 mb-4">5. Funkcje oparte na Sztucznej Inteligencji (AI)</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Aplikacja wykorzystuje mechanizmy Sztucznej Inteligencji (AI) do generowania automatycznych planów dnia oraz do analizowania wpisów dotyczących Twojego nastroju.</li>
            <li><strong>Wyłączenie odpowiedzialności:</strong> Wyniki, analizy, alerty i sugestie dostarczane przez moduły AI mają charakter <u>wyłącznie poglądowy, informacyjny i rozrywkowy</u>.</li>
            <li>Analiza nastroju nie stanowi diagnozy medycznej, psychiatrycznej, psychologicznej ani substytutu profesjonalnej porady terapeutycznej.</li>
            <li>Użytkownik podejmuje wszelkie decyzje życiowe i zdrowotne na własne ryzyko. <strong>Twórca Aplikacji zrzeka się wszelkiej odpowiedzialności prawno-karnej i cywilnej</strong> za jakiekolwiek szkody, działania, zaniechania lub decyzje podjęte (bądź niepodjęte) przez użytkownika na podstawie wygenerowanego przez AI planu dnia lub analizy nastroju.</li>
          </ul>

          <h2 className="text-xl font-bold text-[#1A2F22] mt-8 mb-4">6. Zmiany w Regulaminie</h2>
          <p>
            Zastrzegamy sobie prawo do modyfikacji niniejszego Regulaminu w dowolnym czasie. O istotnych zmianach użytkownicy zostaną poinformowani. Dalsze korzystanie z Aplikacji po wprowadzeniu zmian oznacza ich akceptację.
          </p>

          <h2 className="text-xl font-bold text-[#1A2F22] mt-8 mb-4">7. Kontakt</h2>
          <p>
            W przypadku pytań dotyczących niniejszego Regulaminu, prosimy o kontakt pod adresem e-mail: <strong>alek.iglow@gmail.com</strong>
          </p>
        </div>
      </div>
    </div>
  );
}

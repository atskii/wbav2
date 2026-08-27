import React from 'react';
import { Shield, ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy({ onBack }) {
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
            <Shield size={24} />
          </div>
          <h1 className="text-3xl font-black text-[#1A2F22]">Polityka Prywatności</h1>
        </div>

        <div className="space-y-6 text-sm leading-relaxed text-[#4A5D53]">
          <p><strong>Ostatnia aktualizacja:</strong> 27 sierpnia 2026</p>
          
          <p>
            Niniejsza Polityka Prywatności określa, w jaki sposób aplikacja <strong>Wellbeing App</strong> ("Aplikacja", "My") 
            gromadzi, wykorzystuje i chroni Twoje informacje, w tym dane pozyskiwane za pośrednictwem interfejsów API Google oraz naszej bazy danych (Supabase).
          </p>

          <h2 className="text-xl font-bold text-[#1A2F22] mt-8 mb-4">1. Jakich danych z Google używamy?</h2>
          <p>
            Nasza aplikacja integruje się z usługą Google Calendar. Podczas łączenia konta, prosimy o dostęp w trybie <strong>tylko do odczytu</strong> (zakres: <code>https://www.googleapis.com/auth/calendar.events.readonly</code>).
          </p>
          <p>Dzięki temu Aplikacja może:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Odczytywać Twoje nadchodzące wydarzenia, aby wyświetlić je w panelu aplikacji jako zadania.</li>
            <li>Pomóc Ci w lepszym planowaniu dnia z uwzględnieniem sztywnych bloków czasowych z Twojego kalendarza.</li>
          </ul>

          <h2 className="text-xl font-bold text-[#1A2F22] mt-8 mb-4">2. Zgodność z polityką Google</h2>
          <p>
            Wykorzystanie oraz przekazywanie do innych aplikacji informacji otrzymanych z Google API przez <strong>Wellbeing App</strong> odbywa się zgodnie z polityką <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noreferrer" className="text-[#2D9E6B] underline font-semibold">Google API Services User Data Policy</a>, włączając w to wymogi dotyczące Ograniczonego Użycia (Limited Use).
          </p>

          <h2 className="text-xl font-bold text-[#1A2F22] mt-8 mb-4">3. Jakie inne dane zbieramy?</h2>
          <p>W celu zapewnienia prawidłowego działania aplikacji i synchronizacji pomiędzy urządzeniami, przechowujemy następujące dane na bezpiecznych serwerach (Supabase):</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Adres e-mail:</strong> Używany jako Twój unikalny identyfikator, potrzebny do logowania.</li>
            <li><strong>Zadania (Tasks):</strong> Treść zadań, priorytety i deadline'y, które samodzielnie dodasz w aplikacji lub zaimportujesz z kalendarza.</li>
            <li><strong>Historia Nastrojów (Moods):</strong> Informacje o Twoim samopoczuciu wprowadzane w aplikacji.</li>
            <li><strong>Preferencje (Profiles):</strong> Ustawienia aplikacji, bilans monet i statystyki.</li>
          </ul>

          <h2 className="text-xl font-bold text-[#1A2F22] mt-8 mb-4">4. Udostępnianie danych</h2>
          <p>
            <strong>Nie sprzedajemy, nie wynajmujemy ani nie udostępniamy</strong> Twoich danych osobowych, historii nastrojów, zadań ani danych z kalendarza żadnym podmiotom trzecim w celach reklamowych czy marketingowych.
          </p>

          <h2 className="text-xl font-bold text-[#1A2F22] mt-8 mb-4">5. Twoje Prawa, Retencja i Usuwanie danych</h2>
          <p>
            Masz pełne prawo wglądu do swoich danych oraz żądania ich całkowitego usunięcia. Możesz to zrobić kontaktując się z nami bezpośrednio. 
          </p>
          <p>
            W każdej chwili możesz również całkowicie odciąć Aplikacji dostęp do Twojego Kalendarza Google, wchodząc w ustawienia bezpieczeństwa swojego konta Google (Zarządzanie dostępem aplikacji zewnętrznych).
          </p>

          <h2 className="text-xl font-bold text-[#1A2F22] mt-8 mb-4">6. Kontakt</h2>
          <p>
            W przypadku pytań, wątpliwości lub chęci usunięcia konta, prosimy o kontakt pod adresem e-mail: <strong>alek.iglow@gmail.com</strong>
          </p>
        </div>
      </div>
    </div>
  );
}

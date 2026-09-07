# Specyfikacja Techniczna Projektu

**Projekt:** WellBeing App

---

## 1. Stos Technologiczny (Core Tech Stack) i Uzasadnienie Decyzji Architektonicznych

Sekcja ta zawiera precyzyjny opis technologii bazowych stanowiących fundament aplikacji oraz merytoryczne uzasadnienie ich doboru pod kątem wydajności, skalowalności, ergonomii pracy i niezawodności.

---

### 1.1. React (Wersja 19) — Biblioteka / Framework Interfejsu Użytkownika

* **Rola w systemie:**  
  Główna technologia warstwy prezentacji (UI Runtime). Odpowiada za deklaratywny rendering interfejsu, zarządzanie lokalnym i globalnym stanem aplikacji, obsługę cyklu życia komponentów oraz reaktywną synchronizację widoku z danymi (Virtual DOM / Concurrent React).

* **Dlaczego taka decyzja (Uzasadnienie):**
  1. **Architektura komponentowa:** Umożliwia podział złożonego interfejsu (modale zadań, interaktywny kalendarz, wykresy nastroju, panele analityczne) na niezależne, izolowane i łatwe w testowaniu komponenty wielokrotnego użytku.
  2. **Doświadczenie deweloperskie i ekosystem:** Najbogatszy ekosystem gotowych bibliotek wspierających (obsługa animacji, formularzy, ikonografii, zarządzania stanem).
  3. **Wydajność i współbieżność (React 19):** Zoptymalizowane mechanizmy renderowania i przejść stanów, kluczowe dla płynnego działania aplikacji o dynamicznych aktualizacjach (przeciąganie zadań, filtrowanie osi czasu, animacje pasków postępu).

* **Analiza alternatyw:**
  * *vs Vue.js / Svelte:* Choć oferują mniejszy boilerplate, React zapewnia większą elastyczność architektoniczną przy integracjach z zaawansowanymi bibliotekami zewnętrznymi oraz silniejsze wsparcie w standardzie TypeScript.
  * *vs Angular:* Zbyt duży narzut frameworka (heavyweight framework), wymuszający sztywną strukturę modułową i skomplikowany system Dependency Injection, co jest nieoptymalne dla zwinnej aplikacji SPA.
  * *vs Vanilla JavaScript:* Brak deklaratywności prowadziłby do powtarzalnego, podatnego na błędy ręcznego manipulowania drzewem DOM przy intensywnych operacjach na liście zadań i kalendarzu.

---

### 1.2. TypeScript (TS) — Język Programowania i Statyczne Typowanie

* **Rola w systemie:**  
  Główny język programowania aplikacji (nadbudowa nad JavaScript), dostarczający statyczny system typów w czasie kompilacji oraz rozbudowany kontrakt struktur danych (interfejsy i typy domenowe).

* **Dlaczego taka decyzja (Uzasadnienie):**
  1. **Eliminacja błędów runtime:** Wykrywanie błędów typu `TypeError: undefined is not an object` już na etapie pisania kodu i kompilacji, a nie u użytkownika końcowego.
  2. **Ścisłe kontrakty danych domenowych:** Precyzyjne definiowanie struktur kluczowych encji (np. `Task`, `RecurrenceRule`, `MoodEntry`, `UserAnalytics`, `GamificationProfile`), co zapobiega niespójnościom danych przesyłanych między komponentami a warstwą danych.
  3. **Pewność refaktoryzacji i autouzupełnianie (IntelliSense):** Automatyczna podpowiedź właściwości obiektów, bezbłędna zmiana nazw funkcji czy pól modeli w całym projekcie jednocześnie.

* **Analiza alternatyw:**
  * *vs Czysty JavaScript (ESNext):* JS nie weryfikuje poprawności przekazywanych parametrów i struktur, co przy rozbudowanej logice materializacji zadań cyklicznych czy wyliczania punktów XP stanowiło wysokie ryzyko regresji.
  * *vs JSDoc (adnotacje typów w JS):* JSDoc jest uciążliwy w utrzymaniu i nie gwarantuje tak rygorystycznej kontroli kompilatora jak natywny kompilator TypeScript (`tsc`).

---

### 1.3. Vite (Wersja 8) — Narzędzie Budujące (Bundler) i Środowisko Deweloperskie

* **Rola w systemie:**  
  Nowoczesny silnik uruchomieniowy i budujący. Odpowiada za serwowanie aplikacji w trybie deweloperskim (Dev Server z natywnym ESM i Hot Module Replacement) oraz optymalizację i bundling produkcyjny (Rollup/esbuild), w tym obsługę wielu punktów wejścia (Multi-Page / Multi-Entry: `index.html`, `analytics.html`, `users.html`).

* **Dlaczego taka decyzja (Uzasadnienie):**
  1. **Błyskawiczny start i HMR (Hot Module Replacement):** Serwer deweloperski startuje natychmiast, niezależnie od liczby modułów, a zmiany w plikach widoczne są w przeglądarce w ułamku sekundy.
  2. **Wydajny bundling produkcyjny:** Automatyczny code-splitting, tree-shaking (usuwanie nieużywanego kodu), minifikacja zasobów i optymalne haszowanie plików statycznych dla wydajnego cache'owania.
  3. **Wsparcie dla Multi-Page Application (MPA) / Multi-Entry:** Elastyczna konfiguracja (`vite.config.js`, `vite.analytics.config.js`, `vite.users.config.js`) umożliwiająca jednoczesną pracę nad różnymi dedykowanymi widokami.

* **Analiza alternatyw:**
  * *vs Create React App (Webpack):* Webpack wymaga powolnego ponownego budowania całego pakietu przy zmianach. CRA jest oficjalnie przestarzałe (deprecated) i porzucone przez społeczność Reacta.
  * *vs Parcel:* Mniejsza kontrola nad zaawansowanymi regułami bundlingu wieloekranowego i wtyczkami specyficznymi dla ekosystemu React.

---

### 1.4. Tailwind CSS (Wersja 4) + PostCSS — Warstwa Stylowania i System Designu

* **Rola w systemie:**  
  Silnik stylizacji bazujący na paradygmacie *utility-first*. Odpowiada za warstwę wizualną, spójny system tokenów projektowych (odstępy, typografia, kolory, zaokrąglenia), responsywność (RWD) oraz motywy kolorystyczne (Dark / Light Mode).

* **Dlaczego taka decyzja (Uzasadnienie):**
  1. **Szybkość tworzenia i brak narzutu niespójnych plików CSS:** Style tworzone są bezpośrednio w strukturze komponentów bez konieczności przełączania się między plikami `.jsx`/`.tsx` i `.css`.
  2. **Optymalizacja rozmiaru produkcyjnego:** Nowy kompilator Tailwind CSS v4 generuje plik wynikowy zawierający wyłącznie użyte w projekcie klasy CSS, redukując wagę stylów do absolutnego minimum.
  3. **Spójność wizualna:** Ograniczenie palety kolorystycznej i skal rozmiarów do z góry zdefiniowanego design systemu, co eliminuje przypadkowe, arbitralne wartości w kodzie.

* **Analiza alternatyw:**
  * *vs Zwykły CSS / CSS Modules:* Konieczność ręcznego wymyślania setek unikalnych nazw klas BEM, duplikacja reguł i ryzyko niekontrolowanego rozrostu arkuszy stylów.
  * *vs Biblioteki komponentowe typu Material UI (MUI) / Chakra UI:* Duży narzut wagowy na bundle JavaScript, trudniejsza modyfikacja specyficznych stylów i gorsza wydajność przy częstym przeładowywaniu stanów.

---

### 1.5. Biblioteki Wspierające Warstwę Prezentacji

* **`lucide-react`**: Lekki, spójny zestaw wektorowych ikon dostarczanych jako komponenty React. Wspiera tree-shaking, dzięki czemu do wynikowego buildu trafiają wyłącznie ikony rzeczywiście wyrenderowane na ekranie.
* **`framer-motion`**: Deklaratywna biblioteka do zaawansowanych animacji i mikrointerakcji (animacje otwierania modali, płynne przejścia zakładek, animacje paska postępu).
* **`canvas-confetti`**: Wysokowydajna biblioteka renderująca efekty cząsteczkowe na elemencie `<canvas>`, wykorzystywana w mechanizmach grywalizacji (nagradzanie za realizację celów i podbijanie serii/streak).
---

## 2. Architektura Modułowa Systemu

Poniżej przedstawiono szczegółowy opis kluczowych modułów funkcjonalnych aplikacji:

### 2.1. Moduł Zadań i Planowania (Task Management)
Serce aplikacji odpowiadające za zarządzanie cyklem życia zadań. Obsługuje różne warianty wpisów:
* **Zadania zwykłe:** Pojedyncze akcje do wykonania, przypisane do konkretnego dnia (lub bez określonej daty – w tzw. kolejce / backlogu).
* **Zadania z terminem (Deadline):** Posiadają sztywną datę końcową. Ułatwiają priorytetyzację i zarządzanie czasem.
* **Zadania cykliczne:** Złożony mechanizm pozwalający na definiowanie powtarzalnych nawyków (np. "codziennie", "w dni robocze", "co środę"). System wykorzystuje proces **materializacji**, który generuje fizyczne, oddzielne rekordy (instancje) w bazie danych dla poszczególnych dni. Dzięki temu zmiana statusu zadania (np. odznaczenie jako wykonane) w jednym dniu nie wpływa na jego wystąpienie w kolejnych. Do materializacji brana jest pod uwagę bazowa struktura powtarzalności zadania matki oraz data docelowa (`pDate`).
* **Integracja z Google Calendar:** Możliwość synchronizacji zadań z zewnętrznym kalendarzem Google, co pozwala na centralizację planów użytkownika i widoczność zdarzeń z aplikacji w innych narzędziach.

### 2.2. Moduł Kalendarza (Calendar & Timeline View)
Odpowiada za wizualizację zadań i wydarzeń w kontekście czasu.
* **Widok osi czasu (Timeline):** Główne narzędzie operacyjne. Filtruje zmaterializowane zadania na podstawie przypisanej do nich daty wykonania (`pDate`). Zapewnia to bezbłędne przyporządkowanie wpisów do konkretnych dni.
* **Widoki rozszerzone:** Możliwość podglądu zadań w układzie miesięcznym lub tygodniowym, co ułatwia planowanie długoterminowe.

### 2.3. Moduł Rejestracji Nastroju (Mood Tracking)
Narzędzie do monitorowania stanu psychofizycznego użytkownika.
* **Dziennik samopoczucia:** Pozwala na regularne wprowadzanie informacji o nastroju.
* Dane te stanowią fundament do późniejszej analityki – pozwalają na korelację produktywności (liczby wykonanych zadań) z realnym samopoczuciem i zdolnością do skupienia.

### 2.4. System Ostrzeżeń (Early Warning System)
Mechanizm prewencyjny i wspierający, bazujący na analizie nawyków i nastroju:
* **Alerty przemęczenia i wypalenia:** System wykrywa wzorce negatywne, np. utrzymujący się niski nastrój skorelowany z dużą liczbą niewykonanych lub przeterminowanych zadań.
* **Inteligentne interwencje:** W momencie zarejestrowania ryzyka wypalenia, aplikacja pełni rolę "mostu" pomiędzy użytkownikiem a organizacjami specjalizującymi się w pomocy psychologiczne..

### 2.5. Wirtualna Roślinka (Streak Plant)
System motywacyjny bazujący na utrzymywaniu ciągłości (streak).
* **Wizualizacja postępów:** W miarę regularnego wykonywania zadań, użytkownik wizualnie "podlewa" i rozwija swoją wirtualną roślinkę.
* **Motywacja do dalszego logowania:** Wraz z kolejną liczbą logowań do aplikacji, uzytkownik odblokowuje nowe rodzaje roślinek co motywuje go do dalszego korzystania z aplikacji.


### 2.6. Moduł AI (Sztuczna Inteligencja - Prompty i Plany)
Wykorzystuje potencjał sztucznej inteligencji do wspierania użytkownika i optymalizacji jego planów. 
* **AI Task Planner:** Tworzy spersonalizowane plany dnia zgodnie z uwagami użytkownika, preferencjami oraz zadaniami do wykonania.
* **AI Coach:** Analizuje nastrój uzytkownika a potem na jego podstawie daje opinie majaca pomoc uzytkownik w uswiadomieniu mu jego nastroju oraz daje mu porady jak sobie z nimi poradzic bazujac jak i rekomendujac sprawdzone artykuly naukowe.

### 2.9. Moduł Logowania, Onboardingu i Autoryzacji (Auth Module)
Zapewnia bezpieczeństwo i płynne wejście w aplikację.
* **Logowanie tradycyjne i Google (OAuth):** Klasyczna rejestracja oraz logowanie przez zewnętrzne dostawców jak np. konta Google.
* **Onboarding (`Onboarding` & `Landing`):** Kompleksowy system oprowadzający nowego użytkownika po systemie już od strony głównej (landing page).
* **Wymogi prawne:** Zintegrowane widoki regulaminów i polityk prywatności (`TermsOfService`, `PrivacyPolicy`).

### 2.10. Panele Dodatkowe: Koszty (AI Tokens), Diagnostyka i Komendy Zdalne
Zestaw zaawansowanych narzędzi serwisowych i monitorujących.
* **Panel kosztów i Limitów (AI Tokens):** Mechanizm (realizowany poprzez bazę np. `supabase_ai_tokens.sql`) kontrolujący zużycie zasobów (zapytań do modeli AI) oraz wyliczający lub ograniczający ich użycie na użytkownika, aby zapobiegać nadużyciom.
* **Diagnostyka (Debug Mode):** Umożliwia inspekcję stanu aplikacji (np. poprawność materializacji dat), przegląd błędów i weryfikację komunikacji z backendem.
* **Zdalne komendy:** Zaawansowana funkcjonalność pozwalająca na wyzwalanie procesów, zmian konfiguracji lub narzędzi diagnostycznych z poziomu wysyłanych, specjalnych instrukcji "na odległość".

### 2.11. Moduł Ustawień i Preferencji (Settings)
Centralne miejsce personalizacji doświadczenia użytkownika.
* **Konfiguracja planu dnia (`SettingsView`):** Definiowanie m.in. liczby godzin pracy czy optymalnej pory rozpoczęcia działania (Start Hour, Start Minute).
* **Ulubione aktywności (Picks):** Zapisywanie szybkich przerw (np. "Krótki spacer", "Dobra kawa"), które aplikacja może automatycznie podpowiadać.
* **Zarządzanie kontem:** Dostęp do FAQ i zarządzanie uprawnieniami (np. integracja z kalendarzem).

### 2.12. Tryb Skupienia (Focus Mode)
Dedykowane narzędzie wspomagające głęboką pracę (deep work) nad pojedynczym zadaniem.
* **Zarządzanie czasem (`FocusModeView`):** Zintegrowany minutnik (bazujący np. na technice Pomodoro, domyślnie 25 minut) aktywowany bezpośrednio z poziomu zadania.
* **Ograniczanie rozpraszaczy:** Umożliwia użytkownikowi śledzenie rzeczywistego czasu poświęconego na konkretne działanie i nagradzanie punktami skupienia po jego upłynięciu.

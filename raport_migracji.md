# Raport z wdrożenia materializacji zadań cyklicznych w Wellbeing-App (WBA)

## 1. Wstęp i opis problemu (Context & Problem Statement)
W pierwotnej architekturze Wellbeing-App (WBA) zadania cykliczne były realizowane za pomocą **deklaratywnej cykliczności**. Oznaczało to, że w bazie danych Supabase (PostgreSQL) istniał tylko jeden rekord (wzorzec) dla całego cyklu zadania. 

Aplikacja kliencka dynamicznie obliczała i wyświetlała to samo zadanie w kalendarzu na każdy dzień pasujący do reguły zapisanej w kolumnie `recurrence` (np. codziennie, co tydzień).

### Główne wady starego rozwiązania:
1. **Współdzielony stan (Shared State):** Oznaczenie zadania jako ukończone (`done = true`) na wybrany dzień oznaczało automatyczne oznaczenie go jako ukończone w każdym innym dniu cyklu.
2. **Brak unikalnych identyfikatorów:** Nie było fizycznej możliwości modyfikacji, usunięcia lub spersonalizowania konkretnego wystąpienia (np. przesunięcia godziny jednego spotkania w cyklu) bez wpływu na cały cykl.
3. **Niestabilność filtrowania UI:** Filtry w kalendarzu opierały się na parsowaniu tekstu z pola `t` (np. `"🔒 10:00 🔁 co tydzień pt"`), co powodowało błędy wydajnościowe i nakładanie się zadań.

---

## 2. Nowa koncepcja architektoniczna (Materializacja instancji)
Przejście na nowy model polega na **pełnej materializacji instancji zadań**. Każde wystąpienie zadania cyklicznego staje się teraz w pełni autonomicznym rekordem w bazie danych PostgreSQL z własnym, unikalnym kluczem głównym `id`.

* **Zadanie oryginalne (inicjujące):** Zostaje zapisane w bazie, a jego pole `recurrence` jest zmieniane na `'jednorazowo'`, by zapobiec ponownemu generowaniu.
* **Instancje przyszłe:** Są generowane na podstawie reguły cykliczności i zapisywane jako osobne rekordy z polem `recurrence` o wartości `'zmaterializowane'`.
* **Stan ukończenia:** Każda instancja ma własne niezależne pole `done` (domyślnie `false`).

---

## 3. Zmiany w bazie danych i skryptach (Supabase / Node.js)

Do przeprowadzenia migracji oraz naprawy danych przygotowano trzy dedykowane skrypty Node.js. Wszystkie korzystają z biblioteki `@supabase/supabase-js` oraz `dotenv` do pobierania konfiguracji z pliku `.env`.

### A. Główny skrypt migracyjny: `scripts/migrate-recurrence.js`
Skrypt ten dokonuje jednorazowej transformacji istniejącej bazy danych:
1. **Pobranie danych:** Wybiera z tabeli `tasks` wszystkie zadania, gdzie `recurrence` nie jest puste, `'jednorazowo'` ani `'zmaterializowane'`.
2. **Wyliczenie dat:** Dla każdego zadania generuje daty na podstawie reguły cyklu:
   * `'codziennie'` -> skok co 1 dzień.
   * `'co tydzień'` -> skok co 7 dni od daty początkowej (`pDate`).
   * `'w dni robocze'` -> skok co 1 dzień, z pominięciem sobót i niedziel.
3. **Zastosowanie limitu (Horyzont czasowy):** Generowanie kończy się w punkcie zapisanym w `recurrenceEnd` lub po maksymalnie **365 dniach** od daty uruchomienia.
4. **Klonowanie obiektów:** Tworzy nowe obiekty zadań dla każdej z wygenerowanych dat. 
5. **Bulk Insert:** Masowo wstawia nowe rekordy do bazy danych (w paczkach po 500 rekordów ze względu na limity zapytań Supabase).
6. **Aktualizacja oryginałów:** Zmienia `recurrence` oryginalnych zadań na `'jednorazowo'`.

### B. Skrypt naprawiający pole `t`: `scripts/fix-t-strings.js`
W starej architekturze pole `t` zawierało ciągi tekstowe typu `"🔒 07:30 (10.06.2026) 🔁 w dni robocze"`. Pozostawienie tych dopisków powodowało, że funkcja pomocnicza w aplikacji klienckiej nadal interpretowała te zadania jako aktywne cykle.
* Skrypt znajduje wszystkie zadania oznaczone jako `'jednorazowo'` i usuwa z ich pola `t` tagi cykli (`🔁 ...` oraz `🛑 ...`), pozostawiając czystą informację o godzinie i dacie (np. `"🔒 07:30 (10.06.2026)"`).

### C. Skrypt aktualizacji dat instancji: `scripts/fix-materialized-dates.js`
* Zapewnia spójność danych poprzez synchronizację dat zapisanych w polach tekstowych (`t`, `deadline`, `lockDateTime`) z docelową datą instancji (`pDate`).

---

## 4. Zmiany w kodzie aplikacji frontendowej (React / JavaScript)

W celu wsparcia zmaterializowanego modelu zaktualizowano kluczowe komponenty aplikacji:

### A. Aktualizacja `src/App.jsx`
Zaimplementowano automatyczną materializację podczas tworzenia **nowego zadania cyklicznego** przez użytkownika.
1. **Funkcja `generujDatyCykliczne`:** 
   Generuje tablicę dat w formacie `'YYYY-MM-DD'` od daty startowej do daty końcowej (lub do 365 dni w przód).
2. **Funkcja `saveTask`:**
   * W przypadku wykrycia zadania cyklicznego, wstawia oryginalne zadanie z flagą `recurrence = 'jednorazowo'` i oczyszczonym polem `t`.
   * Tworzy tablicę zmaterializowanych instancji dla przyszłych dat.
   * **Kluczowa poprawka:** W każdej instancji podmienia datę w polach tekstowych (`t`, `deadline`, `lockDateTime`) na nową datę instancji (np. zamiana dnia w deadline z `10.06.2026` na `17.06.2026`), co gwarantuje poprawne pozycjonowanie w kalendarzu.
   * Wykonuje pojedyncze zapytanie masowe typu `insert` do Supabase dla wszystkich przyszłych instancji.

### B. Aktualizacja `src/components/CalendarView.jsx`
Przeniesiono punkt ciężkości filtrowania ze skomplikowanego parsowania stringów w polu `t` na bezpośrednie porównanie pola `pDate`.
1. **Funkcja `isTaskForDate`:**
   Sprawdza spójność z wybraną datą. Jeżeli rekord posiada `pDate`, system opiera się wyłącznie na nim (porównanie `'YYYY-MM-DD'`). Jeśli nie ma `pDate` (stare rekordy), stosowany jest fallback na funkcję `checkIsDate`.
2. **Filtrowanie linii czasu (`timelineTasks`, `dayTasks`):**
   Używa teraz `isTaskForDate`. Informacja z pola `t` (np. `"07:30"`) jest wykorzystywana **wyłącznie** do określenia położenia na osi pionowej (Y) kalendarza.
3. **Backlog (`queueTasks`):**
   Prawa kolumna została zoptymalizowana. Nie ładuje już całej bazy danych. Wyświetla wyłącznie czysty backlog (zadania z `pDate === null`) lub zadania przypisane do aktualnie wybranego dnia (`pDate === selectedDate`).

### C. Aktualizacja `src/components/DashboardView.jsx`
* Filtr `lockedScheduled` (odpowiedzialny za wyświetlanie zablokowanych zadań na dashboardzie) został zmodyfikowany analogicznie do kalendarza — sprawdza w pierwszej kolejności dopasowanie pola `pDate` do wybranego dnia.

---

## 5. Podsumowanie efektów wdrożenia
* **Eliminacja błędów synchronizacji:** Odznaczenie zadania w jednym dniu nie wpływa na pozostałe dni cyklu.
* **Optymalizacja zapytań:** Dzięki precyzyjnemu filtrowaniu po kolumnie `pDate` aplikacja pobiera i przetwarza znacznie mniejszą ilość danych w widoku kalendarza i backlogu.
* **Rozszerzalność:** Nowa architektura umożliwia w przyszłości edycję pojedynczych wystąpień (np. zmiana godziny tylko dla jednego konkretnego poniedziałku).

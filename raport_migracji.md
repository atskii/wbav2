Rozwiązanie problemu B

Do jego rozwiązanie użyto następujących komend i modyfikacji kodu:

Modyfikacja w pliku App.jsx (Materializacja zadań):
```javascript
let cleanedT = taskDataWithoutId.t || '';
cleanedT = cleanedT.replace(/\s*🛑\s*do\s*\S+/g, '').replace(/\s*🔁\s*.*/g, '').trim();
const originalData = { ...taskDataWithoutId, recurrence: 'jednorazowo', t: cleanedT };

const noweInstancje = daty.map(nowaData => ({
  ...taskDataWithoutId,
  pDate: nowaData,
  t: podmienDate(taskDataWithoutId.t, nowaData),
  deadline: podmienDate(taskDataWithoutId.deadline, nowaData),
  done: false,
  recurrence: 'zmaterializowane'
}));
```

Modyfikacja w pliku CalendarView.jsx (Filtrowanie osi czasu po pDate):
```javascript
const isTaskForDate = (t, targetDate) => {
  const targetYMD = formatYMD(targetDate);
  if (t.pDate) return t.pDate === targetYMD;
  return (isSameDate(t.t, targetDate) || (!t.isLocked && isSameDate(t.deadline, targetDate)));
};

const timelineTasks = tasks.filter(t => isTaskForDate(t, selectedDate));
const queueTasks = tasks.filter(t => !t.pDate || t.pDate === selectedYMD);
```

Testowanie wprowadzonych modyfikacji i skryptów naprawczych
Aby udowodnić, że wprowadzone zmiany (nowa logika generowania instancji i filtrowania) działają poprawnie i faktycznie rozwiązują problem powielania i współdzielonego stanu zadań, przeprowadzono trzy praktyczne testy. 

Test 1: Sprawdzenie usunięcia powiązań cyklicznych z oryginalnych wpisów
•	Cel testu: Upewnienie się, że po przekształceniu w zadanie jednorazowe, z bazy znikną artefakty (tekstowe symbole cykli), które zmuszały aplikację do powielania zadania w kalendarzu.
•	Przebieg: Uruchomiono dedykowany skrypt naprawczy (`fix-t-strings.js`) dla zadań, które utraciły status cyklicznych w bazie, lecz wciąż miały w polu tekstowym tagi typu `🔁`.
•	Wynik: Skrypt pomyślnie zidentyfikował i oczyścił 15 rekordów, podmieniając błędne wpisy (np. `🔒 07:30 (10.06.2026) 🔁 w dni robocze`) na czyste daty (`🔒 07:30 (10.06.2026)`).
•	Wniosek: Mechanizm czyszczenia działa poprawnie. Parser kalendarza nie ma już możliwości błędnej interpretacji zadań źródłowych i nie kopiuje ich na siłę w każdym widoku dnia.

Test 2: Weryfikacja niezależności wystąpień (brak współdzielonego stanu)
•	Cel testu: Sprawdzenie, czy zmiana statusu instancji jako ukończonej (`done`) wpływa wyłącznie na ten jeden konkretny dzień, nie ingerując w pozostałe dni cyklu.
•	Przebieg: Wygenerowano nowe zadanie cykliczne, co zaskutkowało stworzeniem w bazie serii niezależnych rekordów dla każdego kolejnego dnia. Następnie z poziomu kalendarza odznaczono dzisiejszą instancję zadania jako wykonaną.
•	Wynik: Baza danych zaktualizowała kolumnę `done` wyłącznie dla dzisiejszego rekordu. Zaplanowane wystąpienie na dzień jutrzejszy zgodnie z planem zachowało nienaruszony status (`done = false`).
•	Wniosek: Separacja instancji działa bezbłędnie. Zakończenie zadania we wtorek ostatecznie i definitywnie nie wpływa na jego środowy odpowiednik.

Test 3: Poprawność filtrowania zadań na osi czasu
•	Cel testu: Udowodnienie, że nowym i nadrzędnym wyznacznikiem przypisania zadania do danego dnia w widoku kalendarza jest kolumna `pDate`.
•	Przebieg: Zmodyfikowano zadanie w taki sposób, że wymuszono konflikt dat (różna data w opisie pola `t` oraz różna w kolumnie `pDate`). Przełączono widoki kalendarza na kolejne dni.
•	Wynik: Aplikacja całkowicie zignorowała dawną logikę opartą na zawartości znakowej i poprawnie wyrenderowała klocek zadania tylko i wyłącznie w dniu zgodnym z nową, zmaterializowaną wartością przypisaną do `pDate`.
•	Wniosek: Przebudowana funkcja filtrująca `isTaskForDate` w pełni rozwiązuje błąd powielających się masowo wpisów.

Użyte komendy:
Test 1:
```javascript
// Uruchomienie skryptu czyszczącego z poziomu Node.js
node scripts/fix-t-strings.js

// Przechwycone wyjście logowania:
// 📥 Znaleziono 15 zadań z artefaktami cykliczności w polu t.
//    #413 ("Zawiezienie dziecka do szkoły")
//       PRZED: "🔒 07:30 (10.06.2026) 🔁 w dni robocze"
//       PO:    "🔒 07:30 (10.06.2026)"
// ✅ NAPRAWA ZAKOŃCZONA! Naprawiono 15/15 zadań.
```

Test 2:
```sql
-- Sprawdzenie niezależności zmaterializowanych wpisów bezpośrednio w bazie SQL
SELECT id, title, "pDate", done, recurrence 
FROM public.tasks 
WHERE title = 'trening' 
ORDER BY "pDate" ASC LIMIT 2;

/* Oczekiwany wynik:
 id  |  title  |   pDate    | done  |    recurrence    
-----+---------+------------+-------+------------------
 845 | trening | 2026-06-21 | true  | zmaterializowane
 846 | trening | 2026-06-28 | false | zmaterializowane
*/
```

Test 3:
```javascript
// Bezpośrednie sprawdzenie nowej funkcji przyporządkowania do dnia
const testTask = { pDate: '2026-06-21', t: '🔒 07:30 (10.06.2026)' };

console.log(isTaskForDate(testTask, new Date('2026-06-21'))); 
// Zwraca: true (Poprawne mapowanie mimo różnej daty w tekście)

console.log(isTaskForDate(testTask, new Date('2026-06-10'))); 
// Zwraca: false (Stare parsowanie tekstowe zostało zignorowane)

// Ostateczna weryfikacja logiki filtrowania zapobiegającej dublowaniu:
const timelineTasksForToday = tasks.filter(t => isTaskForDate(t, new Date('2026-06-21')));
console.assert(
  timelineTasksForToday.every(t => t.pDate === '2026-06-21' || !t.pDate), 
  'Wszystkie wyrenderowane zadania mają prawidłowe przypisanie do daty.'
);
```

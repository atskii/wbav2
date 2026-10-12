
2026-10-12 11:21

Status: [[SEO_bledy]]

Tags: #baby

# Brak zadeklarowanych wymiarów (width i height) w tagach obrazów (<img>).


### Opis błędu

Elementy graficzne `<img>` nie posiadają atrybutów `width` i `height` określających ich oryginalny rozmiar lub proporcje, przez co przeglądarka nie wie, ile miejsca ma dla nich zarezerwować przed ich pełnym pobraniem z serwera.

### Skutki

- **Skakanie układu strony (wysoki CLS – Cumulative Layout Shift):** Wczytujący się obrazek nagle rozpycha treść i przesuwa elementy w dół, co irytuje użytkownika.
- **Spadek pozycji w Google:** CLS jest kluczowym wskaźnikiem _Core Web Vitals_ – słaby wynik bezpośrednio obniża ocenę jakości strony i pozycje w wyszukiwarce.
- **Zbędne obciążenie procesora:** Przeglądarka musi wielokrotnie przeliczać układ strony (_reflow / layout recalculation_).

### Jak naprawić

1. Dodać atrybuty `width` i `height` bezpośrednio w tagu `<img>` o wartościach równych oryginalnym wymiarom pliku w pikselach: `&lt;img src="obrazek.png" alt="Opis" width="500" height="500" class="w-full h-auto" /&gt;`
2. W stylach CSS/Tailwind dodać `height: auto` (`h-auto`) lub `aspect-ratio`, aby obrazek zachował właściwe proporcje przy skalowaniu na mniejszych ekranach.

# References




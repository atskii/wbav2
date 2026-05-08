// ═══════════════════════════════════════════════════
//  ANALIZA NASTROJÓW (SYSTEM OSTRZEGANIA)
// ═══════════════════════════════════════════════════
export const analyzeMoodAlerts = (moods, todayDate) => {
  if (!moods || moods.length === 0) return null;

  const moodMap = {};
  moods.forEach(m => {
    moodMap[m.d] = m.v;
  });

  const getMoodValueForDaysAgo = (daysAgo) => {
    const d = new Date(todayDate);
    d.setDate(d.getDate() - daysAgo);
    const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return moodMap[dStr];
  };

  const getRecentMoods = (daysCount) => {
    const values = [];
    for (let i = 0; i < daysCount; i++) {
      const val = getMoodValueForDaysAgo(i);
      if (val !== undefined) values.push(val);
    }
    return values;
  };

  const calcMean = (arr) => arr.length === 0 ? 0 : arr.reduce((a, b) => a + b, 0) / arr.length;
  const calcVariance = (arr, mean) => arr.length === 0 ? 0 : arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / arr.length;

  // 1. Ostre wyczerpanie emocjonalne (Reguła 3 dni) -> średnia < 2.0 (czyli 0, 1)
  const last3 = getRecentMoods(3);
  if (last3.length === 3) {
    const mean3 = calcMean(last3);
    if (mean3 < 2.0) {
      return {
        id: 1,
        title: "Ostre wyczerpanie emocjonalne",
        text: "Widzę, że od kilku dni Twój poziom energii i nastroju jest bardzo niski. Każdy ma prawo do słabszego momentu, ale jeśli czujesz, że przytłacza Cię stres, nie musisz z tym walczyć sam. Porozmawiaj o tym z kimś zaufanym lub skorzystaj z darmowego, anonimowego wsparcia specjalisty.",
        btnText: "Zobacz dostępne telefony zaufania",
        color: "#D32F2F"
      };
    }
  }

  // 3. Brak regeneracji po weekendzie
  if (todayDate.getDay() === 1) { // 1 = Poniedziałek
    const mondayVal = getMoodValueForDaysAgo(0);
    const fridayVal = getMoodValueForDaysAgo(3);
    if (mondayVal !== undefined && fridayVal !== undefined) {
      if (mondayVal <= fridayVal && mondayVal <= 3) {
        return {
          id: 3,
          title: "Brak regeneracji po weekendzie",
          text: "Wygląda na to, że miniony weekend nie przyniósł Ci upragnionego odpoczynku i resetu. Jeśli obowiązki nie pozwalają Ci złapać tchu, może to prowadzić do poważnego wyczerpania. Może warto porozmawiać o tym, jak skutecznie stawiać granice? Jesteśmy tu, by pomóc.",
          btnText: "Skontaktuj się z infolinią wsparcia",
          color: "#E65100"
        };
      }
    }
  }

  // 2. Spłaszczenie emocjonalne (7 dni)
  const last7 = getRecentMoods(7);
  if (last7.length >= 5) {
    const mean7 = calcMean(last7);
    const var7 = calcVariance(last7, mean7);
    if (var7 < 0.3 && mean7 <= 3.0) {
      return {
        id: 2,
        title: "Spłaszczenie emocjonalne",
        text: "Zauważyłem, że Twój nastrój od dłuższego czasu utrzymuje się na tym samym, płaskim poziomie. Taka monotonia emocjonalna to często sygnał, że Twój organizm włączył 'tryb przetrwania' z powodu przebodźcowania. Pamiętaj, że rozmowa może pomóc Ci odzyskać równowagę. Zobacz, gdzie możesz uzyskać bezpieczną pomoc.",
        btnText: "Znajdź wsparcie psychologiczne",
        color: "#F57C00"
      };
    }
  }

  // 4. Inercja emocjonalna (Pętla nastroju - 5 dni)
  const last5 = getRecentMoods(5);
  if (last5.length >= 4) {
    const mean5 = calcMean(last5);
    const var5 = calcVariance(last5, mean5);
    const max5 = Math.max(...last5);
    if (max5 <= 3 && var5 >= 0.3 && var5 <= 1.5) {
      return {
        id: 4,
        title: "Inercja emocjonalna",
        text: "Twój nastrój wydaje się ostatnio tkwić w martwym punkcie, brakuje w nim naturalnych, pozytywnych wahań. Kiedy wpadamy w taką pętlę, czasem najtrudniejszy jest ten pierwszy krok, by poprosić o pomoc. Specjaliści z bezpłatnej infolinii chętnie Cię wysłuchają, bez oceniania. Chcesz spróbować?",
        btnText: "Połącz mnie z ekspertem",
        color: "#1976D2"
      };
    }
  }

  return null;
};

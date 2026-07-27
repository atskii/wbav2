// Helper do obliczania punktów XP oraz serii (Streak)

export function parseDurationMins(durationStr, sMins, eMins) {
  if (sMins !== null && sMins !== undefined && eMins !== null && eMins !== undefined) {
    return Math.max(15, eMins - sMins);
  }
  if (!durationStr) return 45;
  const match = durationStr.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 45;
}

export function calculateTaskXP(task) {
  if (!task) return 15;

  let priorityXP = 15;
  if (task.p === "wysoki") priorityXP = 30;
  else if (task.p === "sredni") priorityXP = 20;
  else if (task.p === "niski") priorityXP = 10;

  const durationMins = parseDurationMins(task.duration, task.sMins, task.eMins);
  const durationXP = Math.round(durationMins / 5);

  return priorityXP + durationXP;
}

export function calculateStreak(tasks = [], now = new Date()) {
  const getFormatYMD = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  // Zbiór dat z przynajmniej jednym wykonanym zadaniem
  const completedDates = new Set();
  tasks.forEach(t => {
    if (t.done) {
      if (t.pDate) {
        completedDates.add(t.pDate);
      }
    }
  });

  const todayStr = getFormatYMD(now);
  const todayDone = completedDates.has(todayStr);

  let streak = 0;
  let checkDate = new Date(now);

  if (!todayDone) {
    // Jeśli dzisiaj jeszcze nic nie ukończono, sprawdź czy wczoraj było ukończone zadanie
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const dStr = getFormatYMD(checkDate);
    if (completedDates.has(dStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

export function calculateDailyXP(tasks = [], targetDate = new Date()) {
  const ymd = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;
  return tasks
    .filter(t => t.done && t.pDate === ymd)
    .reduce((sum, t) => sum + calculateTaskXP(t), 0);
}

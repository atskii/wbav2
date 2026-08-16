// ═══════════════════════════════════════════════════
//  GOOGLE CALENDAR UTILS
// ═══════════════════════════════════════════════════

/**
 * Zwraca listę wydarzeń z głównego kalendarza użytkownika.
 * @param {string} accessToken Token z Google Identity Services
 * @param {number} daysAhead Na ile dni do przodu szukać
 */
export async function fetchGoogleCalendarEvents(accessToken, daysAhead = 60) {
  const timeMin = new Date().toISOString();
  
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + daysAhead);
  const timeMax = maxDate.toISOString();

  const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&singleEvents=true&orderBy=startTime`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Błąd pobierania kalendarza: ${response.statusText}`);
  }

  const data = await response.json();
  return data.items || [];
}

/**
 * Mapuje wydarzenia Google Calendar na format zadań w WBA.
 * Pomija wydarzenia całodniowe (bez startTime).
 */
export function mapGoogleEventsToTasks(events) {
  const tasks = [];

  for (const ev of events) {
    const isAllDay = ev.start && ev.start.date && !ev.start.dateTime;

    if (!isAllDay && (!ev.start || !ev.start.dateTime || !ev.end || !ev.end.dateTime)) {
      continue;
    }

    let sMins = null;
    let eMins = null;
    let durationMins = 0;
    let isLocked = false;
    let pDate = "";
    let tString = "";
    let lockDateTime = null;

    if (isAllDay) {
      pDate = ev.start.date;
      tString = "Cały dzień";
      isLocked = false;
    } else {
      const start = new Date(ev.start.dateTime);
      const end = new Date(ev.end.dateTime);

      sMins = start.getHours() * 60 + start.getMinutes();
      eMins = end.getHours() * 60 + end.getMinutes();
      durationMins = eMins - sMins;
      if (durationMins < 0) durationMins += 24 * 60;

      pDate = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;
      tString = `🔒 ${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')} (${String(start.getDate()).padStart(2, '0')}.${String(start.getMonth() + 1).padStart(2, '0')}.${start.getFullYear()})`;
      lockDateTime = ev.start.dateTime.substring(0, 16);
      isLocked = true;
    }

    const googleIdTag = `[GCal:${ev.id}]`;

    tasks.push({
      title: ev.summary || (isAllDay ? "Całodniowe z Kalendarza" : "Spotkanie z Kalendarza"),
      desc: (ev.description ? ev.description + "\n\n" : "") + googleIdTag,
      duration: `${durationMins} min`,
      difficulty: 2, 
      p: isAllDay ? "średni" : "wysoki", 
      isLocked: isLocked,
      lockDateTime: lockDateTime,
      t: tString,
      pDate: pDate,
      sMins: sMins,
      eMins: eMins,
      recurrence: 'jednorazowo'
    });
  }

  return tasks;
}

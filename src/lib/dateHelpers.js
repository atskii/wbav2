// --- ROZSZERZONE DYNAMICZNE DATY ---
export const getLocalYMD = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const now = new Date();
export const todayYMD = getLocalYMD(now);
export const todayPL = now.toLocaleDateString("pl-PL");

const day2 = new Date(now); day2.setDate(now.getDate() + 1);
export const day2YMD = getLocalYMD(day2);
export const day2PL = day2.toLocaleDateString("pl-PL");

const day3 = new Date(now); day3.setDate(now.getDate() + 2);
export const day3YMD = getLocalYMD(day3);
export const day3PL = day3.toLocaleDateString("pl-PL");

const day4 = new Date(now); day4.setDate(now.getDate() + 3);
export const day4YMD = getLocalYMD(day4);
export const day4PL = day4.toLocaleDateString("pl-PL");

const day5 = new Date(now); day5.setDate(now.getDate() + 4);
export const day5YMD = getLocalYMD(day5);
export const day5PL = day5.toLocaleDateString("pl-PL");

// Pomocnicze godziny
const in3Hours = new Date(now.getTime() + 3 * 60 * 60 * 1000);
export const in3HoursTime = in3Hours.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

// --- GLOBAL HELPER ---
export const checkIsDate = (textString, targetDate) => {
  if (!textString) return false;
  const txt = textString.toLowerCase();
  const d = targetDate || new Date();
  const selYear = d.getFullYear();
  const selMonth = d.getMonth() + 1;
  const selDay = d.getDate();
  const selDateOnly = new Date(selYear, d.getMonth(), selDay);

  const endMatch = txt.match(/🛑 do (\d{4})-(\d{1,2})-(\d{1,2})/);
  if (endMatch) {
    const endDate = new Date(parseInt(endMatch[1]), parseInt(endMatch[2]) - 1, parseInt(endMatch[3]));
    if (selDateOnly > endDate) return false;
  }

  const startMatch = textString.match(/\((\d{1,2})[\./ -](\d{1,2})[\./ -](\d{4})\)/);
  if (startMatch && (txt.includes("codziennie") || txt.includes("co tydzień") || txt.includes("w dni robocze"))) {
    const startDate = new Date(parseInt(startMatch[3]), parseInt(startMatch[2]) - 1, parseInt(startMatch[1]));
    if (selDateOnly < startDate) return false;
  }

  const dayOfWeek = d.getDay() === 0 ? 6 : d.getDay() - 1;
  const daysArr = ["pon", "wt", "śr", "czw", "pt", "sob", "ndz"];

  if (txt.includes("codziennie") || txt.includes("każdego dnia")) return true;
  if (txt.includes("w dni robocze") && dayOfWeek >= 0 && dayOfWeek <= 4) return true;
  if (txt.includes("co tydzień") || txt.includes("co tydzien")) {
    if (txt.includes(daysArr[dayOfWeek])) return true;
    if (dayOfWeek === 5 && txt.includes("sb")) return true;
  }

  const ymd = textString.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (ymd && parseInt(ymd[1]) === selYear && parseInt(ymd[2]) === selMonth && parseInt(ymd[3]) === selDay) return true;

  const dmy = textString.match(/(\d{1,2})[\./ -](\d{1,2})[\./ -](\d{4})/);
  if (dmy && parseInt(dmy[3]) === selYear && parseInt(dmy[2]) === selMonth && parseInt(dmy[1]) === selDay) return true;

  return false;
};

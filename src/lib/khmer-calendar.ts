import momentkh from "@thyrith/momentkh";

const KHMER_DIGITS = "០១២៣៤៥៦៧៨៩";
export const khmerDigits = (s: string | number) => String(s).replace(/\d/g, (d) => KHMER_DIGITS[Number(d)]);

/** Phnom Penh wall-clock parts for an instant (the clock always shows Cambodia time, GMT+7). */
export function phnomPenhParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Phnom_Penh",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  return { year: get("year"), month: get("month"), day: get("day"), hour: get("hour"), minute: get("minute"), second: get("second") };
}

type Ymd = { year: number; month: number; day: number };
const addDays = ({ year, month, day }: Ymd, n: number): Ymd => {
  const d = new Date(Date.UTC(year, month - 1, day + n));
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
};
const convert = (d: Ymd) => momentkh.fromGregorian(d.year, d.month, d.day);
/** Lunar day (1–15) and phase (0 = កើត waxing, 1 = រោច waning) */
const lunar = (d: Ymd) => convert(d).khmer;
const fmt = (d: Ymd, pattern: string) => momentkh.format(convert(d), pattern);

/** Settings / Date — Calendar=Gregorian */
export function gregorianLines(d: Ymd) {
  const date = new Date(Date.UTC(d.year, d.month - 1, d.day));
  const main = new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(date);
  const start = Date.UTC(d.year, 0, 1);
  const dayOfYear = Math.round((date.getTime() - start) / 86400000) + 1;
  const daysInYear = (d.year % 4 === 0 && d.year % 100 !== 0) || d.year % 400 === 0 ? 366 : 365;
  // ISO week number
  const t = new Date(date);
  t.setUTCDate(t.getUTCDate() + 4 - (t.getUTCDay() || 7));
  const week = Math.ceil(((t.getTime() - Date.UTC(t.getUTCFullYear(), 0, 1)) / 86400000 + 1) / 7);
  return { main, detail: `Week ${week}  ·  Day ${dayOfYear} of ${daysInYear}` };
}

/** Settings / Date — Calendar=Khmer (lunar date, year names, matching solar date) */
export function khmerLines(d: Ymd) {
  return {
    main: fmt(d, "ថ្ងៃW dN ខែm"),
    year: fmt(d, "ឆ្នាំa e ព.ស. b"),
    solar: fmt(d, "ត្រូវនឹងថ្ងៃទីds ខែM ឆ្នាំc"),
  };
}

/** Holy days (ថ្ងៃសីល): 8 and 15 កើត, 8 រោច, and the last day of the lunar month. */
function isSilaDay(d: Ymd) {
  const k = lunar(d);
  const next = lunar(addDays(d, 1));
  const monthEnds = next.moonPhase === 0 && next.day === 1;
  return (k.moonPhase === 0 && (k.day === 8 || k.day === 15)) || (k.moonPhase === 1 && k.day === 8) || (k.moonPhase === 1 && monthEnds);
}

/** Settings / Khmer holy day card */
export function holyDayInfo(today: Ymd) {
  const k = lunar(today);
  let fullMoon = today;
  for (let i = 0; i < 31; i++) {
    const c = addDays(today, i);
    const l = lunar(c);
    if (l.moonPhase === 0 && l.day === 15) {
      fullMoon = c;
      break;
    }
  }
  let sila = addDays(today, 1);
  for (let i = 1; i < 31; i++) {
    const c = addDays(today, i);
    if (isSilaDay(c)) {
      sila = c;
      break;
    }
  }
  return {
    /** 0–1 position in the lunar month: 0 new moon → 0.5 full moon → 1 */
    phase: (k.moonPhase === 0 ? k.day : 15 + k.day) / 30,
    moonTitle: fmt(today, "ព្រះចន្ទ dN"),
    fullMoon: fmt(fullMoon, "ពេញបូណ៌មី ថ្ងៃW dN (ds M)"),
    nextSila: fmt(sila, "ថ្ងៃW dN (ds M)"),
  };
}

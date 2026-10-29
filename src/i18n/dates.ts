/**
 * Long dates in the page's language. Khmer is built from its own day and month names, so it reads the same in every
 * browser (some don't ship Khmer date data and would fall back to English).
 *   en "Thursday, 29 October 2026" · km "ថ្ងៃព្រហស្បតិ៍ ទី29 ខែតុលា ឆ្នាំ2026" · zh "2026年10月29日星期四"
 */
const kmDays = ["អាទិត្យ", "ច័ន្ទ", "អង្គារ", "ពុធ", "ព្រហស្បតិ៍", "សុក្រ", "សៅរ៍"];
const kmMonths = ["មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"];

export function longDate(lang: string, date: Date, { timeZone = "UTC", weekday = true }: { timeZone?: string; weekday?: boolean } = {}) {
  if (lang === "km") {
    const p = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone, year: "numeric", month: "numeric", day: "numeric", weekday: "short" }).formatToParts(date).map((x) => [x.type, x.value]));
    const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(p.weekday);
    return `${weekday ? `ថ្ងៃ${kmDays[day]} ` : ""}ទី${p.day} ខែ${kmMonths[Number(p.month) - 1]} ឆ្នាំ${p.year}`;
  }
  return new Intl.DateTimeFormat(lang === "zh" ? "zh-CN" : "en-GB", { timeZone, day: "numeric", month: "long", year: "numeric", ...(weekday ? { weekday: "long" } : {}) }).format(date);
}

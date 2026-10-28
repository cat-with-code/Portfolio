/**
 * Browser speech (Web Speech API) helpers for the "Listen instead" readers: the most natural system voice,
 * text split into speakable chunks, and time estimates.
 */

/** Words per second for the time estimate (≈155 wpm at 1×). */
export const WPS = 2.6;
/** Playing waveform bar heights (Figma State=Playing); Idle bars are all 6px. */
export const PLAYING = [8, 16, 22, 12, 18, 10, 20, 14, 6, 18, 10, 16, 8, 20, 12, 6, 16, 22, 10, 14];
/** Tapping the speed chip steps through these. */
export const SPEEDS = [0.75, 1, 1.25, 1.5, 1.75, 2];

const female = /samantha|victoria|karen|moira|tessa|fiona|zira|susan|allison|ava|serena|aria|jenny|michelle|emma|libby|sonia|natasha|clara|joanna|female|woman|kanya|li-mu|ting-ting|mei-jia|xiaoxiao|google us english|uk english female/i;
const male = /daniel|alex|david|mark|aaron|arthur|rishi|tom\b|thomas|oliver|guy|ryan|eric|christopher|brian|andrew|roger|william|yunxi|male\b|\bman\b/i;
/** macOS novelty and "eloquence" voices — the robotic ones. */
const robotic = /albert|bad news|bahh|bells|boing|bubbles|cellos|good news|jester|organ|superstar|trinoids|whisper|wobble|zarvox|fred|junior|ralph|kathy|grandma|grandpa|eddy|flo\b|reed|rocko|sandy|shelley/i;

/** Higher is more natural: Edge's neural voices, Apple's downloaded Premium/Enhanced voices, then Chrome's Google voices. */
function quality(v: SpeechSynthesisVoice) {
  if (/natural|neural/i.test(v.name)) return 5;
  if (/premium/i.test(v.name)) return 4;
  if (/enhanced|siri/i.test(v.name)) return 3;
  if (/^google/i.test(v.name) || !v.localService) return 2;
  return 1;
}

/** Picks the most natural system voice for the page language and the "Reading voice" setting (Settings drawer). */
export function pickVoice(lang: string): SpeechSynthesisVoice | undefined {
  const all = speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith(lang));
  const voices = all.filter((v) => !robotic.test(v.name));
  if (!voices.length) return all[0];
  const local = navigator.language.toLowerCase();
  const score = (v: SpeechSynthesisVoice) => quality(v) * 10 + (v.lang.toLowerCase() === local ? 1 : 0);
  const best = (list: SpeechSynthesisVoice[]) => [...list].sort((a, b) => score(b) - score(a))[0];
  let pref = "Female";
  try {
    pref = localStorage.getItem("voice") ?? pref;
  } catch {}
  if (pref === "Female") return best(voices.filter((v) => female.test(v.name) && !male.test(v.name))) ?? best(voices);
  if (pref === "Male") return best(voices.filter((v) => male.test(v.name))) ?? best(voices);
  return best(voices);
}

/** Sentences, with long ones split at commas: Chrome stops long utterances partway. */
export function chunks(text: string) {
  const sentences = text.match(/[^.!?。]+[.!?。”"]*\s*/g) ?? [text];
  return sentences.flatMap((s) => (s.length <= 220 ? [s.trim()] : (s.match(/[^,;:]+[,;:]?\s*/g) ?? [s]).map((p) => p.trim()))).filter(Boolean);
}
export const words = (s: string) => s.split(/\s+/).filter(Boolean).length;

export const readSpeed = () => {
  try {
    const v = Number(localStorage.getItem("reading-speed"));
    return SPEEDS.includes(v) ? v : 1;
  } catch {
    return 1;
  }
};

/** Estimated seconds to read `text` aloud at `rate`. */
export const estimate = (text: string, rate: number) => Math.max(1, Math.round(words(text) / (WPS * rate)));
export const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/**
 * Generative focus soundscapes (Web Audio API) for the Study music player. Each track is a seeded
 * variation of its vibe — tempo, key and pattern — so "Coffee & margins" always sounds the same.
 * Nothing is streamed or downloaded.
 */
import type { Vibe } from "@/content/study";

const SCALES = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  penta: [0, 2, 4, 7, 9],
};

function mulberry(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const hz = (midi: number) => 440 * 2 ** ((midi - 69) / 12);

type Voice = { stop: () => void };

export class FocusAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private bus: GainNode | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private sustained: Voice[] = [];
  private muted = false;
  private noise: AudioBuffer | null = null;

  private ensure() {
    if (this.ctx) return this.ctx;
    const ctx = new AudioContext();
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 0.5;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.ratio.value = 3;
    this.master.connect(comp).connect(ctx.destination);
    // Noise buffer shared by rain, crackle and percussion.
    const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    this.noise = buf;
    return ctx;
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (this.master && this.ctx) this.master.gain.setTargetAtTime(muted ? 0 : 0.5, this.ctx.currentTime, 0.05);
  }

  async play(vibe: Vibe, index: number) {
    const ctx = this.ensure();
    if (ctx.state === "suspended") await ctx.resume();
    this.stopVoices();
    this.bus = ctx.createGain();
    this.bus.gain.setValueAtTime(0, ctx.currentTime);
    this.bus.gain.linearRampToValueAtTime(1, ctx.currentTime + 1.5);
    this.bus.connect(this.master!);
    const rand = mulberry(index * 7919 + vibe.length * 104729);
    ({ lofi: () => this.lofi(rand), neo: () => this.neo(rand), ambient: () => this.ambient(rand), rain: () => this.rain(rand), piano: () => this.piano(rand) })[vibe]();
  }

  async pause() {
    if (this.ctx?.state === "running") await this.ctx.suspend();
  }

  async resume() {
    if (this.ctx?.state === "suspended") await this.ctx.resume();
  }

  stop() {
    this.stopVoices();
    this.ctx?.suspend();
  }

  dispose() {
    this.stopVoices();
    this.ctx?.close();
    this.ctx = null;
  }

  private stopVoices() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    this.sustained.forEach((v) => v.stop());
    this.sustained = [];
    if (this.bus && this.ctx) {
      const old = this.bus;
      old.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
      setTimeout(() => old.disconnect(), 600);
    }
    this.bus = null;
  }

  // ── building blocks ──

  private noiseSource(filterType: BiquadFilterType, freq: number, q: number, gain: number): Voice {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    src.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = filterType;
    f.frequency.value = freq;
    f.Q.value = q;
    const g = ctx.createGain();
    g.gain.value = gain;
    src.connect(f).connect(g).connect(this.bus!);
    src.start();
    return { stop: () => src.stop() };
  }

  private tone(freq: number, at: number, dur: number, opts: { type?: OscillatorType; gain?: number; attack?: number; cutoff?: number; detune?: number } = {}) {
    const ctx = this.ctx!;
    const { type = "triangle", gain = 0.12, attack = 0.01, cutoff = 2400, detune = 0 } = opts;
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;
    osc.detune.value = detune;
    const f = ctx.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = cutoff;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, at);
    g.gain.linearRampToValueAtTime(gain, at + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    osc.connect(f).connect(g).connect(this.bus!);
    osc.start(at);
    osc.stop(at + dur + 0.05);
  }

  private hit(at: number, kind: "kick" | "snare" | "hat", gain: number) {
    const ctx = this.ctx!;
    if (kind === "kick") {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.frequency.setValueAtTime(110, at);
      osc.frequency.exponentialRampToValueAtTime(42, at + 0.18);
      g.gain.setValueAtTime(gain, at);
      g.gain.exponentialRampToValueAtTime(0.0001, at + 0.35);
      osc.connect(g).connect(this.bus!);
      osc.start(at);
      osc.stop(at + 0.4);
      return;
    }
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const f = ctx.createBiquadFilter();
    f.type = kind === "hat" ? "highpass" : "bandpass";
    f.frequency.value = kind === "hat" ? 7000 : 1800;
    const g = ctx.createGain();
    const len = kind === "hat" ? 0.05 : 0.18;
    g.gain.setValueAtTime(gain, at);
    g.gain.exponentialRampToValueAtTime(0.0001, at + len);
    src.connect(f).connect(g).connect(this.bus!);
    src.start(at, Math.random());
    src.stop(at + len + 0.02);
  }

  /** Runs `step(i, time)` on a lookahead scheduler, `per` steps per beat. */
  private sequence(bpm: number, per: number, step: (i: number, at: number) => void) {
    const ctx = this.ctx!;
    const dur = 60 / bpm / per;
    let i = 0;
    let next = ctx.currentTime + 0.1;
    const tick = () => {
      while (next < ctx.currentTime + 0.25) {
        step(i++, next);
        next += dur;
      }
    };
    tick();
    this.timer = setInterval(tick, 50);
  }

  private chordProgression(rand: () => number, minor: boolean) {
    const root = 48 + Math.floor(rand() * 7);
    const degrees = minor ? [[0, 3, 7, 10], [5, 8, 12, 15], [3, 7, 10, 14], [7, 10, 14, 17]] : [[0, 4, 7, 11], [9, 12, 16, 19], [5, 9, 12, 16], [7, 11, 14, 17]];
    const order = [0, 1, 2, 3].sort(() => rand() - 0.5);
    return { root, chords: order.map((o) => degrees[o].map((d) => root + d)) };
  }

  // ── vibes ──

  private lofi(rand: () => number) {
    this.sustained.push(this.noiseSource("highpass", 3000, 0.4, 0.012)); // vinyl hiss
    const bpm = 70 + Math.floor(rand() * 12);
    const { root, chords } = this.chordProgression(rand, rand() > 0.5);
    const scale = SCALES.penta;
    this.sequence(bpm, 2, (i, at) => {
      const beat = i % 8;
      const bar = Math.floor(i / 8);
      if (beat === 0 || beat === 5) this.hit(at, "kick", 0.5);
      if (beat === 2 || beat === 6) this.hit(at, "snare", 0.12);
      this.hit(at + (i % 2 ? 0.03 : 0), "hat", 0.03);
      if (beat === 0) chords[bar % 4].forEach((n, k) => this.tone(hz(n), at + k * 0.012, (60 / bpm) * 3.8, { type: "triangle", gain: 0.05, attack: 0.04, cutoff: 1400 }));
      if (beat === 0) this.tone(hz(chords[bar % 4][0] - 12), at, (60 / bpm) * 1.8, { type: "sine", gain: 0.14, cutoff: 600 });
      if (rand() < 0.22) this.tone(hz(root + 24 + scale[Math.floor(rand() * scale.length)]), at, 0.9, { type: "sine", gain: 0.045, cutoff: 2600 });
    });
  }

  private neo(rand: () => number) {
    const bpm = 82 + Math.floor(rand() * 10);
    const { chords } = this.chordProgression(rand, false);
    this.sequence(bpm, 4, (i, at) => {
      const s = i % 16;
      const bar = Math.floor(i / 16);
      if (s === 0 || s === 10) this.hit(at, "kick", 0.45);
      if (s === 4 || s === 12) this.hit(at, "snare", 0.1);
      if (s % 2 === 0) this.hit(at, "hat", 0.025);
      if (s === 0 || s === 7) chords[bar % 4].forEach((n) => this.tone(hz(n), at, (60 / bpm) * 1.6, { type: "sine", gain: 0.05, attack: 0.02, cutoff: 1800, detune: 6 }));
      if (s === 0 || s === 6 || s === 11) this.tone(hz(chords[bar % 4][0] - 12), at, (60 / bpm) * 0.9, { type: "triangle", gain: 0.12, cutoff: 500 });
    });
  }

  private ambient(rand: () => number) {
    const { chords } = this.chordProgression(rand, rand() > 0.4);
    this.sustained.push(this.noiseSource("lowpass", 400, 0.5, 0.01));
    this.sequence(10 + Math.floor(rand() * 4), 1, (i, at) => {
      if (i % 2 !== 0) return;
      chords[(i / 2) % 4].forEach((n, k) => {
        this.tone(hz(n), at + k * 0.6, 14, { type: "sine", gain: 0.035, attack: 4, cutoff: 900, detune: -5 });
        this.tone(hz(n + 12), at + k * 0.6 + 0.3, 12, { type: "triangle", gain: 0.012, attack: 5, cutoff: 1200, detune: 7 });
      });
    });
  }

  private rain(rand: () => number) {
    const heavy = 0.03 + rand() * 0.03;
    this.sustained.push(this.noiseSource("lowpass", 1400 + rand() * 900, 0.7, heavy));
    this.sustained.push(this.noiseSource("bandpass", 5200, 0.6, heavy * 0.35));
    this.sequence(240, 1, (_i, at) => {
      if (rand() < 0.5) this.tone(1800 + rand() * 2600, at + rand() * 0.2, 0.05, { type: "sine", gain: 0.01 + rand() * 0.02, cutoff: 6000 });
    });
  }

  private piano(rand: () => number) {
    const minor = rand() > 0.5;
    const scale = minor ? SCALES.minor : SCALES.major;
    const root = 55 + Math.floor(rand() * 5);
    const bpm = 56 + Math.floor(rand() * 14);
    let pos = 2;
    this.sequence(bpm, 2, (i, at) => {
      if (i % 8 === 0) [0, 4, 7].forEach((d) => this.tone(hz(root - 12 + (minor && d === 4 ? 3 : d)), at, 3.5, { type: "triangle", gain: 0.05, cutoff: 1200 }));
      if (rand() < 0.62) {
        pos = Math.max(0, Math.min(scale.length * 2 - 1, pos + Math.floor(rand() * 5) - 2));
        const note = root + scale[pos % scale.length] + 12 * Math.floor(pos / scale.length);
        this.tone(hz(note), at, 2.2, { type: "triangle", gain: 0.09, cutoff: 2800 });
        this.tone(hz(note) * 2, at, 1.2, { type: "sine", gain: 0.015, cutoff: 4000 });
      }
    });
  }
}

/** "3:42" / "10:00" / "1:02:15" → seconds */
export const toSeconds = (t: string) => t.split(":").reduce((acc, p) => acc * 60 + Number(p), 0);
export const clock = (s: number) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(Math.floor(s % 60)).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${sec}` : `${m}:${sec}`;
};

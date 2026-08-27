let ctx: AudioContext | null = null;
let musicTimer = 0;
let theme = 0;
let step = 0;

function ac(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function beep(freq: number, dur: number, type: OscillatorType, gain = 0.07): void {
  const audio = ac();
  const osc = audio.createOscillator();
  const g = audio.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.value = gain;
  g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + dur);
  osc.connect(g).connect(audio.destination);
  osc.start();
  osc.stop(audio.currentTime + dur);
}

const TUNES: number[][] = [
  [262, 330, 392, 523, 392, 330, 349, 440],
  [220, 262, 330, 392, 330, 262, 247, 294],
  [392, 494, 587, 784, 659, 523, 587, 698],
];

export const sfx = {
  unlock(): void {
    ac();
  },
  jump(): void {
    beep(420, 0.09, "square", 0.05);
    beep(620, 0.08, "square", 0.04);
  },
  trick(): void {
    beep(520, 0.07, "square", 0.05);
    beep(780, 0.1, "triangle", 0.05);
    beep(980, 0.08, "square", 0.04);
  },
  collect(): void {
    beep(660, 0.07, "triangle", 0.06);
    beep(880, 0.1, "triangle", 0.05);
  },
  gold(): void {
    beep(740, 0.08, "triangle", 0.06);
    beep(988, 0.1, "triangle", 0.06);
    beep(1175, 0.14, "triangle", 0.05);
  },
  star(): void {
    beep(523, 0.08, "sine", 0.05);
    beep(784, 0.1, "sine", 0.05);
    beep(1046, 0.16, "sine", 0.05);
  },
  spring(): void {
    beep(200, 0.06, "sawtooth", 0.05);
    beep(640, 0.12, "square", 0.05);
  },
  throw(): void {
    beep(180, 0.05, "square", 0.05);
    beep(340, 0.08, "sawtooth", 0.04);
  },
  boom(): void {
    beep(90, 0.16, "sawtooth", 0.08);
    beep(60, 0.2, "square", 0.05);
  },
  stomp(): void {
    beep(180, 0.12, "sawtooth", 0.06);
  },
  bark(): void {
    beep(280, 0.06, "square", 0.05);
    beep(190, 0.1, "sawtooth", 0.06);
    beep(320, 0.07, "square", 0.04);
  },
  hurt(): void {
    beep(220, 0.16, "square", 0.06);
    beep(140, 0.2, "square", 0.05);
  },
  checkpoint(): void {
    beep(494, 0.1, "triangle", 0.05);
    beep(659, 0.16, "triangle", 0.06);
  },
  win(): void {
    beep(523, 0.12, "triangle", 0.06);
    beep(659, 0.12, "triangle", 0.06);
    beep(784, 0.2, "triangle", 0.07);
  },
  bossHit(): void {
    beep(160, 0.14, "sawtooth", 0.07);
    beep(90, 0.2, "square", 0.06);
  },
  startMusic(id: number): void {
    theme = id;
    step = 0;
    musicTimer = 0;
  },
  stopMusic(): void {
    theme = -1;
  },
  tickMusic(dt: number): void {
    if (theme < 0) return;
    musicTimer += dt;
    if (musicTimer < 0.22) return;
    musicTimer = 0;
    const notes = TUNES[theme] ?? TUNES[0];
    const n = notes[step % notes.length];
    step += 1;
    beep(n, 0.18, "triangle", 0.028);
    if (step % 4 === 0) beep(n / 2, 0.12, "square", 0.012);
  },
};

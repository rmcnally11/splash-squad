let ctx: AudioContext | null = null;

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

export const sfx = {
  unlock(): void {
    ac();
  },
  jump(): void {
    beep(420, 0.09, "square", 0.05);
    beep(620, 0.08, "square", 0.04);
  },
  collect(): void {
    beep(660, 0.07, "triangle", 0.06);
    beep(880, 0.1, "triangle", 0.05);
  },
  stomp(): void {
    beep(180, 0.12, "sawtooth", 0.06);
  },
  hurt(): void {
    beep(220, 0.16, "square", 0.06);
    beep(140, 0.2, "square", 0.05);
  },
  win(): void {
    beep(523, 0.12, "triangle", 0.06);
    beep(659, 0.12, "triangle", 0.06);
    beep(784, 0.2, "triangle", 0.07);
  },
};

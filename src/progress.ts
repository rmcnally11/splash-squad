import type { KidId } from "./level.ts";

export type Progress = {
  unlocked: number;
  lastKid: KidId;
  best: [number, number, number];
  highScore: number;
};

const KEY = "spud-squad-v1";

function kidId(value: unknown): KidId {
  if (value === "ace" || value === "pip") return value;
  return "boots";
}

function score(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
}

export function emptyProgress(): Progress {
  return { unlocked: 1, lastKid: "boots", best: [0, 0, 0], highScore: 0 };
}

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyProgress();
    const data = JSON.parse(raw) as Partial<Progress>;
    const unlocked = Math.min(3, Math.max(1, score(data.unlocked) || 1));
    const best: [number, number, number] = [
      score(data.best?.[0]),
      score(data.best?.[1]),
      score(data.best?.[2]),
    ];
    return {
      unlocked,
      lastKid: kidId(data.lastKid),
      best,
      highScore: Math.max(score(data.highScore), ...best),
    };
  } catch {
    return emptyProgress();
  }
}

export function saveProgress(progress: Progress): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(progress));
  } catch {
    /* private mode or quota — keep playing */
  }
}

export function recordClear(progress: Progress, worldId: number, scoreValue: number): Progress {
  const next = {
    ...progress,
    unlocked: Math.min(3, Math.max(progress.unlocked, worldId + 2)),
    best: [...progress.best] as [number, number, number],
    highScore: Math.max(progress.highScore, scoreValue),
  };
  if (worldId >= 0 && worldId < 3) {
    next.best[worldId] = Math.max(next.best[worldId], scoreValue);
  }
  saveProgress(next);
  return next;
}

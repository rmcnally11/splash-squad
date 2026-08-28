import { WORLD_COUNT, type KidId } from "./level.ts";

export type Progress = {
  unlocked: number;
  lastKid: KidId;
  best: number[];
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

function scores(value: unknown): number[] {
  const arr = Array.isArray(value) ? value : [];
  return Array.from({ length: WORLD_COUNT }, (_, i) => score(arr[i]));
}

export function emptyProgress(): Progress {
  return { unlocked: 1, lastKid: "boots", best: scores([]), highScore: 0 };
}

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyProgress();
    const data = JSON.parse(raw) as Partial<Progress>;
    const unlocked = Math.min(WORLD_COUNT, Math.max(1, score(data.unlocked) || 1));
    const best = scores(data.best);
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
    unlocked: Math.min(WORLD_COUNT, Math.max(progress.unlocked, worldId + 2)),
    best: scores(progress.best),
    highScore: Math.max(progress.highScore, scoreValue),
  };
  if (worldId >= 0 && worldId < WORLD_COUNT) {
    next.best[worldId] = Math.max(next.best[worldId], scoreValue);
  }
  saveProgress(next);
  return next;
}

import { sfx } from "./audio.ts";
import { SpudGame, type HudInfo } from "./game.ts";
import { bindControls, createInput, releaseAll } from "./input.ts";
import { KIDS, type KidId } from "./level.ts";
import { loadProgress, recordClear, saveProgress, type Progress } from "./progress.ts";
import { loadArt, type Art } from "./sprites.ts";
import "./style.css";

const input = createInput();
bindControls(input);

const overlay = document.getElementById("overlay")!;
const hud = document.getElementById("hud")!;
const controls = document.getElementById("controls")!;
const heartsEl = document.getElementById("hearts")!;
const potatoEl = document.getElementById("potato-count")!;
const ammoEl = document.getElementById("ammo-count")!;
const weaponEl = document.getElementById("weapon-chip");
const throwBtn = document.getElementById("btn-throw");
const kidName = document.getElementById("kid-name")!;
const kidFace = document.getElementById("kid-face") as HTMLImageElement | null;
const dogFace = document.getElementById("dog-face") as HTMLImageElement | null;
const dogCardFace = document.getElementById("dog-card-face") as HTMLImageElement | null;
const scoreEl = document.getElementById("score")!;
const worldEl = document.getElementById("world-chip")!;
const trickEl = document.getElementById("trick-hint")!;
const winCopy = document.getElementById("win-copy")!;
const clearCopy = document.getElementById("clear-copy")!;
const playBtn = document.getElementById("btn-play") as HTMLButtonElement | null;
const bestLine = document.getElementById("best-line");
const winKid = document.getElementById("win-kid") as HTMLImageElement | null;

const PORTRAITS: Record<KidId, string> = {
  boots: "/art/portrait-mallory.png",
  ace: "/art/portrait-luke.png",
  pip: "/art/portrait-connor.png",
};

let picked: KidId = "boots";
let worldId = 0;
let lastClearWasFinal = false;
let screen = "boot";
let game: SpudGame | null = null;
let art: Art | null = null;
let progress: Progress = loadProgress();
picked = progress.lastKid;

function show(name: string): void {
  screen = name;
  overlay.hidden = name === "play";
  overlay.toggleAttribute("data-playing", name === "play");
  hud.hidden = name !== "play";
  controls.hidden = name !== "play";
  for (const panel of overlay.querySelectorAll<HTMLElement>(".panel")) {
    panel.hidden = panel.dataset.screen !== name;
  }
}

function fail(message: string): void {
  const copy = document.getElementById("error-copy");
  if (copy) copy.textContent = message;
  show("error");
}

function paintWorlds(): void {
  for (const btn of document.querySelectorAll<HTMLButtonElement>(".world-card")) {
    const id = Number(btn.dataset.world);
    const open = id < progress.unlocked;
    btn.disabled = !open;
    btn.classList.toggle("locked", !open);
    const best = btn.querySelector<HTMLElement>(".world-best");
    if (!best) continue;
    const value = progress.best[id] ?? 0;
    best.hidden = value <= 0;
    best.textContent = value > 0 ? `Best ${String(value).padStart(6, "0")}` : "";
  }
  if (bestLine) {
    bestLine.hidden = progress.highScore <= 0;
    bestLine.textContent = `Best run ${String(progress.highScore).padStart(6, "0")}`;
  }
}

function paintFaces(): void {
  if (dogFace && art) dogFace.src = art.dog.src;
  if (dogCardFace && art) dogCardFace.src = art.dog.src;
  if (kidFace) kidFace.src = PORTRAITS[picked];
  if (winKid) winKid.src = PORTRAITS[picked];
}

function startRun(id: KidId, world = 0, keepScore = false): void {
  if (!game) return;
  picked = id;
  worldId = world;
  progress.lastKid = id;
  saveProgress(progress);
  sfx.unlock();
  show("play");
  if (trickEl) trickEl.textContent = `Air JUMP = ${KIDS[id].trick}`;
  paintFaces();
  game.start(id, world, keepScore);
}

function renderHud(info: HudInfo): void {
  kidName.textContent = info.name;
  if (kidFace) kidFace.src = PORTRAITS[picked];
  potatoEl.textContent = `${info.got}/${info.total}`;
  ammoEl.textContent = String(info.ammo);
  if (weaponEl) weaponEl.textContent = info.weapon;
  if (throwBtn) throwBtn.textContent = info.weapon === "SPUD" ? "SPUD" : info.weapon;
  heartsEl.textContent = `${"♥".repeat(info.hearts)}${"♡".repeat(Math.max(0, info.max - info.hearts))}`;
  scoreEl.textContent = String(info.score).padStart(6, "0");
  worldEl.textContent = info.world;
  if (info.star > 0) hud.classList.add("starry");
  else hud.classList.remove("starry");
}

const canvas = document.querySelector<HTMLCanvasElement>("#game")!;

void (async () => {
  try {
    art = await loadArt();
    game = new SpudGame(
      canvas,
      art,
      {
        onHud: renderHud,
        onClear(world, score, got, total, last) {
          lastClearWasFinal = last;
          progress = recordClear(progress, worldId, score);
          paintWorlds();
          paintFaces();
          if (last) {
            winCopy.textContent =
              got === total
                ? `Perfect run — ${got} potatoes and ${score} points. The King is toast.`
                : `The keep is yours with ${got} of ${total} potatoes and ${score} points.`;
            show("win");
          } else {
            clearCopy.textContent = `${world} cleared! ${got}/${total} potatoes · ${score} pts. Next world is unlocked.`;
            show("clear");
          }
        },
        onLose() {
          show("lose");
        },
      },
      input,
    );
    window.addEventListener("resize", () => game?.resize());
    paintWorlds();
    paintFaces();
    if (playBtn) playBtn.disabled = false;
    show("title");
  } catch (err) {
    fail(err instanceof Error ? err.message : "Could not load Spud Squad.");
  }
})();

playBtn?.addEventListener("click", () => {
  if (!game) return;
  sfx.unlock();
  show("pick");
});

document.getElementById("btn-reload")?.addEventListener("click", () => location.reload());

for (const card of document.querySelectorAll<HTMLElement>(".kid-card[data-kid]")) {
  card.addEventListener("click", () => {
    const id = card.dataset.kid as KidId;
    picked = id;
    progress.lastKid = id;
    saveProgress(progress);
    paintWorlds();
    paintFaces();
    show("worlds");
  });
}

for (const card of document.querySelectorAll<HTMLButtonElement>(".world-card")) {
  card.addEventListener("click", () => {
    if (card.disabled) return;
    startRun(picked, Number(card.dataset.world), false);
  });
}

document.getElementById("btn-pause")?.addEventListener("click", () => {
  releaseAll(input);
  game?.stop();
  show("pause");
});
document.getElementById("btn-resume")?.addEventListener("click", () => {
  releaseAll(input);
  show("play");
  game?.resume();
});
document.getElementById("btn-quit")?.addEventListener("click", () => {
  game?.stop();
  show("worlds");
});
document.getElementById("btn-again")?.addEventListener("click", () => startRun(picked, lastClearWasFinal ? 0 : worldId));
document.getElementById("btn-retry")?.addEventListener("click", () => startRun(picked, worldId, true));
document.getElementById("btn-next")?.addEventListener("click", () => startRun(picked, worldId + 1, true));
document.getElementById("btn-other")?.addEventListener("click", () => show("pick"));
document.getElementById("btn-lose-pick")?.addEventListener("click", () => show("pick"));
document.getElementById("btn-worlds")?.addEventListener("click", () => {
  paintWorlds();
  show("worlds");
});
document.getElementById("btn-back-pick")?.addEventListener("click", () => show("pick"));

window.addEventListener("keydown", (ev) => {
  if (ev.key === "p" || ev.key === "P" || ev.key === "Escape") {
    if (screen === "play") {
      releaseAll(input);
      game?.stop();
      show("pause");
    } else if (screen === "pause") {
      releaseAll(input);
      show("play");
      game?.resume();
    }
  }
});

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) return;
  releaseAll(input);
  if (screen === "play") {
    game?.stop();
    show("pause");
  }
});

document.addEventListener(
  "touchmove",
  (ev) => {
    if (!(ev.target as HTMLElement).closest(".cards")) ev.preventDefault();
  },
  { passive: false },
);

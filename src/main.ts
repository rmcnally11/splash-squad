import { sfx } from "./audio.ts";
import { SpudGame, type HudInfo } from "./game.ts";
import { bindControls, createInput } from "./input.ts";
import { KIDS, type KidId } from "./level.ts";
import { loadArt } from "./sprites.ts";
import "./style.css";

const input = createInput();
bindControls(input);

const overlay = document.getElementById("overlay")!;
const hud = document.getElementById("hud")!;
const controls = document.getElementById("controls")!;
const heartsEl = document.getElementById("hearts")!;
const potatoEl = document.getElementById("potato-count")!;
const ammoEl = document.getElementById("ammo-count")!;
const kidName = document.getElementById("kid-name")!;
const scoreEl = document.getElementById("score")!;
const worldEl = document.getElementById("world-chip")!;
const trickEl = document.getElementById("trick-hint")!;
const winCopy = document.getElementById("win-copy")!;
const clearCopy = document.getElementById("clear-copy")!;
const jumpBtn = document.getElementById("btn-jump");

let picked: KidId = "boots";
let worldId = 0;
let unlocked = 1;
let lastClearWasFinal = false;
let game: SpudGame | null = null;

function show(name: string): void {
  overlay.hidden = name === "play";
  overlay.toggleAttribute("data-playing", name === "play");
  hud.hidden = name !== "play";
  controls.hidden = name !== "play";
  for (const panel of overlay.querySelectorAll<HTMLElement>(".panel")) {
    panel.hidden = panel.dataset.screen !== name;
  }
}

function paintWorlds(): void {
  for (const btn of document.querySelectorAll<HTMLButtonElement>(".world-card")) {
    const id = Number(btn.dataset.world);
    const open = id < unlocked;
    btn.disabled = !open;
    btn.classList.toggle("locked", !open);
  }
}

function startRun(id: KidId, world = 0, keepScore = false): void {
  picked = id;
  worldId = world;
  if (!game) return;
  sfx.unlock();
  show("play");
  if (jumpBtn) jumpBtn.textContent = KIDS[id].trick === "Dash" ? "JUMP" : "JUMP";
  if (trickEl) trickEl.textContent = `Air JUMP = ${KIDS[id].trick}`;
  game.start(id, world, keepScore);
}

function renderHud(info: HudInfo): void {
  kidName.textContent = info.name;
  potatoEl.textContent = `${info.got}/${info.total}`;
  ammoEl.textContent = String(info.ammo);
  heartsEl.textContent = `${"♥".repeat(info.hearts)}${"♡".repeat(Math.max(0, info.max - info.hearts))}`;
  scoreEl.textContent = String(info.score).padStart(6, "0");
  worldEl.textContent = info.world;
  if (info.star > 0) hud.classList.add("starry");
  else hud.classList.remove("starry");
}

const canvas = document.querySelector<HTMLCanvasElement>("#game")!;

void loadArt().then((art) => {
  const family = document.querySelector<HTMLImageElement>(".family-hero");
  if (family) family.src = art.family.src;
  for (const card of document.querySelectorAll<HTMLButtonElement>(".kid-card")) {
    const img = card.querySelector("img");
    if (!img) continue;
    if (card.dataset.kid === "boots") img.src = art.boots.src;
    if (card.dataset.kid === "ace") img.src = art.ace.src;
    if (card.dataset.kid === "pip") img.src = art.pip.src;
  }
  const potatoImgs = document.querySelectorAll<HTMLImageElement>('img[src="/art/potato.png"]');
  for (const img of potatoImgs) img.src = art.potato.src;
  const lepImgs = document.querySelectorAll<HTMLImageElement>('img[src="/art/leprechaun.png"]');
  for (const img of lepImgs) img.src = art.lep.src;
  game = new SpudGame(canvas, art, {
    onHud: renderHud,
    onClear(world, score, got, total, last) {
      lastClearWasFinal = last;
      if (worldId + 1 >= unlocked) unlocked = Math.min(3, worldId + 2);
      paintWorlds();
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
  }, input);
  window.addEventListener("resize", () => game?.resize());
  paintWorlds();
  show("title");
});

document.getElementById("btn-play")?.addEventListener("click", () => {
  sfx.unlock();
  show("pick");
});

for (const card of document.querySelectorAll<HTMLButtonElement>(".kid-card")) {
  card.addEventListener("click", () => {
    picked = card.dataset.kid as KidId;
    paintWorlds();
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
  game?.stop();
  show("pause");
});
document.getElementById("btn-resume")?.addEventListener("click", () => {
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
    if (!hud.hidden) {
      game?.stop();
      show("pause");
    }
  }
  if (hud.hidden) {
    if (ev.key === "1") startRun("boots", 0);
    if (ev.key === "2") startRun("ace", 0);
    if (ev.key === "3") startRun("pip", 0);
  }
});

document.addEventListener(
  "touchmove",
  (ev) => {
    if (!(ev.target as HTMLElement).closest(".cards")) ev.preventDefault();
  },
  { passive: false },
);

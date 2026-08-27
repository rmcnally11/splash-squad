import { sfx } from "./audio.ts";
import { SpudGame } from "./game.ts";
import { bindControls, createInput } from "./input.ts";
import type { KidId } from "./level.ts";
import { loadArt } from "./sprites.ts";
import "./style.css";

const input = createInput();
bindControls(input);

const overlay = document.getElementById("overlay")!;
const hud = document.getElementById("hud")!;
const controls = document.getElementById("controls")!;
const heartsEl = document.getElementById("hearts")!;
const potatoEl = document.getElementById("potato-count")!;
const kidName = document.getElementById("kid-name")!;
const winCopy = document.getElementById("win-copy")!;

let picked: KidId = "boots";
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

function startRun(id: KidId): void {
  picked = id;
  if (!game) return;
  sfx.unlock();
  show("play");
  game.start(id);
}

const canvas = document.querySelector<HTMLCanvasElement>("#game")!;

void loadArt().then((art) => {
  game = new SpudGame(canvas, art, {
    onHud(hearts, max, got, total, name) {
      kidName.textContent = name;
      potatoEl.textContent = `${got}/${total}`;
      heartsEl.textContent = `${"♥".repeat(hearts)}${"♡".repeat(Math.max(0, max - hearts))}`;
    },
    onWin(got, total) {
      winCopy.textContent =
        got === total
          ? `Every potato — ${got} of ${total}. The red door is yours.`
          : `Home with ${got} of ${total} potatoes. Want to grab the rest?`;
      show("win");
    },
    onLose() {
      show("lose");
    },
  }, input);
  window.addEventListener("resize", () => game?.resize());
  show("title");
});

document.getElementById("btn-play")?.addEventListener("click", () => {
  sfx.unlock();
  show("pick");
});

for (const card of document.querySelectorAll<HTMLButtonElement>(".kid-card")) {
  card.addEventListener("click", () => startRun(card.dataset.kid as KidId));
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
  show("pick");
});
document.getElementById("btn-again")?.addEventListener("click", () => startRun(picked));
document.getElementById("btn-retry")?.addEventListener("click", () => startRun(picked));
document.getElementById("btn-other")?.addEventListener("click", () => show("pick"));
document.getElementById("btn-lose-pick")?.addEventListener("click", () => show("pick"));

window.addEventListener("keydown", (ev) => {
  if (ev.key === "p" || ev.key === "P" || ev.key === "Escape") {
    if (!hud.hidden) {
      game?.stop();
      show("pause");
    }
  }
  if (hud.hidden) {
    if (ev.key === "1") startRun("boots");
    if (ev.key === "2") startRun("ace");
    if (ev.key === "3") startRun("pip");
  }
});

document.addEventListener(
  "touchmove",
  (ev) => {
    if (!(ev.target as HTMLElement).closest(".cards")) ev.preventDefault();
  },
  { passive: false },
);

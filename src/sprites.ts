import { FAMILY, SHEET } from "./art-sheet.ts";

export type Art = {
  boots: HTMLImageElement;
  ace: HTMLImageElement;
  pip: HTMLImageElement;
  lep: HTMLImageElement;
  potato: HTMLImageElement;
  family: HTMLImageElement;
  dog: HTMLImageElement;
};

const CELL = 96;
const SHEET_H = 128;

function load(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(src));
    img.src = src;
  });
}

async function loadSafe(src: string): Promise<HTMLImageElement | null> {
  try {
    return await load(src);
  } catch {
    return null;
  }
}

function slice(sheet: HTMLImageElement, index: number): HTMLImageElement {
  const c = document.createElement("canvas");
  c.width = CELL;
  c.height = SHEET_H;
  const ctx = c.getContext("2d")!;
  ctx.drawImage(sheet, index * CELL, 0, CELL, SHEET_H, 0, 0, CELL, SHEET_H);
  return knockout(c);
}

function knockout(source: HTMLImageElement | HTMLCanvasElement): HTMLImageElement {
  const w = "naturalWidth" in source ? source.naturalWidth || source.width : source.width;
  const h = "naturalHeight" in source ? source.naturalHeight || source.height : source.height;
  const c = document.createElement("canvas");
  c.width = Math.max(1, w);
  c.height = Math.max(1, h);
  const ctx = c.getContext("2d")!;
  ctx.drawImage(source, 0, 0, c.width, c.height);
  const data = ctx.getImageData(0, 0, c.width, c.height);
  const px = data.data;
  for (let i = 0; i < px.length; i += 4) {
    const r = px[i];
    const g = px[i + 1];
    const b = px[i + 2];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const dark = max < 38;
    const sheetGreen = g > 40 && g < 95 && g > r + 18 && g > b + 8 && max < 110;
    if (dark || sheetGreen) {
      px[i + 3] = 0;
    } else if (min < 28 && max - min < 18) {
      px[i + 3] = 0;
    }
  }
  ctx.putImageData(data, 0, 0);
  const img = new Image();
  img.src = c.toDataURL("image/png");
  return img;
}

function drawn(label: string, color: string, w = 192, h = 192): HTMLImageElement {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(w / 2, h / 2, w * 0.38, h * 0.42, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#14110d";
  ctx.lineWidth = 6;
  ctx.stroke();
  ctx.fillStyle = "#fff6e4";
  ctx.font = "800 22px Fredoka, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(label, w / 2, h / 2 + 8);
  const img = new Image();
  img.src = c.toDataURL("image/png");
  return img;
}

function drawnDog(): HTMLImageElement {
  const w = 192;
  const h = 160;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  const stroke = (fn: () => void, fill: string, width = 5): void => {
    ctx.save();
    ctx.fillStyle = fill;
    ctx.strokeStyle = "#14110d";
    ctx.lineWidth = width;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    fn();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  };
  stroke(() => {
    ctx.beginPath();
    ctx.ellipse(148, 96, 16, 10, 0.7, 0, Math.PI * 2);
  }, "#3ec6e8");
  stroke(() => {
    ctx.beginPath();
    ctx.ellipse(92, 108, 46, 28, 0, 0, Math.PI * 2);
  }, "#5ad4f0");
  stroke(() => {
    ctx.beginPath();
    ctx.ellipse(48, 62, 34, 32, 0, 0, Math.PI * 2);
  }, "#7de3f5");
  stroke(() => {
    ctx.beginPath();
    ctx.ellipse(28, 38, 12, 20, -0.4, 0, Math.PI * 2);
  }, "#3ec6e8");
  stroke(() => {
    ctx.beginPath();
    ctx.ellipse(62, 36, 12, 20, 0.35, 0, Math.PI * 2);
  }, "#3ec6e8");
  ctx.fillStyle = "#fff6e4";
  ctx.beginPath();
  ctx.ellipse(40, 64, 7, 8, 0, 0, Math.PI * 2);
  ctx.ellipse(58, 64, 7, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#14110d";
  ctx.beginPath();
  ctx.ellipse(41, 65, 3, 3.5, 0, 0, Math.PI * 2);
  ctx.ellipse(59, 65, 3, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();
  stroke(() => {
    ctx.beginPath();
    ctx.ellipse(49, 76, 7, 5, 0, 0, Math.PI * 2);
  }, "#2a1a0a", 3);
  stroke(() => {
    ctx.beginPath();
    ctx.ellipse(92, 122, 8, 16, 0.1, 0, Math.PI * 2);
    ctx.ellipse(114, 124, 8, 16, -0.1, 0, Math.PI * 2);
    ctx.ellipse(70, 124, 8, 16, 0.2, 0, Math.PI * 2);
    ctx.ellipse(128, 122, 8, 16, -0.15, 0, Math.PI * 2);
  }, "#2eb4d6");
  stroke(() => {
    ctx.beginPath();
    ctx.roundRect(70, 86, 36, 10, 5);
  }, "#c41e3a", 3);
  ctx.fillStyle = "#ffe566";
  ctx.beginPath();
  ctx.arc(106, 91, 4, 0, Math.PI * 2);
  ctx.fill();
  const img = new Image();
  img.src = c.toDataURL("image/png");
  return img;
}

export async function loadArt(): Promise<Art> {
  const [bootsPng, acePng, pipPng, lepPng, potatoPng, familyHi, familyLo, sheetFile, dogPng] = await Promise.all([
    loadSafe("/art/girl-boots.png"),
    loadSafe("/art/boy-ace.png"),
    loadSafe("/art/toddler-pip.png"),
    loadSafe("/art/leprechaun.png"),
    loadSafe("/art/potato.png"),
    loadSafe("/art/family.jpg"),
    loadSafe("/family-sm.jpg"),
    loadSafe("/sheet.jpg"),
    loadSafe("/art/dog.png"),
  ]);
  const baked = sheetFile ?? (await loadSafe(SHEET));
  const family = familyHi ?? familyLo ?? (await loadSafe(FAMILY)) ?? drawn("SQUAD", "#1a4d2e", 280, 180);

  const fromSheet = (index: number, label: string, color: string) =>
    baked ? slice(baked, index) : drawn(label, color);

  return {
    boots: bootsPng ? knockout(bootsPng) : fromSheet(0, "MALLORY", "#5aa9e6"),
    ace: acePng ? knockout(acePng) : fromSheet(1, "LUKE", "#7dce82"),
    pip: pipPng ? knockout(pipPng) : fromSheet(2, "CONNOR", "#f7b267"),
    lep: lepPng ? knockout(lepPng) : fromSheet(3, "LEP", "#2f9e44"),
    potato: potatoPng ? knockout(potatoPng) : fromSheet(4, "SPUD", "#d4a017"),
    family,
    dog: dogPng ? knockout(dogPng) : drawnDog(),
  };
}

export function kidSprite(art: Art, id: "boots" | "ace" | "pip"): HTMLImageElement {
  if (id === "boots") return art.boots;
  if (id === "ace") return art.ace;
  return art.pip;
}

export function ink(
  ctx: CanvasRenderingContext2D,
  draw: () => void,
  fill: string,
  stroke = "#14110d",
  width = 4,
): void {
  ctx.save();
  ctx.fillStyle = fill;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = width;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  draw();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

export function paintSpud(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  t: number,
  gold = false,
  spin = 0,
  size = 30,
): void {
  ctx.save();
  ctx.translate(x + size / 2, y + size / 2 + Math.sin(t * 6) * 2);
  ctx.rotate(spin);
  ctx.scale(gold ? 1.15 : 1, gold ? 1.15 : 1);
  ink(
    ctx,
    () => {
      ctx.beginPath();
      ctx.ellipse(0, 0, size * 0.48, size * 0.4, 0, 0, Math.PI * 2);
    },
    gold ? "#ffd15c" : "#c48a2a",
    "#2a1a0a",
    5,
  );
  ctx.drawImage(img, -size * 0.46, -size * 0.46, size * 0.92, size * 0.92);
  ctx.fillStyle = "rgba(255,255,220,0.45)";
  ctx.beginPath();
  ctx.ellipse(-size * 0.14, -size * 0.12, 5, 3, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function paintOutlined(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
): void {
  ctx.drawImage(img, x, y, w, h);
}

export function paintBoom(ctx: CanvasRenderingContext2D, x: number, y: number, p: number, big = false): void {
  const scale = big ? 1.7 : 1;
  const rings = [
    ["#fff4c2", 38],
    ["#ff9a1f", 30],
    ["#e23d12", 20],
    ["#2a1a0a", 10],
  ] as const;
  for (const [color, r] of rings) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r * p * scale, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "#fff6e4";
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a) * 46 * p * scale, y + Math.sin(a) * 46 * p * scale);
    ctx.lineTo(x + Math.cos(a + 0.18) * 18 * p * scale, y + Math.sin(a + 0.18) * 18 * p * scale);
    ctx.fill();
  }
}

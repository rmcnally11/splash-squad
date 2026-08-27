import { CELL, FAMILY, SHEET, SHEET_H } from "./art-sheet.ts";

export type Art = {
  boots: HTMLImageElement;
  ace: HTMLImageElement;
  pip: HTMLImageElement;
  lep: HTMLImageElement;
  potato: HTMLImageElement;
  family: HTMLImageElement;
};

function load(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("art"));
    img.src = src;
  });
}

function slice(sheet: HTMLImageElement, index: number): HTMLImageElement {
  const c = document.createElement("canvas");
  c.width = CELL;
  c.height = SHEET_H;
  const ctx = c.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(sheet, index * CELL, 0, CELL, SHEET_H, 0, 0, CELL, SHEET_H);
  const img = new Image();
  img.src = c.toDataURL("image/jpeg", 0.92);
  return img;
}

export async function loadArt(): Promise<Art> {
  const [sheet, family] = await Promise.all([load(SHEET), load(FAMILY)]);
  return {
    boots: slice(sheet, 0),
    ace: slice(sheet, 1),
    pip: slice(sheet, 2),
    lep: slice(sheet, 3),
    potato: slice(sheet, 4),
    family,
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
  ctx.save();
  ctx.shadowColor = "#14110d";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.lineWidth = 6;
  ctx.drawImage(img, x - 2, y - 2, w + 4, h + 4);
  ctx.globalCompositeOperation = "source-over";
  ctx.drawImage(img, x, y, w, h);
  ctx.restore();
}

export function paintBoom(ctx: CanvasRenderingContext2D, x: number, y: number, p: number): void {
  const rings = [
    ["#fff4c2", 38],
    ["#ff9a1f", 30],
    ["#e23d12", 20],
    ["#2a1a0a", 10],
  ] as const;
  for (const [color, r] of rings) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r * p, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "#fff6e4";
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a) * 46 * p, y + Math.sin(a) * 46 * p);
    ctx.lineTo(x + Math.cos(a + 0.18) * 18 * p, y + Math.sin(a + 0.18) * 18 * p);
    ctx.fill();
  }
}


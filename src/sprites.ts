import { ART } from "./art-data.ts";

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
    img.onerror = () => reject(new Error("Missing art"));
    img.src = src;
  });
}

export async function loadArt(): Promise<Art> {
  const [boots, ace, pip, lep, potato, family] = await Promise.all([
    load(ART.boots),
    load(ART.ace),
    load(ART.pip),
    load(ART.lep),
    load(ART.potato),
    load(ART.family),
  ]);
  return { boots, ace, pip, lep, potato, family };
}

export function kidSprite(art: Art, id: "boots" | "ace" | "pip"): HTMLImageElement {
  if (id === "boots") return art.boots;
  if (id === "ace") return art.ace;
  return art.pip;
}

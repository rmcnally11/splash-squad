import { ACE } from "./art-ace.ts";
import { BOOTS } from "./art-boots.ts";
import { FAMILY } from "./art-family.ts";
import { LEP } from "./art-lep.ts";
import { PIP } from "./art-pip.ts";
import { POTATO } from "./art-potato.ts";

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
    load(BOOTS),
    load(ACE),
    load(PIP),
    load(LEP),
    load(POTATO),
    load(FAMILY),
  ]);
  return { boots, ace, pip, lep, potato, family };
}

export function kidSprite(art: Art, id: "boots" | "ace" | "pip"): HTMLImageElement {
  if (id === "boots") return art.boots;
  if (id === "ace") return art.ace;
  return art.pip;
}

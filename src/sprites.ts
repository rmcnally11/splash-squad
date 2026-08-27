export type Art = {
  boots: HTMLImageElement;
  ace: HTMLImageElement;
  pip: HTMLImageElement;
  lep: HTMLImageElement;
  potato: HTMLImageElement;
};

function load(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Missing ${src}`));
    img.src = src;
  });
}

export async function loadArt(): Promise<Art> {
  const [boots, ace, pip, lep, potato] = await Promise.all([
    load("/art/girl-boots.png"),
    load("/art/boy-ace.png"),
    load("/art/toddler-pip.png"),
    load("/art/leprechaun.png"),
    load("/art/potato.png"),
  ]);
  return { boots, ace, pip, lep, potato };
}

export function kidSprite(art: Art, id: "boots" | "ace" | "pip"): HTMLImageElement {
  if (id === "boots") return art.boots;
  if (id === "ace") return art.ace;
  return art.pip;
}

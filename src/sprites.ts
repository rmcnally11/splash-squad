export type Art = {
  boots: HTMLImageElement;
  ace: HTMLImageElement;
  pip: HTMLImageElement;
  lep: HTMLImageElement;
  potato: HTMLImageElement;
  family: HTMLImageElement;
};

function fromUrl(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Missing ${src}`));
    img.src = src;
  });
}

function fallback(label: string, color: string, w = 256, h = 256): HTMLImageElement {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#fff6e4";
  ctx.font = "700 28px Fredoka, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(label, w / 2, h / 2);
  const img = new Image();
  img.src = c.toDataURL("image/png");
  return img;
}

export async function loadArt(): Promise<Art> {
  const load = async (src: string, label: string, color: string) => {
    try {
      return await fromUrl(src);
    } catch {
      return fallback(label, color);
    }
  };
  const [boots, ace, pip, lep, potato, family] = await Promise.all([
    load("/art/girl-boots.png", "Boots", "#5aa9e6"),
    load("/art/boy-ace.png", "Ace", "#7dce82"),
    load("/art/toddler-pip.png", "Pip", "#f7b267"),
    load("/art/leprechaun.png", "Lep", "#2f9e44"),
    load("/art/potato.png", "Spud", "#d4a017"),
    load("/art/family.jpg", "Squad", "#1a4d2e"),
  ]);
  return { boots, ace, pip, lep, potato, family };
}

export function kidSprite(art: Art, id: "boots" | "ace" | "pip"): HTMLImageElement {
  if (id === "boots") return art.boots;
  if (id === "ace") return art.ace;
  return art.pip;
}

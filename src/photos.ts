export type PhotoSlot = "boots" | "ace" | "pip" | "family";

const DB_NAME = "spud-squad";
const STORE = "photos";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("IndexedDB failed"));
  });
}

function withStore<T>(mode: IDBTransactionMode, work: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(STORE, mode);
        const req = work(tx.objectStore(STORE));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error ?? new Error("photo store failed"));
      }),
  );
}

export async function loadPhotoUrls(): Promise<Partial<Record<PhotoSlot, string>>> {
  try {
    const db = await openDb();
    const tx = db.transaction(STORE, "readonly");
    const store = tx.objectStore(STORE);
    const slots: PhotoSlot[] = ["boots", "ace", "pip", "family"];
    const out: Partial<Record<PhotoSlot, string>> = {};
    await Promise.all(
      slots.map(
        (slot) =>
          new Promise<void>((resolve) => {
            const req = store.get(slot);
            req.onsuccess = () => {
              if (typeof req.result === "string" && req.result.startsWith("data:")) out[slot] = req.result;
              resolve();
            };
            req.onerror = () => resolve();
          }),
      ),
    );
    return out;
  } catch {
    return {};
  }
}

export async function savePhoto(slot: PhotoSlot, file: File): Promise<string> {
  const url = await preparePhoto(file, slot === "family" ? "family" : "kid");
  await withStore("readwrite", (store) => store.put(url, slot));
  return url;
}

export async function clearPhoto(slot: PhotoSlot): Promise<void> {
  try {
    await withStore("readwrite", (store) => store.delete(slot));
  } catch {
    /* ignore */
  }
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not read that photo"));
    img.src = src;
  });
}

async function blobToImage(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  try {
    return await loadImage(url);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function punchStudio(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const data = ctx.getImageData(0, 0, w, h);
  const px = data.data;
  for (let i = 0; i < px.length; i += 4) {
    const r = px[i];
    const g = px[i + 1];
    const b = px[i + 2];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const pale = min > 228 && max - min < 18;
    const green = g > 150 && g > r + 40 && g > b + 30;
    if (pale || green) px[i + 3] = 0;
  }
  ctx.putImageData(data, 0, 0);
}

export async function preparePhoto(file: File, kind: "kid" | "family"): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("That file is not a picture");
  const img = await blobToImage(file);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not edit that picture");
  if (kind === "family") {
    const scale = Math.min(1, 960 / Math.max(1, img.naturalWidth));
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.84);
  }
  const side = Math.min(img.naturalWidth, img.naturalHeight);
  const sx = (img.naturalWidth - side) / 2;
  const sy = Math.max(0, (img.naturalHeight - side) / 2 - side * 0.08);
  canvas.width = 256;
  canvas.height = 256;
  ctx.drawImage(img, sx, sy, side, side, 0, 0, 256, 256);
  punchStudio(ctx, 256, 256);
  return canvas.toDataURL("image/png");
}

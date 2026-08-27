export type KidId = "boots" | "ace" | "pip";

export type Platform = {
  x: number;
  y: number;
  w: number;
  h: number;
  oneWay: boolean;
  kind: "grass" | "wood" | "stone" | "ceiling";
};

export type Potato = { x: number; y: number; taken: boolean };
export type Lep = {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  left: number;
  right: number;
  flat: number;
  grounded: boolean;
};

export type KidStats = {
  id: KidId;
  name: string;
  speed: number;
  jump: number;
  w: number;
  h: number;
  hearts: number;
  bounce: number;
  stompTime: number;
};

export const KIDS: Record<KidId, KidStats> = {
  boots: {
    id: "boots",
    name: "Boots",
    speed: 235,
    jump: 920,
    w: 40,
    h: 68,
    hearts: 3,
    bounce: 1.28,
    stompTime: 1.6,
  },
  ace: {
    id: "ace",
    name: "Ace",
    speed: 205,
    jump: 900,
    w: 46,
    h: 76,
    hearts: 4,
    bounce: 1.05,
    stompTime: 3.4,
  },
  pip: {
    id: "pip",
    name: "Pip",
    speed: 270,
    jump: 880,
    w: 32,
    h: 46,
    hearts: 3,
    bounce: 1.1,
    stompTime: 1.4,
  },
};

export const WORLD_W = 5400;
export const WORLD_H = 820;
export const GROUND = 700;

export function makeLevel(): { platforms: Platform[]; potatoes: Potato[]; leps: Lep[]; doorX: number } {
  const platforms: Platform[] = [
    { x: 0, y: GROUND, w: 700, h: 140, oneWay: false, kind: "grass" },
    { x: 820, y: GROUND, w: 760, h: 140, oneWay: false, kind: "grass" },
    { x: 1760, y: GROUND, w: 720, h: 140, oneWay: false, kind: "grass" },
    { x: 2680, y: GROUND, w: 900, h: 140, oneWay: false, kind: "grass" },
    { x: 3780, y: GROUND, w: 1620, h: 140, oneWay: false, kind: "grass" },

    { x: 260, y: 560, w: 170, h: 22, oneWay: true, kind: "wood" },
    { x: 500, y: 448, w: 150, h: 22, oneWay: true, kind: "wood" },
    { x: 900, y: 520, w: 210, h: 22, oneWay: true, kind: "wood" },
    { x: 1180, y: 372, w: 140, h: 22, oneWay: true, kind: "stone" },
    { x: 1480, y: 480, w: 190, h: 22, oneWay: true, kind: "wood" },
    { x: 1900, y: 555, w: 160, h: 22, oneWay: true, kind: "wood" },
    { x: 2100, y: 400, w: 130, h: 22, oneWay: true, kind: "stone" },
    { x: 2300, y: 292, w: 150, h: 22, oneWay: true, kind: "stone" },
    { x: 2820, y: 540, w: 230, h: 22, oneWay: true, kind: "wood" },
    { x: 3120, y: 400, w: 170, h: 22, oneWay: true, kind: "wood" },
    { x: 3380, y: 268, w: 130, h: 22, oneWay: true, kind: "stone" },
    { x: 3620, y: 470, w: 210, h: 22, oneWay: true, kind: "wood" },
    { x: 4020, y: 608, w: 300, h: 28, oneWay: false, kind: "ceiling" },
    { x: 4480, y: 520, w: 180, h: 22, oneWay: true, kind: "wood" },
    { x: 4780, y: 400, w: 160, h: 22, oneWay: true, kind: "stone" },
    { x: 5080, y: 555, w: 140, h: 22, oneWay: true, kind: "wood" },
  ];

  const potatoes: Potato[] = [
    { x: 320, y: 518, taken: false },
    { x: 555, y: 406, taken: false },
    { x: 980, y: 478, taken: false },
    { x: 1235, y: 328, taken: false },
    { x: 1555, y: 438, taken: false },
    { x: 1680, y: 640, taken: false },
    { x: 1945, y: 512, taken: false },
    { x: 2145, y: 356, taken: false },
    { x: 2360, y: 248, taken: false },
    { x: 2480, y: 640, taken: false },
    { x: 2900, y: 496, taken: false },
    { x: 3185, y: 356, taken: false },
    { x: 3430, y: 224, taken: false },
    { x: 3700, y: 426, taken: false },
    { x: 4140, y: 640, taken: false },
    { x: 4540, y: 476, taken: false },
    { x: 4840, y: 356, taken: false },
    { x: 5130, y: 512, taken: false },
  ];

  const leps: Lep[] = [
    lep(560, GROUND, 380, 760),
    lep(1040, 520, 910, 1090),
    lep(1540, GROUND, 1320, 1680),
    lep(2050, GROUND, 1820, 2380),
    lep(2920, 540, 2830, 3030),
    lep(3480, GROUND, 2780, 3520),
    lep(4560, GROUND, 4320, 5000),
    lep(4880, 400, 4790, 4930),
  ];

  return { platforms, potatoes, leps, doorX: 5220 };
}

function lep(x: number, footY: number, left: number, right: number): Lep {
  const h = 46;
  return {
    x,
    y: footY - h,
    w: 40,
    h,
    vx: 70,
    left,
    right,
    flat: 0,
    grounded: true,
  };
}

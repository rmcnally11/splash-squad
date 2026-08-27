export type KidId = "boots" | "ace" | "pip";
export type WorldId = 0 | 1 | 2;
export type Theme = "meadow" | "mine" | "keep";

export type Platform = {
  x: number;
  y: number;
  w: number;
  h: number;
  oneWay: boolean;
  kind: "grass" | "wood" | "stone" | "ceiling" | "brick" | "crystal";
};

export type Potato = { x: number; y: number; taken: boolean; gold: boolean };
export type Pickup = {
  x: number;
  y: number;
  kind: "star" | "shamrock" | "gold";
  taken: boolean;
};
export type Spring = { x: number; y: number; w: number; h: number; boost: number };
export type Mover = {
  x: number;
  y: number;
  w: number;
  h: number;
  oneWay: true;
  kind: "wood";
  min: number;
  max: number;
  speed: number;
  axis: "x" | "y";
  dir: number;
};
export type Checkpoint = { x: number; y: number; got: boolean };
export type Lep = {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  left: number;
  right: number;
  top: number;
  bot: number;
  flat: number;
  fly: boolean;
};
export type Shot = { x: number; y: number; vx: number; vy: number; life: number };
export type Boss = {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  hp: number;
  max: number;
  hurt: number;
  jumpT: number;
  throwT: number;
  alive: boolean;
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
  trick: string;
};

export type WorldDef = {
  id: WorldId;
  name: string;
  subtitle: string;
  theme: Theme;
  w: number;
  doorX: number;
  lockedDoor: boolean;
  platforms: Platform[];
  potatoes: Potato[];
  leps: Lep[];
  springs: Spring[];
  movers: Mover[];
  pickups: Pickup[];
  checks: Checkpoint[];
  boss: Boss | null;
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
    bounce: 1.32,
    stompTime: 1.6,
    trick: "Air jump",
  },
  ace: {
    id: "ace",
    name: "Ace",
    speed: 210,
    jump: 900,
    w: 46,
    h: 76,
    hearts: 4,
    bounce: 1.08,
    stompTime: 3.4,
    trick: "Ground pound",
  },
  pip: {
    id: "pip",
    name: "Pip",
    speed: 280,
    jump: 880,
    w: 32,
    h: 46,
    hearts: 3,
    bounce: 1.12,
    stompTime: 1.4,
    trick: "Dash",
  },
};

export const WORLD_H = 820;
export const GROUND = 700;

export function makeWorlds(): WorldDef[] {
  return [meadow(), mine(), keep()];
}

function meadow(): WorldDef {
  return {
    id: 0,
    name: "Potato Patch",
    subtitle: "Sunny fields. Learn your trick. Beat the pits.",
    theme: "meadow",
    w: 5200,
    doorX: 4980,
    lockedDoor: false,
    platforms: [
      g(0, 720),
      g(860, 780),
      g(1860, 820),
      g(2920, 860),
      g(4040, 1160),
      p(280, 560, 180, "wood"),
      p(520, 448, 160, "wood"),
      p(980, 520, 220, "wood"),
      p(1280, 380, 150, "stone"),
      p(1680, 500, 190, "wood"),
      p(2140, 430, 140, "stone"),
      p(2480, 320, 130, "stone"),
      p(3180, 540, 210, "wood"),
      p(3480, 400, 160, "wood"),
      p(3760, 270, 140, "stone"),
      p(4320, 520, 200, "wood"),
      p(4620, 400, 150, "wood"),
    ],
    potatoes: [
      t(320, 518),
      t(560, 406),
      t(1060, 478),
      t(1320, 338, true),
      t(1740, 458),
      t(1980, 640),
      t(2180, 388),
      t(2520, 278),
      t(2700, 640),
      t(3240, 498),
      t(3520, 358),
      t(3800, 228, true),
      t(4380, 478),
      t(4660, 358),
      t(4860, 640),
    ],
    leps: [
      walk(520, GROUND, 200, 700),
      walk(1100, 520, 990, 1180),
      walk(2100, GROUND, 1900, 2500),
      walk(3100, GROUND, 2960, 3600),
      walk(4400, GROUND, 4100, 4900),
      fly(1500, 420, 1380, 1720, 300, 480),
    ],
    springs: [{ x: 780, y: 678, w: 44, h: 22, boost: 1180 }],
    movers: [mover(2580, 470, 150, 2480, 2780, 70, "x")],
    pickups: [
      { x: 1300, y: 330, kind: "shamrock", taken: false },
      { x: 2500, y: 278, kind: "star", taken: false },
      { x: 3780, y: 228, kind: "gold", taken: false },
    ],
    checks: [
      { x: 1880, y: GROUND - 70, got: false },
      { x: 3600, y: GROUND - 70, got: false },
    ],
    boss: null,
  };
}

function mine(): WorldDef {
  return {
    id: 1,
    name: "Lucky Mine",
    subtitle: "Dark tunnels, glow taters, flying hats.",
    theme: "mine",
    w: 5400,
    doorX: 5160,
    lockedDoor: false,
    platforms: [
      g(0, 640),
      g(820, 520),
      g(1560, 700),
      g(2480, 640),
      g(3380, 780),
      g(4420, 980),
      { x: 1180, y: 608, w: 260, h: 26, oneWay: false, kind: "ceiling" },
      { x: 2720, y: 590, w: 280, h: 26, oneWay: false, kind: "ceiling" },
      p(300, 540, 170, "crystal"),
      p(560, 410, 150, "stone"),
      p(980, 480, 180, "crystal"),
      p(1380, 360, 140, "stone"),
      p(1880, 500, 200, "crystal"),
      p(2200, 360, 150, "stone"),
      p(2640, 300, 130, "crystal"),
      p(3100, 470, 190, "stone"),
      p(3480, 330, 150, "crystal"),
      p(3900, 470, 180, "stone"),
      p(4280, 340, 140, "crystal"),
      p(4680, 500, 180, "stone"),
    ],
    potatoes: [
      t(340, 498),
      t(600, 368),
      t(1040, 438),
      t(1420, 318, true),
      t(1760, 640),
      t(1940, 458),
      t(2240, 318),
      t(2680, 258, true),
      t(2920, 640),
      t(3160, 428),
      t(3520, 288),
      t(3960, 428),
      t(4320, 298, true),
      t(4740, 458),
      t(5000, 640),
    ],
    leps: [
      walk(400, GROUND, 80, 600),
      walk(1000, GROUND, 840, 1280),
      walk(1800, GROUND, 1600, 2200),
      walk(2700, GROUND, 2500, 3060),
      walk(3600, GROUND, 3420, 4000),
      walk(4700, GROUND, 4460, 5200),
      fly(700, 360, 520, 900, 240, 420),
      fly(2100, 280, 1900, 2360, 200, 380),
      fly(4000, 300, 3780, 4240, 220, 400),
    ],
    springs: [
      { x: 740, y: 678, w: 44, h: 22, boost: 1240 },
      { x: 2320, y: 678, w: 44, h: 22, boost: 1200 },
    ],
    movers: [
      mover(1480, 460, 140, 360, 520, 55, "y"),
      mover(3260, 420, 150, 3120, 3440, 80, "x"),
    ],
    pickups: [
      { x: 1400, y: 312, kind: "shamrock", taken: false },
      { x: 2660, y: 252, kind: "star", taken: false },
      { x: 4300, y: 292, kind: "gold", taken: false },
    ],
    checks: [
      { x: 1640, y: GROUND - 70, got: false },
      { x: 3460, y: GROUND - 70, got: false },
    ],
    boss: null,
  };
}

function keep(): WorldDef {
  return {
    id: 2,
    name: "Rainbow Keep",
    subtitle: "Castle run. Stomp the King three times.",
    theme: "keep",
    w: 5000,
    doorX: 4760,
    lockedDoor: true,
    platforms: [
      g(0, 700),
      g(880, 700),
      g(1780, 760),
      g(2760, 820),
      g(3820, 1180),
      p(260, 540, 170, "brick"),
      p(500, 410, 150, "wood"),
      p(820, 500, 180, "brick"),
      p(1140, 360, 140, "stone"),
      p(1500, 480, 190, "brick"),
      p(1880, 340, 150, "wood"),
      p(2220, 470, 160, "brick"),
      p(2560, 300, 140, "stone"),
      p(3000, 500, 200, "brick"),
      p(3340, 360, 160, "wood"),
      p(3660, 240, 140, "stone"),
      p(4080, 480, 220, "brick"),
    ],
    potatoes: [
      t(300, 498),
      t(540, 368),
      t(880, 458),
      t(1180, 318, true),
      t(1560, 438),
      t(1920, 298),
      t(2260, 428),
      t(2600, 258, true),
      t(2880, 640),
      t(3060, 458),
      t(3380, 318),
      t(3700, 198, true),
      t(4140, 438),
      t(4400, 640),
      t(4620, 640),
    ],
    leps: [
      walk(480, GROUND, 120, 680),
      walk(1100, GROUND, 900, 1500),
      walk(2000, GROUND, 1820, 2480),
      walk(3100, GROUND, 2800, 3500),
      fly(900, 320, 720, 1100, 220, 400),
      fly(2400, 280, 2140, 2680, 200, 380),
      fly(3500, 260, 3280, 3780, 180, 360),
    ],
    springs: [
      { x: 760, y: 678, w: 44, h: 22, boost: 1220 },
      { x: 2680, y: 678, w: 44, h: 22, boost: 1260 },
    ],
    movers: [
      mover(1680, 400, 140, 1580, 1860, 75, "x"),
      mover(3480, 420, 130, 300, 480, 60, "y"),
    ],
    pickups: [
      { x: 1160, y: 312, kind: "shamrock", taken: false },
      { x: 2580, y: 252, kind: "star", taken: false },
      { x: 3680, y: 192, kind: "gold", taken: false },
    ],
    checks: [
      { x: 1800, y: GROUND - 70, got: false },
      { x: 3200, y: GROUND - 70, got: false },
    ],
    boss: {
      x: 4200,
      y: GROUND - 110,
      w: 92,
      h: 110,
      vx: 90,
      vy: 0,
      hp: 3,
      max: 3,
      hurt: 0,
      jumpT: 1.4,
      throwT: 1.1,
      alive: true,
    },
  };
}

function g(x: number, w: number): Platform {
  return { x, y: GROUND, w, h: 140, oneWay: false, kind: "grass" };
}

function p(x: number, y: number, w: number, kind: Platform["kind"]): Platform {
  return { x, y, w, h: 22, oneWay: true, kind };
}

function t(x: number, y: number, gold = false): Potato {
  return { x, y, taken: false, gold };
}

function walk(x: number, footY: number, left: number, right: number): Lep {
  return {
    x,
    y: footY - 46,
    w: 40,
    h: 46,
    vx: 78,
    vy: 0,
    left,
    right,
    top: 0,
    bot: 0,
    flat: 0,
    fly: false,
  };
}

function fly(x: number, y: number, left: number, right: number, top: number, bot: number): Lep {
  return {
    x,
    y,
    w: 40,
    h: 40,
    vx: 90,
    vy: 40,
    left,
    right,
    top,
    bot,
    flat: 0,
    fly: true,
  };
}

function mover(
  x: number,
  y: number,
  w: number,
  min: number,
  max: number,
  speed: number,
  axis: "x" | "y",
): Mover {
  return { x, y, w, h: 20, oneWay: true, kind: "wood", min, max, speed, dir: 1, axis };
}

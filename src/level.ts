export type KidId = "boots" | "ace" | "pip";
export type WorldId = 0 | 1 | 2 | 3 | 4 | 5;
export type Theme = "meadow" | "mine" | "keep" | "bog" | "vault";
export type LepKind = "hat" | "bruiser" | "swift" | "flyer" | "gold";

export const WORLD_COUNT = 6;

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
  kind: "star" | "shamrock" | "gold" | "blaster" | "gun" | "super";
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
  kind: LepKind;
  hp: number;
  max: number;
  hurt: number;
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
  left: number;
  right: number;
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
    name: "Mallory",
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
    name: "Luke",
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
    name: "Connor",
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
  return [meadow(), mine(), keep(), bog(), vault(), kingpin()];
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
      hat(520, GROUND, 200, 700),
      hat(1100, 520, 990, 1180),
      hat(2100, GROUND, 1900, 2500),
      hat(3100, GROUND, 2960, 3600),
      flyer(1500, 420, 1380, 1720, 300, 480),
      bruiser(4400, GROUND, 4100, 4900),
    ],
    springs: [{ x: 780, y: 678, w: 44, h: 22, boost: 1180 }],
    movers: [mover(2580, 470, 150, 2480, 2780, 70, "x")],
    pickups: [
      { x: 1300, y: 330, kind: "shamrock", taken: false },
      { x: 1680, y: 458, kind: "blaster", taken: false },
      { x: 2500, y: 278, kind: "gun", taken: false },
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
    subtitle: "Dark tunnels, glow taters, two-hit flyers.",
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
      hat(400, GROUND, 80, 600),
      hat(1000, GROUND, 840, 1280, 2),
      swift(1800, GROUND, 1600, 2200),
      hat(2700, GROUND, 2500, 3060, 2),
      bruiser(3600, GROUND, 3420, 4000),
      hat(4700, GROUND, 4460, 5200, 2),
      flyer(700, 360, 520, 900, 240, 420),
      flyer(2100, 280, 1900, 2360, 200, 380),
      flyer(4000, 300, 3780, 4240, 220, 400, 3),
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
      { x: 1880, y: 458, kind: "blaster", taken: false },
      { x: 2660, y: 252, kind: "gun", taken: false },
      { x: 4300, y: 292, kind: "super", taken: false },
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
    subtitle: "Castle run. Stomp the King four times.",
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
      hat(480, GROUND, 120, 680, 2),
      swift(1100, GROUND, 900, 1500),
      bruiser(2000, GROUND, 1820, 2480),
      goldie(3100, GROUND, 2800, 3500),
      flyer(900, 320, 720, 1100, 220, 400),
      flyer(2400, 280, 2140, 2680, 200, 380, 3),
      flyer(3500, 260, 3280, 3780, 180, 360, 3),
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
      { x: 1920, y: 298, kind: "blaster", taken: false },
      { x: 2580, y: 252, kind: "gun", taken: false },
      { x: 3680, y: 192, kind: "super", taken: false },
    ],
    checks: [
      { x: 1800, y: GROUND - 70, got: false },
      { x: 3200, y: GROUND - 70, got: false },
    ],
    boss: king(4200, 4, 108, 128, 3920, 4700),
  };
}

function bog(): WorldDef {
  return {
    id: 3,
    name: "Shamrock Bog",
    subtitle: "Murky water, bruisers, and a first real gauntlet.",
    theme: "bog",
    w: 5600,
    doorX: 5360,
    lockedDoor: false,
    platforms: [
      g(0, 680),
      g(780, 620),
      g(1560, 740),
      g(2480, 700),
      g(3380, 820),
      g(4460, 1140),
      p(240, 540, 170, "wood"),
      p(500, 420, 150, "stone"),
      p(860, 500, 190, "wood"),
      p(1180, 360, 140, "stone"),
      p(1540, 470, 180, "wood"),
      p(1960, 330, 150, "stone"),
      p(2320, 480, 170, "wood"),
      p(2740, 300, 140, "stone"),
      p(3140, 450, 200, "wood"),
      p(3520, 320, 150, "stone"),
      p(3900, 460, 180, "wood"),
      p(4280, 300, 150, "stone"),
      p(4700, 480, 190, "wood"),
      p(5060, 360, 150, "stone"),
    ],
    potatoes: [
      t(280, 498),
      t(540, 378),
      t(900, 458),
      t(1220, 318, true),
      t(1580, 428),
      t(2000, 288),
      t(2360, 438),
      t(2780, 258, true),
      t(3000, 640),
      t(3180, 408),
      t(3560, 278),
      t(3940, 418),
      t(4320, 258, true),
      t(4740, 438),
      t(5100, 318),
      t(5280, 640),
    ],
    leps: [
      hat(420, GROUND, 80, 640, 2, 90),
      bruiser(980, GROUND, 800, 1320),
      swift(1700, GROUND, 1580, 2200),
      bruiser(2600, GROUND, 2500, 3100),
      goldie(3500, GROUND, 3400, 4100),
      bruiser(4700, GROUND, 4480, 5200),
      flyer(700, 340, 520, 980, 220, 420, 3),
      flyer(2100, 280, 1880, 2460, 200, 400, 3),
      flyer(3800, 260, 3560, 4140, 180, 380, 3),
      flyer(5000, 300, 4780, 5280, 200, 400, 3),
    ],
    springs: [
      { x: 720, y: 678, w: 44, h: 22, boost: 1240 },
      { x: 2880, y: 678, w: 44, h: 22, boost: 1280 },
    ],
    movers: [
      mover(1420, 430, 150, 1320, 1680, 70, "x"),
      mover(3360, 400, 140, 280, 500, 55, "y"),
    ],
    pickups: [
      { x: 1200, y: 312, kind: "shamrock", taken: false },
      { x: 1960, y: 288, kind: "blaster", taken: false },
      { x: 2760, y: 252, kind: "gun", taken: false },
      { x: 4300, y: 252, kind: "super", taken: false },
    ],
    checks: [
      { x: 1680, y: GROUND - 70, got: false },
      { x: 3440, y: GROUND - 70, got: false },
    ],
    boss: null,
  };
}

function vault(): WorldDef {
  return {
    id: 4,
    name: "Gold Vault",
    subtitle: "Armored hats. Four hits. Hold the gun and don't blink.",
    theme: "vault",
    w: 5800,
    doorX: 5560,
    lockedDoor: false,
    platforms: [
      g(0, 700),
      g(860, 640),
      g(1680, 760),
      g(2640, 720),
      g(3580, 800),
      g(4620, 1180),
      { x: 1240, y: 608, w: 280, h: 26, oneWay: false, kind: "ceiling" },
      { x: 3020, y: 590, w: 260, h: 26, oneWay: false, kind: "ceiling" },
      p(280, 530, 170, "crystal"),
      p(560, 400, 150, "stone"),
      p(940, 470, 180, "crystal"),
      p(1320, 340, 140, "stone"),
      p(1760, 490, 200, "crystal"),
      p(2140, 340, 150, "stone"),
      p(2520, 280, 130, "crystal"),
      p(2960, 460, 190, "stone"),
      p(3340, 310, 150, "crystal"),
      p(3760, 460, 180, "stone"),
      p(4140, 320, 140, "crystal"),
      p(4520, 470, 180, "stone"),
      p(4980, 340, 160, "crystal"),
      p(5280, 480, 170, "stone"),
    ],
    potatoes: [
      t(320, 488),
      t(600, 358),
      t(980, 428),
      t(1360, 298, true),
      t(1800, 448),
      t(2180, 298),
      t(2560, 238, true),
      t(2800, 640),
      t(3000, 418),
      t(3380, 268),
      t(3800, 418),
      t(4180, 278, true),
      t(4560, 428),
      t(5020, 298),
      t(5320, 438),
      t(5480, 640),
    ],
    leps: [
      goldie(380, GROUND, 80, 680),
      swift(1100, GROUND, 880, 1480),
      bruiser(1900, GROUND, 1720, 2360),
      goldie(2800, GROUND, 2660, 3300),
      bruiser(3700, GROUND, 3600, 4200),
      goldie(4700, GROUND, 4640, 5400),
      flyer(700, 340, 500, 960, 220, 420, 3),
      flyer(2200, 260, 1980, 2480, 180, 380, 3),
      flyer(3500, 240, 3260, 3840, 160, 360, 3),
      flyer(5100, 280, 4860, 5460, 180, 380, 3),
    ],
    springs: [
      { x: 780, y: 678, w: 44, h: 22, boost: 1260 },
      { x: 2460, y: 678, w: 44, h: 22, boost: 1240 },
    ],
    movers: [
      mover(1540, 430, 150, 320, 520, 60, "y"),
      mover(4080, 400, 150, 3920, 4320, 85, "x"),
    ],
    pickups: [
      { x: 1340, y: 292, kind: "shamrock", taken: false },
      { x: 1760, y: 448, kind: "blaster", taken: false },
      { x: 2540, y: 232, kind: "gun", taken: false },
      { x: 4160, y: 272, kind: "super", taken: false },
      { x: 5280, y: 432, kind: "super", taken: false },
    ],
    checks: [
      { x: 1760, y: GROUND - 70, got: false },
      { x: 3620, y: GROUND - 70, got: false },
    ],
    boss: null,
  };
}

function kingpin(): WorldDef {
  return {
    id: 5,
    name: "Kingpin Castle",
    subtitle: "Every hat at once. The King takes eight hits.",
    theme: "keep",
    w: 5400,
    doorX: 5160,
    lockedDoor: true,
    platforms: [
      g(0, 720),
      g(860, 700),
      g(1760, 780),
      g(2740, 820),
      g(3840, 1320),
      p(240, 540, 170, "brick"),
      p(500, 400, 150, "wood"),
      p(840, 490, 180, "brick"),
      p(1180, 340, 140, "stone"),
      p(1540, 470, 190, "brick"),
      p(1920, 320, 150, "wood"),
      p(2280, 450, 160, "brick"),
      p(2620, 280, 140, "stone"),
      p(3040, 490, 200, "brick"),
      p(3400, 340, 160, "wood"),
      p(3740, 220, 140, "stone"),
      p(4140, 460, 220, "brick"),
      p(4560, 330, 160, "wood"),
    ],
    potatoes: [
      t(280, 498),
      t(540, 358),
      t(880, 448),
      t(1220, 298, true),
      t(1580, 428),
      t(1960, 278),
      t(2320, 408),
      t(2660, 238, true),
      t(2920, 640),
      t(3100, 448),
      t(3440, 298),
      t(3780, 178, true),
      t(4180, 418),
      t(4600, 288),
      t(4900, 640),
      t(5080, 640),
    ],
    leps: [
      bruiser(460, GROUND, 120, 720),
      swift(1100, GROUND, 900, 1560),
      goldie(2000, GROUND, 1800, 2500),
      bruiser(3000, GROUND, 2780, 3480),
      goldie(3600, GROUND, 3520, 4000),
      flyer(800, 300, 640, 1080, 200, 400, 3),
      flyer(2300, 260, 2060, 2640, 180, 380, 3),
      flyer(3400, 240, 3180, 3720, 160, 360, 3),
    ],
    springs: [
      { x: 740, y: 678, w: 44, h: 22, boost: 1240 },
      { x: 2700, y: 678, w: 44, h: 22, boost: 1280 },
    ],
    movers: [
      mover(1700, 390, 140, 1580, 1900, 80, "x"),
      mover(3520, 400, 130, 260, 480, 65, "y"),
    ],
    pickups: [
      { x: 1200, y: 292, kind: "shamrock", taken: false },
      { x: 1920, y: 278, kind: "blaster", taken: false },
      { x: 2640, y: 232, kind: "gun", taken: false },
      { x: 3760, y: 172, kind: "super", taken: false },
      { x: 4560, y: 282, kind: "super", taken: false },
    ],
    checks: [
      { x: 1760, y: GROUND - 70, got: false },
      { x: 3280, y: GROUND - 70, got: false },
    ],
    boss: king(4400, 8, 128, 148, 4100, 5080),
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

function lep(
  kind: LepKind,
  x: number,
  y: number,
  w: number,
  h: number,
  vx: number,
  vy: number,
  left: number,
  right: number,
  top: number,
  bot: number,
  fly: boolean,
  hp: number,
): Lep {
  return { x, y, w, h, vx, vy, left, right, top, bot, flat: 0, fly, kind, hp, max: hp, hurt: 0 };
}

function hat(x: number, footY: number, left: number, right: number, hp = 1, speed = 72): Lep {
  return lep("hat", x, footY - 64, 56, 64, speed, 0, left, right, 0, 0, false, hp);
}

function bruiser(x: number, footY: number, left: number, right: number, hp = 3): Lep {
  return lep("bruiser", x, footY - 100, 88, 100, 48, 0, left, right, 0, 0, false, hp);
}

function swift(x: number, footY: number, left: number, right: number, hp = 2): Lep {
  return lep("swift", x, footY - 58, 50, 58, 140, 0, left, right, 0, 0, false, hp);
}

function flyer(
  x: number,
  y: number,
  left: number,
  right: number,
  top: number,
  bot: number,
  hp = 2,
): Lep {
  return lep("flyer", x, y, 54, 54, 96, 44, left, right, top, bot, true, hp);
}

function goldie(x: number, footY: number, left: number, right: number, hp = 4): Lep {
  return lep("gold", x, footY - 82, 72, 82, 42, 0, left, right, 0, 0, false, hp);
}

function king(x: number, hp: number, w: number, h: number, left: number, right: number): Boss {
  return {
    x,
    y: GROUND - h,
    w,
    h,
    vx: 88,
    vy: 0,
    hp,
    max: hp,
    hurt: 0,
    jumpT: 1.4,
    throwT: 1.1,
    alive: true,
    left,
    right,
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

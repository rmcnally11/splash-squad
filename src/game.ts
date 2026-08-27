import { sfx } from "./audio.ts";
import type { InputState } from "./input.ts";
import {
  GROUND,
  KIDS,
  WORLD_H,
  makeWorlds,
  type Boss,
  type KidId,
  type KidStats,
  type Lep,
  type Mover,
  type Platform,
  type Potato,
  type Shot,
  type WorldDef,
} from "./level.ts";
import { kidSprite, paintBoom, paintOutlined, paintSpud, type Art } from "./sprites.ts";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  color: string;
  size: number;
};

type Floater = { x: number; y: number; text: string; life: number; color: string };
type SpudBall = { x: number; y: number; vx: number; vy: number; life: number; spin: number };
type Boom = { x: number; y: number; life: number; max: number };

export type HudInfo = {
  hearts: number;
  max: number;
  got: number;
  total: number;
  name: string;
  score: number;
  combo: number;
  world: string;
  star: number;
  trick: string;
  ammo: number;
};

export type GameHooks = {
  onHud: (info: HudInfo) => void;
  onClear: (world: string, score: number, got: number, total: number, last: boolean) => void;
  onLose: () => void;
};

export class SpudGame {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private art: Art;
  private hooks: GameHooks;
  private input: InputState;
  private kid: KidStats;
  private worlds = makeWorlds();
  private world!: WorldDef;
  private platforms: Platform[] = [];
  private potatoes: Potato[] = [];
  private leps: Lep[] = [];
  private shots: Shot[] = [];
  private spuds: SpudBall[] = [];
  private booms: Boom[] = [];
  private ammo = 3;
  private throwCool = 0;
  private throwPose = 0;
  private x = 80;
  private y = GROUND - 68;
  private vx = 0;
  private vy = 0;
  private facing = 1;
  private onGround = false;
  private coyote = 0;
  private jumpBuf = 0;
  private airUsed = false;
  private dashT = 0;
  private pound = false;
  private hearts = 3;
  private maxHearts = 3;
  private hurt = 0;
  private star = 0;
  private won = false;
  private dead = false;
  private camX = 0;
  private camY = 0;
  private viewW = 420;
  private viewH = 640;
  private particles: Particle[] = [];
  private floats: Floater[] = [];
  private time = 0;
  private last = 0;
  private raf = 0;
  private running = false;
  private score = 0;
  private combo = 0;
  private comboT = 0;
  private spawnX = 90;
  private spawnY = GROUND - 68;
  private shake = 0;
  private landSquash = 0;
  private ride: Mover | null = null;

  constructor(canvas: HTMLCanvasElement, art: Art, hooks: GameHooks, input: InputState) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D missing");
    this.ctx = ctx;
    this.art = art;
    this.hooks = hooks;
    this.input = input;
    this.kid = KIDS.boots;
    this.world = this.worlds[0];
  }

  start(id: KidId, worldId = 0, keepScore = false): void {
    this.kid = KIDS[id];
    this.worlds = makeWorlds();
    this.world = this.worlds[worldId] ?? this.worlds[0];
    this.platforms = this.world.platforms;
    this.potatoes = this.world.potatoes;
    this.leps = this.world.leps;
    this.shots = [];
    this.spuds = [];
    this.booms = [];
    if (!keepScore) this.ammo = 3;
    this.throwCool = 0;
    this.throwPose = 0;
    this.x = 90;
    this.y = GROUND - this.kid.h;
    this.vx = 0;
    this.vy = 0;
    this.facing = 1;
    this.onGround = true;
    this.coyote = 0;
    this.jumpBuf = 0;
    this.airUsed = false;
    this.dashT = 0;
    this.pound = false;
    this.hearts = this.kid.hearts;
    this.maxHearts = this.kid.hearts;
    this.hurt = 0;
    this.star = 0;
    this.won = false;
    this.dead = false;
    this.camX = 0;
    this.camY = 80;
    this.particles = [];
    this.floats = [];
    this.time = 0;
    this.last = performance.now();
    this.running = true;
    if (!keepScore) this.score = 0;
    this.combo = 0;
    this.comboT = 0;
    this.spawnX = 90;
    this.spawnY = GROUND - this.kid.h;
    this.shake = 0;
    this.landSquash = 0;
    this.ride = null;
    sfx.startMusic(this.world.id);
    this.hud();
    this.resize();
    cancelAnimationFrame(this.raf);
    this.raf = requestAnimationFrame((t) => this.frame(t));
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.raf);
    sfx.stopMusic();
  }

  resume(): void {
    if (this.running || this.won || this.dead) return;
    this.running = true;
    this.last = performance.now();
    sfx.startMusic(this.world.id);
    this.raf = requestAnimationFrame((t) => this.frame(t));
  }

  resize(): void {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    this.canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    this.canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    this.viewW = rect.width;
    this.viewH = rect.height;
  }

  private hud(): void {
    const got = this.potatoes.filter((p) => p.taken).length;
    this.hooks.onHud({
      hearts: this.hearts,
      max: this.maxHearts,
      got,
      total: this.potatoes.length,
      name: this.kid.name,
      score: this.score,
      combo: this.combo,
      world: this.world.name,
      star: this.star,
      trick: this.kid.trick,
      ammo: this.ammo,
    });
  }

  private frame(now: number): void {
    if (!this.running) return;
    const dt = Math.min(0.033, (now - this.last) / 1000);
    this.last = now;
    this.step(dt, this.input);
    this.draw();
    this.raf = requestAnimationFrame((t) => this.frame(t));
  }

  private step(dt: number, input: InputState): void {
    if (this.won || this.dead) return;
    this.time += dt;
    this.hurt = Math.max(0, this.hurt - dt);
    this.star = Math.max(0, this.star - dt);
    this.comboT = Math.max(0, this.comboT - dt);
    this.shake = Math.max(0, this.shake - dt);
    this.landSquash = Math.max(0, this.landSquash - dt);
    this.dashT = Math.max(0, this.dashT - dt);
    this.throwCool = Math.max(0, this.throwCool - dt);
    this.throwPose = Math.max(0, this.throwPose - dt);
    if (this.comboT <= 0) this.combo = 0;
    this.coyote = this.onGround ? 0.12 : Math.max(0, this.coyote - dt);
    if (input.jumpPressed) this.jumpBuf = 0.14;
    if (input.jump && this.onGround) this.jumpBuf = 0.14;
    this.jumpBuf = Math.max(0, this.jumpBuf - dt);
    input.jumpPressed = false;
    sfx.tickMusic(dt);

    const speed = this.kid.speed * (this.star > 0 ? 1.28 : 1);
    const accel = speed * 8;
    if (this.dashT > 0) {
      this.vx = this.facing * 520;
    } else if (input.left && !input.right) {
      this.vx = Math.max(this.vx - accel * dt, -speed);
      this.facing = -1;
    } else if (input.right && !input.left) {
      this.vx = Math.min(this.vx + accel * dt, speed);
      this.facing = 1;
    } else {
      this.vx *= Math.max(0, 1 - dt * 10);
      if (Math.abs(this.vx) < 8) this.vx = 0;
    }

    if (this.jumpBuf > 0 && this.coyote > 0) {
      this.vy = -this.kid.jump;
      this.onGround = false;
      this.coyote = 0;
      this.jumpBuf = 0;
      this.airUsed = false;
      this.pound = false;
      this.ride = null;
      sfx.jump();
      this.burst(this.x + this.kid.w / 2, this.y + this.kid.h, "#f3d27a", 8);
      if (navigator.vibrate) navigator.vibrate(8);
    } else if (this.jumpBuf > 0 && !this.onGround && !this.airUsed) {
      this.airUsed = true;
      this.jumpBuf = 0;
      this.doTrick();
    }

    if (input.throwPressed) {
      this.tryThrow();
      input.throwPressed = false;
    }

    this.vy = Math.min(this.pound ? 1400 : 980, this.vy + (this.pound ? 2600 : 1480) * dt);
    const beforeY = this.y;
    this.stepMovers(dt);
    this.move(this.vx * dt, this.vy * dt);
    if (this.onGround && this.vy === 0 && beforeY < this.y - 2) this.landSquash = 0.12;

    if (this.y > WORLD_H + 40) {
      this.damage();
      this.x = this.spawnX;
      this.y = this.spawnY;
      this.vx = 0;
      this.vy = 0;
    }

    this.touchSprings();
    this.touchPickups();
    this.touchPotatoes();
    this.touchChecks();
    this.touchLeps(dt);
    this.touchBoss(dt);
    this.touchShots(dt);
    this.stepSpuds(dt);
    this.touchDoor();
    this.stepParticles(dt);
    this.stepFloats(dt);
    if (this.star > 0 && Math.floor(this.time * 20) % 2 === 0) {
      this.burst(this.x + this.kid.w / 2, this.y + this.kid.h * 0.5, "#ffe566", 1);
    }

    const targetX = this.x - this.viewW * 0.34;
    const targetY = this.y - this.viewH * 0.55;
    this.camX += (targetX - this.camX) * Math.min(1, dt * 8);
    this.camY += (targetY - this.camY) * Math.min(1, dt * 6);
    this.camX = clamp(this.camX, 0, this.world.w - this.viewW);
    this.camY = clamp(this.camY, 0, WORLD_H - this.viewH);
  }

  private doTrick(): void {
    sfx.trick();
    this.shake = 0.12;
    if (this.kid.id === "boots") {
      this.vy = -this.kid.jump * 0.88;
      this.burst(this.x + this.kid.w / 2, this.y + this.kid.h, "#7ec8ff", 12);
      this.float(this.x, this.y, "DOUBLE!", "#7ec8ff");
    } else if (this.kid.id === "ace") {
      this.pound = true;
      this.vy = 980;
      this.float(this.x, this.y, "POUND!", "#f3d27a");
    } else {
      this.dashT = 0.2;
      this.hurt = Math.max(this.hurt, 0.2);
      this.vy = Math.min(this.vy, -80);
      this.burst(this.x + this.kid.w / 2, this.y + this.kid.h / 2, "#ff8ad4", 14);
      this.float(this.x, this.y, "DASH!", "#ff8ad4");
    }
  }

  private tryThrow(): void {
    if (this.ammo <= 0 || this.throwCool > 0 || this.won || this.dead) return;
    this.ammo -= 1;
    this.throwCool = 0.26;
    this.throwPose = 0.16;
    this.spuds.push({
      x: this.x + this.kid.w * 0.5 + this.facing * 18,
      y: this.y + this.kid.h * 0.38,
      vx: this.facing * 520 + this.vx * 0.25,
      vy: -240,
      life: 1.7,
      spin: 0,
    });
    sfx.throw();
    this.shake = 0.1;
    this.burst(this.x + this.facing * 24, this.y + 20, "#f3d27a", 6);
    this.hud();
    if (navigator.vibrate) navigator.vibrate(10);
  }

  private stepSpuds(dt: number): void {
    this.spuds = this.spuds.filter((s) => {
      s.life -= dt;
      s.spin += dt * 14;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.vy += 980 * dt;
      if (s.y > GROUND - 8 || s.life <= 0) {
        this.explode(s.x, s.y);
        return false;
      }
      for (const p of this.solids()) {
        if (overlap(s.x - 8, s.y - 8, 16, 16, p.x, p.y, p.w, p.h)) {
          this.explode(s.x, s.y);
          return false;
        }
      }
      for (const e of this.leps) {
        if (e.flat > 0) continue;
        if (!overlap(s.x - 10, s.y - 10, 20, 20, e.x, e.y, e.w, e.h)) continue;
        e.flat = this.kid.stompTime + 0.4;
        this.addScore(250, e.x, e.y, "SPUD");
        this.explode(e.x + e.w / 2, e.y + e.h / 2);
        return false;
      }
      const b = this.world.boss;
      if (b?.alive && b.hurt <= 0 && overlap(s.x - 10, s.y - 10, 20, 20, b.x, b.y, b.w, b.h)) {
        b.hp -= 1;
        b.hurt = 0.7;
        sfx.bossHit();
        this.addScore(350, b.x, b.y, "KING HIT");
        this.explode(s.x, s.y);
        if (b.hp <= 0) {
          b.alive = false;
          this.world.lockedDoor = false;
          this.float(b.x, b.y, "KING DOWN!", "#ffe566");
          this.addScore(2000, b.x, b.y, "BOSS");
        }
        return false;
      }
      return true;
    });
    this.booms = this.booms.filter((b) => {
      b.life -= dt;
      return b.life > 0;
    });
  }

  private explode(x: number, y: number): void {
    this.booms.push({ x, y, life: 0.28, max: 0.28 });
    this.shake = Math.max(this.shake, 0.18);
    sfx.boom();
    this.burst(x, y, "#ff9a1f", 16);
    this.burst(x, y, "#fff4c2", 8);
  }

  private stepMovers(dt: number): void {
    this.ride = null;
    for (const m of this.world.movers) {
      const before = m.axis === "x" ? m.x : m.y;
      const next = before + m.speed * m.dir * dt;
      if (next < m.min || next > m.max) m.dir *= -1;
      if (m.axis === "x") m.x += m.speed * m.dir * dt;
      else m.y += m.speed * m.dir * dt;
      const feet = this.y + this.kid.h;
      if (
        this.vy >= 0 &&
        feet >= m.y - 8 &&
        feet <= m.y + 16 &&
        this.x + this.kid.w > m.x &&
        this.x < m.x + m.w
      ) {
        this.ride = m;
        this.y = m.y - this.kid.h;
        this.vy = 0;
        this.onGround = true;
        if (m.axis === "x") this.x += m.speed * m.dir * dt;
        else this.y += m.speed * m.dir * dt;
      }
    }
  }

  private solids(): Platform[] {
    return [...this.platforms, ...this.world.movers];
  }

  private move(dx: number, dy: number): void {
    this.x += dx;
    this.x = clamp(this.x, 8, this.world.w - this.kid.w - 8);
    for (const p of this.solids()) {
      if (p.oneWay) continue;
      if (!overlap(this.x, this.y, this.kid.w, this.kid.h, p.x, p.y, p.w, p.h)) continue;
      if (dx > 0) this.x = p.x - this.kid.w;
      else if (dx < 0) this.x = p.x + p.w;
    }

    const wasGround = this.onGround;
    if (!this.ride) this.onGround = false;
    this.y += dy;
    for (const p of this.solids()) {
      if (!overlap(this.x, this.y, this.kid.w, this.kid.h, p.x, p.y, p.w, p.h)) continue;
      if (p.oneWay) {
        const feet = this.y + this.kid.h;
        if (dy >= 0 && feet - dy <= p.y + 10) {
          this.y = p.y - this.kid.h;
          this.vy = 0;
          this.onGround = true;
        }
        continue;
      }
      if (dy > 0 && this.y + this.kid.h - p.y < p.h + 12) {
        this.y = p.y - this.kid.h;
        this.vy = 0;
        this.onGround = true;
      } else if (dy < 0) {
        this.y = p.y + p.h;
        this.vy = 0;
      }
    }
    if (this.onGround) {
      this.airUsed = false;
      if (this.pound) {
        this.pound = false;
        this.shake = 0.22;
        this.landSquash = 0.18;
        sfx.stomp();
        this.burst(this.x + this.kid.w / 2, this.y + this.kid.h, "#f3d27a", 16);
        for (const e of this.leps) {
          if (e.flat > 0) continue;
          if (Math.abs(e.x - this.x) < 120 && Math.abs(e.y - this.y) < 90) {
            e.flat = this.kid.stompTime;
            this.addScore(150, e.x, e.y, "BOOM");
          }
        }
      }
      if (!wasGround) {
        this.landSquash = 0.1;
        this.burst(this.x + this.kid.w / 2, this.y + this.kid.h, "#6b8f3a", 5);
      }
    }
  }

  private touchSprings(): void {
    for (const s of this.world.springs) {
      if (!overlap(this.x, this.y, this.kid.w, this.kid.h, s.x, s.y, s.w, s.h)) continue;
      if (this.vy < -20) continue;
      this.vy = -s.boost;
      this.onGround = false;
      this.airUsed = false;
      sfx.spring();
      this.shake = 0.1;
      this.burst(s.x + 22, s.y, "#ff6b8a", 10);
      this.float(s.x, s.y - 20, "BOING!", "#ff6b8a");
    }
  }

  private touchPickups(): void {
    for (const p of this.world.pickups) {
      if (p.taken) continue;
      if (!overlap(this.x, this.y, this.kid.w, this.kid.h, p.x, p.y, 30, 30)) continue;
      p.taken = true;
      if (p.kind === "star") {
        this.star = 6.5;
        sfx.star();
        this.float(p.x, p.y, "STAR!", "#ffe566");
      } else if (p.kind === "shamrock") {
        this.maxHearts += 1;
        this.hearts = Math.min(this.maxHearts, this.hearts + 1);
        sfx.collect();
        this.float(p.x, p.y, "+♥", "#8fd14f");
      } else {
        this.addScore(500, p.x, p.y, "GOLD");
        sfx.gold();
      }
      this.burst(p.x + 14, p.y + 14, "#ffe566", 14);
      this.hud();
    }
  }

  private touchPotatoes(): void {
    for (const p of this.potatoes) {
      if (p.taken) continue;
      if (!overlap(this.x, this.y, this.kid.w, this.kid.h, p.x, p.y, 28, 28)) continue;
      p.taken = true;
      this.ammo += p.gold ? 2 : 1;
      const pts = (p.gold ? 300 : 100) * (1 + this.combo);
      this.addScore(pts, p.x, p.y, p.gold ? "GOLD SPUD" : "+");
      if (p.gold) sfx.gold();
      else sfx.collect();
      this.burst(p.x + 14, p.y + 14, "#f3d27a", 10);
      this.hud();
      if (navigator.vibrate) navigator.vibrate(12);
    }
  }

  private touchChecks(): void {
    for (const c of this.world.checks) {
      if (c.got) continue;
      if (!overlap(this.x, this.y, this.kid.w, this.kid.h, c.x, c.y, 28, 64)) continue;
      c.got = true;
      this.spawnX = c.x;
      this.spawnY = GROUND - this.kid.h;
      sfx.checkpoint();
      this.float(c.x, c.y, "SAVE!", "#9fd4e8");
      this.burst(c.x + 10, c.y + 20, "#9fd4e8", 12);
    }
  }

  private touchLeps(dt: number): void {
    for (const e of this.leps) {
      if (e.flat > 0) {
        e.flat -= dt;
        continue;
      }
      if (e.fly) {
        e.x += e.vx * dt;
        e.y += e.vy * dt;
        if (e.x < e.left || e.x + e.w > e.right) e.vx *= -1;
        if (e.y < e.top || e.y + e.h > e.bot) e.vy *= -1;
      } else {
        e.x += e.vx * dt;
        if (e.x < e.left) {
          e.x = e.left;
          e.vx = Math.abs(e.vx);
        } else if (e.x + e.w > e.right) {
          e.x = e.right - e.w;
          e.vx = -Math.abs(e.vx);
        }
        e.y += 400 * dt;
        for (const p of this.solids()) {
          if (p.kind === "ceiling") continue;
          if (!overlap(e.x, e.y, e.w, e.h, p.x, p.y, p.w, p.h)) continue;
          if (e.y + e.h - p.y < 28) e.y = p.y - e.h;
        }
      }

      if (!overlap(this.x, this.y, this.kid.w, this.kid.h, e.x, e.y, e.w, e.h)) continue;
      const feet = this.y + this.kid.h;
      const stomped = (this.vy > 50 || this.pound) && feet < e.y + 26;
      if (stomped || this.star > 0 || this.dashT > 0) {
        e.flat = this.kid.stompTime;
        if (stomped) this.vy = -this.kid.jump * this.kid.bounce * 0.72;
        sfx.stomp();
        this.addScore(200, e.x, e.y, "STOMP");
        this.burst(e.x + e.w / 2, e.y, "#8fd14f", 10);
        this.airUsed = false;
      } else {
        this.damage();
      }
    }
  }

  private touchBoss(dt: number): void {
    const b = this.world.boss;
    if (!b || !b.alive) return;
    b.hurt = Math.max(0, b.hurt - dt);
    b.jumpT -= dt;
    b.throwT -= dt;
    b.x += b.vx * dt;
    if (b.x < 3920) {
      b.x = 3920;
      b.vx = Math.abs(b.vx);
    }
    if (b.x + b.w > 4700) {
      b.x = 4700 - b.w;
      b.vx = -Math.abs(b.vx);
    }
    b.vy = Math.min(980, b.vy + 1600 * dt);
    b.y += b.vy * dt;
    if (b.y + b.h > GROUND) {
      b.y = GROUND - b.h;
      b.vy = 0;
    }
    if (b.jumpT <= 0) {
      b.vy = -720;
      b.jumpT = 2.1;
    }
    if (b.throwT <= 0) {
      b.throwT = 1.6;
      this.shots.push({
        x: b.x + b.w / 2,
        y: b.y + 30,
        vx: this.x < b.x ? -240 : 240,
        vy: -220,
        life: 2.4,
      });
    }
    if (!overlap(this.x, this.y, this.kid.w, this.kid.h, b.x, b.y, b.w, b.h)) return;
    const feet = this.y + this.kid.h;
    const stomped = (this.vy > 40 || this.pound) && feet < b.y + 36;
    if ((stomped || this.star > 0) && b.hurt <= 0) {
      b.hp -= 1;
      b.hurt = 0.9;
      this.vy = -this.kid.jump * 0.7;
      this.shake = 0.28;
      sfx.bossHit();
      this.addScore(400, b.x, b.y, "KING HIT");
      this.burst(b.x + b.w / 2, b.y, "#c41e3a", 18);
      if (b.hp <= 0) {
        b.alive = false;
        this.world.lockedDoor = false;
        this.float(b.x, b.y, "KING DOWN!", "#ffe566");
        this.addScore(2000, b.x, b.y, "BOSS");
      }
    } else if (b.hurt <= 0 && this.star <= 0) {
      this.damage();
    }
  }

  private touchShots(dt: number): void {
    this.shots = this.shots.filter((s) => {
      s.life -= dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.vy += 700 * dt;
      if (s.y > GROUND - 12) {
        s.y = GROUND - 12;
        s.vy *= -0.45;
      }
      if (overlap(this.x, this.y, this.kid.w, this.kid.h, s.x, s.y, 16, 16) && this.star <= 0) {
        this.damage();
        return false;
      }
      return s.life > 0;
    });
  }

  private touchDoor(): void {
    if (this.world.lockedDoor) return;
    if (this.x + this.kid.w > this.world.doorX + 20 && this.y + this.kid.h >= GROUND - 8) {
      this.won = true;
      sfx.win();
      sfx.stopMusic();
      const got = this.potatoes.filter((p) => p.taken).length;
      this.hooks.onClear(this.world.name, this.score, got, this.potatoes.length, this.world.id === 2);
    }
  }

  private damage(): void {
    if (this.hurt > 0 || this.won || this.dead || this.star > 0) return;
    this.hearts -= 1;
    this.hurt = 1.35;
    this.vx = -this.facing * 180;
    this.vy = -240;
    this.combo = 0;
    this.shake = 0.2;
    sfx.hurt();
    this.hud();
    if (navigator.vibrate) navigator.vibrate([20, 40, 20]);
    if (this.hearts <= 0) {
      this.dead = true;
      sfx.stopMusic();
      this.hooks.onLose();
    }
  }

  private addScore(n: number, x: number, y: number, label: string): void {
    this.combo += 1;
    this.comboT = 1.8;
    this.score += n;
    this.float(x, y, `${label} ${n}`, "#fff6e4");
    this.hud();
  }

  private float(x: number, y: number, text: string, color: string): void {
    this.floats.push({ x, y, text, life: 0.9, color });
  }

  private burst(x: number, y: number, color: string, n: number): void {
    for (let i = 0; i < n; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 220,
        vy: -40 - Math.random() * 180,
        life: 0.35 + Math.random() * 0.3,
        max: 0.7,
        color,
        size: 3 + Math.random() * 5,
      });
    }
  }

  private stepParticles(dt: number): void {
    this.particles = this.particles.filter((p) => {
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 420 * dt;
      return p.life > 0;
    });
  }

  private stepFloats(dt: number): void {
    this.floats = this.floats.filter((f) => {
      f.life -= dt;
      f.y -= 36 * dt;
      return f.life > 0;
    });
  }

  private draw(): void {
    const ctx = this.ctx;
    const dpr = this.canvas.width / Math.max(1, this.viewW);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, this.viewW, this.viewH);
    const jx = this.shake > 0 ? (Math.random() - 0.5) * 10 : 0;
    const jy = this.shake > 0 ? (Math.random() - 0.5) * 8 : 0;
    ctx.save();
    ctx.translate(jx, jy);
    this.paintSky(ctx);
    this.paintParallax(ctx);
    ctx.save();
    ctx.translate(-this.camX, -this.camY);
    this.paintDecor(ctx);
    for (const p of this.platforms) this.paintPlatform(ctx, p);
    for (const m of this.world.movers) this.paintPlatform(ctx, m);
    for (const s of this.world.springs) this.paintSpring(ctx, s);
    for (const c of this.world.checks) this.paintFlag(ctx, c);
    this.paintDoor(ctx);
    for (const p of this.world.pickups) {
      if (p.taken) continue;
      this.paintPickup(ctx, p);
    }
    for (const p of this.potatoes) {
      if (p.taken) continue;
      paintSpud(ctx, this.art.potato, p.x, p.y, this.time + p.x * 0.01, p.gold);
    }
    for (const e of this.leps) this.paintLep(ctx, e);
    for (const s of this.shots) {
      ctx.fillStyle = "#ffe566";
      ctx.strokeStyle = "#2a1a0a";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(s.x, s.y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    for (const s of this.spuds) {
      paintSpud(ctx, this.art.potato, s.x - 14, s.y - 14, this.time, false, s.spin, 26);
    }
    if (this.world.boss?.alive) this.paintBoss(ctx, this.world.boss);
    this.paintKid(ctx);
    for (const b of this.booms) {
      paintBoom(ctx, b.x, b.y, 1 - b.life / b.max);
    }
    for (const p of this.particles) {
      ctx.globalAlpha = p.life / p.max;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    ctx.font = "700 16px Fredoka, sans-serif";
    for (const f of this.floats) {
      ctx.globalAlpha = Math.max(0, f.life);
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, f.x, f.y);
      ctx.globalAlpha = 1;
    }
    ctx.restore();
    if (this.combo >= 3) {
      ctx.fillStyle = "#ffe566";
      ctx.strokeStyle = "#14110d";
      ctx.lineWidth = 5;
      ctx.font = "800 28px Fredoka, sans-serif";
      ctx.strokeText(`COMBO x${this.combo}`, 16, this.viewH - 18);
      ctx.fillText(`COMBO x${this.combo}`, 16, this.viewH - 18);
    }
    this.paintScan(ctx);
    ctx.restore();
  }

  private paintScan(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = "rgba(10, 6, 2, 0.16)";
    for (let y = 0; y < this.viewH; y += 3) ctx.fillRect(0, y, this.viewW, 1);
    const g = ctx.createRadialGradient(
      this.viewW / 2,
      this.viewH / 2,
      this.viewH * 0.2,
      this.viewW / 2,
      this.viewH / 2,
      this.viewH * 0.85,
    );
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, "rgba(8,4,0,0.35)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, this.viewW, this.viewH);
  }

  private paintSky(ctx: CanvasRenderingContext2D): void {
    const g = ctx.createLinearGradient(0, 0, 0, this.viewH);
    if (this.world.theme === "mine") {
      g.addColorStop(0, "#1a1028");
      g.addColorStop(0.45, "#4a2048");
      g.addColorStop(1, "#1c2a18");
    } else if (this.world.theme === "keep") {
      g.addColorStop(0, "#3a1860");
      g.addColorStop(0.35, "#d23a5a");
      g.addColorStop(0.65, "#f0a030");
      g.addColorStop(1, "#4a6a22");
    } else {
      g.addColorStop(0, "#5ec4f0");
      g.addColorStop(0.4, "#f3d27a");
      g.addColorStop(0.7, "#7ec86a");
      g.addColorStop(1, "#3d7a28");
    }
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, this.viewW, this.viewH);
    ctx.fillStyle = this.world.theme === "mine" ? "#f4e6a0" : "#fff1a8";
    ctx.beginPath();
    ctx.arc(this.viewW * 0.78, 70, 34, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#2a1a0a";
    ctx.lineWidth = 4;
    ctx.stroke();
  }

  private paintParallax(ctx: CanvasRenderingContext2D): void {
    if (this.world.theme === "keep") {
      for (let i = 0; i < 6; i++) {
        const x = ((i * 160 - this.camX * 0.12) % (this.viewW + 180)) - 40;
        ctx.fillStyle = ["#ff5b7a", "#ffd15c", "#62e08a", "#5cc8ff", "#b57bff"][i % 5];
        ctx.globalAlpha = 0.35;
        ctx.beginPath();
        ctx.ellipse(x, 90 + (i % 3) * 16, 70, 18, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    } else {
      ctx.fillStyle = this.world.theme === "mine" ? "#6d5b9a" : "#7eb6d4";
      for (let i = 0; i < 8; i++) {
        const x = ((i * 220 - this.camX * 0.15) % (this.viewW + 240)) - 80;
        ctx.beginPath();
        ctx.ellipse(x, 70 - this.camY * 0.04, 46, 22, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.fillStyle = this.world.theme === "mine" ? "#24351f" : "#4f8f46";
    ctx.beginPath();
    ctx.moveTo(0, this.viewH);
    for (let i = 0; i <= 12; i++) {
      const x = i * (this.viewW / 12);
      const y = this.viewH * 0.62 + Math.sin(i * 0.9 + this.camX * 0.001) * 28;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(this.viewW, this.viewH);
    ctx.fill();
  }

  private paintDecor(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = this.world.theme === "mine" ? "#2f6a4a" : "#3d7a36";
    for (let x = 0; x < this.world.w; x += 28) {
      const h = 10 + ((x * 13) % 14);
      ctx.fillRect(x, GROUND - h, 6, h);
    }
    if (this.world.theme === "keep") {
      ctx.fillStyle = "#5b1d2a";
      ctx.fillRect(this.world.doorX - 140, GROUND - 220, 320, 220);
      ctx.fillStyle = "#3b1220";
      ctx.fillRect(this.world.doorX - 40, GROUND - 280, 40, 70);
      ctx.fillRect(this.world.doorX + 90, GROUND - 300, 40, 90);
    } else if (this.world.theme === "mine") {
      ctx.fillStyle = "#2a1d16";
      ctx.fillRect(this.world.doorX - 80, GROUND - 160, 190, 160);
    } else {
      ctx.fillStyle = "#c41e3a";
      ctx.fillRect(this.world.doorX - 90, GROUND - 168, 210, 168);
      ctx.fillStyle = "#9fd4e8";
      ctx.fillRect(this.world.doorX - 160, GROUND - 150, 70, 150);
      ctx.fillRect(this.world.doorX + 120, GROUND - 150, 80, 150);
    }
  }

  private paintPlatform(ctx: CanvasRenderingContext2D, p: Platform): void {
    ctx.save();
    ctx.strokeStyle = "#14110d";
    ctx.lineWidth = 5;
    ctx.lineJoin = "round";
    if (p.kind === "grass") {
      ctx.fillStyle = "#6b3f1c";
      ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.strokeRect(p.x + 2, p.y + 2, p.w - 4, p.h - 4);
      ctx.fillStyle = "#3d9a32";
      ctx.fillRect(p.x, p.y - 14, p.w, 18);
      ctx.strokeRect(p.x + 1, p.y - 14, p.w - 2, 18);
      ctx.fillStyle = "#7de05a";
      ctx.fillRect(p.x + 4, p.y - 12, p.w - 8, 6);
      ctx.restore();
      return;
    }
    if (p.kind === "ceiling") {
      ctx.fillStyle = "#3a2416";
      ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.fillStyle = "#6a4024";
      for (let i = 0; i < p.w; i += 22) ctx.fillRect(p.x + i, p.y, 10, p.h);
      ctx.strokeRect(p.x, p.y, p.w, p.h);
      ctx.restore();
      return;
    }
    const fill =
      p.kind === "stone" ? "#8a8374" : p.kind === "brick" ? "#c44b38" : p.kind === "crystal" ? "#6a58e0" : "#d4922a";
    const hi =
      p.kind === "stone" ? "#c4bba8" : p.kind === "brick" ? "#f08a6a" : p.kind === "crystal" ? "#c8b8ff" : "#ffd36a";
    ctx.fillStyle = fill;
    roundRect(ctx, p.x, p.y, p.w, p.h + 4, 5);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = hi;
    ctx.fillRect(p.x + 6, p.y + 3, p.w - 12, 5);
    ctx.fillStyle = "#14110d";
    for (let i = 10; i < p.w - 8; i += 18) {
      ctx.beginPath();
      ctx.arc(p.x + i, p.y + p.h * 0.55, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  private paintSpring(ctx: CanvasRenderingContext2D, s: { x: number; y: number; w: number; h: number }): void {
    const bounce = 1 + Math.sin(this.time * 10) * 0.08;
    ctx.fillStyle = "#222";
    ctx.fillRect(s.x + 8, s.y + 8, s.w - 16, s.h);
    ctx.fillStyle = "#ff4d6d";
    roundRect(ctx, s.x, s.y - 4 * bounce, s.w, 14, 6);
    ctx.fill();
  }

  private paintFlag(ctx: CanvasRenderingContext2D, c: { x: number; y: number; got: boolean }): void {
    ctx.fillStyle = "#f4f0e6";
    ctx.fillRect(c.x + 10, c.y, 6, 70);
    ctx.fillStyle = c.got ? "#8fd14f" : "#c41e3a";
    ctx.beginPath();
    ctx.moveTo(c.x + 16, c.y + 4);
    ctx.lineTo(c.x + 48, c.y + 16);
    ctx.lineTo(c.x + 16, c.y + 28);
    ctx.fill();
  }

  private paintPickup(ctx: CanvasRenderingContext2D, p: { x: number; y: number; kind: string }): void {
    const bob = Math.sin(this.time * 6 + p.x) * 4;
    if (p.kind === "star") {
      ctx.fillStyle = "#ffe566";
      star(ctx, p.x + 14, p.y + 14 + bob, 13, 6);
      ctx.fill();
    } else if (p.kind === "shamrock") {
      ctx.fillStyle = "#3dcc6a";
      for (const [ox, oy] of [
        [0, -6],
        [-6, 2],
        [6, 2],
      ]) {
        ctx.beginPath();
        ctx.arc(p.x + 14 + ox, p.y + 14 + oy + bob, 7, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      ctx.fillStyle = "#ffd15c";
      ctx.beginPath();
      ctx.arc(p.x + 14, p.y + 14 + bob, 10, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private paintDoor(ctx: CanvasRenderingContext2D): void {
    const x = this.world.doorX;
    const y = GROUND - 148;
    ctx.fillStyle = this.world.lockedDoor ? "#4a4a4a" : "#f4f0e6";
    ctx.fillRect(x - 10, y - 10, 96, 158);
    ctx.fillStyle = this.world.lockedDoor ? "#2b2b2b" : "#c41e3a";
    ctx.fillRect(x, y, 76, 148);
    ctx.fillStyle = "#9a1730";
    ctx.fillRect(x + 8, y + 14, 24, 40);
    ctx.fillRect(x + 44, y + 14, 24, 40);
    ctx.fillRect(x + 8, y + 66, 24, 40);
    ctx.fillRect(x + 44, y + 66, 24, 40);
    ctx.fillStyle = this.world.lockedDoor ? "#ffe566" : "#2b2b2b";
    ctx.beginPath();
    ctx.arc(x + 64, y + 80, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  private paintLep(ctx: CanvasRenderingContext2D, e: Lep): void {
    const flat = e.flat > 0;
    const h = flat ? e.h * 0.38 : e.h;
    const y = flat ? e.y + e.h - h : e.y;
    const dir = e.vx >= 0 ? 1 : -1;
    const wobble = flat ? 0 : Math.sin(this.time * 10 + e.x) * 2;
    ctx.save();
    ctx.translate(e.x + e.w / 2, y + h);
    ctx.scale(dir, 1);
    ctx.fillStyle = "#1d8a2e";
    ctx.strokeStyle = "#14110d";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(0, -h * 0.55, e.w * 0.42, h * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    paintOutlined(ctx, this.art.lep, -e.w / 2 - 2, -h - 4 + wobble, e.w + 4, h + 6);
    ctx.restore();
  }

  private paintBoss(ctx: CanvasRenderingContext2D, b: Boss): void {
    if (b.hurt > 0 && Math.floor(this.time * 20) % 2 === 0) return;
    ctx.save();
    ctx.translate(b.x + b.w / 2, b.y + b.h);
    ctx.scale(b.vx >= 0 ? 1.35 : -1.35, 1.35);
    ctx.fillStyle = "#c41e3a";
    ctx.beginPath();
    ctx.ellipse(0, -b.h * 0.4, b.w * 0.38, b.h * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
    paintOutlined(ctx, this.art.lep, -b.w / 2 / 1.35, -b.h / 1.35, b.w / 1.35, b.h / 1.35);
    ctx.restore();
    ctx.fillStyle = "#14110d";
    ctx.fillRect(b.x - 2, b.y - 18, b.w + 4, 12);
    ctx.fillStyle = "#e23d12";
    ctx.fillRect(b.x, b.y - 16, (b.w * b.hp) / b.max, 8);
  }

  private paintKid(ctx: CanvasRenderingContext2D): void {
    if (this.hurt > 0 && this.star <= 0 && Math.floor(this.time * 16) % 2 === 0) return;
    const img = kidSprite(this.art, this.kid.id);
    const run = this.onGround && Math.abs(this.vx) > 20 ? Math.sin(this.time * 18) : 0;
    const squash = this.landSquash > 0 ? 0.8 : this.vy < -80 ? 1.1 : 1;
    const stretch = this.landSquash > 0 ? 1.14 : this.vy < -80 ? 0.9 : 1;
    ctx.save();
    ctx.translate(this.x + this.kid.w / 2, this.y + this.kid.h);
    ctx.rotate(this.throwPose > 0 ? this.facing * -0.18 : 0);
    ctx.scale(this.facing * stretch, squash);
    if (this.star > 0) ctx.filter = "saturate(1.8) hue-rotate(20deg)";
    ctx.fillStyle = "#14110d";
    ctx.beginPath();
    ctx.ellipse(0, -6, this.kid.w * 0.55, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    paintOutlined(ctx, img, -this.kid.w / 2 - 6, -this.kid.h - 8 + run * 2, this.kid.w + 12, this.kid.h + 10);
    ctx.restore();
  }
}

function overlap(
  ax: number,
  ay: number,
  aw: number,
  ah: number,
  bx: number,
  by: number,
  bw: number,
  bh: number,
): boolean {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function star(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, n: number): void {
  ctx.beginPath();
  for (let i = 0; i < n * 2; i++) {
    const rad = i % 2 === 0 ? r : r * 0.45;
    const a = (i * Math.PI) / n - Math.PI / 2;
    const px = x + Math.cos(a) * rad;
    const py = y + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

import { sfx } from "./audio.ts";
import type { InputState } from "./input.ts";
import {
  GROUND,
  KIDS,
  WORLD_H,
  WORLD_W,
  makeLevel,
  type KidId,
  type KidStats,
  type Lep,
  type Platform,
  type Potato,
} from "./level.ts";
import { kidSprite, type Art } from "./sprites.ts";

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

export type GameHooks = {
  onHud: (hearts: number, max: number, got: number, total: number, name: string) => void;
  onWin: (got: number, total: number) => void;
  onLose: () => void;
};

export class SpudGame {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private art: Art;
  private hooks: GameHooks;
  private input: InputState;
  private kid: KidStats;
  private platforms: Platform[] = [];
  private potatoes: Potato[] = [];
  private leps: Lep[] = [];
  private doorX = 0;
  private x = 80;
  private y = GROUND - 68;
  private vx = 0;
  private vy = 0;
  private facing = 1;
  private onGround = false;
  private coyote = 0;
  private jumpBuf = 0;
  private hearts = 3;
  private hurt = 0;
  private won = false;
  private dead = false;
  private camX = 0;
  private camY = 0;
  private viewW = 420;
  private viewH = 640;
  private particles: Particle[] = [];
  private time = 0;
  private last = 0;
  private raf = 0;
  private running = false;

  constructor(canvas: HTMLCanvasElement, art: Art, hooks: GameHooks, input: InputState) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D missing");
    this.ctx = ctx;
    this.art = art;
    this.hooks = hooks;
    this.input = input;
    this.kid = KIDS.boots;
  }

  start(id: KidId): void {
    this.kid = KIDS[id];
    const level = makeLevel();
    this.platforms = level.platforms;
    this.potatoes = level.potatoes;
    this.leps = level.leps;
    this.doorX = level.doorX;
    this.x = 90;
    this.y = GROUND - this.kid.h;
    this.vx = 0;
    this.vy = 0;
    this.facing = 1;
    this.onGround = true;
    this.coyote = 0;
    this.jumpBuf = 0;
    this.hearts = this.kid.hearts;
    this.hurt = 0;
    this.won = false;
    this.dead = false;
    this.camX = 0;
    this.camY = 80;
    this.particles = [];
    this.time = 0;
    this.last = performance.now();
    this.running = true;
    this.hud();
    this.resize();
    cancelAnimationFrame(this.raf);
    this.raf = requestAnimationFrame((t) => this.frame(t));
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  resume(): void {
    if (this.running || this.won || this.dead) return;
    this.running = true;
    this.last = performance.now();
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
    this.hooks.onHud(this.hearts, this.kid.hearts, got, this.potatoes.length, this.kid.name);
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
    this.coyote = this.onGround ? 0.1 : Math.max(0, this.coyote - dt);
    if (input.jumpPressed) this.jumpBuf = 0.12;
    this.jumpBuf = Math.max(0, this.jumpBuf - dt);
    input.jumpPressed = false;

    const accel = this.kid.speed * 8;
    if (input.left && !input.right) {
      this.vx = Math.max(this.vx - accel * dt, -this.kid.speed);
      this.facing = -1;
    } else if (input.right && !input.left) {
      this.vx = Math.min(this.vx + accel * dt, this.kid.speed);
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
      sfx.jump();
      this.burst(this.x + this.kid.w / 2, this.y + this.kid.h, "#f3d27a", 6);
      if (navigator.vibrate) navigator.vibrate(8);
    }

    // Phone players tap JUMP. Do not cut velocity on release or a tap
    // never reaches the second-level platforms.
    this.vy = Math.min(980, this.vy + 1480 * dt);
    this.move(this.vx * dt, this.vy * dt);

    if (this.y > WORLD_H + 40) {
      this.damage();
      this.x = Math.max(40, this.x - 180);
      this.y = GROUND - this.kid.h - 8;
      this.vy = 0;
    }

    this.touchPotatoes();
    this.touchLeps(dt);
    this.touchDoor();
    this.stepParticles(dt);

    const targetX = this.x - this.viewW * 0.34;
    const targetY = this.y - this.viewH * 0.55;
    this.camX += (targetX - this.camX) * Math.min(1, dt * 8);
    this.camY += (targetY - this.camY) * Math.min(1, dt * 6);
    this.camX = clamp(this.camX, 0, WORLD_W - this.viewW);
    this.camY = clamp(this.camY, 0, WORLD_H - this.viewH);
  }

  private move(dx: number, dy: number): void {
    this.x += dx;
    this.x = clamp(this.x, 8, WORLD_W - this.kid.w - 8);
    for (const p of this.platforms) {
      if (p.oneWay) continue;
      if (!overlap(this.x, this.y, this.kid.w, this.kid.h, p.x, p.y, p.w, p.h)) continue;
      if (dx > 0) this.x = p.x - this.kid.w;
      else if (dx < 0) this.x = p.x + p.w;
    }

    const wasGround = this.onGround;
    this.onGround = false;
    this.y += dy;
    for (const p of this.platforms) {
      if (!overlap(this.x, this.y, this.kid.w, this.kid.h, p.x, p.y, p.w, p.h)) continue;
      if (p.oneWay) {
        const feet = this.y + this.kid.h;
        if (dy >= 0 && feet - dy <= p.y + 8) {
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
    if (this.onGround && !wasGround) {
      this.burst(this.x + this.kid.w / 2, this.y + this.kid.h, "#6b8f3a", 4);
    }
  }

  private touchPotatoes(): void {
    for (const p of this.potatoes) {
      if (p.taken) continue;
      if (!overlap(this.x, this.y, this.kid.w, this.kid.h, p.x, p.y, 28, 28)) continue;
      p.taken = true;
      sfx.collect();
      this.burst(p.x + 14, p.y + 14, "#f3d27a", 10);
      this.hud();
      if (navigator.vibrate) navigator.vibrate(12);
    }
  }

  private touchLeps(dt: number): void {
    for (const e of this.leps) {
      if (e.flat > 0) {
        e.flat -= dt;
        continue;
      }
      e.x += e.vx * dt;
      if (e.x < e.left) {
        e.x = e.left;
        e.vx = Math.abs(e.vx);
      } else if (e.x + e.w > e.right) {
        e.x = e.right - e.w;
        e.vx = -Math.abs(e.vx);
      }
      e.y += 400 * dt;
      for (const p of this.platforms) {
        if (p.kind === "ceiling") continue;
        if (!overlap(e.x, e.y, e.w, e.h, p.x, p.y, p.w, p.h)) continue;
        if (e.y + e.h - p.y < 28) e.y = p.y - e.h;
      }

      if (!overlap(this.x, this.y, this.kid.w, this.kid.h, e.x, e.y, e.w, e.h)) continue;
      const feet = this.y + this.kid.h;
      const stomped = this.vy > 60 && feet < e.y + 22;
      if (stomped) {
        e.flat = this.kid.stompTime;
        this.vy = -this.kid.jump * this.kid.bounce * 0.72;
        sfx.stomp();
        this.burst(e.x + e.w / 2, e.y, "#8fd14f", 8);
      } else {
        this.damage();
      }
    }
  }

  private touchDoor(): void {
    if (this.x + this.kid.w > this.doorX + 20 && this.y + this.kid.h >= GROUND - 4) {
      this.won = true;
      sfx.win();
      const got = this.potatoes.filter((p) => p.taken).length;
      this.hooks.onWin(got, this.potatoes.length);
    }
  }

  private damage(): void {
    if (this.hurt > 0 || this.won || this.dead) return;
    this.hearts -= 1;
    this.hurt = 1.35;
    this.vx = -this.facing * 180;
    this.vy = -240;
    sfx.hurt();
    this.hud();
    if (navigator.vibrate) navigator.vibrate([20, 40, 20]);
    if (this.hearts <= 0) {
      this.dead = true;
      this.hooks.onLose();
    }
  }

  private burst(x: number, y: number, color: string, n: number): void {
    for (let i = 0; i < n; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 180,
        vy: -40 - Math.random() * 140,
        life: 0.35 + Math.random() * 0.25,
        max: 0.6,
        color,
        size: 3 + Math.random() * 4,
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

  private draw(): void {
    const ctx = this.ctx;
    const dpr = this.canvas.width / Math.max(1, this.viewW);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, this.viewW, this.viewH);

    const camX = this.camX;
    const camY = this.camY;
    this.paintSky(ctx);
    this.paintHills(ctx, camX, camY);

    ctx.save();
    ctx.translate(-camX, -camY);
    this.paintDecor(ctx);
    for (const p of this.platforms) this.paintPlatform(ctx, p);
    this.paintDoor(ctx);
    for (const p of this.potatoes) {
      if (p.taken) continue;
      const bob = Math.sin(this.time * 5 + p.x * 0.02) * 5;
      ctx.drawImage(this.art.potato, p.x, p.y + bob, 28, 28);
    }
    for (const e of this.leps) this.paintLep(ctx, e);
    this.paintKid(ctx);
    for (const p of this.particles) {
      ctx.globalAlpha = p.life / p.max;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }

  private paintSky(ctx: CanvasRenderingContext2D): void {
    const g = ctx.createLinearGradient(0, 0, 0, this.viewH);
    g.addColorStop(0, "#8fd4ea");
    g.addColorStop(0.55, "#bfe6c8");
    g.addColorStop(1, "#6aa84f");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, this.viewW, this.viewH);
  }

  private paintHills(ctx: CanvasRenderingContext2D, camX: number, camY: number): void {
    ctx.fillStyle = "#7eb6d4";
    for (let i = 0; i < 8; i++) {
      const x = ((i * 220 - camX * 0.15) % (this.viewW + 240)) - 80;
      const y = 70 - camY * 0.04;
      ctx.beginPath();
      ctx.ellipse(x, y, 46, 22, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "#4f8f46";
    ctx.beginPath();
    ctx.moveTo(0, this.viewH);
    for (let i = 0; i <= 12; i++) {
      const x = i * (this.viewW / 12);
      const y = this.viewH * 0.62 + Math.sin(i * 0.9 + camX * 0.001) * 28;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(this.viewW, this.viewH);
    ctx.fill();
  }

  private paintDecor(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = "#3d7a36";
    for (let x = 0; x < WORLD_W; x += 28) {
      const h = 10 + ((x * 13) % 14);
      ctx.fillRect(x, GROUND - h, 6, h);
    }
    ctx.fillStyle = "#c41e3a";
    ctx.fillRect(this.doorX - 90, GROUND - 168, 210, 168);
    ctx.fillStyle = "#9fd4e8";
    ctx.fillRect(this.doorX - 160, GROUND - 150, 70, 150);
    ctx.fillRect(this.doorX + 120, GROUND - 150, 80, 150);
  }

  private paintPlatform(ctx: CanvasRenderingContext2D, p: Platform): void {
    if (p.kind === "grass") {
      ctx.fillStyle = "#5a3a1c";
      ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.fillStyle = "#4fa64a";
      ctx.fillRect(p.x, p.y - 10, p.w, 16);
      ctx.fillStyle = "#6bc45c";
      ctx.fillRect(p.x, p.y - 14, p.w, 8);
      return;
    }
    if (p.kind === "ceiling") {
      ctx.fillStyle = "#6b4a2a";
      ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.fillStyle = "#8a6236";
      for (let i = 0; i < p.w; i += 24) ctx.fillRect(p.x + i, p.y, 12, p.h);
      return;
    }
    ctx.fillStyle = p.kind === "stone" ? "#8d8678" : "#c48a3a";
    roundRect(ctx, p.x, p.y, p.w, p.h, 6);
    ctx.fill();
    ctx.fillStyle = p.kind === "stone" ? "#a39c8e" : "#e0b25a";
    ctx.fillRect(p.x + 4, p.y + 3, p.w - 8, 5);
  }

  private paintDoor(ctx: CanvasRenderingContext2D): void {
    const x = this.doorX;
    const y = GROUND - 148;
    ctx.fillStyle = "#f4f0e6";
    ctx.fillRect(x - 10, y - 10, 96, 158);
    ctx.fillStyle = "#c41e3a";
    ctx.fillRect(x, y, 76, 148);
    ctx.fillStyle = "#9a1730";
    ctx.fillRect(x + 8, y + 14, 24, 40);
    ctx.fillRect(x + 44, y + 14, 24, 40);
    ctx.fillRect(x + 8, y + 66, 24, 40);
    ctx.fillRect(x + 44, y + 66, 24, 40);
    ctx.fillStyle = "#2b2b2b";
    ctx.beginPath();
    ctx.arc(x + 64, y + 80, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  private paintLep(ctx: CanvasRenderingContext2D, e: Lep): void {
    const flat = e.flat > 0;
    const h = flat ? e.h * 0.38 : e.h;
    const y = flat ? e.y + e.h - h : e.y;
    const dir = e.vx >= 0 ? 1 : -1;
    ctx.save();
    ctx.translate(e.x + e.w / 2, y + h);
    ctx.scale(dir, 1);
    ctx.drawImage(this.art.lep, -e.w / 2, -h, e.w, h);
    ctx.restore();
  }

  private paintKid(ctx: CanvasRenderingContext2D): void {
    if (this.hurt > 0 && Math.floor(this.time * 16) % 2 === 0) return;
    const img = kidSprite(this.art, this.kid.id);
    const bob = this.onGround && Math.abs(this.vx) > 20 ? Math.sin(this.time * 18) * 2 : 0;
    ctx.save();
    ctx.translate(this.x + this.kid.w / 2, this.y + this.kid.h);
    ctx.scale(this.facing, 1);
    ctx.drawImage(img, -this.kid.w / 2 - 4, -this.kid.h - 6 + bob, this.kid.w + 8, this.kid.h + 8);
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

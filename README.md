# Splash Squad

Phone-first arcade platformer. Mallory, Luke, Connor, and Pipey soak evil surfer dudes with water balloons.

**GitHub:** [github.com/rmcnally11/splash-squad](https://github.com/rmcnally11/splash-squad)

**Play:** [spud-squad.vercel.app](https://spud-squad.vercel.app) (same live URL while we keep the Vercel project)

## Play locally

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:43173](http://127.0.0.1:43173).

Thumbs: **◀ / ▶**, **JUMP**, **TOSS**, and **SUPER** when you have a soak. Air JUMP is that kid’s trick. Keyboard: arrows or WASD, space to jump, **J** / **F** to throw, **G** or **Shift** to soak the screen.

Hold **TOSS** when you have the balloon gun to keep firing.

Want the gun and a nuke immediately? Add `?kit=1` to the URL.

## Weapons

1. **TOSS** — one water balloon
2. **RAPID** — faster shots
3. **SPREAD** — three-way splash
4. **SOAK** — bigger burst, extra King damage
5. **GUN** — brown crate. Hold to spray

A glowing **super soak** nukes every dude on camera. The Surf King still takes a chunk.

Collect balloons for ammo. Icy gold balloons give more.

## Enemies

Evil surfer dudes. Some take more than one hit — they flash, show a life bar, then flatten.

| Enemy | Hits | Notes |
| --- | --- | --- |
| Regular dude | 1–2 | Teal shorts |
| Swift | 2 | Purple, faster |
| Flyer | 2–3 | On a board in the air |
| Bruiser | 3 | Red, huge, slow |
| Gold shades | 4 | Armored |
| Surf King | 4, then 8 | Pipeline and Wipeout Peak |

## Worlds

1. **Tide Pool**
2. **Boardwalk**
3. **Pipeline** — Surf King, four hits
4. **Kelp Caves**
5. **Gold Coast**
6. **Wipeout Peak** — Surf King, eight hits

## Publish

Vite app. Output is `dist`. Link this GitHub repo in Vercel (framework **Vite**, output `dist`) so every push ships the cartoons, family photo, and game together.

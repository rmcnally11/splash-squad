# Spud Squad

A phone-first arcade platformer starring three kids. Jump, stomp, **throw potatoes**, and blast leprechauns across **three worlds**, then knock the King down at Rainbow Keep.

## Play

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:43173](http://127.0.0.1:43173).

On a phone: hold **◀ / ▶**, tap **JUMP**, and tap **SPUD** to throw. Air-tap JUMP for that kid’s trick. Keyboard: arrows or WASD, space to jump, **J** / **F** to throw.

## The kids

| Kid | Trick | How they play |
| --- | --- | --- |
| **Boots** | Air jump | Second leap in the air. Highest bounce off a hat. |
| **Ace** | Ground pound | Air JUMP while falling slams the ground and flattens nearby hats. Extra heart. |
| **Pip** | Dash | Air JUMP rockets sideways. Fastest. Fits under low beams. |

## Worlds

1. **Potato Patch** — sunny fields, springs, a moving ledge, flying hats.
2. **Lucky Mine** — glow crystals, low ceilings, more flyers.
3. **Rainbow Keep** — castle climb. Stomp the King three times to unlock the door.

Grab potatoes (gold ones score more), shamrocks for an extra heart, and stars for a short invincible rush. Flags save your spot. All hearts gone is a catch — retry the same world or switch kids.

## Build

```bash
npm run build
npm run preview
```

## Publish

This is a Vite app. `index.html` must sit at the project root. A Vercel upload that is missing that file dies in `vite build` with `UNRESOLVED_ENTRY`.

`rmcnally11/spud-squad` is still empty, and the Vercel project is **not git-linked**. Until you push this repo there and connect it in Vercel (Project → Git), every production upload is a one-off file deploy.

```bash
git remote add github https://github.com/rmcnally11/spud-squad.git
git push -u github cursor/spud-squad-game-48fc:main
```

Then in Vercel: import `rmcnally11/spud-squad`, framework Vite, output `dist`.

# Spud Squad

Phone-first arcade platformer. Cartoon kids, potato guns, three worlds, King at Rainbow Keep.

## Play locally (full cartoon art)

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:43173](http://127.0.0.1:43173).

Thumbs: **◀ / ▶**, **JUMP**, **SPUD**. Air JUMP is that kid’s trick. Keyboard: arrows or WASD, space to jump, **J** / **F** to throw.

## Weapons

Start with a single **SPUD**. Grab the red **blaster crate** to upgrade:

1. **SPUD** — one potato
2. **RAPID** — faster shots
3. **SPREAD** — three-way blast
4. **HOT SPUD** — bigger bomb, extra King damage

Collect potatoes for ammo. Gold spuds give more.

## The kids

| Kid | Trick |
| --- | --- |
| **Boots** | Air jump — second leap. Highest hat bounce. |
| **Ace** | Ground pound. Extra heart. |
| **Pip** | Dash. Fastest. Fits under beams. |

## Worlds

1. **Potato Patch**
2. **Lucky Mine**
3. **Rainbow Keep** — stomp the King three times

## Publish the full game

Do **not** use tiny one-off file uploads. Those drop `/art` and you get boxes instead of cartoons.

From this folder, after `npm run build`:

```bash
npx vercel deploy dist --yes
```

Or push the repo to GitHub and link that repo in Vercel (framework **Vite**, output `dist`). Then every push ships the cartoon PNGs, the family photo, and the game together.

```bash
git remote add github https://github.com/rmcnally11/spud-squad.git
git push -u github cursor/spud-squad-game-48fc:main
```

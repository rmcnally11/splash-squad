# Spud Squad

Phone-first arcade platformer. Cartoon kids, bigger leprechauns, six worlds, a potato gun, and a super potato that nukes the screen.

## Play locally

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:43173](http://127.0.0.1:43173).

Thumbs: **◀ / ▶**, **JUMP**, **SPUD**, and **SUPER** when you have a nuke. Air JUMP is that kid’s trick. Keyboard: arrows or WASD, space to jump, **J** / **F** to throw, **G** or **Shift** to nuke.

Hold **SPUD** when you have the potato gun to keep firing.

## Weapons

Start with a single **SPUD**. Grab crates to upgrade:

1. **SPUD** — one potato
2. **RAPID** — faster shots
3. **SPREAD** — three-way blast
4. **HOT SPUD** — bigger bomb, extra King damage
5. **GUN** — brown crate. Hold to spray fast, flat shots

A glowing **super potato** gives one screen nuke. Enemies on camera go down. The King still takes a chunk.

Collect potatoes for ammo. Gold spuds give more.

## Enemies

Hats are bigger now, and some take more than one hit — like TMNT. They flash, show a life bar, then flatten.

| Enemy | Hits | Notes |
| --- | --- | --- |
| Green hat | 1–2 | Regular walker, bigger than before |
| Swift | 2 | Purple, faster |
| Flyer | 2–3 | Floats on a path |
| Bruiser | 3 | Red, huge, slow |
| Gold hat | 4 | Armored |
| King | 4, then 8 | World 3 and world 6 |

Stomps, potatoes, Luke’s pound, and Pipey’s bark all chip health. Pound and star hits do two.

## The kids

| Kid | Trick |
| --- | --- |
| **Mallory** | Air jump — second leap. Highest hat bounce. |
| **Luke** | Ground pound. Extra heart. |
| **Connor** | Dash. Fastest. Fits under beams. |

The family photo is baked in: title shot plus Mallory, Luke, and Connor portraits. In the run they use the cartoon bodies.

**Pipey** follows, snags nearby potatoes, and barks hats for one hit.

World unlocks and best scores stay on the device. Switch apps and the run pauses.

## Worlds

1. **Potato Patch** — learn the tricks, meet a bruiser
2. **Lucky Mine** — two-hit flyers, first super potato
3. **Rainbow Keep** — King, four hits
4. **Shamrock Bog** — bruiser gauntlet
5. **Gold Vault** — four-hit armored hats
6. **Kingpin Castle** — every type, King takes eight

## Publish the full game

Do **not** use tiny one-off file uploads. Those drop `/art` and you get boxes instead of cartoons.

From this folder, after `npm run build`:

```bash
npx vercel deploy dist --yes
```

Or push the repo to GitHub and link that repo in Vercel (framework **Vite**, output `dist`). Then every push ships the cartoon PNGs, the family photo, and the game together.

# Twin Views — Spot the Difference

[![make.fun](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/sage-otter-44/best-spot-the-difference-game-20261121-0451/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/sage-otter-44/best-spot-the-difference-game-20261121-0451/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

A complete spot-the-difference game that runs from plain static files — no
build step, no network. Two hand-drawn scenes side by side, click the
differences, beat the clock.

## Play

Open `game/index.html` in desktop Chrome (or serve `game/` with any static
server). Pick a level, then click a difference on either panel to mark it on
both. Find them all before the timer runs out.

- **3 scenes, 3 difficulties** — Sunny Park (5 differences, easy), Night
  Market (7, medium), Harbor Dawn (10, hard). Every scene is drawn by the
  game's own canvas code; every difference is planted by design.
- **Hints** — press `H` or the Hint button (3 per level): a pulsing ring
  points at one difference you haven't found yet.
- **Timer pressure** — each level has its own countdown; a wrong click costs
  3 seconds. The bar turns red under 30 seconds.
- **Score** — 100 points per find, plus a time bonus when you clear a level.
  Three stars for a clean, fast run.

Keys: `1` / `2` / `3` pick a level, `H` hint, `R` restart, `Esc` menu,
`Enter` start.

## Files

- `game/index.html` — page, panels and HUD
- `game/styles.css` — all styling
- `game/scenes.js` — the three hand-drawn scenes and their differences
- `game/game.js` — state, timer, hints, scoring and input
- `game/audio.js` — small WebAudio chimes (no audio files)
- `game/main.js` — boot, URL options (`?level=`, `?demo=`, `?autotest=`)
- `main.ts` — hands the game in: copies `game/` and `screenshots/` to
  `/output` and writes `dossier.json`
- `screenshots/` — real renders of the game in a browser

All art is original, drawn in code. No images, fonts or libraries are loaded
from anywhere — the game works fully offline.

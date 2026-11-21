// Twin Views — boot: wires the DOM to the game, runs the frame loop, and
// reads the URL options the maker uses for screenshots and self-tests:
//   ?level=0|1|2   start on that level
//   ?demo=N        start with N differences already found (photo mode)
//   ?demo=all      start already won, for the victory screenshot
//   ?hint=1        show a hint ring right away (photo mode)
//   ?autotest=1    play itself: click every difference, then one wrong spot,
//                  and write the result into #autotest-result

import { SCENES } from './scenes.js';
import { TwinViewsGame } from './game.js';

const $ = (id) => document.getElementById(id);

const game = new TwinViewsGame({
  canvasA: $('canvas-a'),
  canvasB: $('canvas-b'),
});

const fmtTime = (sec) => {
  const s = Math.max(0, Math.ceil(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

// -- HUD --------------------------------------------------------------------

function syncHudView(patch) {
  if (patch.levelName !== undefined) $('level-name').textContent = patch.levelName;
  if (patch.found !== undefined) $('found-count').textContent = `${patch.found} / ${patch.total}`;
  if (patch.left !== undefined) $('left-count').textContent = String(patch.left);
  if (patch.score !== undefined) $('score').textContent = String(patch.score);
  if (patch.hintsLeft !== undefined) {
    $('hints-left').textContent = String(patch.hintsLeft);
    $('btn-hint').disabled = patch.hintsLeft <= 0 || patch.state !== 'playing';
  }
  if (patch.foundList !== undefined) {
    const dots = $('dots');
    dots.innerHTML = '';
    for (let i = 0; i < patch.total; i++) {
      const dot = document.createElement('span');
      dot.className = 'dot' + (patch.foundList.includes(i) ? ' found' : '');
      dot.title = patch.foundList.includes(i) ? 'found' : 'still hidden';
      dots.appendChild(dot);
    }
  }
  if (patch.timeLeft !== undefined) {
    $('timer-text').textContent = fmtTime(patch.timeLeft);
    const frac = patch.timeTotal > 0 ? patch.timeLeft / patch.timeTotal : 0;
    const fill = $('timer-fill');
    fill.style.width = `${Math.max(0, frac * 100)}%`;
    const low = patch.timeLeft <= 30 && patch.timeLeft > 0;
    fill.classList.toggle('low', low);
    $('timer-text').classList.toggle('low', low);
  }
}

game.onHud = syncHudView;

game.onOverlay = ({ show, title, text, stars, btnLabel }) => {
  $('overlay').classList.toggle('hidden', !show);
  if (!show) return;
  $('overlay-title').textContent = title;
  $('overlay-text').textContent = text;
  $('overlay-stars').textContent = stars > 0 ? '★'.repeat(stars) + '☆'.repeat(3 - stars) : '';
  $('overlay-btn').textContent = btnLabel;
};

// -- level tabs ---------------------------------------------------------------

function buildTabs() {
  const tabs = $('level-tabs');
  tabs.innerHTML = '';
  SCENES.forEach((scene, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'level-tab';
    btn.innerHTML = `<b>${i + 1}. ${scene.name}</b><span>${scene.tagline}</span>`;
    btn.addEventListener('click', () => game.startLevel(i));
    tabs.appendChild(btn);
  });
}

game.onTabs = (active, cleared, state) => {
  [...$('level-tabs').children].forEach((tab, i) => {
    tab.classList.toggle('active', i === active);
    tab.classList.toggle('done', cleared.has(i));
  });
  $('btn-restart').disabled = state === 'menu';
};

// -- input --------------------------------------------------------------------

for (const [id, canvas] of [['canvas-a', $('canvas-a')], ['canvas-b', $('canvas-b')]]) {
  canvas.addEventListener('click', (ev) => {
    game.clickAt(canvas, ev.clientX, ev.clientY);
  });
}

$('btn-hint').addEventListener('click', () => game.useHint());
$('btn-restart').addEventListener('click', () => game.startLevel(game.levelIndex));
$('btn-menu').addEventListener('click', () => game.backToMenu());
$('overlay-btn').addEventListener('click', () => game.overlayAction());

document.addEventListener('keydown', (ev) => {
  if (ev.key === 'h' || ev.key === 'H') game.useHint();
  else if (ev.key === 'r' || ev.key === 'R') game.startLevel(game.levelIndex);
  else if (ev.key === 'Escape') game.backToMenu();
  else if (ev.key === 'Enter' && game.state !== 'playing') game.overlayAction();
  else if (ev.key >= '1' && ev.key <= '3') game.startLevel(Number(ev.key) - 1);
});

// -- frame loop: the timer and the animated rings need a steady heartbeat ----

function frame(now) {
  game.tick(now);
  if (game.state === 'playing') game.renderAll();
  requestAnimationFrame(frame);
}

// -- start --------------------------------------------------------------------

buildTabs();
game.backToMenu();

const params = new URLSearchParams(location.search);
const levelParam = Number(params.get('level') ?? 0);
const startLevel = Number.isInteger(levelParam) && levelParam >= 0 && levelParam < SCENES.length ? levelParam : 0;
const demo = params.get('demo');

if (params.get('autotest') === '1') {
  // Self-test: play the level by clicking every difference dead-centre,
  // then one deliberate wrong click, and report what happened.
  game.startLevel(startLevel);
  // One deliberate wrong click first, while the level is still running:
  // it must count as a miss and cost 3 seconds.
  const timeBeforeMiss = game.timeLeft;
  game.tryPoint(300, 60);
  const wrongCounted = game.misses === 1 && game.timeLeft < timeBeforeMiss;
  const results = [];
  for (const d of game.scene.diffs) results.push(game.tryPoint(d.x, d.y));
  const report = {
    level: game.scene.name,
    diffs: game.scene.diffs.length,
    clicks: results,
    found: game.found.size,
    state: game.state,
    score: game.score,
    wrongClickCounted: wrongCounted,
  };
  const node = $('autotest-result');
  node.textContent = JSON.stringify(report);
  node.style.display = 'block';
  document.title = `AUTOTEST ${JSON.stringify(report)}`;
} else if (demo === 'all') {
  game.startLevel(startLevel, SCENES[startLevel].diffs.length);
} else if (demo !== null) {
  const n = Number(demo);
  game.startLevel(startLevel, Number.isInteger(n) ? n : 0);
  if (params.get('hint') === '1') game.useHint();
  // Park the clock mid-level for the photo: a full bar looks unplayed.
  game.timeLeft = Math.round(game.scene.time * 0.58);
  game.syncHud();
} else if (params.has('level')) {
  game.startLevel(startLevel);
}

requestAnimationFrame(frame);

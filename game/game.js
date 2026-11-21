// Twin Views — the game itself: state, timer, hints, scoring and input.
// The scene art lives in scenes.js; this file only runs the hunt.

import { SCENES, PANEL_W, PANEL_H } from './scenes.js';
import { playFound, playMiss, playWin, playHint, warmup } from './audio.js';

const WRONG_PENALTY_SEC = 3;
const POINTS_PER_FIND = 100;
const TIME_BONUS_PER_SEC = 5;
const HINT_SECONDS = 4;

export class TwinViewsGame {
  constructor(elements) {
    this.el = elements;
    this.canvasA = elements.canvasA;
    this.canvasB = elements.canvasB;
    this.ctxA = this.canvasA.getContext('2d');
    this.ctxB = this.canvasB.getContext('2d');
    this.levelIndex = 0;
    this.state = 'menu'; // menu | playing | won | lost
    this.found = new Set();
    this.score = 0;
    this.misses = 0;
    this.hintsLeft = 3;
    this.timeLeft = 0;
    this.cleared = new Set();
    this.best = {};
    this.hintDiff = null;
    this.hintUntil = 0;
    this.floats = []; // {x, y, text, color, until}
    this.flashes = []; // {x, y, until} wrong-click X marks
    this.lastTick = 0;
    this.winBonus = 0;
    this.stars = 0;
    this.onHud = null;
    this.onOverlay = null;
    this.onTabs = null;
  }

  get scene() {
    return SCENES[this.levelIndex];
  }

  startLevel(index, demoFound = 0) {
    this.levelIndex = index;
    this.state = 'playing';
    this.found = new Set();
    this.score = 0;
    this.misses = 0;
    this.hintsLeft = 3;
    this.timeLeft = this.scene.time;
    this.hintDiff = null;
    this.floats = [];
    this.flashes = [];
    this.winBonus = 0;
    this.stars = 0;
    this.lastTick = performance.now();
    const pre = Math.max(0, Math.min(demoFound, this.scene.diffs.length));
    for (let i = 0; i < pre; i++) {
      this.found.add(i);
      this.score += POINTS_PER_FIND;
    }
    this.hideOverlay();
    // Photo mode can start with every difference already found: that is a
    // win, so show the victory card instead of an empty hunt.
    if (this.found.size === this.scene.diffs.length) {
      this.winLevel();
      return;
    }
    this.renderAll();
    this.syncHud();
    this.syncTabs();
  }

  backToMenu() {
    this.state = 'menu';
    this.hideOverlay();
    this.renderAll();
    this.syncHud();
    this.syncTabs();
  }

  // -- input ---------------------------------------------------------------

  clickAt(canvas, clientX, clientY) {
    warmup();
    if (this.state !== 'playing') return;
    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * PANEL_W;
    const y = ((clientY - rect.top) / rect.height) * PANEL_H;
    this.tryPoint(x, y);
  }

  // The same hit test the click handler uses; autotest drives it directly.
  tryPoint(x, y) {
    if (this.state !== 'playing') return 'idle';
    const diffs = this.scene.diffs;
    let best = -1;
    let bestDist = Infinity;
    for (let i = 0; i < diffs.length; i++) {
      if (this.found.has(i)) continue;
      const d = diffs[i];
      const dist = Math.hypot(x - d.x, y - d.y);
      if (dist < d.r + 12 && dist < bestDist) {
        best = i;
        bestDist = dist;
      }
    }
    if (best >= 0) {
      this.found.add(best);
      this.score += POINTS_PER_FIND;
      const d = diffs[best];
      this.floats.push({ x: d.x, y: d.y - 24, text: `+${POINTS_PER_FIND}`, color: '#ffd166', until: performance.now() + 900 });
      playFound();
      if (this.found.size === diffs.length) {
        this.winLevel();
      } else {
        this.renderAll();
        this.syncHud();
      }
      return 'found';
    }
    this.misses += 1;
    this.timeLeft = Math.max(0, this.timeLeft - WRONG_PENALTY_SEC);
    this.flashes.push({ x, y, until: performance.now() + 700 });
    playMiss();
    this.renderAll();
    this.syncHud();
    if (this.timeLeft <= 0) this.loseLevel();
    return 'miss';
  }

  useHint() {
    if (this.state !== 'playing' || this.hintsLeft <= 0) return false;
    const remaining = this.scene.diffs.map((d, i) => i).filter((i) => !this.found.has(i));
    if (remaining.length === 0) return false;
    this.hintsLeft -= 1;
    this.hintDiff = remaining[Math.floor(Math.random() * remaining.length)];
    this.hintUntil = performance.now() + HINT_SECONDS * 1000;
    playHint();
    this.syncHud();
    return true;
  }

  // -- timer ----------------------------------------------------------------

  tick(now) {
    if (this.state !== 'playing') return;
    const dt = (now - this.lastTick) / 1000;
    this.lastTick = now;
    this.timeLeft = Math.max(0, this.timeLeft - dt);
    if (this.timeLeft <= 0) {
      this.loseLevel();
      return;
    }
    this.syncTimer();
  }

  // -- endings --------------------------------------------------------------

  winLevel() {
    this.state = 'won';
    this.winBonus = Math.round(this.timeLeft) * TIME_BONUS_PER_SEC;
    this.score += this.winBonus;
    this.cleared.add(this.levelIndex);
    const clean = this.misses === 0;
    const fast = this.timeLeft > this.scene.time * 0.4;
    this.stars = clean && fast ? 3 : clean || fast ? 2 : 1;
    if (!this.best[this.levelIndex] || this.score > this.best[this.levelIndex]) {
      this.best[this.levelIndex] = this.score;
    }
    playWin();
    this.renderAll();
    this.syncHud();
    this.syncTabs();
    this.showOverlay(
      'Level Clear!',
      `${this.scene.name} — all ${this.scene.diffs.length} differences found. ` +
        `Time bonus +${this.winBonus}, ${this.misses} miss${this.misses === 1 ? '' : 'es'}.`,
      this.stars,
      this.levelIndex + 1 < SCENES.length ? 'Next Level →' : 'Play Again',
    );
  }

  loseLevel() {
    this.state = 'lost';
    this.timeLeft = 0;
    this.renderAll();
    this.syncHud();
    this.showOverlay(
      "Time's Up",
      `You found ${this.found.size} of ${this.scene.diffs.length} differences in ${this.scene.name}. ` +
        `One more careful look and you'll get them all.`,
      0,
      'Try Again',
    );
  }

  overlayAction() {
    if (this.state === 'won' && this.levelIndex + 1 < SCENES.length) {
      this.startLevel(this.levelIndex + 1);
    } else {
      this.startLevel(this.levelIndex);
    }
  }

  // -- rendering -------------------------------------------------------------

  renderAll() {
    this.drawPanel(this.ctxA, 0);
    this.drawPanel(this.ctxB, 1);
  }

  drawPanel(ctx, variant) {
    ctx.clearRect(0, 0, PANEL_W, PANEL_H);
    this.scene.draw(ctx, variant);
    if (this.state === 'menu') {
      ctx.fillStyle = 'rgba(16, 22, 36, 0.55)';
      ctx.fillRect(0, 0, PANEL_W, PANEL_H);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 26px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(this.scene.name, PANEL_W / 2, PANEL_H / 2 - 14);
      ctx.font = '16px sans-serif';
      ctx.fillStyle = '#dfe7f3';
      ctx.fillText(this.scene.tagline, PANEL_W / 2, PANEL_H / 2 + 16);
      ctx.fillStyle = '#ffd166';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('Click a level above, or press 1 / 2 / 3', PANEL_W / 2, PANEL_H / 2 + 48);
      ctx.textAlign = 'left';
      return;
    }
    const now = performance.now();
    // Found markers: a gold ring plus a check on both panels.
    for (const i of this.found) {
      const d = this.scene.diffs[i];
      ctx.strokeStyle = '#ffd166';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r + 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = '#2f9e44';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(d.x - 8, d.y);
      ctx.lineTo(d.x - 2, d.y + 7);
      ctx.lineTo(d.x + 10, d.y - 7);
      ctx.stroke();
    }
    // Hint ring: a pulsing dashed circle on the one difference it points at.
    if (this.hintDiff !== null && now < this.hintUntil && !this.found.has(this.hintDiff)) {
      const d = this.scene.diffs[this.hintDiff];
      const pulse = 1 + 0.12 * Math.sin(now / 160);
      ctx.strokeStyle = '#4cc9f0';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.arc(d.x, d.y, (d.r + 10) * pulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    } else if (this.hintDiff !== null && now >= this.hintUntil) {
      this.hintDiff = null;
    }
    // Wrong-click X flashes.
    this.flashes = this.flashes.filter((f) => now < f.until);
    for (const f of this.flashes) {
      ctx.strokeStyle = '#ef5350';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(f.x - 10, f.y - 10);
      ctx.lineTo(f.x + 10, f.y + 10);
      ctx.moveTo(f.x + 10, f.y - 10);
      ctx.lineTo(f.x - 10, f.y + 10);
      ctx.stroke();
    }
    // Floating score text.
    this.floats = this.floats.filter((f) => now < f.until);
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    for (const f of this.floats) {
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, f.x, f.y);
    }
    ctx.textAlign = 'left';
  }

  // -- HUD / overlay plumbing (main.js wires the callbacks) ------------------

  syncHud() {
    this.syncTimer();
    if (!this.onHud) return;
    const total = this.scene.diffs.length;
    this.onHud({
      levelName: this.scene.name,
      found: this.found.size,
      total,
      left: total - this.found.size,
      score: this.score,
      hintsLeft: this.hintsLeft,
      state: this.state,
      foundList: [...this.found],
    });
  }

  syncTimer() {
    if (!this.onHud) return;
    this.onHud({ timeLeft: this.timeLeft, timeTotal: this.scene.time });
  }

  syncTabs() {
    if (this.onTabs) this.onTabs(this.levelIndex, this.cleared, this.state);
  }

  showOverlay(title, text, stars, btnLabel) {
    if (this.onOverlay) this.onOverlay({ show: true, title, text, stars, btnLabel });
  }

  hideOverlay() {
    if (this.onOverlay) this.onOverlay({ show: false });
  }
}

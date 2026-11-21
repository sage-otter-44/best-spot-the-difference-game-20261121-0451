// Twin Views — the three scenes. Every picture is drawn by this file's own
// canvas code; nothing is loaded from outside. Each scene draws twice: once
// as Scene A (variant 0) and once as Scene B (variant 1), where the variant
// changes exactly the things listed in `diffs`. A difference is fair when a
// player who studies the picture can see it, and hidden when it sits inside
// a busy, pretty detail.

export const PANEL_W = 600;
export const PANEL_H = 430;

function circle(ctx, x, y, r, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function rect(ctx, x, y, w, h, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}

function poly(ctx, points, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fill();
}

function sky(ctx, top, bottom) {
  const g = ctx.createLinearGradient(0, 0, 0, 300);
  g.addColorStop(0, top);
  g.addColorStop(1, bottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, PANEL_W, 300);
}

function cloud(ctx, x, y, s) {
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.beginPath();
  ctx.arc(x, y, 18 * s, 0, Math.PI * 2);
  ctx.arc(x + 20 * s, y - 6 * s, 15 * s, 0, Math.PI * 2);
  ctx.arc(x + 42 * s, y, 17 * s, 0, Math.PI * 2);
  ctx.fill();
}

function bird(ctx, x, y, s) {
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x - 9 * s, y);
  ctx.quadraticCurveTo(x - 4 * s, y - 7 * s, x, y);
  ctx.quadraticCurveTo(x + 4 * s, y - 7 * s, x + 9 * s, y);
  ctx.stroke();
}

// ---------------------------------------------------------------- park ----
function drawPark(ctx, v) {
  sky(ctx, '#7ec3ee', '#d9f0ff');
  // Sun with rays (diff 1: variant has fewer rays).
  const rays = v === 0 ? 8 : 6;
  ctx.strokeStyle = '#f5b301';
  ctx.lineWidth = 4;
  for (let i = 0; i < rays; i++) {
    const a = (i / rays) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(70 + Math.cos(a) * 40, 60 + Math.sin(a) * 40);
    ctx.lineTo(70 + Math.cos(a) * 52, 60 + Math.sin(a) * 52);
    ctx.stroke();
  }
  circle(ctx, 70, 60, 34, '#ffd93b');
  cloud(ctx, 200, 55, 1);
  cloud(ctx, 420, 80, 0.8);
  cloud(ctx, 520, 40, 0.7);
  // Birds (diff 2: the bird at 430,70 is gone in variant 1).
  if (v === 0) bird(ctx, 430, 70, 1);
  bird(ctx, 480, 95, 0.8);
  bird(ctx, 350, 55, 0.7);
  // Hills and path.
  ctx.fillStyle = '#69b455';
  ctx.beginPath();
  ctx.moveTo(0, 250);
  ctx.quadraticCurveTo(150, 210, 320, 250);
  ctx.quadraticCurveTo(470, 290, 600, 245);
  ctx.lineTo(600, 430);
  ctx.lineTo(0, 430);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#58a34a';
  ctx.beginPath();
  ctx.moveTo(0, 300);
  ctx.quadraticCurveTo(200, 265, 400, 305);
  ctx.quadraticCurveTo(520, 330, 600, 300);
  ctx.lineTo(600, 430);
  ctx.lineTo(0, 430);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#e8d9a8';
  ctx.beginPath();
  ctx.moveTo(296, 430);
  ctx.quadraticCurveTo(308, 340, 322, 292);
  ctx.quadraticCurveTo(334, 340, 344, 430);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#cbb877';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(322, 292);
  ctx.quadraticCurveTo(318, 360, 312, 430);
  ctx.stroke();
  // Pond.
  ellipse(ctx, 480, 365, 92, 38, '#5aa9d6');
  ellipse(ctx, 480, 362, 78, 30, '#7cc4e8');
  ctx.strokeStyle = '#3d7ea6';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(480, 365, 55, 18, 0, 0.2, Math.PI - 0.4);
  ctx.stroke();
  // Tree.
  rect(ctx, 82, 225, 16, 85, '#7a4a21');
  circle(ctx, 90, 205, 42, '#3f8f3a');
  circle(ctx, 55, 225, 28, '#4da344');
  circle(ctx, 125, 225, 28, '#4da344');
  circle(ctx, 90, 175, 26, '#57b04e');
  // Bench (diff 4: the middle back slat is gone in variant 1).
  rect(ctx, 150, 295, 8, 42, '#6b4226');
  rect(ctx, 205, 295, 8, 42, '#6b4226');
  rect(ctx, 145, 292, 75, 9, '#8b5a2b');
  rect(ctx, 145, 272, 75, 8, '#8b5a2b');
  if (v === 0) rect(ctx, 145, 254, 75, 8, '#8b5a2b');
  // Flowers (diff 3: the red flower at 250,330 turns purple).
  const flowers = [
    [250, 330, v === 0 ? '#e63946' : '#9b5de5'],
    [330, 350, '#f4d35e'],
    [420, 330, '#ffffff'],
    [150, 370, '#f77f00'],
    [520, 395, '#e63946'],
  ];
  for (const [fx, fy, fc] of flowers) {
    ctx.strokeStyle = '#2f7d32';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(fx, fy);
    ctx.lineTo(fx, fy + 12);
    ctx.stroke();
    for (let p = 0; p < 5; p++) {
      const a = (p / 5) * Math.PI * 2;
      circle(ctx, fx + Math.cos(a) * 6, fy + Math.sin(a) * 6, 4, fc);
    }
    circle(ctx, fx, fy, 4, '#ffd93b');
  }
  // Kite with tail bows (diff 5: 3 bows become 2).
  poly(ctx, [[480, 130], [505, 155], [480, 180], [455, 155]], '#e63946');
  poly(ctx, [[480, 130], [505, 155], [480, 155], [455, 155]], '#f4d35e');
  ctx.strokeStyle = '#5b4636';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(480, 180);
  ctx.quadraticCurveTo(470, 210, 478, 235);
  ctx.stroke();
  const bows = v === 0 ? 3 : 2;
  for (let i = 0; i < bows; i++) {
    const by = 192 + i * 18;
    poly(ctx, [[478, by - 5], [486, by], [478, by + 5], [470, by]], '#4361ee');
  }
  // Butterfly.
  circle(ctx, 352, 178, 3, '#222');
  ellipse(ctx, 344, 172, 8, 5, '#ff7b9c');
  ellipse(ctx, 360, 172, 8, 5, '#ff7b9c');
  ellipse(ctx, 345, 185, 6, 4, '#ffb3c6');
  ellipse(ctx, 359, 185, 6, 4, '#ffb3c6');
}

const PARK_DIFFS = [
  { x: 70, y: 60, r: 40, label: 'sun rays' },
  { x: 430, y: 70, r: 16, label: 'missing bird' },
  { x: 250, y: 330, r: 16, label: 'flower colour' },
  { x: 182, y: 258, r: 18, label: 'bench slat' },
  { x: 478, y: 205, r: 20, label: 'kite tail bows' },
];

// ---------------------------------------------------------- night market ----
function lantern(ctx, x, y, color, lit) {
  ctx.strokeStyle = '#3a2c1c';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y - 26);
  ctx.lineTo(x, y - 12);
  ctx.stroke();
  ctx.fillStyle = '#c9a227';
  ctx.fillRect(x - 7, y - 14, 14, 4);
  ctx.fillStyle = lit ? color : '#5b5346';
  ctx.beginPath();
  ctx.ellipse(x, y, 13, 17, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#7a1f1f';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x - 12, y - 8);
  ctx.lineTo(x + 12, y - 8);
  ctx.moveTo(x - 13, y);
  ctx.lineTo(x + 13, y);
  ctx.moveTo(x - 12, y + 8);
  ctx.lineTo(x + 12, y + 8);
  ctx.stroke();
  if (lit) {
    ctx.fillStyle = 'rgba(255, 220, 120, 0.18)';
    ctx.beginPath();
    ctx.arc(x, y, 30, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#c9a227';
  ctx.fillRect(x - 7, y + 15, 14, 4);
}

function drawMarket(ctx, v) {
  sky(ctx, '#141c33', '#2c3a5e');
  // Stars.
  ctx.fillStyle = '#fff';
  for (const [sx, sy, sr] of [[40, 40, 1.6], [150, 30, 1.2], [260, 55, 1.8], [360, 35, 1.2], [470, 25, 1.5], [560, 110, 1.2], [90, 90, 1.2], [330, 70, 1.4]]) {
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fill();
  }
  // Moon (diff 2: full moon becomes a crescent in variant 1).
  circle(ctx, 520, 55, 26, '#f4f1de');
  if (v === 1) circle(ctx, 530, 48, 22, '#2c3a5e');
  // String lights with one bulb out in variant 1 (diff 4).
  ctx.strokeStyle = '#0d1226';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 55);
  ctx.quadraticCurveTo(300, 105, 600, 55);
  ctx.stroke();
  const bulbs = [40, 100, 160, 220, 280, 340, 400, 460, 520, 570];
  bulbs.forEach((bx, i) => {
    const t = bx / 600;
    const by = 55 + Math.sin(t * Math.PI) * 34;
    const colors = ['#ffd166', '#ef476f', '#06d6a0', '#118ab2'];
    const dark = v === 1 && bx === 220;
    circle(ctx, bx, by, 6, dark ? '#3a3f4d' : colors[i % 4]);
    if (!dark) {
      ctx.fillStyle = 'rgba(255, 220, 120, 0.15)';
      ctx.beginPath();
      ctx.arc(bx, by, 12, 0, Math.PI * 2);
      ctx.fill();
    }
  });
  // Ground.
  rect(ctx, 0, 310, 600, 120, '#2b2620');
  ctx.fillStyle = '#37312a';
  for (let gy = 320; gy < 430; gy += 18) {
    ctx.fillRect(0, gy, 600, 2);
  }
  // Stall A (left) with cat on the roof (diff 3: the cat is gone in variant 1).
  rect(ctx, 50, 165, 220, 12, '#5b3a29');
  poly(ctx, [[40, 165], [280, 165], [265, 130], [55, 130]], '#c0392b');
  for (let ax = 55; ax < 270; ax += 36) {
    poly(ctx, [[ax, 165], [ax + 18, 165], [ax + 18, 130], [ax, 130]], (ax / 36) % 2 === 0 ? '#f4f1de' : '#c0392b');
  }
  rect(ctx, 60, 250, 200, 60, '#7a5230');
  rect(ctx, 60, 250, 200, 10, '#9c6b3f');
  if (v === 0) {
    // Cat silhouette sitting on the roof, dark slate against the night sky
    // with two small amber eyes: hidden at a glance, findable on a study.
    ctx.fillStyle = '#2e3440';
    ctx.beginPath();
    ctx.ellipse(160, 122, 14, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    circle(ctx, 160, 106, 9, '#2e3440');
    poly(ctx, [[153, 100], [156, 90], [160, 99]], '#2e3440');
    poly(ctx, [[163, 99], [166, 90], [169, 100]], '#2e3440');
    ctx.strokeStyle = '#2e3440';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(172, 126);
    ctx.quadraticCurveTo(184, 122, 182, 110);
    ctx.stroke();
    circle(ctx, 157, 105, 1.6, '#f4d35e');
    circle(ctx, 163, 105, 1.6, '#f4d35e');
  }
  // Dumpling sign (diff 5: three dumplings become two).
  rect(ctx, 120, 180, 90, 42, '#f4ead5');
  ctx.strokeStyle = '#5b3a29';
  ctx.lineWidth = 2;
  ctx.strokeRect(120, 180, 90, 42);
  ctx.fillStyle = '#222';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('DUMPLINGS', 128, 196);
  const dumplings = v === 0 ? [140, 160, 180] : [150, 175];
  for (const dx of dumplings) {
    ctx.fillStyle = '#fff8e7';
    ctx.beginPath();
    ctx.arc(dx, 210, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#c9a227';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  // Stall B (right) with fish tank (diff 6: one fish is gone).
  rect(ctx, 330, 165, 240, 12, '#5b3a29');
  poly(ctx, [[320, 165], [580, 165], [565, 130], [335, 130]], '#247a4d');
  for (let ax = 335; ax < 570; ax += 36) {
    poly(ctx, [[ax, 165], [ax + 18, 165], [ax + 18, 130], [ax, 130]], (ax / 36) % 2 === 0 ? '#f4f1de' : '#247a4d');
  }
  rect(ctx, 340, 250, 220, 60, '#7a5230');
  rect(ctx, 340, 250, 220, 10, '#9c6b3f');
  // Fish tank on the counter.
  rect(ctx, 455, 222, 80, 34, 'rgba(120, 190, 230, 0.55)');
  ctx.strokeStyle = '#9fc6dd';
  ctx.lineWidth = 2;
  ctx.strokeRect(455, 222, 80, 34);
  ctx.fillStyle = '#ff8c42';
  ctx.beginPath();
  ctx.ellipse(478, 240, 9, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  poly(ctx, [[487, 240], [495, 235], [495, 245]], '#ff8c42');
  if (v === 0) {
    ctx.fillStyle = '#ffd166';
    ctx.beginPath();
    ctx.ellipse(512, 244, 8, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();
    poly(ctx, [[504, 244], [497, 240], [497, 248]], '#ffd166');
  }
  // Vendor behind stall B (diff 7: straw hat turns red).
  circle(ctx, 400, 215, 16, '#e8b98a');
  ctx.fillStyle = v === 0 ? '#e9c46a' : '#c0392b';
  ctx.beginPath();
  ctx.ellipse(400, 205, 26, 8, 0, Math.PI, 0);
  ctx.fill();
  ctx.fillRect(388, 196, 24, 8);
  rect(ctx, 372, 232, 56, 22, '#3a6ea5');
  // Lanterns (diff 1: the red lantern at 120,120 turns green).
  lantern(ctx, 120, 120, v === 0 ? '#d62828' : '#2a9d3a', true);
  lantern(ctx, 300, 100, '#f77f00', true);
  lantern(ctx, 500, 118, '#fcbf49', true);
  // Crates.
  rect(ctx, 80, 340, 42, 42, '#8b5a2b');
  ctx.strokeStyle = '#5b3a29';
  ctx.lineWidth = 2;
  ctx.strokeRect(80, 340, 42, 42);
  ctx.beginPath();
  ctx.moveTo(80, 340);
  ctx.lineTo(122, 382);
  ctx.moveTo(122, 340);
  ctx.lineTo(80, 382);
  ctx.stroke();
  rect(ctx, 126, 352, 34, 30, '#7a4a21');
  ctx.strokeRect(126, 352, 34, 30);
}

const MARKET_DIFFS = [
  { x: 120, y: 120, r: 18, label: 'lantern colour' },
  { x: 520, y: 55, r: 28, label: 'moon phase' },
  { x: 160, y: 112, r: 18, label: 'cat on the roof' },
  { x: 220, y: 82, r: 12, label: 'dark bulb' },
  { x: 165, y: 205, r: 20, label: 'dumplings on the sign' },
  { x: 508, y: 242, r: 18, label: 'fish in the tank' },
  { x: 400, y: 203, r: 20, label: 'vendor hat' },
];

// ------------------------------------------------------------ harbor dawn ----
function drawHarbor(ctx, v) {
  sky(ctx, '#ff9e6d', '#c9d8ef');
  circle(ctx, 500, 92, 30, '#fff3b0');
  cloud(ctx, 180, 60, 0.9);
  cloud(ctx, 350, 45, 0.7);
  // Seagulls (diff 3: the gull at 480,100 is gone in variant 1).
  bird(ctx, 450, 80, 1);
  if (v === 0) bird(ctx, 480, 100, 0.9);
  bird(ctx, 420, 62, 0.8);
  // Sea.
  rect(ctx, 0, 260, 600, 170, '#3d7ea6');
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  for (let wy = 280; wy < 420; wy += 26) {
    for (let wx = (wy * 7) % 90; wx < 600; wx += 110) {
      ctx.fillRect(wx, wy, 46, 3);
    }
  }
  // Lighthouse (diff 1: the beam is off in variant 1; diff 9: flag direction).
  rect(ctx, 55, 120, 34, 140, '#f4f1de');
  ctx.fillStyle = '#d62828';
  ctx.fillRect(55, 140, 34, 18);
  ctx.fillRect(55, 180, 34, 18);
  ctx.fillRect(55, 220, 34, 18);
  rect(ctx, 48, 96, 48, 24, '#334155');
  ctx.fillStyle = '#ffd166';
  ctx.fillRect(58, 102, 28, 12);
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(72, 96);
  ctx.lineTo(72, 66);
  ctx.stroke();
  if (v === 0) {
    poly(ctx, [[72, 66], [108, 58], [108, 74]], '#d62828');
  } else {
    poly(ctx, [[72, 66], [36, 58], [36, 74]], '#d62828');
  }
  if (v === 0) {
    ctx.fillStyle = 'rgba(255, 240, 160, 0.35)';
    poly(ctx, [[86, 108], [220, 70], [220, 140]], 'rgba(255, 240, 160, 0.35)');
  }
  // Harbor house with a window (diff 6: the window goes dark).
  rect(ctx, 350, 150, 90, 70, '#e8dcc3');
  poly(ctx, [[340, 150], [450, 150], [395, 118]], '#a44a3f');
  rect(ctx, 366, 168, 22, 26, v === 0 ? '#ffd166' : '#334155');
  rect(ctx, 402, 168, 22, 26, '#5b7a99');
  rect(ctx, 388, 196, 18, 24, '#6b4226');
  // Sailboat (diff 2: the sail stripe turns blue).
  poly(ctx, [[300, 175], [300, 250], [345, 250]], '#f4f1de');
  ctx.fillStyle = v === 0 ? '#d62828' : '#2470c2';
  poly(ctx, [[300, 195], [300, 215], [330, 215]], v === 0 ? '#d62828' : '#2470c2');
  poly(ctx, [[300, 175], [300, 250], [262, 250]], '#e9c46a');
  ctx.strokeStyle = '#5b4636';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(300, 170);
  ctx.lineTo(300, 252);
  ctx.stroke();
  ctx.fillStyle = '#7a4a21';
  ctx.beginPath();
  ctx.moveTo(255, 250);
  ctx.lineTo(350, 250);
  ctx.lineTo(335, 266);
  ctx.lineTo(270, 266);
  ctx.closePath();
  ctx.fill();
  // Small rowboat.
  ctx.fillStyle = '#247a4d';
  ctx.beginPath();
  ctx.moveTo(160, 310);
  ctx.lineTo(220, 310);
  ctx.lineTo(210, 322);
  ctx.lineTo(170, 322);
  ctx.closePath();
  ctx.fill();
  // Jumping fish (diff 7: gone in variant 1).
  if (v === 0) {
    ctx.fillStyle = '#c0c8d0';
    ctx.beginPath();
    ctx.ellipse(150, 292, 12, 5, -0.5, 0, Math.PI * 2);
    ctx.fill();
    poly(ctx, [[140, 296], [132, 292], [140, 290]], '#c0c8d0');
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(150, 306, 8, 0.2, Math.PI - 0.6);
    ctx.stroke();
  }
  // Buoy (diff 4: orange turns yellow).
  circle(ctx, 200, 330, 13, v === 0 ? '#f77f00' : '#ffd60a');
  rect(ctx, 196, 310, 8, 10, '#334155');
  // Dock.
  rect(ctx, 0, 360, 600, 70, '#8b5a2b');
  ctx.fillStyle = '#7a4a21';
  for (let dx = 0; dx < 600; dx += 60) ctx.fillRect(dx, 360, 3, 70);
  ctx.fillStyle = '#6b4226';
  ctx.fillRect(0, 392, 600, 4);
  // Rope coil (diff 5: gone in variant 1).
  if (v === 0) {
    ctx.strokeStyle = '#d9c08a';
    ctx.lineWidth = 5;
    for (const rr of [16, 11, 6]) {
      ctx.beginPath();
      ctx.arc(520, 380, rr, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  // Anchor (diff 8: gone in variant 1).
  if (v === 0) {
    ctx.strokeStyle = '#2f3a4a';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(430, 372);
    ctx.lineTo(430, 402);
    ctx.moveTo(414, 388);
    ctx.quadraticCurveTo(414, 404, 430, 404);
    ctx.quadraticCurveTo(446, 404, 446, 388);
    ctx.stroke();
    circle(ctx, 430, 370, 5, '#2f3a4a');
  }
  // Crab (diff 10: the crab appears only in variant 1).
  if (v === 1) {
    circle(ctx, 560, 398, 10, '#e63946');
    ctx.strokeStyle = '#e63946';
    ctx.lineWidth = 3;
    for (const [lx, ly] of [[548, 392], [550, 404], [572, 392], [570, 404]]) {
      ctx.beginPath();
      ctx.moveTo(556, 396);
      ctx.lineTo(lx, ly);
      ctx.stroke();
    }
    circle(ctx, 556, 390, 2, '#111');
    circle(ctx, 564, 390, 2, '#111');
  }
  // Crates on the dock.
  rect(ctx, 40, 330, 36, 30, '#a9713a');
  ctx.strokeStyle = '#5b3a29';
  ctx.lineWidth = 2;
  ctx.strokeRect(40, 330, 36, 30);
}

const HARBOR_DIFFS = [
  { x: 150, y: 105, r: 26, label: 'lighthouse beam' },
  { x: 312, y: 205, r: 20, label: 'sail stripe' },
  { x: 480, y: 100, r: 14, label: 'missing gull' },
  { x: 200, y: 328, r: 16, label: 'buoy colour' },
  { x: 520, y: 380, r: 18, label: 'rope coil' },
  { x: 377, y: 181, r: 14, label: 'lit window' },
  { x: 150, y: 292, r: 16, label: 'jumping fish' },
  { x: 430, y: 388, r: 18, label: 'anchor' },
  { x: 72, y: 66, r: 14, label: 'flag direction' },
  { x: 560, y: 398, r: 16, label: 'crab on the dock' },
];

// ------------------------------------------------------------------ export ----
export const SCENES = [
  {
    id: 'park',
    name: 'Sunny Park',
    tagline: 'Easy · 5 differences · 2:00',
    time: 120,
    diffs: PARK_DIFFS,
    draw: drawPark,
  },
  {
    id: 'market',
    name: 'Night Market',
    tagline: 'Medium · 7 differences · 2:30',
    time: 150,
    diffs: MARKET_DIFFS,
    draw: drawMarket,
  },
  {
    id: 'harbor',
    name: 'Harbor Dawn',
    tagline: 'Hard · 10 differences · 3:00',
    time: 180,
    diffs: HARBOR_DIFFS,
    draw: drawHarbor,
  },
];

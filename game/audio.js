// Twin Views — tiny WebAudio chimes. No audio files are shipped; every
// sound is a few oscillator notes, made on the first user gesture.

let ctx = null;

function audioCtx() {
  if (!ctx) {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      ctx = new AC();
    } catch {
      ctx = null;
    }
  }
  if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

function tone(freq, start, dur, type, vol) {
  const ac = audioCtx();
  if (!ac) return;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(vol, ac.currentTime + start);
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + start + dur);
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start(ac.currentTime + start);
  osc.stop(ac.currentTime + start + dur + 0.02);
}

// Two bright notes: the satisfying "found it" chime.
export function playFound() {
  tone(659.25, 0, 0.14, 'sine', 0.22);
  tone(880.0, 0.09, 0.22, 'sine', 0.22);
}

// Low buzz for a wrong click.
export function playMiss() {
  tone(110, 0, 0.18, 'sawtooth', 0.12);
}

// Short rising arpeggio for clearing a level.
export function playWin() {
  tone(523.25, 0, 0.16, 'triangle', 0.2);
  tone(659.25, 0.12, 0.16, 'triangle', 0.2);
  tone(783.99, 0.24, 0.16, 'triangle', 0.2);
  tone(1046.5, 0.36, 0.32, 'triangle', 0.22);
}

// Soft tick for a hint.
export function playHint() {
  tone(1174.66, 0, 0.1, 'sine', 0.14);
}

// Warm-up call on the first pointer interaction so later sounds are instant.
export function warmup() {
  audioCtx();
}

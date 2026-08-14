// Áudio 100% sintetizado (WebAudio): sem arquivos, sem downloads.

import { settings } from './save.js';

let ctx = null;
let masterGain = null;
let musicGain = null;
let musicTimer = null;
let currentTrack = null;

function ac() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  masterGain = ctx.createGain();
  masterGain.gain.value = 0.35;
  masterGain.connect(ctx.destination);
  musicGain = ctx.createGain();
  musicGain.gain.value = 0.16;
  musicGain.connect(masterGain);
  return ctx;
}

/** Precisa ser chamado a partir de um gesto do usuário (política de autoplay). */
export function unlock() {
  const c = ac();
  if (c && c.state === 'suspended') c.resume();
}

function tone({ freq = 440, dur = .15, type = 'sine', gain = .3, dest, slideTo, delay = 0 }) {
  const c = ac();
  if (!c || !settings.audio) return;
  const t0 = c.currentTime + delay;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(1, slideTo), t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + Math.min(.02, dur / 3));
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g);
  g.connect(dest || masterGain);
  osc.start(t0);
  osc.stop(t0 + dur + .05);
}

function noise({ dur = .2, gain = .25, filter = 900, delay = 0, sweep = 0 }) {
  const c = ac();
  if (!c || !settings.audio) return;
  const t0 = c.currentTime + delay;
  const frames = Math.max(1, Math.floor(c.sampleRate * dur));
  const buf = c.createBuffer(1, frames, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < frames; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
  const src = c.createBufferSource();
  src.buffer = buf;
  const bp = c.createBiquadFilter();
  bp.type = 'lowpass';
  bp.frequency.setValueAtTime(filter, t0);
  if (sweep) bp.frequency.exponentialRampToValueAtTime(Math.max(60, filter + sweep), t0 + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(bp); bp.connect(g); g.connect(masterGain);
  src.start(t0);
}

// ------------------------------------------------------------ efeitos ------
const SFX = {
  select:   () => tone({ freq: 620, dur: .07, type: 'square', gain: .16 }),
  confirm:  () => { tone({ freq: 620, dur: .08, type: 'square', gain: .18 }); tone({ freq: 930, dur: .1, type: 'square', gain: .14, delay: .06 }); },
  cancel:   () => tone({ freq: 300, dur: .1, type: 'square', gain: .15, slideTo: 180 }),
  blip:     () => tone({ freq: 1100, dur: .022, type: 'square', gain: .045 }),
  hit:      () => { noise({ dur: .16, gain: .3, filter: 1400, sweep: -1100 }); tone({ freq: 160, dur: .12, type: 'triangle', gain: .22, slideTo: 70 }); },
  crit:     () => { noise({ dur: .28, gain: .38, filter: 2600, sweep: -2200 }); tone({ freq: 240, dur: .22, type: 'sawtooth', gain: .25, slideTo: 60 }); },
  miss:     () => tone({ freq: 520, dur: .12, type: 'sine', gain: .12, slideTo: 260 }),
  heal:     () => { tone({ freq: 660, dur: .16, type: 'sine', gain: .18 }); tone({ freq: 880, dur: .2, type: 'sine', gain: .16, delay: .09 }); tone({ freq: 1180, dur: .24, type: 'sine', gain: .12, delay: .18 }); },
  jutsu:    () => { noise({ dur: .4, gain: .22, filter: 500, sweep: 2600 }); tone({ freq: 180, dur: .38, type: 'sawtooth', gain: .16, slideTo: 620 }); },
  ultimate: () => { noise({ dur: .7, gain: .32, filter: 300, sweep: 4200 }); tone({ freq: 110, dur: .6, type: 'sawtooth', gain: .22, slideTo: 880 }); tone({ freq: 220, dur: .6, type: 'square', gain: .12, slideTo: 1320, delay: .08 }); },
  poof:     () => noise({ dur: .3, gain: .26, filter: 2200, sweep: -1900 }),
  levelup:  () => [523, 659, 784, 1047].forEach((f, i) => tone({ freq: f, dur: .22, type: 'triangle', gain: .2, delay: i * .1 })),
  victory:  () => [523, 523, 523, 698, 659, 784].forEach((f, i) => tone({ freq: f, dur: i === 5 ? .5 : .16, type: 'square', gain: .2, delay: i * .13 })),
  defeat:   () => [392, 349, 311, 262].forEach((f, i) => tone({ freq: f, dur: .38, type: 'triangle', gain: .2, delay: i * .22 })),
  choice:   () => { tone({ freq: 880, dur: .1, type: 'sine', gain: .16 }); tone({ freq: 1320, dur: .16, type: 'sine', gain: .12, delay: .08 }); },
  bond:     () => [784, 988, 1175].forEach((f, i) => tone({ freq: f, dur: .2, type: 'sine', gain: .16, delay: i * .09 })),
  dark:     () => { tone({ freq: 90, dur: .8, type: 'sawtooth', gain: .2, slideTo: 55 }); noise({ dur: .8, gain: .14, filter: 260 }); },
  page:     () => noise({ dur: .1, gain: .1, filter: 3200, sweep: -2400 }),
};

export function sfx(name) {
  try { SFX[name]?.(); } catch { /* áudio nunca deve derrubar o jogo */ }
}

// ------------------------------------------------------------- música ------
// Cada faixa é uma sequência de [semitom, duração em batidas]; -1 = pausa.
const A4 = 440;
const note = (semi) => A4 * Math.pow(2, semi / 12);

const TRACKS = {
  village: { bpm: 104, wave: 'triangle', bass: true, seq: [[0,1],[4,1],[7,1],[4,1],[2,1],[7,1],[9,1],[7,1],[-1,1],[5,1],[9,1],[12,1],[7,2],[4,2]] },
  calm:    { bpm: 76, wave: 'sine', bass: true, seq: [[0,2],[7,2],[5,2],[3,2],[-2,2],[5,2],[3,4]] },
  tense:   { bpm: 128, wave: 'square', bass: true, seq: [[0,.5],[0,.5],[3,1],[0,.5],[-2,.5],[1,1],[0,.5],[0,.5],[3,1],[6,1],[5,1]] },
  battle:  { bpm: 152, wave: 'sawtooth', bass: true, seq: [[0,.5],[3,.5],[7,.5],[10,.5],[7,.5],[3,.5],[5,.5],[8,.5],[0,.5],[3,.5],[7,.5],[12,1],[10,1]] },
  boss:    { bpm: 168, wave: 'sawtooth', bass: true, seq: [[-5,.5],[-5,.25],[-2,.75],[-5,.5],[-1,.5],[-5,.5],[-3,.5],[-5,.5],[2,.5],[1,.5],[-1,1],[-5,1]] },
  sad:     { bpm: 64, wave: 'sine', bass: false, seq: [[0,2],[-2,2],[-4,2],[-5,4],[-2,2],[0,4]] },
  hope:    { bpm: 92, wave: 'triangle', bass: true, seq: [[0,1],[4,1],[7,2],[9,1],[7,1],[4,2],[5,1],[9,1],[12,2],[7,2]] },
  dark:    { bpm: 88, wave: 'sawtooth', bass: true, seq: [[-12,2],[-11,1],[-12,1],[-15,2],[-10,2],[-12,4]] },
  title:   { bpm: 84, wave: 'triangle', bass: true, seq: [[0,1.5],[7,.5],[9,2],[7,1],[4,1],[5,2],[0,1],[4,1],[7,1],[12,3]] },
};

function stopMusic() {
  clearTimeout(musicTimer);
  musicTimer = null;
}

/** Toca uma faixa em loop. `null` para silenciar. */
export function music(trackId) {
  if (trackId === currentTrack) return;
  stopMusic();
  currentTrack = trackId;
  if (!trackId || !settings.music || !settings.audio) return;
  const track = TRACKS[trackId];
  if (!track || !ac()) return;

  const beat = 60 / track.bpm;
  let i = 0;

  const step = () => {
    if (currentTrack !== trackId || !settings.music || !settings.audio) return;
    const [semi, beats] = track.seq[i % track.seq.length];
    const dur = beats * beat;
    if (semi > -50) {
      tone({ freq: note(semi), dur: dur * .92, type: track.wave, gain: .1, dest: musicGain });
      if (track.bass && i % 2 === 0) {
        tone({ freq: note(semi - 24), dur: dur * .95, type: 'triangle', gain: .12, dest: musicGain });
      }
    }
    i++;
    musicTimer = setTimeout(step, dur * 1000);
  };
  step();
}

export function setAudioEnabled(on) {
  settings.audio = on;
  if (!on) stopMusic();
  else if (currentTrack) { const t = currentTrack; currentTrack = null; music(t); }
}

export function setMusicEnabled(on) {
  settings.music = on;
  if (!on) stopMusic();
  else if (currentTrack) { const t = currentTrack; currentTrack = null; music(t); }
}

export const nowPlaying = () => currentTrack;

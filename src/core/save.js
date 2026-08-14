// Persistência em localStorage: 3 slots manuais + 1 autosave + configurações.

import { state, loadInto, SAVE_VERSION, partyLevel, displayName } from './state.js';

const PREFIX = 'kalica.save.';
const SETTINGS_KEY = 'kalica.settings';
const AUTOSAVE = 'auto';
export const SLOTS = [1, 2, 3];

let sessionStart = Date.now();

function storage() {
  try {
    const t = '__k';
    localStorage.setItem(t, t);
    localStorage.removeItem(t);
    return localStorage;
  } catch {
    return null; // modo privado / storage bloqueado
  }
}

function key(slot) {
  return PREFIX + slot;
}

/** Tempo de jogo acumulado, incluindo a sessão atual. */
export function currentPlaytime() {
  return (state.playtime || 0) + (Date.now() - sessionStart);
}

export function resetPlaytimeClock() {
  sessionStart = Date.now();
}

export function formatPlaytime(ms) {
  const total = Math.floor((ms || 0) / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  return h > 0 ? `${h}h ${String(m).padStart(2, '0')}min` : `${m}min`;
}

function meta() {
  return {
    version: SAVE_VERSION,
    heroName: displayName('hero'),
    chapter: state.chapter,
    chapterTitle: state.chapterTitle,
    level: partyLevel(),
    party: [...state.party],
    playtime: currentPlaytime(),
    savedAt: Date.now(),
    element: state.hero?.element,
    style: state.hero?.style,
  };
}

/** Grava a partida atual em um slot. */
export function save(slot = AUTOSAVE) {
  const ls = storage();
  if (!ls) return { ok: false, reason: 'storage-unavailable' };
  try {
    state.playtime = currentPlaytime();
    resetPlaytimeClock();
    state.savedAt = Date.now();
    ls.setItem(key(slot), JSON.stringify({ meta: meta(), data: state }));
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: String(e?.message || e) };
  }
}

export const autosave = () => save(AUTOSAVE);

/** Lê o cabeçalho de um slot sem carregar a partida. */
export function peek(slot) {
  const ls = storage();
  if (!ls) return null;
  try {
    const raw = ls.getItem(key(slot));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.meta || null;
  } catch {
    return null;
  }
}

export function listSlots() {
  return SLOTS.map((s) => ({ slot: s, meta: peek(s) }));
}

export function hasAutosave() {
  return Boolean(peek(AUTOSAVE));
}

export const AUTOSAVE_SLOT = AUTOSAVE;

/** Carrega um slot para o estado global. */
export function load(slot = AUTOSAVE) {
  const ls = storage();
  if (!ls) return { ok: false, reason: 'storage-unavailable' };
  try {
    const raw = ls.getItem(key(slot));
    if (!raw) return { ok: false, reason: 'empty' };
    const parsed = JSON.parse(raw);
    if (!parsed?.data) return { ok: false, reason: 'corrupt' };
    if (parsed.data.version !== SAVE_VERSION) {
      return { ok: false, reason: 'version', found: parsed.data.version };
    }
    loadInto(parsed.data);
    resetPlaytimeClock();
    return { ok: true, meta: parsed.meta };
  } catch (e) {
    return { ok: false, reason: String(e?.message || e) };
  }
}

export function erase(slot) {
  const ls = storage();
  if (!ls) return false;
  ls.removeItem(key(slot));
  return true;
}

// -------------------------------------------------------------- ajustes ----
const DEFAULT_SETTINGS = {
  textSpeed: 22,     // ms por caractere (menor = mais rápido)
  audio: true,
  music: true,
  autoAdvance: false,
  battleAnim: true,
  difficulty: 'normal', // easy | normal | hard
};

export function loadSettings() {
  const ls = storage();
  if (!ls) return { ...DEFAULT_SETTINGS };
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(ls.getItem(SETTINGS_KEY) || '{}') };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(s) {
  const ls = storage();
  if (!ls) return false;
  try {
    ls.setItem(SETTINGS_KEY, JSON.stringify(s));
    return true;
  } catch {
    return false;
  }
}

export const settings = loadSettings();

export function updateSettings(patch) {
  Object.assign(settings, patch);
  saveSettings(settings);
  return settings;
}

// ------------------------------------------------- galeria de finais -------
const GALLERY_KEY = 'kalica.gallery';

export function galleryUnlocked() {
  const ls = storage();
  if (!ls) return [];
  try {
    return JSON.parse(ls.getItem(GALLERY_KEY) || '[]');
  } catch {
    return [];
  }
}

export function unlockInGallery(endingId) {
  const ls = storage();
  if (!ls) return false;
  const list = galleryUnlocked();
  if (list.includes(endingId)) return false;
  list.push(endingId);
  try {
    ls.setItem(GALLERY_KEY, JSON.stringify(list));
    return true;
  } catch {
    return false;
  }
}

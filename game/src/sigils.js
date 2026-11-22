// Emberfall Duel — the four sigils.
// Every card belongs to one sigil. A sigil is told apart by BOTH its colour
// and its shape, so the table stays readable even at thumbnail size.
export const SIGILS = {
  ember: {
    key: 'ember',
    name: 'Ember',
    glyph: '▲',
    color: '#e5484d',
    dark: '#7d1a1e',
    soft: '#f6b8b9',
    glow: 'rgba(229, 72, 77, 0.55)',
    motto: 'Burn bright, burn first.',
  },
  tide: {
    key: 'tide',
    name: 'Tide',
    glyph: '●',
    color: '#3e8ef7',
    dark: '#173f7d',
    soft: '#bcd8fb',
    glow: 'rgba(62, 142, 247, 0.55)',
    motto: 'Still water wears stone.',
  },
  gale: {
    key: 'gale',
    name: 'Gale',
    glyph: '◆',
    color: '#2fbf9b',
    dark: '#14594a',
    soft: '#b2e8da',
    glow: 'rgba(47, 191, 155, 0.55)',
    motto: 'The wind owes nobody.',
  },
  stone: {
    key: 'stone',
    name: 'Stone',
    glyph: '■',
    color: '#e8a13a',
    dark: '#7a5210',
    soft: '#f7dcab',
    glow: 'rgba(232, 161, 58, 0.55)',
    motto: 'Stand. Endure. Answer.',
  },
};

export const SIGIL_KEYS = Object.keys(SIGILS);

export function sigilOf(key) {
  return SIGILS[key] ?? SIGILS.ember;
}

// A tiny deterministic random source, so screenshot states and replays
// can be staged from a seed instead of from Math.random.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

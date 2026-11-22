// Emberfall Duel — the card catalogue and the deck.
// 24 original cards, six per sigil. A card has one job: strike the foe,
// raise a shield, or bend the duel with a trick. Costs run 1–6 ember;
// values run 2–13, so every hand is a real decision about what to spend.
import { mulberry32 } from './sigils.js';

// kind: 'strike' hits life, 'guard' raises shield, 'trick' draws cards,
// restores ember, or heals. value is the size of the card's main effect;
// draw / ember / heal are the trick's side effects.
export const CARD_LIST = [
  // ——— Ember ▲ : fast, hungry strikes ———
  { id: 'cinder-slash', name: 'Cinder Slash', sigil: 'ember', cost: 1, kind: 'strike', value: 3, text: 'Deal 3 damage.' },
  { id: 'kindled-edge', name: 'Kindled Edge', sigil: 'ember', cost: 2, kind: 'strike', value: 4, text: 'Deal 4 damage. Draw a card.', draw: 1 },
  { id: 'spark-fan', name: 'Spark Fan', sigil: 'ember', cost: 2, kind: 'strike', value: 5, text: 'Deal 5 damage.' },
  { id: 'flame-lash', name: 'Flame Lash', sigil: 'ember', cost: 3, kind: 'strike', value: 7, text: 'Deal 7 damage.' },
  { id: 'wildfire', name: 'Wildfire', sigil: 'ember', cost: 5, kind: 'strike', value: 11, text: 'Deal 11 damage.' },
  { id: 'ember-nova', name: 'Ember Nova', sigil: 'ember', cost: 6, kind: 'strike', value: 13, text: 'Deal 13 damage.' },
  // ——— Tide ● : shields and calm ———
  { id: 'mist-veil', name: 'Mist Veil', sigil: 'tide', cost: 1, kind: 'guard', value: 4, text: 'Gain 4 shield.' },
  { id: 'stillwater', name: 'Stillwater', sigil: 'tide', cost: 2, kind: 'guard', value: 5, text: 'Gain 5 shield. Draw a card.', draw: 1 },
  { id: 'tide-wall', name: 'Tide Wall', sigil: 'tide', cost: 2, kind: 'guard', value: 7, text: 'Gain 7 shield.' },
  { id: 'moon-pool', name: 'Moon Pool', sigil: 'tide', cost: 3, kind: 'trick', value: 6, text: 'Restore 6 life.', heal: 6 },
  { id: 'deep-calm', name: 'Deep Calm', sigil: 'tide', cost: 3, kind: 'guard', value: 10, text: 'Gain 10 shield.' },
  { id: 'floodgate', name: 'Floodgate', sigil: 'tide', cost: 4, kind: 'guard', value: 12, text: 'Gain 12 shield.' },
  // ——— Gale ◆ : speed, draw and ember ———
  { id: 'quick-gust', name: 'Quick Gust', sigil: 'gale', cost: 1, kind: 'strike', value: 2, text: 'Deal 2 damage. Draw a card.', draw: 1 },
  { id: 'tailwind', name: 'Tailwind', sigil: 'gale', cost: 2, kind: 'trick', value: 3, text: 'Gain 3 ember.', ember: 3 },
  { id: 'zephyr-feint', name: 'Zephyr Feint', sigil: 'gale', cost: 2, kind: 'strike', value: 3, text: 'Deal 3 damage. Gain 2 shield.', shield: 2 },
  { id: 'slipstream', name: 'Slipstream', sigil: 'gale', cost: 3, kind: 'trick', value: 2, text: 'Draw 2 cards.', draw: 2 },
  { id: 'cyclone', name: 'Cyclone', sigil: 'gale', cost: 4, kind: 'strike', value: 8, text: 'Deal 8 damage.' },
  { id: 'storm-call', name: 'Storm Call', sigil: 'gale', cost: 5, kind: 'strike', value: 10, text: 'Deal 10 damage.' },
  // ——— Stone ■ : heavy, patient power ———
  { id: 'pebble-shot', name: 'Pebble Shot', sigil: 'stone', cost: 1, kind: 'strike', value: 2, text: 'Deal 2 damage.' },
  { id: 'bulwark', name: 'Bulwark', sigil: 'stone', cost: 2, kind: 'guard', value: 6, text: 'Gain 6 shield.' },
  { id: 'quarry-hymn', name: 'Quarry Hymn', sigil: 'stone', cost: 3, kind: 'trick', value: 3, text: 'Gain 2 ember and 3 shield.', ember: 2, shield: 3 },
  { id: 'rockfall', name: 'Rockfall', sigil: 'stone', cost: 3, kind: 'strike', value: 6, text: 'Deal 6 damage.' },
  { id: 'granite-fist', name: 'Granite Fist', sigil: 'stone', cost: 4, kind: 'strike', value: 9, text: 'Deal 9 damage.' },
  { id: 'mountains-weight', name: "Mountain's Weight", sigil: 'stone', cost: 5, kind: 'strike', value: 12, text: 'Deal 12 damage.' },
];

export function cardById(id) {
  return CARD_LIST.find((card) => card.id === id) ?? null;
}

// One fresh shuffled copy of the catalogue. A second copy of the three
// cheapest cards keeps early hands from stalling on cost.
export function buildDeck(seed) {
  const random = mulberry32(seed);
  const cards = CARD_LIST.map((card) => ({ ...card }));
  for (const id of ['cinder-slash', 'mist-veil', 'pebble-shot']) {
    const base = cardById(id);
    cards.push({ ...base, id: `${base.id}-ii` });
  }
  for (let i = cards.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

export function drawFrom(deck, hand, count) {
  const drawn = [];
  for (let i = 0; i < count && deck.length > 0; i += 1) {
    const card = deck.shift();
    hand.push(card);
    drawn.push(card);
  }
  return drawn;
}

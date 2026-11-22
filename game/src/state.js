// Emberfall Duel — the duel state and the rules that move it.
// One duel: two mages, 30 life each, ember that grows one a turn to a
// cap of 10. A turn is: draw one, play what your ember allows, end.
// Resonance: the second card of a sigil you already played this turn
// lands +2 stronger — the combo the whole duel is built around.
import { buildDeck, cardById, drawFrom } from './deck.js';

export const MAX_LIFE = 30;
export const MAX_EMBER = 10;
export const HAND_LIMIT = 7;
export const OPENING_HAND = 5;

export function makeMage(name, title, seed) {
  return {
    name,
    title,
    life: MAX_LIFE,
    shield: 0,
    ember: 3,
    emberMax: 3,
    deck: buildDeck(seed),
    hand: [],
    discard: [],
    damageDealt: 0,
    cardsPlayed: 0,
  };
}

export function createDuel(seed) {
  const duel = {
    seed,
    turn: 1,
    phase: 'player', // 'player' | 'foe' | 'over'
    sigilsPlayed: [],
    resonance: null,
    winner: null,
    log: [],
    player: makeMage('Wren', 'Lantern Keeper', seed),
    foe: makeMage('Korr', 'Ashen Magistrate', seed + 101),
  };
  drawFrom(duel.player.deck, duel.player.hand, OPENING_HAND);
  drawFrom(duel.foe.deck, duel.foe.hand, OPENING_HAND);
  pushLog(duel, 'The lanterns are lit. Wren opens the duel.');
  return duel;
}

export function pushLog(duel, line) {
  duel.log.unshift(line);
  if (duel.log.length > 6) duel.log.length = 6;
}

function otherOf(duel, side) {
  return side === 'player' ? duel.foe : duel.player;
}

// Resolve one played card. Returns a short description for the log.
export function playCard(duel, side, cardId) {
  const mage = side === 'player' ? duel.player : duel.foe;
  const rival = otherOf(duel, side);
  const index = mage.hand.findIndex((card) => card.id === cardId);
  if (index === -1) return null;
  const card = mage.hand[index];
  if (card.cost > mage.ember) return null;

  const resonant = duel.sigilsPlayed.includes(card.sigil);
  const boost = resonant ? 2 : 0;
  mage.ember -= card.cost;
  mage.hand.splice(index, 1);
  mage.discard.push(card);
  mage.cardsPlayed += 1;
  duel.sigilsPlayed.push(card.sigil);
  if (resonant) duel.resonance = card.sigil;

  let line = '';
  if (card.kind === 'strike') {
    const damage = card.value + boost;
    const blocked = Math.min(rival.shield, damage);
    rival.shield -= blocked;
    rival.life = Math.max(0, rival.life - (damage - blocked));
    mage.damageDealt += damage - blocked;
    line = `${mage.name} strikes with ${card.name} for ${damage}${blocked ? ` (${blocked} soaked by shield)` : ''}.`;
  } else if (card.kind === 'guard') {
    mage.shield += card.value + boost;
    line = `${mage.name} raises ${card.name}: +${card.value + boost} shield.`;
  } else {
    if (card.heal) {
      mage.life = Math.min(MAX_LIFE, mage.life + card.heal + boost);
      line = `${mage.name} drinks from ${card.name}: +${card.heal + boost} life.`;
    } else if (card.ember) {
      mage.ember = Math.min(MAX_EMBER, mage.ember + card.ember);
      line = `${mage.name} calls ${card.name}: +${card.ember} ember.`;
    } else if (card.draw) {
      drawFrom(mage.deck, mage.hand, card.draw);
      line = `${mage.name} plays ${card.name} and draws ${card.draw}.`;
    }
  }
  if (card.draw && card.kind !== 'trick') {
    drawFrom(mage.deck, mage.hand, card.draw);
    line += ` Draws ${card.draw}.`;
  }
  if (card.shield && card.kind !== 'guard') {
    mage.shield += card.shield;
    line += ` Gains ${card.shield} shield.`;
  }
  if (resonant) line += ` Resonance! ${card.sigil} sings (+2).`;
  pushLog(duel, line);

  if (rival.life <= 0) {
    duel.phase = 'over';
    duel.winner = side;
    pushLog(duel, side === 'player'
      ? 'Korr’s lantern gutters out. Wren takes the duel!'
      : 'Wren’s lantern gutters out. Korr takes the duel.');
  }
  return { card, resonant, boost, line };
}

export function startPlayerTurn(duel) {
  duel.turn += 1;
  const mage = duel.player;
  mage.emberMax = Math.min(MAX_EMBER, mage.emberMax + 1);
  mage.ember = mage.emberMax;
  duel.phase = 'player';
  duel.sigilsPlayed = [];
  duel.resonance = null;
  if (mage.hand.length < HAND_LIMIT) drawFrom(mage.deck, mage.hand, 1);
  pushLog(duel, `Turn ${duel.turn} — Wren draws, ember rises to ${mage.ember}.`);
}

export function startFoeTurn(duel) {
  const mage = duel.foe;
  mage.emberMax = Math.min(MAX_EMBER, mage.emberMax + 1);
  mage.ember = mage.emberMax;
  duel.phase = 'foe';
  duel.sigilsPlayed = [];
  duel.resonance = null;
  if (mage.hand.length < HAND_LIMIT) drawFrom(mage.deck, mage.hand, 1);
  pushLog(duel, `Korr takes turn ${duel.turn}, ember ${mage.ember}.`);
}

export function affordableCards(duel, side) {
  const mage = side === 'player' ? duel.player : duel.foe;
  return mage.hand.filter((card) => card.cost <= mage.ember);
}

export function isOver(duel) {
  return duel.phase === 'over';
}

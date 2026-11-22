// Emberfall Duel — everything the eye sees.
// The table is plain DOM: a card is a <button> with a big value, a sigil
// glyph in its own colour and shape, a cost pip and a name. The renderer
// rebuilds the table from the duel state after every action, so what the
// screenshots show is always the state itself.
import { sigilOf } from './sigils.js';
import { MAX_LIFE } from './state.js';

export function lifePercent(mage) {
  return Math.max(0, Math.round((mage.life / MAX_LIFE) * 100));
}

export function emberPips(mage) {
  let pips = '';
  for (let i = 0; i < mage.emberMax; i += 1) {
    pips += `<span class="pip${i < mage.ember ? ' lit' : ''}" title="ember"></span>`;
  }
  return pips;
}

export function cardFace(card, { playable = false, index = 0 } = {}) {
  const sigil = sigilOf(card.sigil);
  const el = document.createElement('button');
  el.type = 'button';
  el.className = `card sigil-${card.sigil}${playable ? ' playable' : ''}`;
  el.dataset.cardId = card.id;
  el.dataset.index = String(index);
  el.setAttribute('aria-label', `${card.name}, ${sigil.name}, cost ${card.cost}, ${card.text}`);
  el.innerHTML = `
    <span class="card-cost" style="--sigil:${sigil.color}">${card.cost}</span>
    <span class="card-glyph" style="color:${sigil.color}">${sigil.glyph}</span>
    <span class="card-value">${card.value}</span>
    <span class="card-sigil-name" style="color:${sigil.color}">${sigil.name}</span>
    <span class="card-name">${card.name}</span>
    <span class="card-text">${card.text}</span>`;
  return el;
}

export function cardBack(index) {
  const el = document.createElement('div');
  el.className = 'card card-back';
  el.dataset.index = String(index);
  el.innerHTML = '<span class="back-glyph">✦</span><span class="back-word">EMBERFALL</span>';
  return el;
}

function renderMage(duel, side) {
  const mage = side === 'player' ? duel.player : duel.foe;
  const portrait = document.getElementById(`${side}-portrait`);
  portrait.querySelector('.mage-name').textContent = mage.name;
  portrait.querySelector('.mage-title').textContent = mage.title;
  portrait.querySelector('.life-number').textContent = `${mage.life} / ${MAX_LIFE}`;
  portrait.querySelector('.life-fill').style.width = `${lifePercent(mage)}%`;
  portrait.querySelector('.shield-number').textContent = mage.shield > 0 ? `🛡 ${mage.shield}` : '';
  portrait.querySelector('.score-line').textContent = `Damage dealt ${mage.damageDealt} · Cards played ${mage.cardsPlayed}`;
  const emberEl = document.getElementById(`${side}-ember`);
  emberEl.innerHTML = `<span class="ember-label">Ember</span>${emberPips(mage)}<span class="ember-count">${mage.ember}/${mage.emberMax}</span>`;
}

export function renderHands(duel, onCardClick) {
  const foeHand = document.getElementById('foe-hand');
  foeHand.replaceChildren();
  duel.foe.hand.forEach((_, i) => foeHand.appendChild(cardBack(i)));

  const playerHand = document.getElementById('player-hand');
  playerHand.replaceChildren();
  duel.player.hand.forEach((card, i) => {
    const playable = duel.phase === 'player' && card.cost <= duel.player.ember;
    const el = cardFace(card, { playable, index: i });
    el.addEventListener('click', () => onCardClick(card.id));
    playerHand.appendChild(el);
  });
}

export function renderLog(duel) {
  const log = document.getElementById('duel-log');
  log.replaceChildren();
  duel.log.forEach((line) => {
    const li = document.createElement('li');
    li.textContent = line;
    log.appendChild(li);
  });
}

export function renderStatus(duel) {
  const status = document.getElementById('turn-status');
  const turn = document.getElementById('turn-count');
  turn.textContent = `Turn ${duel.turn}`;
  if (duel.phase === 'over') {
    status.textContent = duel.winner === 'player' ? 'Wren wins the duel!' : 'Korr wins the duel.';
  } else if (duel.phase === 'player') {
    status.textContent = 'Your turn — play cards, then end the turn.';
  } else {
    status.textContent = 'Korr is thinking…';
  }
  const endBtn = document.getElementById('end-turn');
  endBtn.disabled = duel.phase !== 'player';
  const resonance = document.getElementById('resonance');
  resonance.textContent = duel.resonance
    ? `✦ Resonance: ${duel.resonance} sings — your next ${duel.resonance} card lands +2`
    : (duel.sigilsPlayed.length > 0
      ? `Sigils played: ${duel.sigilsPlayed.join(' · ')} — match one for +2`
      : 'Play two cards of one sigil in a turn for Resonance +2');
}

export function renderTable(duel, onCardClick) {
  renderMage(duel, 'player');
  renderMage(duel, 'foe');
  renderHands(duel, onCardClick);
  renderLog(duel);
  renderStatus(duel);
  document.getElementById('foe-count').textContent = `${duel.foe.hand.length} cards`;
  document.getElementById('player-count').textContent = `${duel.player.hand.length} cards · deck ${duel.player.deck.length}`;
}

export function showOverlay(kind, duel) {
  const overlay = document.getElementById('overlay');
  const title = document.getElementById('overlay-title');
  const body = document.getElementById('overlay-body');
  overlay.classList.remove('hidden');
  overlay.dataset.kind = kind;
  if (kind === 'title') {
    title.textContent = 'EMBERFALL DUEL';
    body.innerHTML = `
      <p class="tagline">Two lanterns. One table. Thirty life apiece.</p>
      <p>Wren, Lantern Keeper of Veyl, meets Magistrate Korr of the Ashen Court
      in a duel of ember and sigil. Spend ember to play cards, match sigils for
      Resonance, and gutter your rival's lantern out first.</p>
      <p class="howto">Click a card to play it · Keys 1–7 play a card · Enter ends the turn · R restarts · M mutes</p>
      <button type="button" class="big-button" id="start-duel">Light the lanterns</button>`;
  } else if (kind === 'win') {
    title.textContent = 'VICTORY';
    body.innerHTML = `
      <p class="tagline">The Ashen Court bows. Veyl stays lit.</p>
      <p>Wren wins in ${duel.turn} turns, dealing ${duel.player.damageDealt} damage.
      Korr's lantern is out — and the table is yours.</p>
      <button type="button" class="big-button" id="again-duel">Duel again</button>`;
  } else if (kind === 'loss') {
    title.textContent = 'DEFEAT';
    body.innerHTML = `
      <p class="tagline">The lantern gutters out. Korr takes the table.</p>
      <p>Korr wins in ${duel.turn} turns, dealing ${duel.foe.damageDealt} damage.
      Relight the lantern and answer him.</p>
      <button type="button" class="big-button" id="again-duel">Duel again</button>`;
  }
}

export function hideOverlay() {
  const overlay = document.getElementById('overlay');
  overlay.classList.add('hidden');
  overlay.dataset.kind = '';
}

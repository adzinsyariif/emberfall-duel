// Emberfall Duel — boot and the turn loop.
// A duel is: Wren plays cards until her ember runs out, ends the turn,
// Korr answers one card at a time so his choices stay readable, then
// Wren draws and the ember rises. First to gutter the other's lantern
// to zero life wins.
import { createDuel, isOver, playCard, startFoeTurn, startPlayerTurn } from './state.js';
import { chooseFoePlays } from './ai.js';
import { renderTable, showOverlay, hideOverlay } from './render.js';
import { floatText, shakePortrait, flashTable, pulseEmber } from './effects.js';
import { SoundBank } from './audio.js';
import { attachInput } from './input.js';
import { stageShot, stageIsSound } from './shots.js';

const sounds = new SoundBank();
let duel = null;
let busy = false; // true while Korr is playing, so clicks cannot interleave

function refresh() {
  renderTable(duel, onCardClick);
}

function describeResult(result, side) {
  if (!result) return;
  const { card } = result;
  soundsFor(card, result.resonant);
  const portrait = document.getElementById(side === 'player' ? 'foe-portrait' : 'player-portrait');
  if (card.kind === 'strike') {
    floatText(portrait, `-${card.value + result.boost}`, 'damage');
    shakePortrait(side === 'player' ? 'foe' : 'player');
    flashTable('hit');
  } else if (card.kind === 'guard') {
    floatText(document.getElementById(side === 'player' ? 'player-portrait' : 'foe-portrait'), `+${card.value + result.boost} 🛡`, 'shield');
    flashTable('heal');
  } else {
    floatText(document.getElementById(side === 'player' ? 'player-portrait' : 'foe-portrait'), card.name, 'trick');
  }
}

function soundsFor(card, resonant) {
  if (card.kind === 'strike') sounds.strike();
  else if (card.kind === 'guard') sounds.guard();
  else sounds.trick();
  if (resonant) sounds.resonance();
}

function onCardClick(cardId) {
  if (busy || isOver(duel) || duel.phase !== 'player') return;
  const result = playCard(duel, 'player', cardId);
  if (!result) {
    sounds.click();
    return;
  }
  describeResult(result, 'player');
  pulseEmber('player');
  refresh();
  if (isOver(duel)) endDuel();
}

function endTurn() {
  if (busy || isOver(duel) || duel.phase !== 'player') return;
  busy = true;
  sounds.turn();
  startFoeTurn(duel);
  refresh();
  const plays = chooseFoePlays(duel);
  let step = 0;
  const playNext = () => {
    if (isOver(duel)) {
      busy = false;
      endDuel();
      return;
    }
    if (step >= plays.length) {
      busy = false;
      startPlayerTurn(duel);
      sounds.turn();
      refresh();
      return;
    }
    const result = playCard(duel, 'foe', plays[step]);
    step += 1;
    if (result) describeResult(result, 'foe');
    pulseEmber('foe');
    refresh();
    window.setTimeout(playNext, 850);
  };
  window.setTimeout(playNext, 700);
}

function endDuel() {
  refresh();
  if (duel.winner === 'player') sounds.win();
  else sounds.lose();
  window.setTimeout(() => showOverlay(duel.winner === 'player' ? 'win' : 'loss', duel), 650);
}

function newDuel(seed) {
  duel = createDuel(seed ?? Math.floor(Math.random() * 100000));
  busy = false;
  hideOverlay();
  refresh();
}

function startFromTitle() {
  sounds.deal();
  hideOverlay();
  refresh();
}

function boot() {
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  const seed = Number(params.get('seed') ?? '7') || 7;

  if (shot) {
    // Screenshot mode: render one fixed state, take no turns. Animations
    // are switched off so the capture always shows the settled table.
    document.documentElement.classList.add('shot-mode');
    const staged = stageShot(shot, seed);
    if (!stageIsSound(staged)) {
      document.getElementById('turn-status').textContent = 'Staged state failed its check.';
      return;
    }
    duel = staged.duel;
    renderTable(duel, () => {});
    if (staged.overlay) showOverlay(staged.overlay, duel);
    document.title = `Emberfall Duel — ${shot}`;
    return;
  }

  newDuel();
  showOverlay('title', duel);
  attachInput({
    endTurn,
    restart: () => newDuel(),
    start: startFromTitle,
    toggleMute: () => {
      const muted = sounds.toggleMute();
      document.getElementById('mute-btn').textContent = muted ? '🔇 Muted' : '🔊 Sound';
    },
    playByIndex: (index) => {
      const card = duel.player.hand[index];
      if (card) onCardClick(card.id);
    },
  });
  document.getElementById('mute-btn').textContent = '🔊 Sound';
}

boot();

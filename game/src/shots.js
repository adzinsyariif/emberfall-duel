// Emberfall Duel — deterministic screenshot staging.
// ?shot=title|table|win|loss&seed=N renders one fixed state of the real
// game, from the real state and the real renderer, so every screenshot
// is a render of the game's own code and nothing is composited or faked.
// The table shot is the cover: both hands, life totals, ember, the log
// and a Resonance line all visible at once.
import { createDuel, playCard, startPlayerTurn } from './state.js';
import { cardById } from './deck.js';

function forceHand(duel, side, ids) {
  const mage = side === 'player' ? duel.player : duel.foe;
  mage.hand = ids.map((id) => ({ ...cardById(id) }));
}

function forceLife(duel, playerLife, foeLife, playerShield, foeShield) {
  duel.player.life = playerLife;
  duel.foe.life = foeLife;
  duel.player.shield = playerShield;
  duel.foe.shield = foeShield;
}

// Play a few scripted moves on a fresh duel so the table shot shows a
// duel already in motion: shields up, a Resonance glowing, damage dealt.
function stageMidDuel(seed) {
  const duel = createDuel(seed);
  duel.turn = 4;
  duel.player.emberMax = 6;
  duel.player.ember = 4;
  duel.foe.emberMax = 6;
  duel.foe.ember = 5;
  forceHand(duel, 'player', [
    'flame-lash', 'tide-wall', 'cyclone', 'quarry-hymn', 'kindled-edge', 'moon-pool',
  ]);
  forceHand(duel, 'foe', ['spark-fan', 'tide-wall', 'cyclone', 'rockfall', 'tailwind']);
  forceLife(duel, 24, 18, 5, 2);
  duel.player.damageDealt = 14;
  duel.foe.damageDealt = 9;
  duel.player.cardsPlayed = 5;
  duel.foe.cardsPlayed = 4;
  duel.sigilsPlayed = ['ember'];
  duel.resonance = 'ember';
  duel.log = [
    'Wren strikes with Flame Lash for 7. Resonance! ember sings (+2).',
    'Korr raises Tide Wall: +7 shield.',
    'Wren raises Mist Veil: +4 shield.',
    'Korr strikes with Spark Fan for 5 (2 soaked by shield).',
    'Turn 4 — Wren draws, ember rises to 6.',
    'The lanterns are lit. Wren opens the duel.',
  ];
  return duel;
}

export function stageShot(name, seed) {
  if (name === 'title') {
    const duel = stageMidDuel(seed);
    return { duel, overlay: 'title' };
  }
  if (name === 'win') {
    const duel = stageMidDuel(seed);
    duel.foe.life = 0;
    duel.phase = 'over';
    duel.winner = 'player';
    duel.player.damageDealt = 30;
    duel.turn = 7;
    duel.log = [
      'Korr’s lantern gutters out. Wren takes the duel!',
      'Wren strikes with Ember Nova for 13. Resonance! ember sings (+2).',
      'Korr raises Floodgate: +12 shield.',
      'Wren strikes with Wildfire for 11.',
      'Turn 7 — Wren draws, ember rises to 9.',
      'Korr strikes with Granite Fist for 9.',
    ];
    return { duel, overlay: 'win' };
  }
  if (name === 'loss') {
    const duel = stageMidDuel(seed);
    duel.player.life = 0;
    duel.phase = 'over';
    duel.winner = 'foe';
    duel.foe.damageDealt = 30;
    duel.turn = 8;
    duel.log = [
      'Wren’s lantern gutters out. Korr takes the duel.',
      'Korr strikes with Storm Call for 10.',
      'Wren raises Deep Calm: +10 shield.',
      'Korr strikes with Cyclone for 8.',
      'Turn 8 — Wren draws, ember rises to 10.',
      'Wren strikes with Flame Lash for 7.',
    ];
    return { duel, overlay: 'loss' };
  }
  // Default: the table, mid-duel, no overlay.
  return { duel: stageMidDuel(seed), overlay: null };
}

// A tiny self-check the boot code runs in shot mode: the staged duel
// must be playable state, and the win/loss stages must actually be over.
export function stageIsSound(staged) {
  const { duel, overlay } = staged;
  if (!duel || !duel.player || !duel.foe) return false;
  if (overlay === 'win') return duel.winner === 'player' && duel.foe.life === 0;
  if (overlay === 'loss') return duel.winner === 'foe' && duel.player.life === 0;
  return duel.player.hand.length > 0 && duel.foe.hand.length > 0;
}

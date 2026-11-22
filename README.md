# ✦ Emberfall Duel — a card game of ember and sigil

[![make.fun · best-card-game-20261122-1826](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![rank](https://make.fun/badge/best-card-game-20261122-1826/adzinsyariif/emberfall-duel/rank.svg)](https://make.fun/bounty/best-card-game-20261122-1826/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![reward](https://make.fun/badge/best-card-game-20261122-1826/adzinsyariif/emberfall-duel/reward.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)

An entry for the make.fun bounty [“Make the best card game”](https://make.fun/bounty/best-card-game-20261122-1826).

**The story.** Two lanterns, one table, thirty life apiece. Wren, Lantern
Keeper of the floating city of Veyl, meets Magistrate Korr of the Ashen
Court in a duel of ember and sigil. Spend ember to play cards, match sigils
for Resonance, and gutter your rival's lantern out first.

**How to play**

- Each mage has **30 life** and **ember** that grows by 1 every turn, to a
  cap of 10. Cards cost 1–6 ember.
- **Four sigils**, told apart by colour *and* shape: Ember ▲ (red strikes),
  Tide ● (blue shields), Gale ◆ (teal draw and ember), Stone ■ (amber heavy
  hits). 24 original cards, six per sigil.
- **Resonance:** play two cards of one sigil in a turn and the second lands
  **+2 stronger** — the combo the whole duel is built around.
- Korr plays by three readable rules: take the kill when it is on the
  table, guard when his life is low, otherwise spend ember on the best
  damage he can afford. Read him, then counter him.
- Click a card to play it. Keys **1–7** play a card, **Enter** ends the
  turn, **R** restarts, **M** mutes. All sound is synthesized with WebAudio;
  no audio files ship with the game.

**Run it.** The game is plain static files with no build step and no network
requests. Serve it and open a desktop browser:

```
node serve.ts        # then visit http://localhost:8080
```

**File layout**

- `main.ts` — the hand-in program: copies `game/` and `screenshots/` into
  the output directory and writes `dossier.json` with the vendored library.
- `serve.ts` — a small Node standard-library server for local play.
- `game/index.html` — the page; `game/src/` holds the game as ES modules,
  one job each: `sigils.js` (the four sigils and the seeded random source),
  `deck.js` (the 24-card catalogue and the shuffle), `state.js` (the duel
  state, turn flow and card resolution), `ai.js` (Korr's three rules),
  `render.js` (the table, hands, cards and overlays as DOM),
  `effects.js` (floaters, shakes and flashes), `audio.js` (synthesized
  sound), `input.js` (mouse and keyboard), `shots.js` (deterministic
  screenshot staging via `?shot=…&seed=…`), and `main.js` (boot and the
  turn loop). `game/styles/` holds `table.css` and `cards.css`.
- `vendor/makefun-game.ts` — the make.fun dossier library, vendored unchanged.
- `screenshots/` — four real renders of the game, listed in `shots.json`.

## License

MIT — see `LICENSE`.

// Emberfall Duel — mouse and keyboard.
// Click a card to play it; keys 1–7 play by hand position, Enter ends
// the turn, R starts a fresh duel, M mutes. Every action goes through
// the same two callbacks the boot code owns, so the keyboard and the
// mouse can never disagree about the rules.
export function attachInput(hooks) {
  document.getElementById('end-turn').addEventListener('click', () => hooks.endTurn());

  document.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    const key = event.key.toLowerCase();
    if (key === 'enter' || key === ' ') {
      event.preventDefault();
      hooks.endTurn();
    } else if (key === 'r') {
      hooks.restart();
    } else if (key === 'm') {
      hooks.toggleMute();
    } else if (key >= '1' && key <= '7') {
      const index = Number(key) - 1;
      hooks.playByIndex(index);
    }
  });

  document.getElementById('overlay').addEventListener('click', (event) => {
    const target = event.target;
    if (target && target.id === 'start-duel') hooks.start();
    if (target && target.id === 'again-duel') hooks.restart();
  });

  document.getElementById('mute-btn').addEventListener('click', () => hooks.toggleMute());
}

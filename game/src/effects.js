// Emberfall Duel — motion and feedback on the table.
// Cards slide, flip and snap; damage floats up from the portrait it
// lands on; the table flashes when a big hit lands. All of it is CSS
// classes and short-lived nodes — no library, no canvas.

export function floatText(target, text, kind) {
  if (!target) return;
  const floater = document.createElement('div');
  floater.className = `float-text float-${kind}`;
  floater.textContent = text;
  const box = target.getBoundingClientRect();
  const table = document.getElementById('table');
  const tableBox = table ? table.getBoundingClientRect() : { left: 0, top: 0 };
  floater.style.left = `${box.left - tableBox.left + box.width / 2}px`;
  floater.style.top = `${box.top - tableBox.top}px`;
  table.appendChild(floater);
  window.setTimeout(() => floater.remove(), 1400);
}

export function shakePortrait(side) {
  const el = document.getElementById(side === 'player' ? 'player-portrait' : 'foe-portrait');
  if (!el) return;
  el.classList.remove('shake');
  void el.offsetWidth; // restart the animation
  el.classList.add('shake');
}

export function flashTable(kind) {
  const table = document.getElementById('table');
  if (!table) return;
  table.classList.remove('flash-hit', 'flash-heal');
  void table.offsetWidth;
  table.classList.add(kind === 'heal' ? 'flash-heal' : 'flash-hit');
  window.setTimeout(() => table.classList.remove('flash-hit', 'flash-heal'), 450);
}

export function pulseEmber(side) {
  const el = document.getElementById(side === 'player' ? 'player-ember' : 'foe-ember');
  if (!el) return;
  el.classList.remove('pulse');
  void el.offsetWidth;
  el.classList.add('pulse');
}

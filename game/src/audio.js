// Emberfall Duel — every sound is synthesized with WebAudio.
// No audio files ship with the game, so nothing is ever fetched.
export class SoundBank {
  constructor() {
    this.context = null;
    this.muted = false;
  }

  ensure() {
    if (!this.context) {
      const Ctor = window.AudioContext || window.webkitAudioContext;
      if (!Ctor) return null;
      this.context = new Ctor();
    }
    if (this.context.state === 'suspended') void this.context.resume();
    return this.context;
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  tone(freq, dur, type, gain, when = 0, slideTo = null) {
    if (this.muted) return;
    const ctx = this.ensure();
    if (!ctx) return;
    const start = ctx.currentTime + when;
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, start + dur);
    amp.gain.setValueAtTime(0.0001, start);
    amp.gain.exponentialRampToValueAtTime(gain, start + 0.012);
    amp.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(amp).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + dur + 0.05);
  }

  click() { this.tone(660, 0.07, 'triangle', 0.08); }
  deal() { this.tone(520, 0.09, 'sine', 0.07, 0, 780); }
  playCard() { this.tone(392, 0.12, 'triangle', 0.1, 0, 587); }
  strike() { this.tone(160, 0.22, 'sawtooth', 0.12, 0, 60); this.tone(90, 0.3, 'square', 0.07, 0.02, 45); }
  guard() { this.tone(330, 0.18, 'sine', 0.09, 0, 495); this.tone(495, 0.18, 'sine', 0.06, 0.06); }
  trick() { this.tone(740, 0.1, 'sine', 0.07); this.tone(988, 0.12, 'sine', 0.07, 0.08); }
  resonance() { this.tone(587, 0.1, 'triangle', 0.09); this.tone(880, 0.16, 'triangle', 0.09, 0.08); }
  turn() { this.tone(440, 0.12, 'triangle', 0.07, 0, 554); }
  win() {
    [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.32, 'triangle', 0.1, i * 0.13));
  }
  lose() {
    [392, 330, 262, 196].forEach((f, i) => this.tone(f, 0.34, 'sine', 0.09, i * 0.15));
  }
}

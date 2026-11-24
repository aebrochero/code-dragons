/**
 * 8-Bit Procedural Chiptune Audio Synthesizer using Web Audio API.
 * Zero external audio files required.
 */

export type SfxName =
  | 'jump'
  | 'land'
  | 'step'
  | 'dash'
  | 'openAltar'
  | 'codeSuccess'
  | 'codeError'
  | 'damage'
  | 'bloodPact'
  | 'potion'
  | 'buy'
  | 'checkpoint'
  | 'levelUp'
  | 'bossHit'
  | 'bossVictory'
  | 'click';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private muted = false;
  private musicTimer: number | null = null;
  private musicPlaying = false;
  private stepIndex = 0;

  private ensureContext(): AudioContext | null {
    if (this.muted) return null;
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.muted = muted;
    if (muted) {
      this.stopMusic();
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public isMusicPlaying(): boolean {
    return this.musicPlaying;
  }

  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType = 'square',
    volume = 0.08,
    delay = 0,
    slideTo?: number
  ) {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slideTo) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), now + duration);
    }

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  private playNoise(duration: number, volume = 0.08, delay = 0) {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const sampleRate = ctx.sampleRate;
    const length = Math.floor(sampleRate * duration);
    const buffer = ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const now = ctx.currentTime + delay;
    const src = ctx.createBufferSource();
    src.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(900, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    src.start(now);
    src.stop(now + duration + 0.02);
  }

  public play(sfx: SfxName) {
    if (this.muted) return;
    const jitter = 0.94 + Math.random() * 0.12;

    switch (sfx) {
      case 'jump':
        this.playTone(230 * jitter, 0.13, 'square', 0.07, 0, 520 * jitter);
        break;
      case 'land':
        this.playNoise(0.06, 0.05);
        this.playTone(110 * jitter, 0.05, 'triangle', 0.06, 0, 75);
        break;
      case 'step':
        this.playTone(150 * jitter, 0.035, 'triangle', 0.035, 0, 100);
        break;
      case 'dash':
        this.playNoise(0.11, 0.07);
        this.playTone(460, 0.1, 'sawtooth', 0.05, 0, 180);
        break;
      case 'click':
        this.playTone(620, 0.04, 'square', 0.05);
        break;
      case 'openAltar':
        this.playTone(330, 0.09, 'triangle', 0.08, 0);
        this.playTone(440, 0.09, 'triangle', 0.08, 0.07);
        this.playTone(659.25, 0.16, 'triangle', 0.09, 0.14);
        break;
      case 'codeSuccess':
        // Triumphant 8-bit RPG arpeggio
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
          this.playTone(freq, 0.14, 'square', 0.075, idx * 0.08);
        });
        break;
      case 'codeError':
        this.playTone(220, 0.14, 'sawtooth', 0.09, 0, 150);
        this.playTone(165, 0.22, 'sawtooth', 0.09, 0.11, 105);
        this.playNoise(0.12, 0.06, 0.04);
        break;
      case 'damage':
        this.playNoise(0.15, 0.1);
        this.playTone(185, 0.16, 'sawtooth', 0.1, 0, 82);
        break;
      case 'bloodPact':
        this.playTone(146.8, 0.18, 'sawtooth', 0.08, 0, 110);
        this.playTone(220, 0.2, 'triangle', 0.07, 0.1, 165);
        break;
      case 'potion':
        this.playTone(392, 0.08, 'triangle', 0.08, 0, 523);
        this.playTone(523, 0.1, 'triangle', 0.08, 0.08, 784);
        this.playTone(784, 0.14, 'sine', 0.08, 0.16, 1046);
        break;
      case 'buy':
        this.playTone(987.77, 0.07, 'square', 0.07, 0);
        this.playTone(1318.5, 0.14, 'square', 0.07, 0.07);
        break;
      case 'checkpoint':
        [293.66, 369.99, 440, 587.33].forEach((f, i) => {
          this.playTone(f, 0.16, 'triangle', 0.07, i * 0.075);
        });
        break;
      case 'levelUp':
        [392, 493.88, 587.33, 783.99, 987.77].forEach((f, i) => {
          this.playTone(f, 0.16, 'square', 0.08, i * 0.085);
        });
        break;
      case 'bossHit':
        this.playNoise(0.22, 0.12);
        this.playTone(320, 0.18, 'sawtooth', 0.1, 0, 90);
        this.playTone(587.33, 0.14, 'square', 0.07, 0.14, 784);
        break;
      case 'bossVictory':
        [523.25, 587.33, 659.25, 783.99, 659.25, 783.99, 1046.5].forEach((f, i) => {
          this.playTone(f, i === 6 ? 0.36 : 0.12, 'square', 0.08, i * 0.1);
        });
        break;
    }
  }

  public startMusic() {
    if (this.muted || this.musicPlaying) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    this.musicPlaying = true;

    // Medieval Dorian-mode 8-bit melody loop (D Dorian: D E F G A B C)
    const melody = [
      293.66, 349.23, 440.0, 392.0,
      349.23, 329.63, 293.66, 0,
      293.66, 349.23, 440.0, 523.25,
      493.88, 440.0, 392.0, 0,
    ];
    const bass = [
      146.83, 0, 146.83, 0,
      130.81, 0, 146.83, 0,
      116.54, 0, 130.81, 0,
      146.83, 0, 110.0, 0,
    ];

    this.musicTimer = window.setInterval(() => {
      if (this.muted || !this.musicPlaying) return;
      const idx = this.stepIndex % melody.length;
      const mFreq = melody[idx];
      const bFreq = bass[idx];
      if (mFreq > 0) this.playTone(mFreq, 0.16, 'square', 0.025);
      if (bFreq > 0) this.playTone(bFreq, 0.22, 'triangle', 0.035);
      this.stepIndex++;
    }, 240);
  }

  public stopMusic() {
    this.musicPlaying = false;
    if (this.musicTimer !== null) {
      window.clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }

  public toggleMusic(): boolean {
    if (this.musicPlaying) {
      this.stopMusic();
      return false;
    }
    this.muted = false;
    this.startMusic();
    return true;
  }
}

export const soundEngine = new SoundEngine();

/**
 * Web Audio API Sound Synthesizer for LumusCards
 * Provides crisp audio rewards without relying on external MP3 downloads.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private soundPack: 'default' | 'retro8bit' | 'zen' = 'default';

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setSoundPack(pack: 'default' | 'retro8bit' | 'zen') {
    this.soundPack = pack;
  }

  // Creamy ASMR Mechanical Keyboard Keypress Sound
  public playKeypress(key?: string) {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Organic pitch variation (+/- 30 cents) for realistic keycap feel
      const randomDetune = (Math.random() - 0.5) * 60;

      // Frequency tuning based on key type
      let baseFreq = 340; // Default letter key bump
      if (key === 'Enter' || key === ' ') {
        baseFreq = 220; // Deeper spacebar/enter thock
      } else if (key === 'Backspace' || key === 'Delete') {
        baseFreq = 410; // Crisp backspace clack
      }

      // 1. Tactile Switch Thock (Dampened Sine Pulse)
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.detune.setValueAtTime(randomDetune, now);
      
      oscGain.gain.setValueAtTime(0.22, now);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);

      osc.connect(oscGain);
      oscGain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.045);

      // 2. Creamy Keycap Bottoming Out (Filtered Warm Noise)
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.025); // ~25ms noise burst
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      // Lowpass filter to shape into a warm, creamy mechanical switch sound
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(key === 'Enter' || key === ' ' ? 900 : 1250, now);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.15, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);

      noise.start(now);
      noise.stop(now + 0.03);
    } catch (e) {
      console.warn('Keypress audio error:', e);
    }
  }

  // UI click handler
  public playClick() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      if (this.soundPack === 'zen') {
        // Soft soothing resonant chime
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.18);
      } else {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = this.soundPack === 'retro8bit' ? 'square' : 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);
        gain.gain.setValueAtTime(0.28, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.05);
      }
    } catch (e) {
      console.warn('Audio error:', e);
    }
  }

  // Card Flip Swoosh
  public playFlip() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      if (this.soundPack === 'zen') {
        // Soothing 432Hz -> 540Hz warm sine sweep
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(432, now);
        osc.frequency.exponentialRampToValueAtTime(540, now + 0.14);
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.14);
      } else {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = this.soundPack === 'retro8bit' ? 'square' : 'triangle';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.08);
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
      }
    } catch (e) {
      console.warn('Audio error:', e);
    }
  }

  // SRS Rating: Again
  public playAgain() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      if (this.soundPack === 'zen') {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(216, now); // Low 216Hz Zen tone
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.35);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
      } else {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = this.soundPack === 'retro8bit' ? 'square' : 'sine';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.setValueAtTime(196, now + 0.1);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
      }
    } catch (e) {
      console.warn('Audio error:', e);
    }
  }

  // SRS Rating: Hard
  public playHard() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      if (this.soundPack === 'zen') {
        // Soothing dual sine interval
        [324, 432].forEach((freq, idx) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.06);
          gain.gain.setValueAtTime(0.06, now + idx * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 0.4);
          osc.connect(gain);
          gain.connect(this.ctx!.destination);
          osc.start(now + idx * 0.06);
          osc.stop(now + idx * 0.06 + 0.4);
        });
      } else {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = this.soundPack === 'retro8bit' ? 'square' : 'sine';
        osc.frequency.setValueAtTime(330, now);
        osc.frequency.setValueAtTime(440, now + 0.08);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
      }
    } catch (e) {
      console.warn('Audio error:', e);
    }
  }

  // SRS Rating: Good - Resonant Zen Bell Triad
  public playGood() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      if (this.soundPack === 'zen') {
        // Warm 432Hz Pentatonic Zen Bell
        const notes = [432, 540, 648]; // Resonant warm triad
        notes.forEach((freq, idx) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);
          gain.gain.setValueAtTime(0.08, now + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.6);
          osc.connect(gain);
          gain.connect(this.ctx!.destination);
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.6);
        });
      } else {
        const freqs = this.soundPack === 'retro8bit' ? [523.25, 659.25] : [523.25, 659.25, 783.99];
        freqs.forEach((freq, idx) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          osc.type = this.soundPack === 'retro8bit' ? 'square' : 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.04);
          gain.gain.setValueAtTime(0.1, now + idx * 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.25);
          osc.connect(gain);
          gain.connect(this.ctx!.destination);
          osc.start(now + idx * 0.04);
          osc.stop(now + idx * 0.04 + 0.25);
        });
      }
    } catch (e) {
      console.warn('Audio error:', e);
    }
  }

  // SRS Rating: Easy - Zen Singing Bowl Cascade
  public playEasy() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      if (this.soundPack === 'zen') {
        const notes = [432, 540, 648, 864];
        notes.forEach((freq, i) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.07);
          gain.gain.setValueAtTime(0.08, now + i * 0.07);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.07 + 0.8);
          osc.connect(gain);
          gain.connect(this.ctx!.destination);
          osc.start(now + i * 0.07);
          osc.stop(now + i * 0.07 + 0.8);
        });
      } else {
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, i) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          osc.type = this.soundPack === 'retro8bit' ? 'square' : 'triangle';
          osc.frequency.setValueAtTime(freq, now + i * 0.03);
          gain.gain.setValueAtTime(0.1, now + i * 0.03);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.03 + 0.3);
          osc.connect(gain);
          gain.connect(this.ctx!.destination);
          osc.start(now + i * 0.03);
          osc.stop(now + i * 0.03 + 0.3);
        });
      }
    } catch (e) {
      console.warn('Audio error:', e);
    }
  }

  // Combo Streak Multiplier Sound
  public playCombo() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      if (this.soundPack === 'zen') {
        const notes = [216, 270, 324, 432, 540];
        notes.forEach((freq, i) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.08);
          gain.gain.setValueAtTime(0.08, now + i * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 0.7);
          osc.connect(gain);
          gain.connect(this.ctx!.destination);
          osc.start(now + i * 0.08);
          osc.stop(now + i * 0.08 + 0.7);
        });
      } else {
        const notes = [440, 554.37, 659.25, 880, 1108.73];
        notes.forEach((freq, i) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          osc.type = this.soundPack === 'retro8bit' ? 'square' : 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.05);
          gain.gain.setValueAtTime(0.12, now + i * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.35);
          osc.connect(gain);
          gain.connect(this.ctx!.destination);
          osc.start(now + i * 0.05);
          osc.stop(now + i * 0.05 + 0.35);
        });
      }
    } catch (e) {
      console.warn('Audio error:', e);
    }
  }

  // Level Up Fanfare
  public playLevelUp() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      if (this.soundPack === 'zen') {
        const notes = [324, 432, 540, 648, 864];
        notes.forEach((freq, i) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.12);
          gain.gain.setValueAtTime(0.09, now + i * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.12 + 1.0);
          osc.connect(gain);
          gain.connect(this.ctx!.destination);
          osc.start(now + i * 0.12);
          osc.stop(now + i * 0.12 + 1.0);
        });
      } else {
        const chords = [
          { freqs: [261.63, 329.63, 392.00], duration: 0.15 },
          { freqs: [293.66, 349.23, 440.00], duration: 0.15 },
          { freqs: [329.63, 392.00, 493.88], duration: 0.15 },
          { freqs: [523.25, 659.25, 783.99, 1046.50], duration: 0.6 }
        ];

        let timeOffset = 0;
        chords.forEach((chord) => {
          chord.freqs.forEach((freq) => {
            const osc = this.ctx!.createOscillator();
            const gain = this.ctx!.createGain();
            osc.type = this.soundPack === 'retro8bit' ? 'square' : 'triangle';
            osc.frequency.setValueAtTime(freq, now + timeOffset);
            gain.gain.setValueAtTime(0.12, now + timeOffset);
            gain.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + chord.duration);
            osc.connect(gain);
            gain.connect(this.ctx!.destination);
            osc.start(now + timeOffset);
            osc.stop(now + timeOffset + chord.duration);
          });
          timeOffset += chord.duration * 0.8;
        });
      }
    } catch (e) {
      console.warn('Audio error:', e);
    }
  }

  // Rocket takeoff audio for onboarding
  public playRocketTakeoff() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 1.2);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 1.2);
    } catch (e) {
      console.warn('Audio error:', e);
    }
  }
}

export const soundEngine = new SoundEngine();

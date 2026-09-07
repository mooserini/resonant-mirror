// Retro Web Audio Synthesizer for Authentic Vintage PC Beeps

class RetroSoundEngine {
  private audioCtx: AudioContext | null = null;
  public isMuted: boolean = true; // Muted by default for polite browsing

  private getContext(): AudioContext | null {
    if (this.isMuted) return null;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (!this.isMuted) {
      this.playPostBeep(880, 0.08); // Friendly confirmation chirp
    }
    return this.isMuted;
  }

  // Classic IBM / AT&T PC POST Beep
  public playPostBeep(freq: number = 890, duration: number = 0.12): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square'; // Vintage square wave speaker
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  // Boot sequence dual beep
  public playBootSuccess(): void {
    this.playPostBeep(587.33, 0.08); // D5
    setTimeout(() => {
      this.playPostBeep(880, 0.14); // A5
    }, 110);
  }

  // FIDO Authenticated Chime
  public playFidoSuccess(): void {
    this.playPostBeep(523.25, 0.07); // C5
    setTimeout(() => this.playPostBeep(659.25, 0.07), 80); // E5
    setTimeout(() => this.playPostBeep(783.99, 0.12), 160); // G5
  }

  // Retro 8-bit Achievement Fanfare Chime
  public playAchievementFanfare(): void {
    const notes = [
      { freq: 523.25, dur: 0.08, delay: 0 },    // C5
      { freq: 659.25, dur: 0.08, delay: 85 },   // E5
      { freq: 783.99, dur: 0.08, delay: 170 },  // G5
      { freq: 1046.50, dur: 0.22, delay: 260 }, // C6
    ];
    notes.forEach((n) => {
      setTimeout(() => this.playPostBeep(n.freq, n.dur), n.delay);
    });
  }

  // Mechanical Key Click
  public playKeyclick(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      gain.gain.setValueAtTime(0.015, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.02);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.02);
    } catch {
      // Ignore
    }
  }

  public playKeyClick(): void {
    this.playKeyclick();
  }

  public playError(): void {
    this.playModemError();
  }

  // Modem Connection Error Buzzer
  public playModemError(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      // Harsh dual low-frequency error buzz
      const freqs = [330, 220];
      freqs.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.03, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.28);
      });
    } catch {
      // Ignore
    }
  }

  // Classic 1980s US Dial Tone (350Hz + 440Hz dual sine)
  public playDialTone(duration: number = 0.6): void {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      [350, 440].forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.025, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration);
      });
    } catch {
      // Ignore
    }
  }

  // Short Retro Bell 212A / V.22bis Carrier Chirp
  public playCarrierHandshake(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const burst = [
        { freq: 1200, delay: 0, dur: 0.08 },
        { freq: 2400, delay: 0.09, dur: 0.08 },
        { freq: 1800, delay: 0.18, dur: 0.14 },
      ];
      burst.forEach(({ freq, delay, dur }) => {
        setTimeout(() => {
          if (!this.getContext()) return;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          gain.gain.setValueAtTime(0.02, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + dur);
        }, delay * 1000);
      });
    } catch {
      // Ignore
    }
  }
}

export const retroAudio = new RetroSoundEngine();

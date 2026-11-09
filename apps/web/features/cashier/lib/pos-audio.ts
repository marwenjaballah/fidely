/**
 * Web Audio POS Sound Synthesizer & Haptic Engine
 * Provides immediate auditory and tactile feedback for fast retail operations without external audio assets.
 */

class POSAudioEngine {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  /**
   * Crisp celebratory POS register chime (Major Arpeggio C5 -> E5 -> G5 -> C6)
   */
  playSuccess() {
    // Tactile vibration
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([40, 30, 80]);
      } catch {}
    }

    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      const now = ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        gain.gain.setValueAtTime(0.18, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.36);
      });
    } catch (e) {
      console.warn('POS Audio play error:', e);
    }
  }

  /**
   * Low double-boop buzzer for errors/mismatches
   */
  playError() {
    // Tactile vibration
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([100, 50, 150]);
      } catch {}
    }

    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [240, 180];

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);

        gain.gain.setValueAtTime(0.12, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.18);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.19);
      });
    } catch (e) {
      console.warn('POS Audio play error:', e);
    }
  }

  /**
   * Subtle mechanical tactile click on numpad tap
   */
  playClick() {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(10);
      } catch {}
    }

    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, now);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch {}
  }

  /**
   * Coffee Counter "Order Ready" Digital Buzzer Chime
   * Plays an unmistakable two-stage resonant bell chime + pager vibration pattern.
   */
  playOrderReadyBuzzer() {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([180, 90, 180, 90, 350]);
      } catch {}
    }

    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Warm hospitality dual-bell chime (G5 -> B5 -> D6 -> G6) repeated twice
      const sequence = [
        { freq: 783.99, offset: 0.0, duration: 0.25 },
        { freq: 987.77, offset: 0.12, duration: 0.25 },
        { freq: 1174.66, offset: 0.24, duration: 0.3 },
        { freq: 1567.98, offset: 0.38, duration: 0.55 },
        { freq: 1174.66, offset: 0.85, duration: 0.25 },
        { freq: 1567.98, offset: 1.0, duration: 0.65 },
      ];

      sequence.forEach(({ freq, offset, duration }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + offset);

        gain.gain.setValueAtTime(0.22, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + offset);
        osc.stop(now + offset + duration + 0.02);
      });
    } catch (e) {
      console.warn('Order Ready Buzzer audio error:', e);
    }
  }
}

export const posAudio = new POSAudioEngine();

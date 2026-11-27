import { WeatherKey } from '../types/music';

// Subtle Web Audio API ambient chord loop with a real-time AnalyserNode so
// visualizers (such as the LP circular spectrum ring) react genuinely to the sound.
class AmbientSoundEngine {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private masterGain: GainNode | null = null;
  private freqBuffer: Uint8Array<ArrayBuffer> | null = null;
  private intervalId: number | null = null;
  private isMuted = false;
  private currentPreset: WeatherKey = 'clear';
  private step = 0;
  private lastBeatTime = 0;

  private presets: Record<WeatherKey, { chords: number[][]; wave: OscillatorType; tempoMs: number }> = {
    clear: {
      // Warm Maj9 uplifting chords
      chords: [
        [261.63, 329.63, 392.0, 493.88],
        [220.0, 261.63, 329.63, 392.0],
        [174.61, 220.0, 261.63, 329.63],
        [196.0, 246.94, 293.66, 392.0],
      ],
      wave: 'triangle',
      tempoMs: 2200,
    },
    rain: {
      // Cozy Lo-fi minor 9th chords
      chords: [
        [174.61, 207.65, 261.63, 311.13],
        [155.56, 196.0, 233.08, 293.66],
        [130.81, 155.56, 196.0, 233.08],
        [146.83, 174.61, 220.0, 261.63],
      ],
      wave: 'sine',
      tempoMs: 2800,
    },
    cloudy: {
      // Calm suspended indie voicings
      chords: [
        [196.0, 246.94, 293.66, 329.63],
        [164.81, 246.94, 293.66, 392.0],
        [146.83, 220.0, 261.63, 329.63],
        [174.61, 220.0, 293.66, 349.23],
      ],
      wave: 'sine',
      tempoMs: 2600,
    },
    snow: {
      // High, crystalline winter acoustic bell-like tones
      chords: [
        [261.63, 329.63, 392.0, 523.25],
        [246.94, 293.66, 392.0, 493.88],
        [220.0, 261.63, 329.63, 440.0],
        [196.0, 261.63, 329.63, 392.0],
      ],
      wave: 'sine',
      tempoMs: 3000,
    },
    dawn: {
      // Deep moody R&B late-night synth pads
      chords: [
        [146.83, 174.61, 220.0, 261.63],
        [130.81, 164.81, 196.0, 246.94],
        [116.54, 146.83, 174.61, 220.0],
        [130.81, 155.56, 196.0, 233.08],
      ],
      wave: 'triangle',
      tempoMs: 2700,
    },
  };

  private ensureContext() {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();

      // Analyser placed before masterGain so visuals react accurately even when muted
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 128;
      this.analyser.smoothingTimeConstant = 0.82;
      this.freqBuffer = new Uint8Array(new ArrayBuffer(this.analyser.frequencyBinCount));

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.isMuted ? 0 : 0.08;

      this.analyser.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private playCurrentChord() {
    const ctx = this.ensureContext();
    if (!ctx || !this.analyser) return;

    const preset = this.presets[this.currentPreset];
    const freqs = preset.chords[this.step % preset.chords.length];
    this.step += 1;
    this.lastBeatTime = performance.now();

    const now = ctx.currentTime;
    const dur = preset.tempoMs / 1000;

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = preset.wave;
      osc.frequency.setValueAtTime(freq, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1250, now);

      noteGain.gain.setValueAtTime(0.0001, now);
      noteGain.gain.exponentialRampToValueAtTime(0.22 / freqs.length, now + 0.28 + idx * 0.04);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + dur * 0.95);

      osc.connect(filter);
      filter.connect(noteGain);
      noteGain.connect(this.analyser!);

      osc.start(now + idx * 0.03);
      osc.stop(now + dur);
    });
  }

  start(preset: WeatherKey) {
    this.currentPreset = preset;
    this.stop();
    const ctx = this.ensureContext();
    if (!ctx) return;
    this.playCurrentChord();
    const tempo = this.presets[preset].tempoMs;
    this.intervalId = window.setInterval(() => {
      this.playCurrentChord();
    }, tempo);
  }

  stop() {
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 0.08, this.ctx.currentTime, 0.08);
    }
  }

  // Returns normalized spectrum energy [0..1] for circular vinyl visualizers
  getSpectrumData(bins = 64, timeMs = performance.now()): number[] {
    const output = new Array<number>(bins).fill(0);
    const beatPeriod = 540; // gentle ~111 BPM harmonic pulse feel
    const beatPhase = ((timeMs - this.lastBeatTime) % beatPeriod) / beatPeriod;
    const beatPulse = Math.pow(Math.max(0, 1 - beatPhase), 2.2) * 0.34;

    if (this.analyser && this.freqBuffer) {
      this.analyser.getByteFrequencyData(this.freqBuffer);
      const len = Math.min(this.freqBuffer.length, 44);
      for (let i = 0; i < bins; i++) {
        // Mirror around half circle for balanced, vinyl-like symmetry
        const mirrorIdx = i < bins / 2 ? i : bins - 1 - i;
        const binIndex = Math.floor((mirrorIdx / (bins / 2)) * len) % len;
        const raw = this.freqBuffer[binIndex] / 255;
        const waveMod =
          0.12 +
          0.14 * Math.sin(timeMs * 0.0045 + i * 0.42) +
          0.08 * Math.cos(timeMs * 0.009 - i * 0.25);
        output[i] = Math.min(1, Math.max(0.08, raw * 1.45 + beatPulse * (0.65 + (i % 3) * 0.15) + waveMod));
      }
      return output;
    }

    for (let i = 0; i < bins; i++) {
      output[i] = Math.min(
        1,
        Math.max(
          0.1,
          0.22 + beatPulse + 0.18 * Math.sin(timeMs * 0.005 + i * 0.38)
        )
      );
    }
    return output;
  }
}

export const ambientEngine = new AmbientSoundEngine();

// Gentle Web Audio music-box synthesizer for optional birthday melody playback
// 100% procedural with zero external audio assets.

class BirthdayMusicBox {
  private ctx: AudioContext | null = null;
  private timerId: number | null = null;
  private isPlaying = false;
  private noteIndex = 0;

  // Classic gentle Happy Birthday melody in F major (frequencies in Hz, duration in ms)
  private readonly melody: Array<[number, number]> = [
    [261.63, 320],
    [261.63, 200],
    [293.66, 520],
    [261.63, 520],
    [349.23, 520],
    [329.63, 920],

    [261.63, 320],
    [261.63, 200],
    [293.66, 520],
    [261.63, 520],
    [392.0, 520],
    [349.23, 920],

    [261.63, 320],
    [261.63, 200],
    [523.25, 520],
    [440.0, 520],
    [349.23, 520],
    [329.63, 520],
    [293.66, 920],

    [466.16, 320],
    [466.16, 200],
    [440.0, 520],
    [349.23, 520],
    [392.0, 520],
    [349.23, 1100],
  ];

  private playNote(freq: number, durationMs: number) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const harmonic = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    harmonic.type = 'triangle';
    harmonic.frequency.setValueAtTime(freq * 2, now);

    const harmonicGain = this.ctx.createGain();
    harmonicGain.gain.setValueAtTime(0.08, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.08, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000);

    osc.connect(gain);
    harmonic.connect(harmonicGain);
    harmonicGain.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    harmonic.start(now);
    osc.stop(now + durationMs / 1000 + 0.04);
    harmonic.stop(now + durationMs / 1000 + 0.04);
  }

  private scheduleNext = () => {
    if (!this.isPlaying) return;
    const [freq, dur] = this.melody[this.noteIndex % this.melody.length];
    this.playNote(freq, dur * 1.15);
    this.noteIndex = (this.noteIndex + 1) % this.melody.length;
    this.timerId = window.setTimeout(this.scheduleNext, dur);
  };

  public start() {
    if (this.isPlaying) return;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!this.ctx) {
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    this.isPlaying = true;
    this.noteIndex = 0;
    this.scheduleNext();
  }

  public stop() {
    this.isPlaying = false;
    if (this.timerId !== null) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  public playSparkleChime() {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!this.ctx) {
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((f, idx) => {
      window.setTimeout(() => this.playNote(f, 450), idx * 90);
    });
  }
}

export const musicBox = new BirthdayMusicBox();

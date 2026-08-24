// ============================================================================
// GAME AUDIO & WEB PUSH NOTIFICATION ENGINE (Pure Web Audio API Synthesizer)
// Zero external asset downloads - 100% reliable, zero latency, zero 404s
// ============================================================================

class GameAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private bgmGain: GainNode | null = null;

  private isMuted: boolean = false;
  private masterVolume: number = 0.7;
  private isBgmPlaying: boolean = false;
  private bgmIntervalId: any = null;
  private ambientRoarIntervalId: any = null;

  constructor() {
    if (typeof window !== "undefined") {
      const savedMute = localStorage.getItem("rpg_sound_muted");
      this.isMuted = savedMute === "true";
      const savedVol = localStorage.getItem("rpg_sound_volume");
      if (savedVol !== null) {
        this.masterVolume = Math.max(0, Math.min(1, parseFloat(savedVol)));
      }
    }
  }

  private initContext() {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.sfxGain = this.ctx.createGain();
        this.bgmGain = this.ctx.createGain();

        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVolume, this.ctx.currentTime);
        this.sfxGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
        this.bgmGain.gain.setValueAtTime(0.35, this.ctx.currentTime);

        this.sfxGain.connect(this.masterGain);
        this.bgmGain.connect(this.masterGain);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (typeof window !== "undefined") {
      localStorage.setItem("rpg_sound_muted", String(muted));
    }
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.setValueAtTime(muted ? 0 : this.masterVolume, this.ctx.currentTime);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(vol: number) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
    if (typeof window !== "undefined") {
      localStorage.setItem("rpg_sound_volume", String(this.masterVolume));
    }
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
    }
  }

  public getVolume(): number {
    return this.masterVolume;
  }

  // ============================================================================
  // 1. SATISFYING TASK SUBMIT "TING" SOUND (Crystal Bell Chime with Warm Decay)
  // ============================================================================
  public playTing() {
    const ctx = this.initContext();
    if (!ctx || !this.sfxGain || this.isMuted) return;

    const now = ctx.currentTime;
    const freqs = [1760, 2637, 3520]; // A6, E7, A7 bright bell harmonics

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.28 / (idx + 1), now + 0.006);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2 - idx * 0.2);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(now);
      osc.stop(now + 1.25);
    });
  }

  // ============================================================================
  // 2. DRAGON ROAR SOUND (Low Guttural Rumble + Sweeping Roar Resonator)
  // ============================================================================
  public playDragonRoar() {
    const ctx = this.initContext();
    if (!ctx || !this.sfxGain || this.isMuted) return;

    const now = ctx.currentTime;

    // Deep Pitch-Dropping Oscillator
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.35);
    osc.frequency.exponentialRampToValueAtTime(45, now + 1.6);

    oscGain.gain.setValueAtTime(0, now);
    oscGain.gain.linearRampToValueAtTime(0.45, now + 0.15);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

    // Roaring Filter
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(480, now);
    filter.frequency.exponentialRampToValueAtTime(1200, now + 0.35);
    filter.frequency.exponentialRampToValueAtTime(120, now + 1.7);
    filter.Q.setValueAtTime(4, now);

    // Noise breath burst
    const bufferSize = ctx.sampleRate * 1.5;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "bandpass";
    noiseFilter.frequency.setValueAtTime(320, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(700, now + 0.4);
    noiseFilter.frequency.exponentialRampToValueAtTime(140, now + 1.5);
    noiseFilter.Q.setValueAtTime(2.5, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0, now);
    noiseGain.gain.linearRampToValueAtTime(0.35, now + 0.2);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 1.6);

    osc.connect(filter);
    filter.connect(oscGain);
    oscGain.connect(this.sfxGain);

    whiteNoise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 1.85);
    whiteNoise.start(now);
    whiteNoise.stop(now + 1.65);
  }

  // ============================================================================
  // 3. LIGHTNING ATTACK SOUND (Electric crackle, buzz & thunder crash)
  // ============================================================================
  public playLightning(durationMs: number = 1400) {
    const ctx = this.initContext();
    if (!ctx || !this.sfxGain || this.isMuted) return;

    const now = ctx.currentTime;
    const duration = durationMs / 1000;

    // Modulated carrier for electric arc
    const carrier = ctx.createOscillator();
    const modulator = ctx.createOscillator();
    const modGain = ctx.createGain();
    const mainGain = ctx.createGain();

    carrier.type = "sawtooth";
    carrier.frequency.setValueAtTime(220, now);
    carrier.frequency.linearRampToValueAtTime(440, now + duration * 0.4);
    carrier.frequency.linearRampToValueAtTime(110, now + duration);

    modulator.type = "square";
    modulator.frequency.setValueAtTime(48, now);
    modGain.gain.setValueAtTime(280, now);

    modulator.connect(carrier.frequency);

    mainGain.gain.setValueAtTime(0, now);
    mainGain.gain.linearRampToValueAtTime(0.35, now + 0.05);
    mainGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    carrier.connect(mainGain);
    mainGain.connect(this.sfxGain);

    carrier.start(now);
    modulator.start(now);
    carrier.stop(now + duration);
    modulator.stop(now + duration);
  }

  // ============================================================================
  // 4. ICE / FREEZE ATTACK SOUND (Crystalline glassy chimes & frost crack)
  // ============================================================================
  public playFreeze() {
    const ctx = this.initContext();
    if (!ctx || !this.sfxGain || this.isMuted) return;

    const now = ctx.currentTime;
    const frostNotes = [1568, 2093, 2637, 3135, 4186];

    frostNotes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0, now + idx * 0.06);
      gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.06 + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 0.7);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.75);
    });
  }

  // ============================================================================
  // 5. FIRE / BURN ATTACK SOUND (Crackling flame whoosh & ignition)
  // ============================================================================
  public playFireBurn(durationMs: number = 1400) {
    const ctx = this.initContext();
    if (!ctx || !this.sfxGain || this.isMuted) return;

    const now = ctx.currentTime;
    const duration = durationMs / 1000;

    const bufferSize = ctx.sampleRate * duration;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(260, now);
    filter.frequency.linearRampToValueAtTime(580, now + 0.3);
    filter.frequency.linearRampToValueAtTime(180, now + duration);
    filter.Q.setValueAtTime(1.8, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.4, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(now);
    noise.stop(now + duration);
  }

  // ============================================================================
  // 6. HEROIC FANFARE MELODY (3.5 Second Triumphant Victory / Notification Fanfare)
  // ============================================================================
  public playHeroicMelody() {
    const ctx = this.initContext();
    if (!ctx || !this.sfxGain || this.isMuted) return;

    const now = ctx.currentTime;
    // D Major / Medieval Triumphant Fanfare Sequence: D4 -> F#4 -> A4 -> D5 -> C#5 -> D5
    const fanfareNotes = [
      { freq: 293.66, start: 0.0, dur: 0.28 }, // D4
      { freq: 369.99, start: 0.28, dur: 0.28 }, // F#4
      { freq: 440.0, start: 0.56, dur: 0.32 }, // A4
      { freq: 587.33, start: 0.88, dur: 0.55 }, // D5
      { freq: 554.37, start: 1.43, dur: 0.25 }, // C#5
      { freq: 587.33, start: 1.68, dur: 1.2 },  // D5 sustain
    ];

    fanfareNotes.forEach((n) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(n.freq, now + n.start);

      // Add harmonic brass warmth
      const osc2 = ctx.createOscillator();
      osc2.type = "sawtooth";
      osc2.frequency.setValueAtTime(n.freq, now + n.start);

      const brassFilter = ctx.createBiquadFilter();
      brassFilter.type = "lowpass";
      brassFilter.frequency.setValueAtTime(1400, now + n.start);

      gain.gain.setValueAtTime(0, now + n.start);
      gain.gain.linearRampToValueAtTime(0.24, now + n.start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + n.start + n.dur);

      osc.connect(gain);
      osc2.connect(brassFilter);
      brassFilter.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(now + n.start);
      osc.stop(now + n.start + n.dur + 0.05);
      osc2.start(now + n.start);
      osc2.stop(now + n.start + n.dur + 0.05);
    });
  }

  // ============================================================================
  // 7. MEDIEVAL CHILL LO-FI BGM GENERATOR (Looping Lute Chords + Lo-fi Atmosphere)
  // ============================================================================
  public startMedievalLofiBgm() {
    if (this.isBgmPlaying) return;
    const ctx = this.initContext();
    if (!ctx) return;

    this.isBgmPlaying = true;
    let barIndex = 0;

    // 4-Bar Lo-Fi Medieval Progression: Dm9 -> Bbmaj7 -> Gm7 -> A7sus4/A7
    const chords = [
      [146.83, 220.0, 261.63, 329.63], // Dm9
      [116.54, 174.61, 220.0, 293.66], // Bbmaj7
      [98.0, 146.83, 174.61, 246.94],  // Gm7
      [110.0, 164.81, 220.0, 277.18],  // A7
    ];

    const playChordBar = () => {
      if (!this.isBgmPlaying || !this.ctx || !this.bgmGain) return;
      const now = this.ctx.currentTime;
      const currentChord = chords[barIndex % chords.length];

      // Pluck lute string arpeggios
      currentChord.forEach((freq, noteIdx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const filter = this.ctx!.createBiquadFilter();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + noteIdx * 0.18);

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(850, now);

        gain.gain.setValueAtTime(0, now + noteIdx * 0.18);
        gain.gain.linearRampToValueAtTime(0.09, now + noteIdx * 0.18 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + noteIdx * 0.18 + 2.2);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.bgmGain!);

        osc.start(now + noteIdx * 0.18);
        osc.stop(now + noteIdx * 0.18 + 2.3);
      });

      // Warm soft lo-fi sub note
      const bassOsc = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();
      bassOsc.type = "sine";
      bassOsc.frequency.setValueAtTime(currentChord[0] * 0.5, now);

      bassGain.gain.setValueAtTime(0, now);
      bassGain.gain.linearRampToValueAtTime(0.12, now + 0.04);
      bassGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.6);

      bassOsc.connect(bassGain);
      bassGain.connect(this.bgmGain);

      bassOsc.start(now);
      bassOsc.stop(now + 2.8);

      barIndex++;
    };

    playChordBar();
    this.bgmIntervalId = setInterval(playChordBar, 3200); // ~75 BPM bar length

    // Periodic Ambient Roar every 1 minute
    if (!this.ambientRoarIntervalId) {
      this.ambientRoarIntervalId = setInterval(() => {
        if (this.isBgmPlaying && !this.isMuted) {
          this.playDragonRoar();
        }
      }, 60000);
    }
  }

  public stopMedievalLofiBgm() {
    this.isBgmPlaying = false;
    if (this.bgmIntervalId) {
      clearInterval(this.bgmIntervalId);
      this.bgmIntervalId = null;
    }
    if (this.ambientRoarIntervalId) {
      clearInterval(this.ambientRoarIntervalId);
      this.ambientRoarIntervalId = null;
    }
  }

  public isBgmActive(): boolean {
    return this.isBgmPlaying;
  }
}

export const gameAudio = new GameAudioEngine();

// ============================================================================
// WEB PUSH NOTIFICATION & DEADLINE REMINDER MANAGER
// ============================================================================

export async function requestWebPushPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }
  try {
    const perm = await Notification.requestPermission();
    if (perm === "granted") {
      localStorage.setItem("rpg_push_notifications_enabled", "true");
      return true;
    } else {
      localStorage.setItem("rpg_push_notifications_enabled", "false");
      return false;
    }
  } catch (err) {
    console.error("Failed to request notification permission:", err);
    return false;
  }
}

export function areNotificationsEnabled(): boolean {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  return Notification.permission === "granted" && localStorage.getItem("rpg_push_notifications_enabled") === "true";
}

export function sendWebNotification(title: string, body: string, soundType?: "ting" | "roar" | "fanfare") {
  if (typeof window === "undefined") return;

  // Play sound effect
  if (soundType === "roar") {
    gameAudio.playDragonRoar();
  } else if (soundType === "fanfare") {
    gameAudio.playHeroicMelody();
  } else if (soundType === "ting") {
    gameAudio.playTing();
  }

  if ("Notification" in window && Notification.permission === "granted") {
    try {
      new Notification(title, {
        body,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        silent: false,
      });
    } catch (err) {
      console.warn("Desktop notification suppressed or error:", err);
    }
  }
}

// ============================================================================
// GAME AUDIO & WEB PUSH NOTIFICATION ENGINE (Acoustic Web Audio Synthesizer)
// Natural, Organic, Adventurous - Zero external downloads, zero latency
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

  // Active looping spell sound nodes
  private activeSpellLoop: {
    nodes: (AudioNode | OscillatorNode | AudioBufferSourceNode)[];
    gainNode: GainNode;
    spellType: string;
    timers: number[];
  } | null = null;

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

        // 70% softer SFX volume default to ensure comfort and zero ear-bleeding
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVolume, this.ctx.currentTime);
        this.sfxGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
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
  // 1. SATISFYING TASK SUBMIT "TING" SOUND (Acoustic Bell Chime)
  // ============================================================================
  public playTing() {
    const ctx = this.initContext();
    if (!ctx || !this.sfxGain || this.isMuted) return;

    const now = ctx.currentTime;
    const freqs = [1760, 2637, 3520]; // Clean acoustic bell harmonics

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.14 / (idx + 1), now + 0.006);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2 - idx * 0.2);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(now);
      osc.stop(now + 1.25);
    });
  }

  // ============================================================================
  // 2. MIGHTY NATURAL LOW-PITCH DRAGON ROAR (Sub-Bass Chest Rumble + Guttural Roar)
  // Zero electronic buzz - pure deep acoustic beast vocalization
  // ============================================================================
  public playDragonRoar() {
    const ctx = this.initContext();
    if (!ctx || !this.sfxGain || this.isMuted) return;

    const now = ctx.currentTime;

    // Layer 1: Subterranean Low Bass Chest Rumble (45Hz - 85Hz with 18Hz natural flutter)
    const subOsc = ctx.createOscillator();
    const flutterLfo = ctx.createOscillator();
    const flutterGain = ctx.createGain();
    const subGain = ctx.createGain();

    subOsc.type = "sine";
    subOsc.frequency.setValueAtTime(78, now);
    subOsc.frequency.linearRampToValueAtTime(110, now + 0.4);
    subOsc.frequency.exponentialRampToValueAtTime(42, now + 2.4);

    flutterLfo.type = "sine";
    flutterLfo.frequency.setValueAtTime(18, now);
    flutterGain.gain.setValueAtTime(22, now);
    flutterLfo.connect(subOsc.frequency);

    subGain.gain.setValueAtTime(0, now);
    subGain.gain.linearRampToValueAtTime(0.26, now + 0.15);
    subGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);

    subOsc.connect(subGain);
    subGain.connect(this.sfxGain);

    flutterLfo.start(now);
    subOsc.start(now);
    flutterLfo.stop(now + 2.5);
    subOsc.stop(now + 2.5);

    // Layer 2: Guttural Throat Roar (Vocal Formants at 160Hz & 380Hz)
    const throatBuffer = ctx.createBuffer(1, ctx.sampleRate * 2.5, ctx.sampleRate);
    const throatData = throatBuffer.getChannelData(0);
    for (let i = 0; i < throatData.length; i++) {
      throatData[i] = (Math.random() * 2 - 1) * 0.7;
    }
    const throatNoise = ctx.createBufferSource();
    throatNoise.buffer = throatBuffer;

    const throatFilter = ctx.createBiquadFilter();
    throatFilter.type = "bandpass";
    throatFilter.frequency.setValueAtTime(180, now);
    throatFilter.frequency.linearRampToValueAtTime(460, now + 0.35);
    throatFilter.frequency.exponentialRampToValueAtTime(95, now + 2.2);
    throatFilter.Q.setValueAtTime(3.8, now);

    const throatGain = ctx.createGain();
    throatGain.gain.setValueAtTime(0, now);
    throatGain.gain.linearRampToValueAtTime(0.18, now + 0.18);
    throatGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.3);

    throatNoise.connect(throatFilter);
    throatFilter.connect(throatGain);
    throatGain.connect(this.sfxGain);

    throatNoise.start(now);
    throatNoise.stop(now + 2.4);
  }

  // ============================================================================
  // 3. CONTINUOUS SYNCHRONIZED ATTACK SPELL SOUNDS
  // 70% Lower Volume, Natural Acoustic Textures, Realistic Thunder / Wind / Freeze
  // ============================================================================
  public startSpellLoop(spellType: string) {
    this.stopSpellLoop();
    const ctx = this.initContext();
    if (!ctx || !this.sfxGain || this.isMuted) return;

    const now = ctx.currentTime;
    const loopGain = ctx.createGain();
    loopGain.gain.setValueAtTime(0, now);
    loopGain.gain.linearRampToValueAtTime(0.12, now + 0.08); // 70% soft volume
    loopGain.connect(this.sfxGain);

    const nodes: (AudioNode | OscillatorNode | AudioBufferSourceNode)[] = [];
    const timers: number[] = [];

    if (spellType === "lightning" || spellType === "spark" || spellType === "all") {
      // NATURAL THUNDER STRIKE: Crisp strike -> Deep booming rumble -> 1s pause -> Echo strike
      const playThunderStrike = () => {
        if (!this.activeSpellLoop || !this.ctx) return;
        const tNow = this.ctx.currentTime;

        // 1. Initial Crisp Arc Crackle (120ms)
        const arcBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.18, this.ctx.sampleRate);
        const arcData = arcBuffer.getChannelData(0);
        for (let i = 0; i < arcData.length; i++) {
          arcData[i] = (Math.random() * 2 - 1);
        }
        const arcNoise = this.ctx.createBufferSource();
        arcNoise.buffer = arcBuffer;

        const arcFilter = this.ctx.createBiquadFilter();
        arcFilter.type = "highpass";
        arcFilter.frequency.setValueAtTime(2200, tNow);

        const arcGain = this.ctx.createGain();
        arcGain.gain.setValueAtTime(0.15, tNow);
        arcGain.gain.exponentialRampToValueAtTime(0.0001, tNow + 0.16);

        arcNoise.connect(arcFilter);
        arcFilter.connect(arcGain);
        arcGain.connect(loopGain);
        arcNoise.start(tNow);

        // 2. Heavy Sub-Bass Thunder Boom (85Hz -> 30Hz deep acoustic lowpass rumble)
        const boomOsc = this.ctx.createOscillator();
        const boomFilter = this.ctx.createBiquadFilter();
        const boomGain = this.ctx.createGain();

        boomOsc.type = "sine";
        boomOsc.frequency.setValueAtTime(95, tNow + 0.02);
        boomOsc.frequency.exponentialRampToValueAtTime(32, tNow + 0.9);

        boomFilter.type = "lowpass";
        boomFilter.frequency.setValueAtTime(140, tNow);

        boomGain.gain.setValueAtTime(0, tNow);
        boomGain.gain.linearRampToValueAtTime(0.24, tNow + 0.05);
        boomGain.gain.exponentialRampToValueAtTime(0.0001, tNow + 1.0);

        boomOsc.connect(boomFilter);
        boomFilter.connect(boomGain);
        boomGain.connect(loopGain);

        boomOsc.start(tNow + 0.02);
        boomOsc.stop(tNow + 1.05);
      };

      playThunderStrike();
      // Strike every 1.4 seconds in a natural rhythm
      const interval = window.setInterval(playThunderStrike, 1400);
      timers.push(interval);
    } else if (spellType === "ice" || spellType === "water") {
      // NATURAL GLACIAL FREEZE: Howling freezing sub-zero wind + crisp ice cracking fracture
      const windBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const windData = windBuffer.getChannelData(0);
      for (let i = 0; i < windData.length; i++) {
        windData[i] = (Math.random() * 2 - 1) * 0.6;
      }
      const wind = ctx.createBufferSource();
      wind.buffer = windBuffer;
      wind.loop = true;

      const windFilter = ctx.createBiquadFilter();
      windFilter.type = "bandpass";
      windFilter.frequency.setValueAtTime(650, now);
      windFilter.Q.setValueAtTime(2.2, now);

      wind.connect(windFilter);
      windFilter.connect(loopGain);
      wind.start(now);
      nodes.push(wind, windFilter);

      // Periodic Ice Crack & Frost Fracture clicks
      const playIceCrack = () => {
        if (!this.activeSpellLoop || !this.ctx) return;
        const tNow = this.ctx.currentTime;
        const crackFreqs = [2400, 3600, 4800];
        crackFreqs.forEach((freq, idx) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, tNow + idx * 0.03);
          gain.gain.setValueAtTime(0.08, tNow + idx * 0.03);
          gain.gain.exponentialRampToValueAtTime(0.0001, tNow + idx * 0.03 + 0.12);

          osc.connect(gain);
          gain.connect(loopGain);
          osc.start(tNow + idx * 0.03);
          osc.stop(tNow + idx * 0.03 + 0.14);
        });
      };

      playIceCrack();
      const crackInterval = window.setInterval(playIceCrack, 650);
      timers.push(crackInterval);
    } else if (spellType === "fire") {
      // NATURAL FLAME WHOOSH & COMBUSTION
      const fireBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const fireData = fireBuffer.getChannelData(0);
      for (let i = 0; i < fireData.length; i++) {
        fireData[i] = (Math.random() * 2 - 1) * 0.7;
      }
      const fire = ctx.createBufferSource();
      fire.buffer = fireBuffer;
      fire.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(280, now);
      filter.Q.setValueAtTime(1.4, now);

      fire.connect(filter);
      filter.connect(loopGain);
      fire.start(now);
      nodes.push(fire, filter);
    }

    this.activeSpellLoop = {
      nodes,
      gainNode: loopGain,
      spellType,
      timers,
    };
  }

  public stopSpellLoop() {
    if (!this.activeSpellLoop || !this.ctx) return;
    const { nodes, gainNode, timers } = this.activeSpellLoop;
    timers.forEach((t) => clearInterval(t));

    const now = this.ctx.currentTime;
    try {
      gainNode.gain.linearRampToValueAtTime(0.0001, now + 0.08);
      setTimeout(() => {
        nodes.forEach((n: any) => {
          try {
            if (typeof n.stop === "function") n.stop();
            if (typeof n.disconnect === "function") n.disconnect();
          } catch {}
        });
      }, 100);
    } catch {}

    this.activeSpellLoop = null;
  }

  // One-shot Playback
  public playLightning(durationMs: number = 1600) {
    this.startSpellLoop("lightning");
    setTimeout(() => this.stopSpellLoop(), durationMs);
  }

  public playFreeze(durationMs: number = 1600) {
    this.startSpellLoop("ice");
    setTimeout(() => this.stopSpellLoop(), durationMs);
  }

  public playFireBurn(durationMs: number = 1600) {
    this.startSpellLoop("fire");
    setTimeout(() => this.stopSpellLoop(), durationMs);
  }

  // ============================================================================
  // 4. HEROIC FANFARE (Adventurous Melodic Victory Jingle)
  // ============================================================================
  public playHeroicMelody() {
    const ctx = this.initContext();
    if (!ctx || !this.sfxGain || this.isMuted) return;

    const now = ctx.currentTime;
    // Upbeat Inspiring Fanfare: D4 -> F#4 -> A4 -> B4 -> D5
    const fanfareNotes = [
      { freq: 293.66, start: 0.0, dur: 0.2 },
      { freq: 369.99, start: 0.2, dur: 0.2 },
      { freq: 440.0, start: 0.4, dur: 0.22 },
      { freq: 493.88, start: 0.62, dur: 0.25 },
      { freq: 587.33, start: 0.87, dur: 1.2 },
    ];

    fanfareNotes.forEach((n) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(n.freq, now + n.start);

      gain.gain.setValueAtTime(0, now + n.start);
      gain.gain.linearRampToValueAtTime(0.18, now + n.start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + n.start + n.dur);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(now + n.start);
      osc.stop(now + n.start + n.dur + 0.05);
    });
  }

  // ============================================================================
  // 5. ADVENTUROUS MEDIEVAL HEROIC BGM (Acoustic Lute, Flute & Tavern Hand Drum)
  // Uplifting, inspiring, joyous adventure in D Major at 116 BPM
  // ============================================================================
  public startMedievalHeroicBgm() {
    if (this.isBgmPlaying) return;
    const ctx = this.initContext();
    if (!ctx) return;

    this.isBgmPlaying = true;
    let step = 0;

    // Joyous, Adventurous Medieval Chord Progression: D -> G -> A -> Bm -> G -> A -> D
    const luteBass = [
      146.83, 146.83, 196.0, 196.0,   // D3, D3, G3, G3
      220.0, 220.0, 246.94, 246.94,   // A3, A3, B3, B3
      196.0, 196.0, 220.0, 220.0,     // G3, G3, A3, A3
      146.83, 146.83, 293.66, 146.83, // D3, D3, D4, D3
    ];

    // Uplifting Flute / Lute Lead Melody
    const fluteMelody = [
      587.33, 659.25, 739.99, 587.33, // D5, E5, F#5, D5
      783.99, 739.99, 659.25, 587.33, // G5, F#5, E5, D5
      880.0, 783.99, 739.99, 659.25,  // A5, G5, F#5, E5
      739.99, 659.25, 587.33, 587.33, // F#5, E5, D5, D5
    ];

    const playAdventurousBeat = () => {
      if (!this.isBgmPlaying || !this.ctx || !this.bgmGain) return;
      const now = this.ctx.currentTime;
      const beatIdx = step % 16;

      // 1. Plucked Acoustic Lute / Harp (Gentle triangle with natural decay)
      const bassFreq = luteBass[beatIdx];
      const luteOsc = this.ctx.createOscillator();
      const luteGain = this.ctx.createGain();
      luteOsc.type = "triangle";
      luteOsc.frequency.setValueAtTime(bassFreq, now);

      luteGain.gain.setValueAtTime(0, now);
      luteGain.gain.linearRampToValueAtTime(0.08, now + 0.015);
      luteGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);

      luteOsc.connect(luteGain);
      luteGain.connect(this.bgmGain);
      luteOsc.start(now);
      luteOsc.stop(now + 0.45);

      // 2. Warm Wooden Flute Melody (Sine wave + soft lowpass filter)
      const fluteFreq = fluteMelody[beatIdx];
      const fluteOsc = this.ctx.createOscillator();
      const fluteGain = this.ctx.createGain();
      fluteOsc.type = "sine";
      fluteOsc.frequency.setValueAtTime(fluteFreq, now);

      fluteGain.gain.setValueAtTime(0, now);
      fluteGain.gain.linearRampToValueAtTime(0.07, now + 0.03);
      fluteGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);

      fluteOsc.connect(fluteGain);
      fluteGain.connect(this.bgmGain);
      fluteOsc.start(now);
      fluteOsc.stop(now + 0.4);

      // 3. Acoustic Tavern Woodblock / Hand Drum (Soft warm tap on beats)
      if (beatIdx % 4 === 0 || beatIdx % 4 === 2) {
        const drumOsc = this.ctx.createOscillator();
        const drumGain = this.ctx.createGain();
        drumOsc.type = "sine";
        drumOsc.frequency.setValueAtTime(beatIdx % 4 === 0 ? 110 : 160, now);
        drumOsc.frequency.exponentialRampToValueAtTime(40, now + 0.12);

        drumGain.gain.setValueAtTime(0.12, now);
        drumGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

        drumOsc.connect(drumGain);
        drumGain.connect(this.bgmGain);
        drumOsc.start(now);
        drumOsc.stop(now + 0.16);
      }

      step++;
    };

    playAdventurousBeat();
    this.bgmIntervalId = setInterval(playAdventurousBeat, 258); // ~116 BPM 8th-note pace

    // Periodic Ambient Roar every 1 minute
    if (!this.ambientRoarIntervalId) {
      this.ambientRoarIntervalId = setInterval(() => {
        if (this.isBgmPlaying && !this.isMuted) {
          this.playDragonRoar();
        }
      }, 60000);
    }
  }

  public stopMedievalHeroicBgm() {
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
        requireInteraction: true,
        silent: false,
      });
    } catch (err) {
      console.warn("Desktop notification suppressed or error:", err);
    }
  }
}

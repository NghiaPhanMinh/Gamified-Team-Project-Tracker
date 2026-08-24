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
  private masterVolume: number = 0.75;
  private isBgmPlaying: boolean = false;
  private bgmIntervalId: any = null;
  private ambientRoarIntervalId: any = null;

  // Active looping spell sound nodes
  private activeSpellLoop: {
    nodes: (AudioNode | OscillatorNode | AudioBufferSourceNode)[];
    gainNode: GainNode;
    spellType: string;
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

        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVolume, this.ctx.currentTime);
        this.sfxGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
        this.bgmGain.gain.setValueAtTime(0.4, this.ctx.currentTime);

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
  // 1. SATISFYING TASK SUBMIT "TING" SOUND (Crisp Crystal Bell Chime)
  // ============================================================================
  public playTing() {
    const ctx = this.initContext();
    if (!ctx || !this.sfxGain || this.isMuted) return;

    const now = ctx.currentTime;
    const freqs = [1760, 2637, 3520, 5274]; // Crisp metallic chime harmonics

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.3 / (idx + 1), now + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.3 - idx * 0.18);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(now);
      osc.stop(now + 1.35);
    });
  }

  // ============================================================================
  // 2. POWERFUL CINEMATIC DRAGON ROAR (Multi-layered Sub-bass & Ferocious Growl)
  // ============================================================================
  public playDragonRoar() {
    const ctx = this.initContext();
    if (!ctx || !this.sfxGain || this.isMuted) return;

    const now = ctx.currentTime;

    // Layer 1: Sub-Bass Chest Rumble (Pitch Sweep with Heavy Growl Modulation)
    const roarOsc = ctx.createOscillator();
    const growlLfo = ctx.createOscillator();
    const growlLfoGain = ctx.createGain();
    const roarGain = ctx.createGain();

    roarOsc.type = "sawtooth";
    roarOsc.frequency.setValueAtTime(160, now);
    roarOsc.frequency.linearRampToValueAtTime(280, now + 0.25);
    roarOsc.frequency.exponentialRampToValueAtTime(55, now + 1.9);

    // 38Hz Growl Vibrato
    growlLfo.type = "sawtooth";
    growlLfo.frequency.setValueAtTime(38, now);
    growlLfoGain.gain.setValueAtTime(75, now);
    growlLfo.connect(roarOsc.frequency);

    // Roar Filter Sweep
    const roarFilter = ctx.createBiquadFilter();
    roarFilter.type = "lowpass";
    roarFilter.frequency.setValueAtTime(350, now);
    roarFilter.frequency.exponentialRampToValueAtTime(1600, now + 0.35);
    roarFilter.frequency.exponentialRampToValueAtTime(110, now + 1.9);
    roarFilter.Q.setValueAtTime(5.5, now);

    roarGain.gain.setValueAtTime(0, now);
    roarGain.gain.linearRampToValueAtTime(0.55, now + 0.12);
    roarGain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);

    roarOsc.connect(roarFilter);
    roarFilter.connect(roarGain);
    roarGain.connect(this.sfxGain);

    growlLfo.start(now);
    roarOsc.start(now);
    growlLfo.stop(now + 2.0);
    roarOsc.stop(now + 2.0);

    // Layer 2: Ferocious Wind & Breath Blast
    const bufferSize = ctx.sampleRate * 2.0;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const noiseSrc = ctx.createBufferSource();
    noiseSrc.buffer = noiseBuffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "bandpass";
    noiseFilter.frequency.setValueAtTime(450, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(1200, now + 0.3);
    noiseFilter.frequency.exponentialRampToValueAtTime(180, now + 1.8);
    noiseFilter.Q.setValueAtTime(3.2, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0, now);
    noiseGain.gain.linearRampToValueAtTime(0.45, now + 0.15);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 1.9);

    noiseSrc.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.sfxGain);

    noiseSrc.start(now);
    noiseSrc.stop(now + 2.0);
  }

  // ============================================================================
  // 3. CONTINUOUS LOOPING SPELL SOUNDS (Plays while visual is active, stops on end)
  // ============================================================================
  public startSpellLoop(spellType: string) {
    this.stopSpellLoop();
    const ctx = this.initContext();
    if (!ctx || !this.sfxGain || this.isMuted) return;

    const now = ctx.currentTime;
    const loopGain = ctx.createGain();
    loopGain.gain.setValueAtTime(0, now);
    loopGain.gain.linearRampToValueAtTime(0.38, now + 0.1);
    loopGain.connect(this.sfxGain);

    const nodes: (AudioNode | OscillatorNode | AudioBufferSourceNode)[] = [];

    if (spellType === "lightning" || spellType === "spark" || spellType === "all") {
      // SHOCKING HIGH-VOLTAGE ELECTRICITY: 60Hz hum + intense FM electric arcs
      const carrier = ctx.createOscillator();
      carrier.type = "sawtooth";
      carrier.frequency.setValueAtTime(180, now);

      const modulator = ctx.createOscillator();
      modulator.type = "square";
      modulator.frequency.setValueAtTime(64, now);

      const modGain = ctx.createGain();
      modGain.gain.setValueAtTime(380, now);

      modulator.connect(carrier.frequency);

      // Electric Sizzle Noise
      const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      noise.loop = true;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = "highpass";
      noiseFilter.frequency.setValueAtTime(1400, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.4, now);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(loopGain);

      carrier.connect(loopGain);

      carrier.start(now);
      modulator.start(now);
      noise.start(now);

      nodes.push(carrier, modulator, noise, noiseFilter, noiseGain, modGain);
    } else if (spellType === "ice" || spellType === "water") {
      // GLACIAL FREEZE & FROST SHATTER: Chilling wind resonance + crystal frost shimmer
      const frostOsc = ctx.createOscillator();
      frostOsc.type = "sine";
      frostOsc.frequency.setValueAtTime(2400, now);

      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(12, now);
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(180, now);
      lfo.connect(frostOsc.frequency);

      // Sub-zero wind sweep
      const windBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const data = windBuffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const wind = ctx.createBufferSource();
      wind.buffer = windBuffer;
      wind.loop = true;

      const windFilter = ctx.createBiquadFilter();
      windFilter.type = "bandpass";
      windFilter.frequency.setValueAtTime(950, now);
      windFilter.Q.setValueAtTime(4.5, now);

      wind.connect(windFilter);
      windFilter.connect(loopGain);
      frostOsc.connect(loopGain);

      frostOsc.start(now);
      lfo.start(now);
      wind.start(now);

      nodes.push(frostOsc, lfo, lfoGain, wind, windFilter);
    } else if (spellType === "fire") {
      // TURBULENT ROARING FLAME WHOOSH & COMBUSTION
      const fireBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const data = fireBuffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const fire = ctx.createBufferSource();
      fire.buffer = fireBuffer;
      fire.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(320, now);
      filter.Q.setValueAtTime(1.5, now);

      fire.connect(filter);
      filter.connect(loopGain);
      fire.start(now);

      nodes.push(fire, filter);
    }

    this.activeSpellLoop = {
      nodes,
      gainNode: loopGain,
      spellType,
    };
  }

  public stopSpellLoop() {
    if (!this.activeSpellLoop || !this.ctx) return;
    const { nodes, gainNode } = this.activeSpellLoop;
    const now = this.ctx.currentTime;

    try {
      gainNode.gain.linearRampToValueAtTime(0.001, now + 0.12);
      setTimeout(() => {
        nodes.forEach((n: any) => {
          try {
            if (typeof n.stop === "function") n.stop();
            if (typeof n.disconnect === "function") n.disconnect();
          } catch {}
        });
      }, 150);
    } catch {}

    this.activeSpellLoop = null;
  }

  // One-shot Spell Playback
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
  // 4. HEROIC FANFARE MELODY (Triumphant Victory Melodic Fanfare)
  // ============================================================================
  public playHeroicMelody() {
    const ctx = this.initContext();
    if (!ctx || !this.sfxGain || this.isMuted) return;

    const now = ctx.currentTime;
    const fanfareNotes = [
      { freq: 293.66, start: 0.0, dur: 0.22 }, // D4
      { freq: 369.99, start: 0.22, dur: 0.22 }, // F#4
      { freq: 440.0, start: 0.44, dur: 0.28 }, // A4
      { freq: 587.33, start: 0.72, dur: 0.55 }, // D5
      { freq: 554.37, start: 1.27, dur: 0.24 }, // C#5
      { freq: 587.33, start: 1.51, dur: 1.4 },  // D5 sustain
    ];

    fanfareNotes.forEach((n) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(n.freq, now + n.start);

      const brassFilter = ctx.createBiquadFilter();
      brassFilter.type = "lowpass";
      brassFilter.frequency.setValueAtTime(1800, now + n.start);

      gain.gain.setValueAtTime(0, now + n.start);
      gain.gain.linearRampToValueAtTime(0.28, now + n.start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + n.start + n.dur);

      osc.connect(brassFilter);
      brassFilter.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(now + n.start);
      osc.stop(now + n.start + n.dur + 0.05);
    });
  }

  // ============================================================================
  // 5. ENERGETIC MEDIEVAL HEROIC BGM (Driving Gallop & Heroic Combat Fanfare)
  // ============================================================================
  public startMedievalHeroicBgm() {
    if (this.isBgmPlaying) return;
    const ctx = this.initContext();
    if (!ctx) return;

    this.isBgmPlaying = true;
    let step = 0;

    // Driving Medieval Heroic Progression (D minor -> F major -> C major -> G minor -> A major) at 128 BPM
    const bassline = [
      146.83, 146.83, 146.83, 146.83, // D3
      174.61, 174.61, 174.61, 174.61, // F3
      130.81, 130.81, 130.81, 130.81, // C3
      98.0, 98.0, 110.0, 110.0,       // G2 -> A2
    ];

    const leadMelody = [
      587.33, 440.0, 587.33, 659.25, // D5, A4, D5, E5
      698.46, 587.33, 698.46, 783.99, // F5, D5, F5, G5
      523.25, 659.25, 523.25, 440.0,  // C5, E5, C5, A4
      392.0, 440.0, 554.37, 587.33,   // G4, A4, C#5, D5
    ];

    const playHeroicBeat = () => {
      if (!this.isBgmPlaying || !this.ctx || !this.bgmGain) return;
      const now = this.ctx.currentTime;
      const beatIdx = step % 16;

      // 1. Driving Medieval Lute / String Ostinato (Galloping Rhythm)
      const bassFreq = bassline[Math.floor(beatIdx / 4) * 4];
      const bassOsc = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();
      bassOsc.type = "sawtooth";
      bassOsc.frequency.setValueAtTime(bassFreq * (beatIdx % 2 === 0 ? 1 : 0.5), now);

      const bassFilter = this.ctx.createBiquadFilter();
      bassFilter.type = "lowpass";
      bassFilter.frequency.setValueAtTime(650, now);

      bassGain.gain.setValueAtTime(0, now);
      bassGain.gain.linearRampToValueAtTime(0.14, now + 0.01);
      bassGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

      bassOsc.connect(bassFilter);
      bassFilter.connect(bassGain);
      bassGain.connect(this.bgmGain);

      bassOsc.start(now);
      bassOsc.stop(now + 0.24);

      // 2. Lead Brass Fanfare Melody
      const leadFreq = leadMelody[beatIdx];
      const leadOsc = this.ctx.createOscillator();
      const leadGain = this.ctx.createGain();
      leadOsc.type = "triangle";
      leadOsc.frequency.setValueAtTime(leadFreq, now);

      leadGain.gain.setValueAtTime(0, now);
      leadGain.gain.linearRampToValueAtTime(0.12, now + 0.02);
      leadGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

      leadOsc.connect(leadGain);
      leadGain.connect(this.bgmGain);

      leadOsc.start(now);
      leadOsc.stop(now + 0.3);

      // 3. Medieval Battle Drum (Kick on beat 0, 4, 8, 12, rim on 2, 6, 10, 14)
      if (beatIdx % 4 === 0) {
        const kickOsc = this.ctx.createOscillator();
        const kickGain = this.ctx.createGain();
        kickOsc.frequency.setValueAtTime(120, now);
        kickOsc.frequency.exponentialRampToValueAtTime(45, now + 0.14);

        kickGain.gain.setValueAtTime(0.35, now);
        kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

        kickOsc.connect(kickGain);
        kickGain.connect(this.bgmGain);

        kickOsc.start(now);
        kickOsc.stop(now + 0.18);
      }

      step++;
    };

    playHeroicBeat();
    this.bgmIntervalId = setInterval(playHeroicBeat, 234); // ~128 BPM 8th-note gallop

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
        requireInteraction: true, // Keep notification visible until user interacts with it
        silent: false,
      });
    } catch (err) {
      console.warn("Desktop notification suppressed or error:", err);
    }
  }
}

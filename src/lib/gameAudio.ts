// ============================================================================
// GAME AUDIO & WEB PUSH NOTIFICATION ENGINE (Acoustic Web Audio Synthesizer)
// Zero external asset downloads - 100% reliable, zero latency, zero 404s
// ============================================================================

class GameAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private bgmGain: GainNode | null = null;

  private isMuted: boolean = false;
  private masterVolume: number = 0.55; // 40% lower default volume for comfortable listening
  private isBgmPlaying: boolean = false;
  private bgmIntervalId: any = null;
  private ambientRoarIntervalId: any = null;

  // Active looping spell sound nodes
  private activeSpellLoop: {
    nodes: (AudioNode | OscillatorNode | AudioBufferSourceNode)[];
    gainNode: GainNode;
    spellType: string;
    timers?: any[];
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
        this.sfxGain.gain.setValueAtTime(0.70, this.ctx.currentTime); // +10% increase in attack SFX volume
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
  // 1. SATISFYING TASK SUBMIT "TING" SOUND (Crisp Crystal Bell Chime)
  // ============================================================================
  public playTing() {
    const ctx = this.initContext();
    if (!ctx || !this.sfxGain || this.isMuted) return;

    const now = ctx.currentTime;
    const freqs = [1760, 2637, 3520]; // Crystal chime harmonics

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.22 / (idx + 1), now + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2 - idx * 0.2);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(now);
      osc.stop(now + 1.25);
    });
  }

  // ============================================================================
  // 2. MIGHTY LOW-BASS DRAGON ROAR (Acoustic Guttural Sub-Rumble & Cavern Roar)
  // ============================================================================
  public playDragonRoar() {
    const ctx = this.initContext();
    if (!ctx || !this.sfxGain || this.isMuted) return;

    const now = ctx.currentTime;

    // Layer 1: Deep Chest Sub-Rumble (48Hz down to 32Hz, lowpass filtered)
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = "triangle";
    subOsc.frequency.setValueAtTime(75, now);
    subOsc.frequency.exponentialRampToValueAtTime(38, now + 1.8);

    subGain.gain.setValueAtTime(0, now);
    subGain.gain.linearRampToValueAtTime(0.48, now + 0.15);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);

    const subFilter = ctx.createBiquadFilter();
    subFilter.type = "lowpass";
    subFilter.frequency.setValueAtTime(140, now);

    subOsc.connect(subFilter);
    subFilter.connect(subGain);
    subGain.connect(this.sfxGain);

    subOsc.start(now);
    subOsc.stop(now + 2.0);

    // Layer 2: Guttural Throat Cavity Formant (Deep Acoustic Roar)
    const throatOsc = ctx.createOscillator();
    const throatGain = ctx.createGain();
    throatOsc.type = "sawtooth";
    throatOsc.frequency.setValueAtTime(95, now);
    throatOsc.frequency.linearRampToValueAtTime(130, now + 0.25);
    throatOsc.frequency.exponentialRampToValueAtTime(45, now + 1.9);

    const formantFilter1 = ctx.createBiquadFilter();
    formantFilter1.type = "bandpass";
    formantFilter1.frequency.setValueAtTime(240, now);
    formantFilter1.Q.setValueAtTime(3.5, now);

    throatGain.gain.setValueAtTime(0, now);
    throatGain.gain.linearRampToValueAtTime(0.38, now + 0.18);
    throatGain.gain.exponentialRampToValueAtTime(0.001, now + 1.9);

    throatOsc.connect(formantFilter1);
    formantFilter1.connect(throatGain);
    throatGain.connect(this.sfxGain);

    throatOsc.start(now);
    throatOsc.stop(now + 2.0);

    // Layer 3: Cavern Breath Air Blast (Brownian/Pink Noise through Lowpass)
    const bufferSize = ctx.sampleRate * 2.0;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.03 * white) / 1.03; // Soft pink/brown noise
      lastOut = data[i];
    }

    const noiseSrc = ctx.createBufferSource();
    noiseSrc.buffer = noiseBuffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "lowpass";
    noiseFilter.frequency.setValueAtTime(380, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(800, now + 0.35);
    noiseFilter.frequency.exponentialRampToValueAtTime(160, now + 1.8);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0, now);
    noiseGain.gain.linearRampToValueAtTime(0.32, now + 0.2);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 1.9);

    noiseSrc.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.sfxGain);

    noiseSrc.start(now);
    noiseSrc.stop(now + 2.0);
  }

  // ============================================================================
  // 3. CONTINUOUS LOOPING SPELL SOUNDS
  // ============================================================================
  public startSpellLoop(spellType: string) {
    this.stopSpellLoop();
    const ctx = this.initContext();
    if (!ctx || !this.sfxGain || this.isMuted) return;

    const now = ctx.currentTime;
    const loopGain = ctx.createGain();
    loopGain.gain.setValueAtTime(0, now);
    loopGain.gain.linearRampToValueAtTime(0.28, now + 0.08); // +10% attack SFX volume
    loopGain.connect(this.sfxGain);

    const nodes: (AudioNode | OscillatorNode | AudioBufferSourceNode)[] = [];
    const timers: any[] = [];

    if (spellType === "lightning" || spellType === "spark" || spellType === "all") {
      // CINEMATIC THUNDERBLAST & BOMB DETONATION (Zero metallic resonance, pure explosive boom & rolling rumble)
      const playExplosiveThunderDetonation = () => {
        if (!this.ctx || !this.activeSpellLoop) return;
        const strikeTime = this.ctx.currentTime;

        // 1. Initial High-Voltage Spark Crackle (Diffuse non-tonal snap, 0.035s)
        const snapLen = Math.floor(this.ctx.sampleRate * 0.04);
        const snapBuf = this.ctx.createBuffer(1, snapLen, this.ctx.sampleRate);
        const snapData = snapBuf.getChannelData(0);
        for (let i = 0; i < snapLen; i++) {
          snapData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.008));
        }
        const snapSrc = this.ctx.createBufferSource();
        snapSrc.buffer = snapBuf;

        const snapHp = this.ctx.createBiquadFilter();
        snapHp.type = "highpass";
        snapHp.frequency.setValueAtTime(2800, strikeTime);
        snapHp.Q.setValueAtTime(0.5, strikeTime); // Zero ringing resonance

        const snapGain = this.ctx.createGain();
        snapGain.gain.setValueAtTime(0.24, strikeTime);

        snapSrc.connect(snapHp);
        snapHp.connect(snapGain);
        snapGain.connect(loopGain);
        snapSrc.start(strikeTime);

        // 2. Heavy Bomb Detonation Blast Wave (Organic Brownian explosion noise through dual non-resonant lowpass)
        const blastLen = Math.floor(this.ctx.sampleRate * 0.95);
        const blastBuf = this.ctx.createBuffer(1, blastLen, this.ctx.sampleRate);
        const blastData = blastBuf.getChannelData(0);
        let brown = 0;
        for (let i = 0; i < blastLen; i++) {
          const white = Math.random() * 2 - 1;
          brown = (brown + 0.04 * white) / 1.04;
          // Fast explosive impact envelope decaying into rolling tail
          const env = 0.8 * Math.exp(-i / (this.ctx.sampleRate * 0.09)) + 0.35 * Math.exp(-i / (this.ctx.sampleRate * 0.45));
          blastData[i] = brown * env * 4.5;
        }
        const blastSrc = this.ctx.createBufferSource();
        blastSrc.buffer = blastBuf;

        // Dual cascading lowpass filters (Butterworth response - completely eliminates metallic pipe frequencies)
        const lp1 = this.ctx.createBiquadFilter();
        lp1.type = "lowpass";
        lp1.frequency.setValueAtTime(100, strikeTime);
        lp1.frequency.exponentialRampToValueAtTime(45, strikeTime + 0.85);
        lp1.Q.setValueAtTime(0.5, strikeTime);

        const lp2 = this.ctx.createBiquadFilter();
        lp2.type = "lowpass";
        lp2.frequency.setValueAtTime(120, strikeTime);
        lp2.frequency.exponentialRampToValueAtTime(55, strikeTime + 0.85);
        lp2.Q.setValueAtTime(0.5, strikeTime);

        const blastGain = this.ctx.createGain();
        blastGain.gain.setValueAtTime(0.65, strikeTime);
        blastGain.gain.exponentialRampToValueAtTime(0.001, strikeTime + 0.92);

        blastSrc.connect(lp1);
        lp1.connect(lp2);
        lp2.connect(blastGain);
        blastGain.connect(loopGain);
        blastSrc.start(strikeTime);

        // 3. Ultra-Low Sub-Bass Pressure Impact (Pure 48Hz -> 26Hz sub rumble, felt in chest)
        const subOsc = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        subOsc.type = "sine";
        subOsc.frequency.setValueAtTime(52, strikeTime);
        subOsc.frequency.exponentialRampToValueAtTime(26, strikeTime + 0.65);

        subGain.gain.setValueAtTime(0.42, strikeTime);
        subGain.gain.exponentialRampToValueAtTime(0.001, strikeTime + 0.75);

        subOsc.connect(subGain);
        subGain.connect(loopGain);
        subOsc.start(strikeTime);
        subOsc.stop(strikeTime + 0.80);
      };

      playExplosiveThunderDetonation();
      const timerThunder = setInterval(playExplosiveThunderDetonation, 1000); // 1.0s loop
      timers.push(timerThunder);
    } else if (spellType === "ice" || spellType === "water") {
      // REALISTIC SUB-ZERO FREEZING & ICE CRACKING
      // 1. Chilling Arctic Wind
      const windBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const windData = windBuffer.getChannelData(0);
      let lastW = 0;
      for (let i = 0; i < windData.length; i++) {
        const white = Math.random() * 2 - 1;
        windData[i] = (lastW + 0.02 * white) / 1.02;
        lastW = windData[i];
      }
      const wind = ctx.createBufferSource();
      wind.buffer = windBuffer;
      wind.loop = true;

      const windFilter = ctx.createBiquadFilter();
      windFilter.type = "bandpass";
      windFilter.frequency.setValueAtTime(650, now);
      windFilter.Q.setValueAtTime(2.0, now);

      wind.connect(windFilter);
      windFilter.connect(loopGain);
      wind.start(now);
      nodes.push(wind, windFilter);

      // 2. Periodic Sharp Ice Cracking Shards
      const playIceCrack = () => {
        if (!this.ctx || !this.activeSpellLoop) return;
        const crackTime = this.ctx.currentTime;
        const freqs = [2800, 3600, 4400];
        freqs.forEach((f) => {
          const osc = this.ctx!.createOscillator();
          const g = this.ctx!.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(f + (Math.random() * 400 - 200), crackTime);

          g.gain.setValueAtTime(0, crackTime);
          g.gain.linearRampToValueAtTime(0.08, crackTime + 0.003);
          g.gain.exponentialRampToValueAtTime(0.0001, crackTime + 0.12);

          osc.connect(g);
          g.connect(loopGain);
          osc.start(crackTime);
          osc.stop(crackTime + 0.14);
        });
      };

      playIceCrack();
      const timerCrack = setInterval(playIceCrack, 450);
      timers.push(timerCrack);
    } else if (spellType === "fire") {
      // TURBULENT COMBUSTION FLAME WHOOSH & POPPING CRACKLE
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
    const now = this.ctx.currentTime;

    if (timers) {
      timers.forEach((t) => clearInterval(t));
    }

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
      brassFilter.frequency.setValueAtTime(1600, now + n.start);

      gain.gain.setValueAtTime(0, now + n.start);
      gain.gain.linearRampToValueAtTime(0.22, now + n.start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + n.start + n.dur);

      osc.connect(brassFilter);
      brassFilter.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(now + n.start);
      osc.stop(now + n.start + n.dur + 0.05);
    });
  }

  // ============================================================================
  // 5. ADVENTUROUS HEROIC MEDIEVAL BGM (Inspiring Trumpet Horns, Lute & War Drums)
  // ============================================================================
  public startMedievalHeroicBgm() {
    if (this.isBgmPlaying) return;
    const ctx = this.initContext();
    if (!ctx) return;

    this.isBgmPlaying = true;
    let step = 0;

    // Upbeat, inspiring adventurous medieval theme in D Major (D -> G -> A -> D -> Bm -> G -> A -> D)
    const bassChords = [
      146.83, 146.83, 196.00, 196.00, // D3 -> G3
      220.00, 220.00, 146.83, 146.83, // A3 -> D3
      123.47, 123.47, 196.00, 196.00, // B2 -> G3
      220.00, 220.00, 146.83, 146.83, // A3 -> D3
    ];

    const trumpetMelody = [
      293.66, 369.99, 440.00, 493.88, // D4, F#4, A4, B4 (Heroic Ascent)
      440.00, 587.33, 440.00, 369.99, // A4, D5, A4, F#4 (Triumphant Call)
      493.88, 440.00, 369.99, 329.63, // B4, A4, F#4, E4 (Adventurous Stride)
      369.99, 440.00, 587.33, 587.33, // F#4, A4, D5 (Grand Finale)
    ];

    const playHeroicBeat = () => {
      if (!this.isBgmPlaying || !this.ctx || !this.bgmGain) return;
      const now = this.ctx.currentTime;
      const beatIdx = step % 16;

      // 1. Acoustic Lute Chords (Warm Plucked Strum)
      const chordRoot = bassChords[beatIdx];
      [chordRoot, chordRoot * 1.25, chordRoot * 1.5].forEach((freq, noteIdx) => {
        const luteOsc = this.ctx!.createOscillator();
        const luteGain = this.ctx!.createGain();
        luteOsc.type = "triangle";
        luteOsc.frequency.setValueAtTime(freq, now + noteIdx * 0.02);

        luteGain.gain.setValueAtTime(0, now + noteIdx * 0.02);
        luteGain.gain.linearRampToValueAtTime(0.08, now + noteIdx * 0.02 + 0.015);
        luteGain.gain.exponentialRampToValueAtTime(0.0001, now + noteIdx * 0.02 + 0.45);

        luteOsc.connect(luteGain);
        luteGain.connect(this.bgmGain!);

        luteOsc.start(now + noteIdx * 0.02);
        luteOsc.stop(now + noteIdx * 0.02 + 0.5);
      });

      // 2. Inspiring Medieval Horn / Trumpet Lead
      const hornFreq = trumpetMelody[beatIdx];
      const hornOsc = this.ctx.createOscillator();
      const hornGain = this.ctx.createGain();
      hornOsc.type = "triangle";
      hornOsc.frequency.setValueAtTime(hornFreq, now);

      const hornFilter = this.ctx.createBiquadFilter();
      hornFilter.type = "lowpass";
      hornFilter.frequency.setValueAtTime(1400, now);

      hornGain.gain.setValueAtTime(0, now);
      hornGain.gain.linearRampToValueAtTime(0.12, now + 0.025);
      hornGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);

      hornOsc.connect(hornFilter);
      hornFilter.connect(hornGain);
      hornGain.connect(this.bgmGain);

      hornOsc.start(now);
      hornOsc.stop(now + 0.35);

      // 3. Acoustic Marching Battle Drums
      if (beatIdx % 4 === 0) {
        // Deep Resonant Bass Drum
        const kickOsc = this.ctx.createOscillator();
        const kickGain = this.ctx.createGain();
        kickOsc.frequency.setValueAtTime(95, now);
        kickOsc.frequency.exponentialRampToValueAtTime(40, now + 0.18);

        kickGain.gain.setValueAtTime(0.28, now);
        kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        kickOsc.connect(kickGain);
        kickGain.connect(this.bgmGain);

        kickOsc.start(now);
        kickOsc.stop(now + 0.22);
      }

      // Snare / Marching Tap on beats 2, 6, 10, 14
      if (beatIdx % 2 === 1) {
        const snareBuffer = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * 0.09), this.ctx.sampleRate);
        const snareData = snareBuffer.getChannelData(0);
        for (let i = 0; i < snareData.length; i++) {
          snareData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.02));
        }
        const snare = this.ctx.createBufferSource();
        snare.buffer = snareBuffer;
        const snareGain = this.ctx.createGain();
        snareGain.gain.setValueAtTime(0.12, now);

        snare.connect(snareGain);
        snareGain.connect(this.bgmGain);
        snare.start(now);
      }

      step++;
    };

    playHeroicBeat();
    this.bgmIntervalId = setInterval(playHeroicBeat, 275); // ~110 BPM inspiring march tempo

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

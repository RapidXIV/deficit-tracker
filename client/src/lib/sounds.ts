let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext();
  }
  if (ctx.state === "suspended") {
    ctx.resume();
  }
  return ctx;
}

function getVolume(): number {
  const stored = localStorage.getItem("sound-volume");
  return stored !== null ? parseInt(stored, 10) / 100 : 0.5;
}

/** Short punchy boing/honk — plays on + button tap. ~100ms. */
export function playTap(): void {
  try {
    const volume = getVolume();
    if (volume === 0) return;

    const ac = getCtx();
    const now = ac.currentTime;

    const master = ac.createGain();
    master.gain.value = volume;
    master.connect(ac.destination);

    // Noise burst: bandpass-filtered white noise, decays fast
    const bufferSize = Math.floor(ac.sampleRate * 0.045);
    const noiseBuffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = ac.createBufferSource();
    noise.buffer = noiseBuffer;

    const bandpass = ac.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.value = 700;
    bandpass.Q.value = 1.5;

    const noiseGain = ac.createGain();
    noiseGain.gain.setValueAtTime(0.35, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    noise.connect(bandpass);
    bandpass.connect(noiseGain);
    noiseGain.connect(master);
    noise.start(now);
    noise.stop(now + 0.05);

    // Frequency sweep: 200 Hz → 600 Hz, triangle wave, quick decay
    const osc = ac.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.09);

    const oscGain = ac.createGain();
    oscGain.gain.setValueAtTime(0.45, now);
    oscGain.gain.setValueAtTime(0.45, now + 0.006);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

    osc.connect(oscGain);
    oscGain.connect(master);
    osc.start(now);
    osc.stop(now + 0.14);
  } catch {
    // Audio unavailable — silent fail
  }
}

/** Deep resonant gong — plays on Finish Day / Update Day. ~2.5s decay. */
export function playGong(): void {
  try {
    const volume = getVolume();
    if (volume === 0) return;

    const ac = getCtx();
    const now = ac.currentTime;

    const master = ac.createGain();
    master.gain.value = volume;
    master.connect(ac.destination);

    function addLayer(freq: number, gainVal: number, decayTime: number, type: OscillatorType = "sine") {
      const osc = ac.createOscillator();
      osc.type = type;
      osc.frequency.value = freq;
      const g = ac.createGain();
      g.gain.setValueAtTime(gainVal, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + decayTime);
      osc.connect(g);
      g.connect(master);
      osc.start(now);
      osc.stop(now + decayTime + 0.05);
    }

    // Fundamental: 65Hz, slow 2.5s decay
    addLayer(65, 0.5, 2.5);
    // Beating tone: 66.5Hz — 1.5Hz beat frequency creates slow pulse against fundamental
    addLayer(66.5, 0.35, 2.5);
    // Second harmonic: 131Hz
    addLayer(131, 0.3, 2.0);
    // High shimmer: 196Hz
    addLayer(196, 0.15, 1.5);

    // Strike transient: triangle 300Hz → 80Hz in 60ms, fast 100ms decay
    const transient = ac.createOscillator();
    transient.type = "triangle";
    transient.frequency.setValueAtTime(300, now);
    transient.frequency.exponentialRampToValueAtTime(80, now + 0.06);
    const transientGain = ac.createGain();
    transientGain.gain.setValueAtTime(0.4, now);
    transientGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    transient.connect(transientGain);
    transientGain.connect(master);
    transient.start(now);
    transient.stop(now + 0.12);
  } catch {
    // Audio unavailable — silent fail
  }
}

/** Triumphant silly fanfare — kept for reference. ~400ms. */
export function playComplete(): void {
  try {
    const volume = getVolume();
    if (volume === 0) return;

    const ac = getCtx();
    const now = ac.currentTime;

    const master = ac.createGain();
    master.gain.value = volume;
    master.connect(ac.destination);

    // Ascending cartoon victory jingle: slot machine meets clown horn
    const notes = [350, 450, 600, 800, 1050];
    const noteDur = 0.07;
    const step = 0.08; // note + gap

    notes.forEach((freq, i) => {
      const t = now + i * step;

      // Square wave main tone (cartoonish)
      const osc = ac.createOscillator();
      osc.type = "square";
      osc.frequency.setValueAtTime(freq, t);
      // Slight wobble for clown-horn character
      osc.frequency.setValueAtTime(freq * 1.04, t + noteDur * 0.35);
      osc.frequency.setValueAtTime(freq, t + noteDur * 0.7);

      const gain = ac.createGain();
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.18, t + 0.006);
      gain.gain.setValueAtTime(0.18, t + noteDur - 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, t + noteDur + 0.04);

      // Octave-up sine harmonic for sparkle
      const osc2 = ac.createOscillator();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(freq * 2, t);

      const gain2 = ac.createGain();
      gain2.gain.setValueAtTime(0, t);
      gain2.gain.linearRampToValueAtTime(0.07, t + 0.006);
      gain2.gain.exponentialRampToValueAtTime(0.001, t + noteDur + 0.03);

      osc.connect(gain);
      gain.connect(master);
      osc2.connect(gain2);
      gain2.connect(master);

      osc.start(t);
      osc.stop(t + noteDur + 0.06);
      osc2.start(t);
      osc2.stop(t + noteDur + 0.05);
    });
  } catch {
    // Audio unavailable — silent fail
  }
}

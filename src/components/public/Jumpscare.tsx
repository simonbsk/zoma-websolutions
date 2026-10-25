import { useEffect, useState } from 'react';

const EVENT = 'zoma:jumpscare';
const DURATION_MS = 1800;

export function triggerJumpscare() {
  window.dispatchEvent(new Event(EVENT));
}

/** Synthesised screech: detuned sawtooth sweep plus a burst of noise. */
function playScream() {
  const ctx = new AudioContext();
  const now = ctx.currentTime;
  const end = now + DURATION_MS / 1000;

  const master = ctx.createGain();
  master.gain.setValueAtTime(0.0001, now);
  master.gain.exponentialRampToValueAtTime(0.9, now + 0.03);
  master.gain.exponentialRampToValueAtTime(0.0001, end);
  master.connect(ctx.destination);

  for (const detune of [0, 37, -52, 91]) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.detune.value = detune;
    osc.frequency.setValueAtTime(380, now);
    osc.frequency.exponentialRampToValueAtTime(1400, now + 0.25);
    osc.frequency.exponentialRampToValueAtTime(220, end);
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 23;
    lfoGain.gain.value = 120;
    lfo.connect(lfoGain).connect(osc.frequency);
    osc.connect(master);
    osc.start(now);
    lfo.start(now);
    osc.stop(end);
    lfo.stop(end);
  }

  const noise = ctx.createBuffer(1, ctx.sampleRate * (DURATION_MS / 1000), ctx.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = noise;
  const noiseGain = ctx.createGain();
  noiseGain.gain.value = 0.35;
  src.connect(noiseGain).connect(master);
  src.start(now);

  setTimeout(() => ctx.close(), DURATION_MS + 200);
}

export function Jumpscare() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const onTrigger = () => {
      setActive(true);
      playScream();
    };
    window.addEventListener(EVENT, onTrigger);
    return () => window.removeEventListener(EVENT, onTrigger);
  }, []);

  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => setActive(false), DURATION_MS);
    return () => clearTimeout(t);
  }, [active]);

  if (!active) return null;
  return (
    <div className="jumpscare" onClick={() => setActive(false)}>
      <img src="/eyuep.png" alt="" />
    </div>
  );
}

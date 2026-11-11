/**
 * Notebook sound effects. Page turns play JD's recorded samples through the
 * Web Audio API; the bookmark hover tick is synthesised. Everything only
 * plays in response to a user gesture, so it respects browser autoplay rules.
 */

type AudioContextCtor = typeof AudioContext;

interface Sample {
  buffer: AudioBuffer;
  /** Start of the audible region in seconds (recordings have silent padding). */
  offset: number;
  /** Length of the audible region in seconds. */
  duration: number;
}

const sampleUrls = {
  turn: '/sounds/page-turn.mp3',
  burst: '/sounds/page-riffle.mp3',
} as const;

let ctx: AudioContext | null = null;
let lastHover = 0;
const samples = new Map<string, Sample>();
const sampleLoading = new Set<string>();
const activeSources = new Map<string, AudioBufferSourceNode>();

function context(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctor: AudioContextCtor | undefined =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: AudioContextCtor })
      .webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) ctx = new Ctor();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

/** Resume the shared context from within a user gesture handler. */
export function primeNotebookAudio(): void {
  const target = context();
  if (target) {
    void loadSample(target, sampleUrls.turn);
    void loadSample(target, sampleUrls.burst);
  }
}

/** Find the audible span so silent lead-in and tail padding are skipped. */
function activeRegion(buffer: AudioBuffer): { offset: number; duration: number } {
  const channel = buffer.getChannelData(0);
  const rate = buffer.sampleRate;
  const window = Math.max(1, Math.floor(rate * 0.02));
  const threshold = 0.015;
  let first = -1;
  let last = -1;
  for (let i = 0; i < channel.length; i += window) {
    let peak = 0;
    const end = Math.min(i + window, channel.length);
    for (let j = i; j < end; j += 1) peak = Math.max(peak, Math.abs(channel[j]!));
    if (peak > threshold) {
      if (first < 0) first = i;
      last = end;
    }
  }
  if (first < 0) return { offset: 0, duration: buffer.duration };
  const offset = Math.max(0, first / rate - 0.01);
  const duration = Math.min(buffer.duration - offset, last / rate - offset + 0.05);
  return { offset, duration };
}

async function loadSample(
  target: AudioContext,
  url: string,
): Promise<Sample | null> {
  const cached = samples.get(url);
  if (cached) return cached;
  if (sampleLoading.has(url)) return null;
  sampleLoading.add(url);
  try {
    const response = await fetch(url);
    const data = await response.arrayBuffer();
    const buffer = await target.decodeAudioData(data);
    const sample = { buffer, ...activeRegion(buffer) };
    samples.set(url, sample);
    return sample;
  } catch {
    return null;
  } finally {
    sampleLoading.delete(url);
  }
}

/** Play a recorded sample's audible region, stopping any prior play of it. */
function playSample(
  url: string,
  gainValue: number,
  maxDuration?: number,
): void {
  const target = context();
  if (!target) return;
  const render = (sample: Sample) => {
    // Keep repeated turns crisp instead of letting samples pile up.
    const previous = activeSources.get(url);
    if (previous) {
      try {
        previous.stop();
      } catch {
        // Already stopped.
      }
    }
    const source = target.createBufferSource();
    source.buffer = sample.buffer;
    // Trim playback to match the on-screen animation when asked, with a short
    // fade so the shortened tail does not click.
    const playDuration =
      maxDuration !== undefined
        ? Math.min(sample.duration, maxDuration)
        : sample.duration;
    const now = target.currentTime;
    const fade = Math.min(0.12, playDuration / 3);
    const gain = target.createGain();
    gain.gain.setValueAtTime(gainValue, now);
    gain.gain.setValueAtTime(gainValue, now + playDuration - fade);
    gain.gain.linearRampToValueAtTime(0.0001, now + playDuration);
    source.connect(gain).connect(target.destination);
    source.onended = () => {
      if (activeSources.get(url) === source) activeSources.delete(url);
    };
    activeSources.set(url, source);
    source.start(0, sample.offset, playDuration);
  };
  const cached = samples.get(url);
  if (cached) {
    render(cached);
    return;
  }
  void loadSample(target, url).then((sample) => {
    if (sample) render(sample);
  });
}

/** A soft tonal tick for pointer feedback. */
function tick(
  target: AudioContext,
  when: number,
  frequency: number,
  peakGain: number,
  duration: number,
): void {
  const osc = target.createOscillator();
  osc.type = 'triangle';
  osc.frequency.value = frequency;
  const gain = target.createGain();
  gain.gain.setValueAtTime(0.0001, when);
  gain.gain.exponentialRampToValueAtTime(peakGain, when + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + duration);
  osc.connect(gain).connect(target.destination);
  osc.start(when);
  osc.stop(when + duration + 0.02);
}

/** One page flipping over: JD's recorded single page-turn sample, kept subtle. */
export function playPageTurn(): void {
  playSample(sampleUrls.turn, 0.45);
}

/**
 * Several pages riffling past during a section jump. The engine animates at
 * most three pages (~280ms each), so the sample is capped to match and stay
 * subtle rather than droning on past the animation.
 */
export function playPageBurst(): void {
  playSample(sampleUrls.burst, 0.38, 0.85);
}

/** A quiet tick when a bookmark is hovered. */
export function playBookmarkHover(): void {
  const target = context();
  if (!target) return;
  const now = target.currentTime;
  // Avoid spamming while the pointer sweeps across several bookmarks.
  if (now - lastHover < 0.05) return;
  lastHover = now;
  tick(target, now, 1500, 0.04, 0.06);
}

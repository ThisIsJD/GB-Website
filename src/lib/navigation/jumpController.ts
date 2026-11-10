import type { EngineSnapshot, FlipAdapterHandle } from './engineProtocol';

export interface JumpResult {
  target: number;
  turns: number;
  duration: number;
  snapshot: EngineSnapshot;
}
interface JumpOptions {
  move: FlipAdapterHandle['turn'];
  position: () => EngineSnapshot | null;
  reducedMotion: boolean;
  onBusy: (busy: boolean) => void;
  onComplete: (result: JumpResult) => void;
  onError: (error: unknown) => void;
  now?: () => number;
}

export function jumpPath(from: number, target: number, visible: number[] = []) {
  if (from === target || visible.includes(target)) return [];
  const distance = Math.abs(target - from);
  const count = distance <= 2 ? 1 : distance <= 6 ? 2 : 3;
  return Array.from({ length: count }, (_, index) =>
    Math.round(from + ((target - from) * (index + 1)) / count),
  );
}

export function createJumpController(options: JumpOptions) {
  let latest: number | null = null;
  let active: Promise<JumpResult | null> | null = null;
  let cancelled = false;
  const now = options.now ?? (() => performance.now());

  async function drain(): Promise<JumpResult | null> {
    let turns = 0;
    const started = now();
    options.onBusy(true);
    try {
      while (latest !== null && !cancelled) {
        const target: number = latest;
        latest = null;
        const position = options.position();
        if (!position) throw new Error('Notebook position is not ready.');
        const path = options.reducedMotion
          ? []
          : jumpPath(position.index, target, position.visible);
        for (const step of path) {
          if (latest !== null || cancelled || turns >= 3) break;
          if (options.position()?.visible.includes(step)) continue;
          await options.move(step, {
            animate: true,
            focus: false,
            burst: true,
          });
          turns++;
        }
        if (cancelled) return null;
        if (latest !== null) continue;
        // Always verify the final landing and focus, even when its spread is already visible.
        const snapshot = await options.move(target, {
          animate: false,
          focus: true,
          burst: true,
        });
        if (cancelled) return null;
        if (latest !== null) continue;
        if (!snapshot.visible.includes(target))
          throw new Error('Notebook jump missed its destination.');
        const result = { target, turns, duration: now() - started, snapshot };
        options.onComplete(result);
        return result;
      }
      return null;
    } catch (error) {
      if (!cancelled) options.onError(error);
      return null;
    } finally {
      if (!cancelled) options.onBusy(false);
    }
  }

  return {
    request(target: number) {
      if (cancelled) return Promise.resolve(null);
      if (!Number.isInteger(target) || target < 0)
        throw new RangeError('Invalid notebook destination.');
      latest = target;
      if (!active)
        active = Promise.resolve()
          .then(drain)
          .finally(() => {
            active = null;
          });
      return active;
    },
    cancel() {
      cancelled = true;
      latest = null;
    },
  };
}

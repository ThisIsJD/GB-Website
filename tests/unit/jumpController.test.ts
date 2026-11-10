import { describe, expect, it } from 'vitest';
import { createJumpController } from '../../src/lib/navigation/jumpController';
import type { EngineSnapshot } from '../../src/lib/navigation/engineProtocol';

function harness(reducedMotion = false) {
  let position: EngineSnapshot = {
    index: 0,
    visible: [0],
    mode: 'portrait',
    state: 'read',
    revision: 'test',
  };
  let clock = 0;
  const calls: { index: number; animate: boolean }[] = [];
  const results: unknown[] = [];
  const errors: unknown[] = [];
  let hold: (() => Promise<void>) | null = null;
  const controller = createJumpController({
    reducedMotion,
    position: () => position,
    now: () => clock,
    onBusy: () => {},
    onComplete: (result) => results.push(result),
    onError: (error) => errors.push(error),
    move: async (index, options) => {
      calls.push({ index, animate: options?.animate ?? true });
      if (hold) {
        const wait = hold;
        hold = null;
        await wait();
      }
      clock += options?.animate ? 280 : 1;
      position = { ...position, index, visible: [index] };
      return position;
    },
  });
  return {
    controller,
    calls,
    results,
    errors,
    holdNext: (wait: () => Promise<void>) => {
      hold = wait;
    },
  };
}

describe('bounded section jumps', () => {
  it.each([
    [1, 1],
    [5, 2],
    [8, 3],
  ])('lands at %i with %i physical turns', async (target, turns) => {
    const test = harness();
    const result = await test.controller.request(target!);
    expect(result?.target).toBe(target);
    expect(result?.snapshot.visible).toContain(target);
    expect(test.calls.filter((call) => call.animate)).toHaveLength(turns!);
    expect(result?.duration).toBeLessThanOrEqual(1400);
    expect(test.errors).toEqual([]);
  });

  it('replaces many pending selections and never completes an obsolete target', async () => {
    const test = harness();
    let release!: () => void;
    test.holdNext(
      () =>
        new Promise<void>((resolve) => {
          release = resolve;
        }),
    );
    const first = test.controller.request(8);
    await Promise.resolve();
    for (let index = 0; index < 100; index++)
      void test.controller.request(index % 9);
    const final = test.controller.request(1);
    release();
    expect(await final).toMatchObject({ target: 1 });
    expect(await first).toMatchObject({ target: 1 });
    expect(test.calls.map((call) => call.index)).toEqual([3, 1, 1]);
    expect(test.results).toHaveLength(1);
  });

  it('uses an immediate final landing with reduced motion', async () => {
    const test = harness(true);
    const result = await test.controller.request(8);
    expect(test.calls).toEqual([{ index: 8, animate: false }]);
    expect(result?.turns).toBe(0);
  });

  it('does not complete or start further steps after cancellation', async () => {
    const test = harness();
    let release!: () => void;
    test.holdNext(
      () =>
        new Promise<void>((resolve) => {
          release = resolve;
        }),
    );
    const result = test.controller.request(8);
    await Promise.resolve();
    test.controller.cancel();
    release();
    expect(await result).toBeNull();
    expect(test.calls).toHaveLength(1);
    expect(test.results).toEqual([]);
    expect(test.errors).toEqual([]);
  });
});

it('caps turns even when the destination changes at every completion boundary', async () => {
  let snapshot: EngineSnapshot = {
    index: 0,
    visible: [0],
    mode: 'portrait',
    state: 'read',
    revision: 'test',
  };
  let turns = 0;
  const results: number[] = [];
  const errors: unknown[] = [];
  const controller = createJumpController({
    position: () => snapshot,
    reducedMotion: false,
    onBusy: () => {},
    onComplete: (result) => results.push(result.target),
    onError: (error) => errors.push(error),
    move: async (index, options) => {
      if (options?.animate) {
        turns++;
        void controller.request(turns % 2 ? 0 : 8);
      }
      snapshot = { ...snapshot, index, visible: [index] };
      return snapshot;
    },
  });
  expect(await controller.request(8)).toMatchObject({ target: 0, turns: 3 });
  expect(turns).toBe(3);
  expect(results).toEqual([0]);
  expect(errors).toEqual([]);
});

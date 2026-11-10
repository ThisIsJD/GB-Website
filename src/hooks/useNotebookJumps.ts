import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from 'react';
import {
  createJumpController,
  type JumpResult,
} from '../lib/navigation/jumpController';
import type {
  EngineSnapshot,
  FlipAdapterHandle,
} from '../lib/navigation/engineProtocol';

export function useNotebookJumps(
  adapter: RefObject<FlipAdapterHandle | null>,
  revision: string,
  reducedMotion: boolean,
  snapshotRef: RefObject<EngineSnapshot | null>,
  onComplete: (result: JumpResult) => void,
  onError: (cause: unknown) => void,
) {
  const controller = useRef<ReturnType<typeof createJumpController> | null>(
    null,
  );
  const activeRef = useRef(false);
  const callbacks = useRef({ onComplete, onError });
  const [busyRevision, setBusyRevision] = useState('');
  const [result, setResult] = useState<JumpResult | null>(null);
  useEffect(() => {
    callbacks.current = { onComplete, onError };
  });
  useEffect(() => {
    const initialAdapter = adapter.current;
    let alive = true;
    const instance = createJumpController({
      reducedMotion,
      position: () => snapshotRef.current,
      move: async (index, options) => {
        if (!adapter.current)
          throw new DOMException('Notebook was replaced.', 'AbortError');
        const value = await adapter.current.turn(index, {
          ...options,
          focus: false,
        });
        if (!alive || value.revision !== revision)
          throw new DOMException('Notebook was replaced.', 'AbortError');
        snapshotRef.current = value;
        return value;
      },
      onBusy: (busy) => {
        activeRef.current = busy;
        setBusyRevision(busy ? revision : '');
        adapter.current?.lockInput(busy);
      },
      onComplete: (value) => {
        setResult(value);
        callbacks.current.onComplete(value);
      },
      onError: (cause) => {
        if (!(cause instanceof DOMException && cause.name === 'AbortError'))
          callbacks.current.onError(cause);
      },
    });
    controller.current = instance;
    return () => {
      alive = false;
      instance.cancel();
      activeRef.current = false;
      initialAdapter?.lockInput(false);
      if (controller.current === instance) controller.current = null;
    };
  }, [adapter, revision, reducedMotion, snapshotRef]);
  const request = useCallback((target: number) => {
    void controller.current?.request(target);
  }, []);
  return { request, activeRef, jumping: busyRevision === revision, result };
}

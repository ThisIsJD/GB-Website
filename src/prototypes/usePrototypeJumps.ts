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
import type { BookmarkDestination } from '../components/notebook/BookmarkRail';
import { sectionAtIndex } from './bookmarkDestinations';

export function usePrototypeJumps(
  adapter: RefObject<FlipAdapterHandle | null>,
  revision: string,
  reducedMotion: boolean,
  destinations: BookmarkDestination[],
  onError: (error: unknown) => void,
) {
  const latestPosition = useRef<EngineSnapshot | null>(null);
  const burstActive = useRef(false);
  const controller = useRef<ReturnType<typeof createJumpController> | null>(
    null,
  );
  const [position, setPosition] = useState<EngineSnapshot | null>(null);
  const [displayPosition, setDisplayPosition] = useState<EngineSnapshot | null>(
    null,
  );
  const [selected, setSelected] = useState('');
  const [jumping, setJumping] = useState(false);
  const [result, setResult] = useState<JumpResult | null>(null);
  const receivePosition = useCallback(
    (snapshot: EngineSnapshot) => {
      latestPosition.current = snapshot;
      setPosition(snapshot);
      if (!burstActive.current) {
        setDisplayPosition(snapshot);
        setSelected((previous) =>
          destinations.some(
            (destination) =>
              destination.id === previous &&
              snapshot.visible.includes(destination.index),
          )
            ? previous
            : sectionAtIndex(destinations, snapshot.index),
        );
      }
    },
    [destinations],
  );

  useEffect(() => {
    const instance = createJumpController({
      position: () => latestPosition.current,
      reducedMotion,
      move: (index, options) => {
        const target = adapter.current;
        if (!target) throw new Error('Notebook is not available.');
        return target.turn(index, options).then((snapshot) => {
          latestPosition.current = snapshot;
          return snapshot;
        });
      },
      onBusy: (value) => {
        burstActive.current = value;
        setJumping(value);
        adapter.current?.lockInput(value);
      },
      onComplete: (value) => {
        setResult(value);
        setDisplayPosition(value.snapshot);
        setPosition(value.snapshot);
      },
      onError,
    });
    controller.current = instance;
    return () => {
      instance.cancel();
      if (controller.current === instance) controller.current = null;
    };
  }, [adapter, revision, reducedMotion, onError]);

  const select = useCallback((destination: BookmarkDestination) => {
    setSelected(destination.id);
    void controller.current?.request(destination.index);
  }, []);
  const ready = useCallback(
    (snapshot: EngineSnapshot) => {
      burstActive.current = false;
      setJumping(false);
      receivePosition(snapshot);
    },
    [receivePosition],
  );
  const peek = useCallback(
    (range: { top: number; bottom: number } | null) =>
      adapter.current?.peek(range),
    [adapter],
  );
  return {
    position,
    displayPosition,
    selected,
    jumping,
    result,
    receivePosition,
    select,
    ready,
    peek,
  };
}

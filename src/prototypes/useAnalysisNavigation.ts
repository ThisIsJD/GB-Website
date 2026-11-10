import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from 'react';
import type {
  EngineSnapshot,
  FlipAdapterHandle,
  ReadingLeaf,
} from '../lib/navigation/engineProtocol';
import type { ReadingLocation } from '../lib/pagination/analysisBlocks';

export function useAnalysisNavigation(
  adapter: RefObject<FlipAdapterHandle | null>,
  pages: ReadingLeaf[],
  revision: string,
  locationRef: RefObject<ReadingLocation>,
  reducedMotion: boolean,
  onError: (cause: unknown) => void,
) {
  const [snapshot, setSnapshot] = useState<EngineSnapshot | null>(null);
  const [phase, setPhase] = useState('read');
  const [pending, setPending] = useState('');
  const active = useRef(revision);
  const requested = useRef<ReadingLocation | null>(null);
  useEffect(() => {
    active.current = revision;
    return () => {
      active.current = '';
      requested.current = null;
    };
  }, [revision]);

  const receive = useCallback(
    (value: EngineSnapshot) => {
      if (value.revision !== revision) return;
      setSnapshot(value);
      const ranges = value.visible.flatMap(
        (index) => pages[index]?.ranges ?? [],
      );
      const previous = requested.current ?? locationRef.current;
      const retained = ranges.find((part) =>
        previous.blockId
          ? part.blockId === previous.blockId &&
            (previous.offset ?? 0) >= part.from &&
            (previous.offset ?? 0) < part.to
          : part.anchor === previous.anchor,
      );
      if (requested.current && !retained) return;
      const next = retained ?? ranges[0];
      if (next)
        locationRef.current = {
          anchor: next.anchor,
          blockId: next.blockId,
          offset: retained && previous.blockId ? previous.offset : next.from,
        };
    },
    [revision, pages, locationRef],
  );

  const turn = useCallback(
    async (index: number, desired?: ReadingLocation) => {
      const expected = revision;
      requested.current = desired ?? null;
      if (desired) locationRef.current = desired;
      setPending(expected);
      try {
        const value = await adapter.current?.turn(index, {
          animate: !reducedMotion,
          focus: true,
        });
        if (active.current === expected && value) receive(value);
      } catch (cause) {
        if (!(cause instanceof DOMException && cause.name === 'AbortError'))
          onError(cause);
      } finally {
        if (active.current === expected) {
          requested.current = null;
          setPending('');
        }
      }
    },
    [adapter, revision, locationRef, reducedMotion, receive, onError],
  );

  return {
    snapshot,
    phase,
    receive,
    setPhase,
    turn,
    busy: pending === revision || phase !== 'read',
  };
}

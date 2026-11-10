import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useNotebookJumps } from './useNotebookJumps';
import type {
  EngineSnapshot,
  FlipAdapterHandle,
  ReadingLeaf,
} from '../lib/navigation/engineProtocol';
import type { ReadingLocation } from '../lib/pagination/analysisBlocks';
import {
  pageForLocation,
  type PortfolioComposition,
} from './usePortfolioLayout';
import {
  blockForTarget,
  locationForTarget,
  notebookUrl,
  readNotebookRoute,
  groupForLocation,
} from '../lib/navigation/notebookRoutes';

/** Owns route requests, semantic reading position, and final engine events. */
export function useNotebookNavigation({
  adapter,
  pages,
  composed,
  revision,
  engineReady,
  reading,
  locationRef,
  reducedMotion,
  onError,
}: {
  adapter: RefObject<FlipAdapterHandle | null>;
  pages: ReadingLeaf[];
  composed?: PortfolioComposition;
  revision: string;
  engineReady: boolean;
  reading: boolean;
  locationRef: RefObject<ReadingLocation>;
  reducedMotion: boolean;
  onError: (cause: unknown) => void;
}) {
  const route = useLocation();
  const navigate = useNavigate();
  const [snapshot, setSnapshot] = useState<EngineSnapshot | null>(null);
  const [phase, setPhase] = useState('read');
  const [pending, setPending] = useState('');
  const [historyRevision, setHistoryRevision] = useState(0);
  const active = useRef('');
  const applied = useRef('');
  const echo = useRef('');
  const requested = useRef<ReadingLocation | null>(null);
  const inFlight = useRef(false);
  const scrollingToTarget = useRef(false);
  const routeKey = useRef(route.key);
  const snapshotRef = useRef<EngineSnapshot | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const [landedStamp, setLandedStamp] = useState('');
  const stamp = `${route.key}:${historyRevision}:${revision}`;
  const jumps = useNotebookJumps(
    adapter,
    revision,
    reducedMotion,
    snapshotRef,
    (result) => {
      const latestRoute = readNotebookRoute(
        window.location.pathname,
        window.location.search,
      );
      if (
        latestRoute &&
        composed &&
        !result.snapshot.visible.includes(
          pageForLocation(composed, latestRoute.location),
        )
      )
        return;
      const desired = requested.current ?? locationRef.current;
      locationRef.current = desired;
      setSnapshot(result.snapshot);
      setLandedStamp(stamp);
      requested.current = null;
      inFlight.current = false;
      const title = groupForLocation(desired)?.title ?? 'Notebook';
      const heading = blockForTarget(desired.anchor);
      adapter.current?.focusHeading(
        heading?.kind === 'heading' ? heading.text : title,
      );
      const detail =
        heading?.node.type === 'heading' ? ` ${heading.text}.` : '';
      setAnnouncement(
        `${title}.${detail} Page ${result.snapshot.index + 1} of ${pages.length}.`,
      );
    },
    onError,
  );
  const busy = pending === revision || phase !== 'read' || jumps.jumping;
  const requestJump = jumps.request;

  useEffect(() => {
    const restore = () => setHistoryRevision((value) => value + 1);
    window.addEventListener('popstate', restore);
    return () => window.removeEventListener('popstate', restore);
  }, []);

  useEffect(() => {
    routeKey.current = route.key;
    // Back can revisit a key whose intervening request had not landed yet.
    applied.current = '';
  }, [route.key]);

  useEffect(() => {
    active.current = revision;
    return () => {
      active.current = '';
      inFlight.current = false;
      requested.current = null;
    };
  }, [revision]);

  const publish = useCallback(
    (location: ReadingLocation) => {
      const url = notebookUrl(location, reading);
      if (url === route.pathname + route.search) return;
      echo.current = url;
      void navigate(url, { replace: true });
    },
    [navigate, reading, route.pathname, route.search],
  );

  const receive = useCallback(
    (value: EngineSnapshot, passive = true) => {
      if (value.revision !== revision) return;
      if (value.state === 'read') setPhase('read');
      snapshotRef.current = value;
      if (jumps.activeRef.current && passive) return;
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
      if (!next) return;
      locationRef.current = {
        anchor: next.anchor,
        blockId: next.blockId,
        offset: retained && previous.blockId ? previous.offset : next.from,
      };
      if (
        passive &&
        !inFlight.current &&
        !requested.current &&
        applied.current === stamp &&
        value.state === 'read'
      )
        publish(locationRef.current);
    },
    [revision, pages, locationRef, stamp, publish, jumps.activeRef],
  );

  const turn = useCallback(
    async (index: number, desired?: ReadingLocation, routeRequest = false) => {
      const expected = revision;
      const expectedRoute = routeKey.current;
      inFlight.current = true;
      requested.current = desired ?? null;
      if (desired) locationRef.current = desired;
      setPending(expected);
      try {
        const value = await adapter.current?.turn(index, {
          animate: !reducedMotion,
          focus: !!desired,
        });
        if (active.current === expected && value) {
          receive(value, false);
          if (!routeRequest && routeKey.current === expectedRoute)
            publish(locationRef.current);
        }
      } catch (cause) {
        if (!(cause instanceof DOMException && cause.name === 'AbortError'))
          onError(cause);
      } finally {
        if (active.current === expected) {
          inFlight.current = false;
          requested.current = null;
          setPending('');
        }
      }
    },
    [adapter, revision, locationRef, reducedMotion, receive, publish, onError],
  );

  const scrollToLocation = useCallback(() => {
    const block = blockForTarget(
      locationRef.current.blockId ?? locationRef.current.anchor,
    );
    const node = block && document.getElementById(block.id);
    if (node) {
      scrollingToTarget.current = true;
      node.scrollIntoView({ block: 'start', behavior: 'instant' });
      node.setAttribute('tabindex', '-1');
      node.focus({ preventScroll: true });
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          scrollingToTarget.current = false;
        }),
      );
    }
  }, [locationRef]);

  useEffect(() => {
    if (applied.current === stamp) return;
    const parsed = readNotebookRoute(route.pathname, route.search);
    if (!parsed) return;
    if (echo.current === route.pathname + route.search) {
      const frame = requestAnimationFrame(() => {
        echo.current = '';
        applied.current = stamp;
        setLandedStamp(stamp);
      });
      return () => cancelAnimationFrame(frame);
    }
    // A route stays pending while measuring or turning. Never consume it early.
    if (pending === revision) return;
    locationRef.current = parsed.location;
    if (reading) {
      const frame = requestAnimationFrame(() => {
        applied.current = stamp;
        scrollToLocation();
      });
      return () => cancelAnimationFrame(frame);
    }
    if (!engineReady || !composed) return;
    const frame = requestAnimationFrame(() => {
      applied.current = stamp;
      requested.current = parsed.location;
      inFlight.current = true;
      requestJump(pageForLocation(composed, parsed.location));
    });
    return () => cancelAnimationFrame(frame);
  }, [
    stamp,
    route.pathname,
    route.search,
    busy,
    pending,
    revision,
    locationRef,
    reading,
    engineReady,
    composed,
    requestJump,
    scrollToLocation,
  ]);

  const goTo = (target: string) => {
    void navigate(notebookUrl(locationForTarget(target), reading));
  };
  const recordReading = useCallback(
    (location: ReadingLocation) => {
      if (scrollingToTarget.current) return;
      locationRef.current = location;
      if (applied.current === stamp) publish(location);
    },
    [locationRef, stamp, publish],
  );

  return {
    snapshot,
    phase,
    receive,
    setPhase,
    turn,
    busy,
    goTo,
    recordReading,
    scrollToLocation,
    jumping: jumps.jumping,
    jumpResult: jumps.result,
    announcement,
    routeReady: landedStamp === stamp,
  };
}

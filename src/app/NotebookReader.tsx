import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useSearchParams, useNavigate } from 'react-router';
import { ReaderBook } from '../components/notebook/ReaderBook';
import { NotebookCover } from '../components/notebook/NotebookCover';
import { ReaderBookmarks } from '../components/notebook/ReaderBookmarks';
import { FullReadingView } from '../components/content/FullReadingView';
import { Lightbox } from '../components/content/Lightbox';
import { useElementWidth } from '../hooks/useElementWidth';
import { useReadingInputs } from '../hooks/useReadingInputs';
import { usePortfolioLayout } from '../hooks/usePortfolioLayout';
import { useReducedMotion } from '../hooks/useReducedMotion';
import {
  compositionGeometry,
  readerRailWidth,
} from '../lib/pagination/composePortfolio';
import { useNotebookNavigation } from '../hooks/useNotebookNavigation';
import {
  groupForLocation,
  readNotebookRoute,
} from '../lib/navigation/notebookRoutes';
import type {
  FlipAdapterHandle,
  ReadingLeaf,
} from '../lib/navigation/engineProtocol';
import type { ZoomImage } from '../lib/navigation/engineProtocol';
import type { ReadingLocation } from '../lib/pagination/analysisBlocks';
import './reader.css';

const emptyPages: ReadingLeaf[] = [];
export function NotebookReader() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const route = useLocation();
  const destination = readNotebookRoute(route.pathname, route.search)!;
  const surface = useRef<HTMLElement>(null);
  const adapter = useRef<FlipAdapterHandle>(null);
  const explicitReading = params.get('view') === 'reading';
  const position = useRef<ReadingLocation>(destination.location);
  const [zoom, setZoom] = useState<ZoomImage | null>(null);
  const openedFromCover = !!route.state?.openedFromCover;
  const animateCover = route.state?.animateCover !== false;
  const [coverTransition, setCoverTransition] = useState(
    openedFromCover && animateCover,
  );
  const direct =
    route.pathname !== '/notebook' || params.has('at') || explicitReading;
  const entering = useRef(!direct);
  const [opened, setOpened] = useState(direct);
  const width = useElementWidth(surface, 150);
  const inputs = useReadingInputs();
  const [error, setError] = useState('');
  const [readyRevision, setReadyRevision] = useState('');
  const reducedMotion = useReducedMotion();
  const geometryKey = JSON.stringify(compositionGeometry(width, true));
  const geometry = useMemo(() => {
    const base = JSON.parse(geometryKey) as ReturnType<
      typeof compositionGeometry
    >;
    const scale = inputs.scale;
    return {
      ...base,
      fontSize: base.fontSize * scale,
      lineHeight: base.lineHeight * scale,
    };
  }, [geometryKey, inputs.scale]);
  const layout = usePortfolioLayout(
    geometry,
    inputs.revision,
    width > 0 && !explicitReading && !error,
    position,
  );
  const composed = layout?.value;
  const pages = composed?.pages ?? emptyPages;
  const revision = `${layout?.id ?? 'loading'}-${reducedMotion}`;
  const failure = useCallback((cause: unknown) => setError(String(cause)), []);
  const failed = error || layout?.error;
  const reading = explicitReading || !!failed;
  const navigation = useNotebookNavigation({
    adapter,
    pages,
    composed,
    revision,
    locationRef: position,
    reducedMotion,
    onError: failure,
    engineReady: readyRevision === revision,
    reading,
  });
  const ready =
    !!composed &&
    readyRevision === revision &&
    !navigation.busy &&
    navigation.routeReady;
  const current =
    navigation.snapshot?.revision === revision
      ? navigation.snapshot.index
      : (layout?.startIndex ?? 1);
  const startIndex = layout?.startIndex ?? 1;
  const endIndex = pages.length - 1;
  const atEnd =
    ready &&
    !reading &&
    (navigation.snapshot?.revision === revision
      ? (navigation.snapshot?.visible?.includes(endIndex) ?? false)
      : false);
  const selectedLocation = groupForLocation(destination.location);
  const destinationsReady = !!composed && readyRevision === revision;
  const [turnHintDone, setTurnHintDone] = useState(false);
  const [bookmarkHintDone, setBookmarkHintDone] = useState(false);
  const readyRef = useRef(false);
  const firstIndex = useRef<number | null>(null);
  useEffect(() => {
    readyRef.current = ready;
  }, [ready]);
  useEffect(() => {
    if (!ready) return;
    if (firstIndex.current === null) {
      firstIndex.current = current;
      return;
    }
    if (current !== firstIndex.current) setTurnHintDone(true);
  }, [ready, current]);
  const goToDestination = (id: string) => {
    setBookmarkHintDone(true);
    navigation.goTo(id);
  };
  const selectedSection =
    composed?.pages[current]?.sectionId ??
    selectedLocation?.sectionId ??
    'student-profile';
  useEffect(() => {
    if (!coverTransition || !ready) return;
    const timer = window.setTimeout(() => setCoverTransition(false), 480);
    return () => window.clearTimeout(timer);
  }, [coverTransition, ready]);
  return (
    <main
      ref={surface}
      id="main-content"
      className="notebook-reader"
      tabIndex={-1}
      data-ready={ready && !reading}
      data-from-cover={openedFromCover || undefined}
      data-cover-transition={coverTransition || undefined}
      data-layout-revision={revision}
      data-destination={destination.location.anchor}
      data-failure={failed || undefined}
      data-jumping={navigation.jumping}
      data-jump-target={navigation.jumpResult?.target}
      data-burst-turns={navigation.jumpResult?.turns}
      data-burst-duration={Math.round(navigation.jumpResult?.duration ?? 0)}
    >
      {coverTransition && <NotebookCover transition opening={ready} />}
      <h1>My Literary Journey</h1>
      <p className="reader-subtitle">A Great Books Digital Portfolio</p>
      {failed && (
        <p role="alert">
          The page-turning notebook could not open. The complete writing is
          available below.
        </p>
      )}
      {destination.recovered && (
        <p role="status">
          That reading location could not be found. This section is open at the
          beginning.
        </p>
      )}
      {!reading && (
        <ReaderBook
          onNavigate={(href) => void navigate(href)}
          adapterRef={adapter}
          available={!!composed}
          railWidth={readerRailWidth(width)}
          ready={ready}
          destinationsReady={destinationsReady}
          current={current}
          selected={selectedSection}
          turnHint={ready && !turnHintDone}
          bookmarkHint={destinationsReady && !bookmarkHintDone}
          onDestination={goToDestination}
          onPrevious={() => {
            setTurnHintDone(true);
            void navigation.turn(
              Math.max(1, current - (geometry.spread ? 2 : 1)),
            );
          }}
          onNext={() => {
            setTurnHintDone(true);
            void navigation.turn(
              Math.min(pages.length - 1, current + (geometry.spread ? 2 : 1)),
            );
          }}
          configuration={{
            pages,
            revision,
            geometry,
            reducedMotion,
            startIndex: !opened && !reducedMotion ? 0 : startIndex,
          }}
          onReady={(snapshot) => {
            navigation.receive(snapshot, false);
            if (entering.current && !reducedMotion) {
              entering.current = false;
              setOpened(true);
              void navigation
                .turn(startIndex, position.current)
                .then(() => setReadyRevision(revision));
            } else {
              entering.current = false;
              setOpened(true);
              setReadyRevision(revision);
            }
          }}
          onPosition={navigation.receive}
          onState={(state) => {
            if (
              readyRef.current &&
              (state === 'user_fold' || state === 'fold_corner')
            )
              setTurnHintDone(true);
            navigation.setPhase(state);
          }}
          onZoom={setZoom}
          onError={failure}
        />
      )}
      {reading && (
        <div className="reader-reading-bookmarks">
          <ReaderBookmarks
            selected={selectedLocation?.sectionId ?? 'student-profile'}
            disabled={false}
            compact={false}
            onSelect={navigation.goTo}
          />
        </div>
      )}
      {atEnd && (
        <div className="reader-end-alert" role="status">
          <span className="reader-end-alert-tape" aria-hidden="true" />
          <p>
            You have reached the end of the notebook. It stays open, because
            there is still more to learn.
          </p>
        </div>
      )}
      <p
        className="reader-announcement"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {navigation.announcement}
      </p>
      <FullReadingView
        active={reading}
        onLocation={navigation.recordReading}
        onZoom={setZoom}
      />
      <Lightbox image={zoom} onClose={() => setZoom(null)} />
    </main>
  );
}

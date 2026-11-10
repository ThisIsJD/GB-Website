import { useCallback, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';
import { FlipAdapter } from '../components/notebook/FlipAdapter';
import { BookmarkRail } from '../components/notebook/BookmarkRail';
import { MarkdownContent } from '../components/content/MarkdownContent';
import { SketchButton } from '../components/ui/SketchButton';
import { useElementWidth } from '../hooks/useElementWidth';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { pageGeometry } from '../lib/pagination/geometry';
import type { FlipAdapterHandle } from '../lib/navigation/engineProtocol';
import { samplePages } from './samplePages';
import { bookmarkDestinations } from './bookmarkDestinations';
import { usePrototypeJumps } from './usePrototypeJumps';
import { PrototypeControls } from './PrototypeControls';
import fullAnalysis from './fixtures/odyssey.md?raw';
import './prototype.css';

export function EnginePrototype() {
  const surface = useRef<HTMLElement>(null);
  const adapter = useRef<FlipAdapterHandle>(null);
  const width = useElementWidth(surface);
  const reducedMotion = useReducedMotion();
  const [edition, setEdition] = useState(0);
  const [fewer, setFewer] = useState(false);
  const [mountVersion, setMountVersion] = useState(0);
  const [reading, setReading] = useState(false);
  const [error, setError] = useState('');
  const [readyRevision, setReadyRevision] = useState('');
  const [state, setState] = useState('read');
  const [ordinaryPending, setOrdinaryPending] = useState(false);
  const wide = width >= 900;
  const geometry = useMemo(
    () => pageGeometry(width - (wide ? 144 : 0)),
    [width, wide],
  );
  const pages = useMemo(() => samplePages(edition, fewer), [edition, fewer]);
  const destinations = useMemo(() => bookmarkDestinations(pages), [pages]);
  const revision = [
    edition,
    fewer,
    geometry.width,
    geometry.spread,
    mountVersion,
    reducedMotion,
  ].join('-');
  const failure = useCallback((cause: unknown) => {
    if (cause instanceof DOMException && cause.name === 'AbortError') return;
    setError(String(cause));
    setReading(true);
  }, []);
  const jumps = usePrototypeJumps(
    adapter,
    revision,
    reducedMotion,
    destinations,
    failure,
  );
  const current = jumps.position?.index ?? 0;
  const configuration = {
    pages,
    geometry,
    revision,
    reducedMotion,
    startIndex: Math.min(current, pages.length - 1),
  };
  const ready = readyRevision === revision;
  const busy = state !== 'read' || jumps.jumping || ordinaryPending;
  const reveal =
    new URLSearchParams(location.search).get('reveal') === 'slide'
      ? 'slide'
      : 'transparency';
  const bookWidth = geometry.width * (geometry.spread ? 2 : 1);

  async function turn(index: number, focus = false) {
    setOrdinaryPending(true);
    try {
      const result = await adapter.current?.turn(index, {
        animate: !reducedMotion,
        focus,
      });
      if (result) jumps.receivePosition(result);
    } catch (cause) {
      failure(cause);
    } finally {
      setOrdinaryPending(false);
    }
  }

  return (
    <main
      ref={surface}
      id="main-content"
      className="book-prototype"
      tabIndex={-1}
      data-error={error || undefined}
      data-jumping={jumps.jumping}
      data-burst-turns={jumps.result?.turns ?? ''}
      data-burst-duration={jumps.result?.duration ?? ''}
      data-jump-target={jumps.result?.target ?? ''}
    >
      <h1>Notes from my Great Books journey</h1>
      <div className="book-toolbar">
        <Link to="/prototype">Back to the reading page</Link>
        <Link to="/prototype/analysis">Read a complete analysis</Link>
        <SketchButton
          onClick={() => {
            if (reading) setMountVersion((value) => value + 1);
            setReading((value) => !value);
          }}
        >
          {reading ? 'Back to notebook' : 'Read without page turns'}
        </SketchButton>
      </div>
      {error && (
        <p role="alert">
          Page turns are unavailable. The complete writing is available below.
        </p>
      )}
      {reading ? (
        <article className="sample-leaf full-reading">
          <h2>The Odyssey</h2>
          <MarkdownContent>{fullAnalysis}</MarkdownContent>
        </article>
      ) : (
        <>
          <div className="engine-surface">
            {width > 0 && (
              <div
                className="book-assembly"
                data-wide={wide}
                style={{
                  width: bookWidth + (wide ? 144 : 0),
                  gridTemplateColumns: wide
                    ? `${bookWidth}px 144px`
                    : 'minmax(0, 1fr)',
                }}
              >
                <BookmarkRail
                  destinations={destinations}
                  selected={jumps.selected}
                  ready={ready}
                  wide={wide}
                  reveal={reveal}
                  onSelect={jumps.select}
                  onPeek={jumps.peek}
                />
                <section
                  className="book-window"
                  style={{ width: bookWidth }}
                  data-ready={ready}
                  data-engine-state={state}
                  data-page-index={current}
                  data-mode={jumps.position?.mode ?? ''}
                  data-visible={jumps.position?.visible.join(',') ?? ''}
                  data-revision={revision}
                >
                  <FlipAdapter
                    ref={adapter}
                    configuration={configuration}
                    onReady={(snapshot) => {
                      setReadyRevision(snapshot.revision);
                      jumps.ready(snapshot);
                      setState('read');
                    }}
                    onPosition={jumps.receivePosition}
                    onState={setState}
                    onError={failure}
                  />
                </section>
              </div>
            )}
          </div>
          <p className="book-position" aria-live="polite">
            {ready
              ? `Page ${(jumps.displayPosition?.index ?? 0) + 1} of ${pages.length}`
              : 'Arranging the pages...'}
          </p>
          <PrototypeControls
            pages={pages}
            current={current}
            spread={geometry.spread}
            disabled={!ready || busy}
            fewer={fewer}
            turn={(index, focus) => void turn(index, focus)}
            refresh={() => setEdition((value) => value + 1)}
            toggleFewer={() => setFewer((value) => !value)}
          />
        </>
      )}
    </main>
  );
}

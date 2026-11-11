import type { CSSProperties, RefObject } from 'react';
import type {
  EngineConfiguration,
  EngineSnapshot,
  FlipAdapterHandle,
  ZoomImage,
} from '../../lib/navigation/engineProtocol';
import { NotebookShell } from './NotebookShell';
import { EngineBoundary } from './EngineBoundary';
import { FlipAdapter } from './FlipAdapter';
import { ReaderBookmarks } from './ReaderBookmarks';
import { ReaderPageControls } from './ReaderPageControls';

export function ReaderBook({
  onNavigate,
  configuration,
  available,
  adapterRef,
  railWidth,
  ready,
  destinationsReady,
  selected,
  current,
  turnHint,
  bookmarkHint,
  onDestination,
  onPrevious,
  onNext,
  onReady,
  onPosition,
  onState,
  onZoom,
  onSound,
  onBookmarkHover,
  onBookmarkInteract,
  onError,
}: {
  onNavigate: (href: string) => void;
  configuration: EngineConfiguration;
  available: boolean;
  adapterRef: RefObject<FlipAdapterHandle | null>;
  railWidth: number;
  ready: boolean;
  destinationsReady: boolean;
  selected: string;
  current: number;
  turnHint: boolean;
  bookmarkHint: boolean;
  onDestination: (id: string) => void;
  onPrevious: () => void;
  onNext: () => void;
  onReady: (snapshot: EngineSnapshot) => void;
  onPosition: (snapshot: EngineSnapshot) => void;
  onState: (state: string) => void;
  onZoom: (image: ZoomImage) => void;
  onSound: (kind: 'turn' | 'burst') => void;
  onBookmarkHover: () => void;
  onBookmarkInteract: () => void;
  onError: (cause: unknown) => void;
}) {
  const { geometry } = configuration;
  const bookWidth = geometry.width * (geometry.spread ? 2 : 1);
  return (
    <div className="reader-engine">
      <div
        className="reader-book-assembly"
        data-spread={geometry.spread}
        data-centered={railWidth !== 64}
        data-turning={!ready}
        style={
          {
            width: bookWidth + railWidth * (railWidth === 64 ? 1 : 2),
            '--reader-rail': `${railWidth}px`,
          } as CSSProperties
        }
      >
        <div className="reader-shell" style={{ width: bookWidth }}>
          <NotebookShell>
            {!available ? (
              <div className="reader-arranging" role="status">
                Arranging the pages…
              </div>
            ) : (
              <EngineBoundary key={configuration.revision} onError={onError}>
                <FlipAdapter
                  onNavigate={onNavigate}
                  ref={adapterRef}
                  configuration={configuration}
                  onReady={onReady}
                  onPosition={onPosition}
                  onState={onState}
                  onZoom={onZoom}
                  onSound={onSound}
                  onError={onError}
                />
              </EngineBoundary>
            )}
            {turnHint && available && (
              <div className="reader-page-hint" aria-hidden="true">
                <span>Click a page or drag a corner to turn</span>
              </div>
            )}
          </NotebookShell>
          <ReaderPageControls
            disabled={!ready}
            current={current}
            total={configuration.pages.length}
            hint={turnHint}
            onPrevious={onPrevious}
            onNext={onNext}
          />
        </div>
        <ReaderBookmarks
          selected={selected}
          disabled={!destinationsReady}
          compact={railWidth === 64}
          hint={bookmarkHint}
          onSelect={onDestination}
          onHover={onBookmarkHover}
          onInteract={onBookmarkInteract}
        />
      </div>
      <p className="reader-gesture-hint">
        Click a page to turn it. Hold and drag a bottom corner to curl it. Click
        a photo to zoom in. The side arrows or arrow keys also move between
        pages.
      </p>
    </div>
  );
}

import { useCallback, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';
import { FlipAdapter } from '../components/notebook/FlipAdapter';
import { MarkdownContent } from '../components/content/MarkdownContent';
import { SketchButton } from '../components/ui/SketchButton';
import { useElementWidth } from '../hooks/useElementWidth';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useMeasuredAnalysis } from '../hooks/useMeasuredAnalysis';
import type {
  FlipAdapterHandle,
  ReadingLeaf,
} from '../lib/navigation/engineProtocol';
import {
  analysisBlocks,
  type ReadingLocation,
} from '../lib/pagination/analysisBlocks';
import { pageGeometry } from '../lib/pagination/geometry';
import { leafForLocation } from '../lib/pagination/paginateAnalysis';
import { analysisSamples, readingExercise } from './analysisSamples';
import { AnalysisOptions } from './AnalysisOptions';
import { AnalysisControls } from './AnalysisControls';
import { useAnalysisNavigation } from './useAnalysisNavigation';
import './prototype.css';

const emptyPages: ReadingLeaf[] = [];

export function AnalysisPrototype() {
  const surface = useRef<HTMLElement>(null);
  const adapter = useRef<FlipAdapterHandle>(null);
  const locationRef = useRef<ReadingLocation>({ anchor: 'answer-1' });
  const width = useElementWidth(surface, 120);
  const reducedMotion = useReducedMotion();
  const [work, setWork] = useState(analysisSamples[0]!.id);
  const [exercise, setExercise] = useState(false);
  const [large, setLarge] = useState(false);
  const [reading, setReading] = useState(false);
  const [mount, setMount] = useState(0);
  const [error, setError] = useState('');
  const [readyRevision, setReadyRevision] = useState('');
  const sample = analysisSamples.find((item) => item.id === work)!;
  const source = sample.markdown + (exercise ? readingExercise : '');
  const blocks = useMemo(() => analysisBlocks(source), [source]);
  const availableWidth = Math.min(width, 880);
  const geometry = useMemo(() => {
    const base = pageGeometry(availableWidth);
    return large ? { ...base, fontSize: 24, lineHeight: 40 } : base;
  }, [availableWidth, large]);
  const measured = useMeasuredAnalysis(
    source,
    sample.title,
    geometry,
    width > 0,
    locationRef,
  );
  const pages = measured?.pages ?? emptyPages;
  const revision = [measured?.id ?? 'loading', reducedMotion, mount].join('-');
  const failure = useCallback((cause: unknown) => setError(String(cause)), []);
  const navigation = useAnalysisNavigation(
    adapter,
    pages,
    revision,
    locationRef,
    reducedMotion,
    failure,
  );
  const current =
    navigation.snapshot?.revision === revision
      ? navigation.snapshot.index
      : (measured?.startIndex ?? 1);
  const ready = readyRevision === revision;
  const failed = error || measured?.error;
  const fullReading = reading || !!failed;
  const configuration = {
    pages,
    revision,
    geometry,
    reducedMotion,
    startIndex: current,
  };

  return (
    <main
      ref={surface}
      id="main-content"
      className="book-prototype analysis-prototype"
      tabIndex={-1}
      data-measuring={!measured}
      data-large={large}
      data-error={failed || undefined}
    >
      <h1>A closer reading</h1>
      <div className="book-toolbar">
        <Link to="/prototype/book">Back to notebook trials</Link>
        {!failed && (
          <SketchButton
            onClick={() => {
              if (reading) {
                setMount((value) => value + 1);
                setError('');
              }
              setReading((value) => !value);
            }}
          >
            {reading ? 'Back to notebook' : 'Read without page turns'}
          </SketchButton>
        )}
      </div>
      <AnalysisOptions
        work={work}
        large={large}
        exercise={exercise}
        onWork={(value) => {
          locationRef.current = { anchor: 'answer-1' };
          setWork(value);
        }}
        onLarge={setLarge}
        onExercise={setExercise}
      />
      {exercise && (
        <p className="analysis-hint">
          Answer 7 is a layout exercise with a long paragraph and an example
          source address. The original six answers are unchanged.
        </p>
      )}
      {failed && (
        <p role="alert">
          The notebook could not arrange these pages. The complete writing is
          available below.
        </p>
      )}
      {fullReading ? (
        <article className="sample-leaf full-reading">
          <h2>{sample.title}</h2>
          <MarkdownContent>{source}</MarkdownContent>
        </article>
      ) : (
        <>
          {!measured ? (
            <p role="status">Arranging the writing into readable pages...</p>
          ) : (
            <>
              <section
                className="book-window measured-window"
                style={{ width: geometry.width * (geometry.spread ? 2 : 1) }}
                data-ready={ready}
                data-engine-state={navigation.phase}
                data-page-index={current}
                data-mode={navigation.snapshot?.mode ?? ''}
                data-visible={navigation.snapshot?.visible.join(',') ?? ''}
                data-revision={revision}
                data-page-count={pages.length}
              >
                <FlipAdapter
                  ref={adapter}
                  configuration={configuration}
                  onReady={(snapshot) => {
                    setReadyRevision(snapshot.revision);
                    navigation.receive(snapshot);
                    navigation.setPhase('read');
                  }}
                  onPosition={navigation.receive}
                  onState={navigation.setPhase}
                  onError={failure}
                />
              </section>
              <p className="book-position" aria-live="polite">
                {ready
                  ? `Page ${current + 1} of ${pages.length}`
                  : 'Opening the notebook...'}
              </p>
              <AnalysisControls
                pages={pages}
                blocks={blocks}
                current={current}
                spread={geometry.spread}
                disabled={!ready || navigation.busy}
                onTurn={(index) => void navigation.turn(index)}
                onAnswer={(anchor) =>
                  void navigation.turn(leafForLocation(pages, { anchor }), {
                    anchor,
                  })
                }
              />
            </>
          )}
        </>
      )}
    </main>
  );
}

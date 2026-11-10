import { useEffect, useMemo, useRef, useState } from 'react';
import { NotebookShell } from '../components/notebook/NotebookShell';
import { FlipAdapter } from '../components/notebook/FlipAdapter';
import { PageLeaf } from '../components/notebook/PageLeaf';
import { useElementWidth } from '../hooks/useElementWidth';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { portfolio } from '../lib/content/portfolio';
import {
  composePortfolio,
  compositionGeometry,
} from '../lib/pagination/composePortfolio';
import { measureContent } from '../lib/pagination/measureContent';
import { geometryVariables } from '../lib/pagination/geometry';
import type { FlipAdapterHandle } from '../lib/navigation/engineProtocol';
import './composition.css';

type Composition = Awaited<ReturnType<typeof composePortfolio>>;
export function ComposedPortfolio() {
  const surface = useRef<HTMLElement>(null);
  const adapter = useRef<FlipAdapterHandle>(null);
  const width = useElementWidth(surface, 120);
  const geometry = useMemo(() => compositionGeometry(width), [width]);
  const key = JSON.stringify(geometry);
  const reducedMotion = useReducedMotion();
  const [result, setResult] = useState<{ key: string; value: Composition }>();
  const [error, setError] = useState('');
  const [ready, setReady] = useState('');
  const [index, setIndex] = useState(1);
  const [flat, setFlat] = useState(false);
  useEffect(() => {
    if (!width) return;
    const controller = new AbortController();
    void composePortfolio(portfolio, (group) =>
      measureContent(group.blocks, group.title, geometry, controller.signal, {
        images: portfolio.images,
        opening: group.opening,
        material: 'ruled',
      }),
    )
      .then((value) => {
        if (!controller.signal.aborted) setResult({ key, value });
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) setError(String(cause));
      });
    return () => controller.abort();
  }, [geometry, key, width]);
  const composed = result?.key === key ? result.value : undefined;
  return (
    <main
      ref={surface}
      id="main-content"
      className="composition-review"
      data-ready={!!composed}
      data-engine-ready={ready === key}
    >
      <h1>The complete notebook layout</h1>
      <p>Openings and continued writing from the same original blocks.</p>
      {error && <p role="alert">{error}</p>}
      {!composed ? (
        <p role="status">Arranging the notebook...</p>
      ) : (
        <>
          <label>
            Go to an opening
            <select
              onChange={(event) => {
                void adapter.current?.turn(Number(event.target.value), {
                  animate: false,
                  focus: true,
                });
              }}
              disabled={flat || ready !== key}
            >
              {composed.openings.map((opening) => (
                <option key={opening.documentId} value={opening.leafIndex}>
                  {composed.pages[opening.leafIndex]!.title}
                </option>
              ))}
            </select>
          </label>
          <button onClick={() => setFlat((value) => !value)}>
            {flat ? 'Show page turns' : 'Inspect all leaves'}
          </button>
          <div
            data-page-maps={JSON.stringify(composed.maps)}
            data-opening-records={JSON.stringify(composed.openings)}
          >
            {flat ? (
              <div
                className="composition-flat"
                style={geometryVariables(geometry)}
              >
                {composed.pages.map((leaf, i) => (
                  <div
                    className="composed-leaf"
                    data-kind={leaf.kind}
                    key={leaf.id}
                    style={{ width: geometry.width, height: geometry.height }}
                  >
                    <PageLeaf
                      leaf={leaf}
                      number={i + 1}
                      total={composed.pages.length}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div
                className="composition-shell"
                style={{ width: geometry.width * (geometry.spread ? 2 : 1) }}
              >
                <NotebookShell>
                  <FlipAdapter
                    ref={adapter}
                    configuration={{
                      pages: composed.pages,
                      revision: key,
                      geometry,
                      reducedMotion,
                      startIndex: 1,
                    }}
                    onReady={(snapshot) => {
                      setReady(key);
                      setIndex(snapshot.index);
                    }}
                    onPosition={(snapshot) => setIndex(snapshot.index)}
                    onState={() => {}}
                    onError={setError}
                  />
                </NotebookShell>
              </div>
            )}
          </div>
          <p role="status">
            Page {index + 1} of {composed.pages.length}
          </p>
        </>
      )}
    </main>
  );
}

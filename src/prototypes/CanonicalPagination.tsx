import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';
import { PageLeaf } from '../components/notebook/PageLeaf';
import { MarkdownContent } from '../components/content/MarkdownContent';
import { useElementWidth } from '../hooks/useElementWidth';
import { portfolio } from '../lib/content/portfolio';
import { blocksMarkdown } from '../lib/content/parseMarkdown';
import { geometryVariables, pageGeometry } from '../lib/pagination/geometry';
import { paginationSample } from './contentPaginationSamples';
import { useContentPagination } from './useContentPagination';
import './canonical-pagination.css';

export function CanonicalPagination() {
  const surface = useRef<HTMLElement>(null);
  const width = useElementWidth(surface, 120);
  const [work, setWork] = useState(portfolio.works[0]!.id as string);
  const [stress, setStress] = useState(false);
  const [large, setLarge] = useState(false);
  const sample = useMemo(() => paginationSample(work, stress), [work, stress]);
  const geometry = useMemo(() => {
    const base = pageGeometry(Math.min(width, 880));
    return large ? { ...base, fontSize: 24, lineHeight: 40 } : base;
  }, [width, large]);
  const result = useContentPagination(
    sample.blocks,
    sample.title,
    geometry,
    width > 0,
  );
  return (
    <main
      ref={surface}
      id="main-content"
      className="canonical-pagination"
      tabIndex={-1}
      data-ready={!!result}
      data-error={result?.error}
    >
      <h1>Trying the page layout</h1>
      <p>Complete analyses and their sources, arranged into readable leaves.</p>
      <Link to="/prototype/analysis">Back to the page-turn trial</Link>
      <div className="canonical-options">
        <label>
          Choose a work
          <select
            value={work}
            onChange={(event) => setWork(event.target.value)}
          >
            {portfolio.works.map(({ id, title }) => (
              <option key={id} value={id}>
                {title}
              </option>
            ))}
          </select>
        </label>
        <label>
          <input
            type="checkbox"
            checked={stress}
            onChange={(event) => setStress(event.target.checked)}
          />{' '}
          Include a layout exercise
        </label>
        <label>
          <input
            type="checkbox"
            checked={large}
            onChange={(event) => setLarge(event.target.checked)}
          />{' '}
          Larger handwriting
        </label>
      </div>
      {stress && (
        <p>
          The added exercise tests long paragraphs, lists, quotations, a long
          address, and JD’s photograph. The original six answers are unchanged.
        </p>
      )}
      <details className="canonical-original">
        <summary>Read the complete writing</summary>
        <article className="sample-leaf">
          <h2>{sample.title}</h2>
          <MarkdownContent images={portfolio.images}>
            {blocksMarkdown(sample.blocks)}
          </MarkdownContent>
        </article>
      </details>
      {result?.error ? (
        <p role="alert">
          These pages could not be arranged. Read the complete writing above.
        </p>
      ) : !result ? (
        <p role="status">Arranging the pages...</p>
      ) : (
        <>
          <p role="status">{result.leaves.length} writing leaves</p>
          <div
            className="canonical-leaves"
            style={{
              ...geometryVariables(geometry),
              gridTemplateColumns: `repeat(${geometry.spread ? 2 : 1}, ${geometry.width}px)`,
            }}
          >
            {result.leaves.map((leaf, index) => (
              <div
                className="canonical-leaf"
                key={leaf.id}
                style={{ width: geometry.width, height: geometry.height }}
              >
                <PageLeaf
                  leaf={leaf}
                  number={index + 1}
                  total={result.leaves.length}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}

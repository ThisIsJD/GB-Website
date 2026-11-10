import { forwardRef } from 'react';
import { MarkdownContent } from '../content/MarkdownContent';
import { Polaroid } from '../content/Polaroid';
import type { ReadingLeaf } from '../../lib/navigation/engineProtocol';

interface PageLeafProps {
  leaf: ReadingLeaf;
  number: number;
  total: number;
  register?: (id: string, element: HTMLDivElement | null) => void;
}

export const PageLeaf = forwardRef<HTMLDivElement, PageLeafProps>(
  function PageLeaf({ leaf, number, total, register }, ref) {
    return (
      <div
        className={`page-leaf ${leaf.hard ? 'page-leaf-cover' : ''}`}
        data-density={leaf.hard ? 'hard' : 'soft'}
        data-leaf-id={leaf.id}
        data-work-id={leaf.workId}
        data-layout-key={leaf.opening?.layoutKey}
        data-cover={leaf.hard ? leaf.anchor : undefined}
        data-ending={leaf.anchor === 'the-end' || undefined}
        data-paper={leaf.material}
        data-source-ranges={
          leaf.ranges ? JSON.stringify(leaf.ranges) : undefined
        }
        ref={(element) => {
          if (typeof ref === 'function') ref(element);
          else if (ref) ref.current = element;
          register?.(leaf.id, element);
        }}
      >
        <article className="leaf-inner" aria-label={leaf.title}>
          <h2 className="leaf-header" tabIndex={-1}>
            {leaf.title}
          </h2>
          {leaf.opening &&
            (leaf.opening.label !== leaf.title || leaf.opening.detail) && (
              <div className="leaf-opening">
                {leaf.opening.label !== leaf.title && (
                  <p>{leaf.opening.label}</p>
                )}
                {leaf.opening.detail && <p>{leaf.opening.detail}</p>}
              </div>
            )}
          {leaf.opening?.portrait && (
            <div className="leaf-portrait">
              <Polaroid {...leaf.opening.portrait} />
            </div>
          )}
          <div className="leaf-body">
            <MarkdownContent embedded images={leaf.images}>
              {leaf.markdown}
            </MarkdownContent>
          </div>
          <footer
            className="leaf-footer"
            aria-label={`Page ${number} of ${total}`}
          >
            {number}
          </footer>
        </article>
      </div>
    );
  },
);

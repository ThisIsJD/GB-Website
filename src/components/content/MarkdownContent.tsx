import Markdown from 'react-markdown';
import { createElement } from 'react';
import type { ContentImage } from '../../lib/content/types';

type MarkdownContentProps = {
  children: string;
  embedded?: boolean;
  images?: readonly ContentImage[];
  headingOffset?: number;
};

const noteLabel = /^(Margin note|Closing note)\b/u;

/** A margin or closing note is a paragraph that opens with its bold label. */
function noteText(node: unknown): string {
  const first = (node as { children?: { tagName?: string; children?: { value?: string }[] }[] })
    ?.children?.[0];
  if (first?.tagName !== 'strong') return '';
  return first.children?.[0]?.value ?? '';
}

export function MarkdownContent({
  children,
  embedded = false,
  images = [],
  headingOffset = 0,
}: MarkdownContentProps) {
  return (
    <div className="reading-content">
      <Markdown
        skipHtml
        components={{
          h2: ({ children }) =>
            createElement(`h${Math.min(6, 2 + headingOffset)}`, null, children),
          p: ({ node, children }) =>
            noteLabel.test(noteText(node)) ? (
              <p className="note-sticky">
                <span className="note-tape" aria-hidden="true" />
                {children}
              </p>
            ) : (
              <p>{children}</p>
            ),
          img: ({ src, alt, title }) => {
            const image = images.find((image) => image.src === src);
            return (
              <img
                src={src}
                alt={alt}
                title={title}
                width={image?.width}
                height={image?.height}
              />
            );
          },
          ...(embedded
            ? {
                a: ({ href, title, children }) => (
                  <a
                    href={href}
                    title={title}
                    target={
                      href?.startsWith('/') || href?.startsWith('#')
                        ? '_parent'
                        : '_blank'
                    }
                    rel="noopener noreferrer"
                  >
                    {children}
                  </a>
                ),
              }
            : {}),
        }}
      >
        {children}
      </Markdown>
    </div>
  );
}

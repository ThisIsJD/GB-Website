import { MarkdownContent } from './MarkdownContent';
import { blocksMarkdown } from '../../lib/content/parseMarkdown';
import type { ContentBlock, ContentImage } from '../../lib/content/types';

interface ContentBlocksProps {
  blocks: readonly ContentBlock[];
  embedded?: boolean;
  images?: readonly ContentImage[];
  headingOffset?: number;
}

/** Both leaf composition and uninterrupted reading consume this exact block order. */
export function ContentBlocks({
  blocks,
  embedded = false,
  images,
  headingOffset,
}: ContentBlocksProps) {
  return (
    <div className="content-blocks">
      {blocks.map((block) => (
        <div
          key={block.id}
          id={block.id}
          data-block-id={block.id}
          data-anchor={block.anchor}
        >
          <MarkdownContent
            embedded={embedded}
            images={images}
            headingOffset={headingOffset}
          >
            {blocksMarkdown([block])}
          </MarkdownContent>
        </div>
      ))}
    </div>
  );
}

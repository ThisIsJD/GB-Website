import type { AnalysisBlock } from '../lib/pagination/analysisBlocks';
import type { ReadingLeaf } from '../lib/navigation/engineProtocol';
import { SketchButton } from '../components/ui/SketchButton';

interface AnalysisControlsProps {
  pages: ReadingLeaf[];
  blocks: AnalysisBlock[];
  current: number;
  spread: boolean;
  disabled: boolean;
  onTurn: (index: number) => void;
  onAnswer: (anchor: string) => void;
}
export function AnalysisControls({
  pages,
  blocks,
  current,
  spread,
  disabled,
  onTurn,
  onAnswer,
}: AnalysisControlsProps) {
  const headings = blocks.filter((block) => block.node.type === 'heading');
  const next = current === 0 ? 1 : current + (spread ? 2 : 1);
  const previous = current <= (spread ? 2 : 1) ? 0 : current - (spread ? 2 : 1);
  return (
    <nav className="analysis-controls" aria-label="Analysis pages">
      <div className="book-toolbar">
        <SketchButton
          disabled={disabled || current === 0}
          onClick={() => onTurn(previous)}
        >
          Previous page
        </SketchButton>
        <SketchButton
          disabled={disabled || next >= pages.length}
          onClick={() => onTurn(next)}
        >
          Next page
        </SketchButton>
      </div>
      <label>
        Go to answer
        <select
          disabled={disabled}
          defaultValue=""
          onChange={(event) => {
            if (event.target.value) onAnswer(event.target.value);
            event.target.value = '';
          }}
        >
          <option value="">Choose an answer</option>
          {headings.map((block) => (
            <option key={block.id} value={block.anchor}>
              {block.text}
            </option>
          ))}
        </select>
      </label>
      <label>
        Go to page
        <select
          disabled={disabled}
          value={current}
          onChange={(event) => onTurn(Number(event.target.value))}
        >
          {pages.map((leaf, index) => (
            <option key={leaf.id} value={index}>
              Page {index + 1} of {pages.length}
            </option>
          ))}
        </select>
      </label>
    </nav>
  );
}

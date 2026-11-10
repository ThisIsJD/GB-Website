import { SketchButton } from '../components/ui/SketchButton';
import type { ReadingLeaf } from '../lib/navigation/engineProtocol';

interface ControlsProps {
  pages: ReadingLeaf[];
  current: number;
  spread: boolean;
  disabled: boolean;
  fewer: boolean;
  turn: (index: number, focus?: boolean) => void;
  refresh: () => void;
  toggleFewer: () => void;
}
export function PrototypeControls({
  pages,
  current,
  spread,
  disabled,
  fewer,
  turn,
  refresh,
  toggleFewer,
}: ControlsProps) {
  return (
    <>
      <div className="book-toolbar">
        <SketchButton
          disabled={disabled || current === 0}
          onClick={() =>
            turn(current === 1 ? 0 : Math.max(0, current - (spread ? 2 : 1)))
          }
        >
          Previous page
        </SketchButton>
        <SketchButton
          disabled={disabled || current >= pages.length - 1}
          onClick={() =>
            turn(
              current === 0
                ? 1
                : Math.min(pages.length - 1, current + (spread ? 2 : 1)),
            )
          }
        >
          Next page
        </SketchButton>
      </div>
      <details className="reading-options">
        <summary>Reading samples</summary>
        <label>
          Choose a reading page
          <select
            aria-label="Choose a reading page"
            value={current}
            disabled={disabled}
            onChange={(event) => turn(Number(event.target.value), true)}
          >
            {pages.map((leaf, index) => (
              <option key={leaf.id} value={index}>
                {index + 1}. {leaf.title}
              </option>
            ))}
          </select>
        </label>
        <SketchButton disabled={disabled} onClick={refresh}>
          Refresh reading sample
        </SketchButton>
        <SketchButton disabled={disabled} onClick={toggleFewer}>
          {fewer ? 'Use all notes' : 'Use fewer notes'}
        </SketchButton>
      </details>
    </>
  );
}

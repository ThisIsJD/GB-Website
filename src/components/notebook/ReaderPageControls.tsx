export function ReaderPageControls({
  disabled,
  current,
  total,
  hint,
  onPrevious,
  onNext,
}: {
  disabled: boolean;
  current: number;
  total: number;
  hint?: boolean;
  onPrevious: () => void;
  onNext: () => void;
}) {
  const canPrevious = !disabled && current > 1;
  const canNext = !disabled && current < total - 1;
  return (
    <nav className="reader-page-controls" aria-label="Page navigation">
      <button
        className="reader-corner-arrow reader-corner-previous"
        aria-label="Previous page"
        title="Previous page"
        disabled={!canPrevious}
        onClick={onPrevious}
      >
        <svg viewBox="0 0 32 32" aria-hidden="true">
          <path d="M27 25C25 14 17 12 6 15m8-9-9 9 9 8" />
        </svg>
        {hint && (
          <span className="reader-arrow-hint" aria-hidden="true">
            Click to turn left
          </span>
        )}
      </button>
      <span className="reader-page-count" role="status" aria-live="off">
        {disabled ? 'Turning pages…' : `Page ${current + 1} of ${total}`}
      </span>
      <button
        className="reader-corner-arrow reader-corner-next"
        aria-label="Next page"
        title="Next page"
        disabled={!canNext}
        onClick={onNext}
      >
        <svg viewBox="0 0 32 32" aria-hidden="true">
          <path d="M5 25C7 14 15 12 26 15m-8-9 9 9-9 8" />
        </svg>
        {hint && (
          <span className="reader-arrow-hint" aria-hidden="true">
            Click to turn right
          </span>
        )}
      </button>
    </nav>
  );
}

import type { ReactNode } from 'react';
import './notebook.css';

/**
 * Material frame with optional cover overlay for open/close transitions.
 *
 * When `opening` is true, a full-face cover clone is rendered on top and
 * plays the hinge-open animation — so the user sees the notebook cover
 * swing open to reveal pages. When `closing` is true the reverse animation
 * plays, and `onClosed` fires after it ends.
 */
export function NotebookShell({
  children,
  opening = false,
  closing = false,
  reading = false,
  onClosed,
}: {
  children: ReactNode;
  opening?: boolean;
  closing?: boolean;
  reading?: boolean;
  onClosed?: () => void;
}) {
  return (
    <div
      className={`notebook-shell${reading ? ' notebook-shell-reading' : ''}`}
    >
      {children}
      {(opening || closing) && (
        <div
          className={`entry-cover-motion${closing ? ' entry-cover-closing' : ''}`}
          aria-hidden="true"
          onAnimationEnd={() => {
            if (closing) onClosed?.();
          }}
        >
          <span className="entry-cover-label">JD</span>
          <svg
            className="entry-cover-drawing"
            viewBox="0 0 120 90"
            fill="none"
            aria-hidden="true"
          >
            <path d="M12 17 Q35 9 60 23 Q84 10 108 17 L106 72 Q83 65 60 79 Q37 65 14 72 Z M60 23 L60 79 M22 28 Q37 24 49 31 M22 40 Q37 36 49 43 M72 31 Q86 24 98 28 M72 43 Q86 36 98 40" />
          </svg>
          <span className="entry-cover-title">My Literary Journey</span>
          <span className="entry-cover-subtitle">
            A Great Books Digital Portfolio
          </span>
          <span className="entry-cover-sticker" aria-hidden="true">
            {'</>'}
          </span>
        </div>
      )}
    </div>
  );
}

/** Natural height is intentional until measured pagination is integrated. */
export function PaperLeaf({
  children,
  labelledBy,
}: {
  children: ReactNode;
  labelledBy: string;
}) {
  return (
    <section className="paper-leaf" aria-labelledby={labelledBy}>
      <div className="paper-writing">{children}</div>
    </section>
  );
}

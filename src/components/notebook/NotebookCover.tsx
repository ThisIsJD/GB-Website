import { Link, useNavigate } from 'react-router';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import './notebook.css';

type NotebookCoverProps = {
  missingDestination?: boolean;
  transition?: boolean;
  opening?: boolean;
  closing?: boolean;
};

export function NotebookCover({
  missingDestination = false,
  transition = false,
  opening = false,
  closing = false,
}: NotebookCoverProps) {
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();
  const open = () => {
    // Navigate immediately — the reader renders a cover overlay that hinges
    // open, so there is no flash between routes.
    void navigate('/profile', {
      state: { openedFromCover: true, animateCover: !reducedMotion },
    });
  };
  if (transition)
    return (
      <section
        className={`notebook-cover notebook-cover-transition ${
          opening
            ? 'cover-route-opening'
            : closing
              ? 'cover-route-closing'
              : ''
        }`}
        aria-hidden="true"
      >
        <span className="owner-label">JD</span>
        <svg
          className="book-drawing"
          viewBox="0 0 120 90"
          fill="none"
          aria-hidden="true"
        >
          <path d="M12 17 Q35 9 60 23 Q84 10 108 17 L106 72 Q83 65 60 79 Q37 65 14 72 Z M60 23 L60 79 M22 28 Q37 24 49 31 M22 40 Q37 36 49 43 M72 31 Q86 24 98 28 M72 43 Q86 36 98 40" />
        </svg>
        <h1>My Literary Journey</h1>
        <p className="cover-subtitle">A Great Books Digital Portfolio</p>
        <span className="code-sticker" aria-hidden="true">
          {'</>'}
        </span>
      </section>
    );
  return (
    <main id="main-content" className="notebook-stage" tabIndex={-1}>
      <section
        className="notebook-cover"
        aria-labelledby="notebook-title"
      >
        <button
          type="button"
          className="cover-open-hit"
          aria-label="Open the notebook cover"
          onClick={open}
        />
        <span className="owner-label">JD</span>
        <svg
          className="book-drawing"
          viewBox="0 0 120 90"
          fill="none"
          aria-hidden="true"
        >
          <path d="M12 17 Q35 9 60 23 Q84 10 108 17 L106 72 Q83 65 60 79 Q37 65 14 72 Z M60 23 L60 79 M22 28 Q37 24 49 31 M22 40 Q37 36 49 43 M72 31 Q86 24 98 28 M72 43 Q86 36 98 40" />
        </svg>
        <h1 id="notebook-title">My Literary Journey</h1>
        <p className="cover-subtitle">A Great Books Digital Portfolio</p>
        <span className="code-sticker" aria-hidden="true">
          {'</>'}
        </span>
        <div className="cover-open-tooltip" aria-hidden="true">
          Click the notebook to open
        </div>
      </section>
      <div className="cover-caption">
        {missingDestination ? (
          <>
            <p>This page is not in my notebook.</p>
            <Link to="/">Return to cover</Link>
            <Link to="/analyses">Open reading list</Link>
          </>
        ) : (
          <>
            <p>John Daniel P. Labing</p>
          </>
        )}
      </div>
    </main>
  );
}

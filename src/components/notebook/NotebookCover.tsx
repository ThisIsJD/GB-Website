import { Link } from 'react-router';

type NotebookCoverProps = { missingDestination?: boolean };

export function NotebookCover({ missingDestination = false }: NotebookCoverProps) {
  return (
    <main id="main-content" className="notebook-stage" tabIndex={-1}>
      <section className="notebook-cover" aria-labelledby="notebook-title">
        <span className="owner-label">JD</span>
        <svg className="book-drawing" viewBox="0 0 120 90" fill="none" aria-hidden="true">
          <path d="M12 17 Q35 9 60 23 Q84 10 108 17 L106 72 Q83 65 60 79 Q37 65 14 72 Z M60 23 L60 79 M22 28 Q37 24 49 31 M22 40 Q37 36 49 43 M72 31 Q86 24 98 28 M72 43 Q86 36 98 40" />
        </svg>
        <h1 id="notebook-title">My Literary Journey</h1>
        <p className="cover-subtitle">A Great Books Digital Portfolio</p>
        <span className="code-sticker" aria-hidden="true">{'</>'}</span>
      </section>
      <div className="cover-caption">
        {missingDestination ? (
          <>
            <p>This page is not in my notebook.</p>
            <Link to="/">Return to cover</Link>
          </>
        ) : (
          <p>John Daniel P. Labing</p>
        )}
      </div>
    </main>
  );
}

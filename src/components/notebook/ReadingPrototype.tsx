import { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router';
import profileSample from '../../prototypes/fixtures/profile.md?raw';
import { MarkdownContent } from '../content/MarkdownContent';
import { SketchButton } from '../ui/SketchButton';

export function ReadingPrototype() {
  const navigate = useNavigate();
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    heading.current?.focus();
  }, []);

  return (
    <main id="main-content" className="reading-stage" tabIndex={-1}>
      <article className="sample-leaf" aria-labelledby="reading-title">
        <h1 id="reading-title" ref={heading} tabIndex={-1}>
          Notes from my Great Books journey
        </h1>
        <MarkdownContent>{profileSample}</MarkdownContent>
        <p>
          <Link to="/prototype/book">Open reading notebook</Link>
        </p>
        <SketchButton onClick={() => navigate('/')}>
          Close notebook
        </SketchButton>
      </article>
    </main>
  );
}

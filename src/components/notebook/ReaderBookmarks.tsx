import { useState, type CSSProperties } from 'react';
import { portfolio } from '../../lib/content/portfolio';
import tokens from '../../styles/tokens.json';

export function ReaderBookmarks({
  selected,
  disabled,
  compact,
  hint,
  onSelect,
}: {
  selected: string;
  disabled: boolean;
  compact: boolean;
  hint?: boolean;
  onSelect: (id: string) => void;
}) {
  const [worksOpen, setWorksOpen] = useState(false);
  return (
    <nav
      className="reader-bookmarks"
      aria-label="Notebook sections"
      data-compact={compact}
    >
      {hint && (
        <div className="reader-bookmark-hint" aria-hidden="true">
          Click a bookmark to open a section
        </div>
      )}
      {portfolio.sections.map(({ id, label }, index) => {
        const token = tokens.bookmarks[index]!;
        const color =
          tokens.color.bookmark[
            token.colorKey as keyof typeof tokens.color.bookmark
          ];
        const button = (
          <button
            key={id}
            className="reader-bookmark"
            data-section={id}
            style={
              {
                '--tab-fill': color.fill,
                '--tab-accent': color.accent,
              } as CSSProperties
            }
            disabled={disabled}
            aria-label={label}
            aria-current={selected === id ? 'page' : undefined}
            aria-expanded={id === 'literary-analyses' ? worksOpen : undefined}
            aria-controls={
              id === 'literary-analyses' ? 'analysis-work-flyout' : undefined
            }
            onClick={() =>
              id === 'literary-analyses'
                ? setWorksOpen((open) => !open)
                : onSelect(id)
            }
          >
            <span className="reader-bookmark-full" aria-hidden="true">
              {label}
            </span>
            <span className="reader-bookmark-short" aria-hidden="true">
              {
                ['Profile', 'Analyses', 'Favorite', 'Learning', 'Reflection'][
                  index
                ]
              }
            </span>
          </button>
        );
        return id !== 'literary-analyses' ? (
          button
        ) : (
          <div
            key={id}
            className="reader-analysis-tab"
            onKeyDown={(event) => {
              if (event.key === 'Escape' && worksOpen) {
                event.preventDefault();
                setWorksOpen(false);
                event.currentTarget.querySelector('button')?.focus();
              }
            }}
          >
            {button}
            <div
              id="analysis-work-flyout"
              className="reader-work-flyout"
              hidden={!worksOpen}
            >
              <button
                disabled={disabled}
                aria-current={selected === 'literary-analyses' ? 'true' : undefined}
                onClick={() => {
                  setWorksOpen(false);
                  onSelect('literary-analyses');
                }}
              >
                Literary Analyses overview
              </button>
              {portfolio.works.map((work) => (
                <button
                  key={work.id}
                  disabled={disabled}
                  aria-current={selected === work.id ? 'true' : undefined}
                  onClick={() => {
                    setWorksOpen(false);
                    onSelect(work.id);
                  }}
                >
                  {work.title}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </nav>
  );
}

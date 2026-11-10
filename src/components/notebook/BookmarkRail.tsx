import { useEffect, useState, useRef, type CSSProperties } from 'react';

export interface BookmarkDestination {
  id: string;
  label: string;
  index: number;
  fill: string;
  accent: string;
}

interface BookmarkRailProps {
  destinations: BookmarkDestination[];
  selected: string;
  ready: boolean;
  wide: boolean;
  reveal: 'transparency' | 'slide';
  onSelect: (destination: BookmarkDestination) => void;
  onPeek: (range: { top: number; bottom: number } | null) => void;
}

export function BookmarkRail({
  destinations,
  selected,
  ready,
  wide,
  reveal,
  onSelect,
  onPeek,
}: BookmarkRailProps) {
  const rail = useRef<HTMLElement>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const peek = hovered ?? focused;
  useEffect(() => {
    const element = rail.current?.querySelector<HTMLElement>(
      '[data-bookmark-id="' + peek + '"]',
    );
    const box = element?.getBoundingClientRect();
    onPeek(
      ready && wide && reveal === 'transparency' && box
        ? { top: box.top - 6, bottom: box.bottom + 6 }
        : null,
    );
    return () => onPeek(null);
  }, [ready, wide, reveal, peek, onPeek]);

  return (
    <nav
      ref={rail}
      className="bookmark-rail"
      aria-label="Notebook sections"
      data-reveal={reveal}
    >
      {destinations.map((destination) => (
        <button
          key={destination.id}
          data-bookmark-id={destination.id}
          type="button"
          className="bookmark-button"
          style={
            {
              '--tab-fill': destination.fill,
              '--tab-accent': destination.accent,
            } as CSSProperties
          }
          aria-current={selected === destination.id ? 'page' : undefined}
          disabled={!ready}
          onMouseEnter={() => setHovered(destination.id)}
          onMouseLeave={() => setHovered(null)}
          onFocus={() => setFocused(destination.id)}
          onBlur={() => setFocused(null)}
          onClick={() => onSelect(destination)}
        >
          <span>{destination.label}</span>
          {selected === destination.id && (
            <span className="bookmark-current" aria-hidden="true">
              •
            </span>
          )}
        </button>
      ))}
    </nav>
  );
}

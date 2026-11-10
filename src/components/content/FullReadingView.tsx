import { useEffect, useRef } from 'react';
import { compositionGroups } from '../../lib/pagination/composePortfolio';
import { portfolio } from '../../lib/content/portfolio';
import { profile } from '../../content/profile';
import { sourceContext } from '../../content/sources';
import { fontCredit, marginNoteCredit } from '../../content/assets';
import { ContentBlocks } from './ContentBlocks';
import { Polaroid } from './Polaroid';
import { decorateReading } from '../../lib/annotations/noteMarks';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import type { ReadingLocation } from '../../lib/pagination/analysisBlocks';
import type { ZoomImage } from '../../lib/navigation/engineProtocol';

const groups = compositionGroups(portfolio);
export function FullReadingView({
  active,
  onLocation,
  onZoom,
}: {
  active: boolean;
  onLocation: (location: ReadingLocation) => void;
  onZoom?: (image: ZoomImage) => void;
}) {
  const surface = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    if (!active || !surface.current) return;
    decorateReading(surface.current, !reducedMotion);
  }, [active, reducedMotion]);
  useEffect(() => {
    if (!active) return;
    let frame = 0;
    const scroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const visible = Array.from(
          surface.current?.querySelectorAll<HTMLElement>('[data-block-id]') ??
            [],
        ).find(
          (node) =>
            node.getBoundingClientRect().bottom > 100 &&
            node.getBoundingClientRect().top < innerHeight,
        );
        if (visible)
          onLocation({
            anchor: visible.dataset.anchor!,
            blockId: visible.dataset.blockId,
            offset: 0,
          });
      });
    };
    window.addEventListener('scroll', scroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', scroll);
      cancelAnimationFrame(frame);
    };
  }, [active, onLocation]);
  return (
    <div ref={surface} className="full-portfolio" hidden={!active}>
      <p>
        {profile.name}, {profile.course}, {profile.year}
      </p>
      <p>
        {profile.university}. {profile.classSection}. Class code{' '}
        {profile.classCode}.
      </p>
      {groups.map((group) => (
        <section
          key={group.id}
          aria-labelledby={`reading-${group.id}`}
          data-document-id={group.id}
          data-work-id={group.workId}
        >
          <h2 id={`reading-${group.id}`}>{group.title}</h2>
          {group.workId && (
            <p>
              {group.opening.label}. {group.opening.detail}.
            </p>
          )}
          {group.opening.portrait && (
            <Polaroid {...group.opening.portrait} onZoom={onZoom} />
          )}
          {group.id === 'sources' && (
            <>
              <p>{sourceContext.editionDisclaimer}</p>
              <p>{sourceContext.sdgDisclaimer}</p>
            </>
          )}
          <ContentBlocks
            blocks={group.blocks}
            images={portfolio.images}
            headingOffset={1}
          />
        </section>
      ))}
      <p>{marginNoteCredit}</p>
      <p>
        {fontCredit.family} by {fontCredit.creator}.{' '}
        <a href="/licenses/Patrick-Hand-OFL.txt">{fontCredit.license}</a>.
      </p>
    </div>
  );
}

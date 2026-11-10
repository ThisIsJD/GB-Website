import { useEffect, useRef, useState, type RefObject } from 'react';
import { portfolio } from '../lib/content/portfolio';
import { composePortfolio } from '../lib/pagination/composePortfolio';
import { measureContent } from '../lib/pagination/measureContent';
import type { PageGeometry } from '../lib/navigation/engineProtocol';
import type { ReadingLocation } from '../lib/pagination/analysisBlocks';
import { leafForLocation } from '../lib/pagination/paginateAnalysis';

export type PortfolioComposition = Awaited<ReturnType<typeof composePortfolio>>;
export function pageForLocation(
  composed: PortfolioComposition,
  location: ReadingLocation,
): number {
  if (location.blockId || composed.maps.answers[location.anchor])
    return leafForLocation(composed.pages, location);
  return (
    composed.maps.works[location.anchor]?.[0] ??
    composed.maps.sections[location.anchor]?.[0] ??
    1
  );
}

export function usePortfolioLayout(
  geometry: PageGeometry,
  assetRevision: number,
  enabled: boolean,
  location: RefObject<ReadingLocation>,
) {
  const serial = useRef(0);
  const key = JSON.stringify([geometry, assetRevision]);
  const [result, setResult] = useState<{
    key: string;
    id: number;
    value?: PortfolioComposition;
    startIndex: number;
    error?: string;
  }>();
  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    void composePortfolio(portfolio, (group) =>
      measureContent(group.blocks, group.title, geometry, controller.signal, {
        images: portfolio.images,
        opening: group.opening,
        material: 'ruled',
      }),
    )
      .then((value) => {
        controller.signal.throwIfAborted();
        setResult({
          key,
          id: ++serial.current,
          value,
          startIndex: pageForLocation(value, location.current),
        });
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted)
          setResult({
            key,
            id: ++serial.current,
            startIndex: 1,
            error: String(error),
          });
      });
    return () => controller.abort();
  }, [key, geometry, enabled, location]);
  return result?.key === key ? result : undefined;
}

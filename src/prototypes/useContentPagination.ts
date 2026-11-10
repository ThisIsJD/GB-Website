import { useEffect, useState } from 'react';
import type { ContentBlock } from '../lib/content/types';
import { portfolio } from '../lib/content/portfolio';
import { measureContent } from '../lib/pagination/measureContent';
import type { ContentLeaf } from '../lib/pagination/paginateContent';
import type { PageGeometry } from '../lib/navigation/engineProtocol';

interface Result {
  key: string;
  leaves: ContentLeaf[];
  error?: string;
}

/** Review harness only. Production semantic restoration belongs to P4.4. */
export function useContentPagination(
  blocks: readonly ContentBlock[],
  title: string,
  geometry: PageGeometry,
  enabled: boolean,
) {
  const [result, setResult] = useState<Result>();
  const key = JSON.stringify([blocks.map(({ id }) => id), title, geometry]);
  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    void measureContent(blocks, title, geometry, controller.signal, {
      images: portfolio.images,
    })
      .then((leaves) => {
        if (!controller.signal.aborted) setResult({ key, leaves });
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted)
          setResult({ key, leaves: [], error: String(error) });
      });
    return () => controller.abort();
  }, [blocks, title, geometry, key, enabled]);
  return result?.key === key ? result : undefined;
}

import { useEffect, useRef, useState, type RefObject } from 'react';
import type {
  PageGeometry,
  ReadingLeaf,
} from '../lib/navigation/engineProtocol';
import type { ReadingLocation } from '../lib/pagination/analysisBlocks';
import { leafForLocation } from '../lib/pagination/paginateAnalysis';
import { measureAnalysis } from '../lib/pagination/measureAnalysis';

interface MeasuredAnalysis {
  key: string;
  id: number;
  pages: ReadingLeaf[];
  startIndex: number;
  error?: string;
}

export function useMeasuredAnalysis(
  source: string,
  title: string,
  geometry: PageGeometry,
  enabled: boolean,
  locationRef: RefObject<ReadingLocation>,
) {
  const serial = useRef(0);
  const key = JSON.stringify([source, title, geometry]);
  const [result, setResult] = useState<MeasuredAnalysis | null>(null);
  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      const error = 'Page measurement timed out.';
      setResult({ key, id: ++serial.current, pages: [], startIndex: 0, error });
      controller.abort(new Error(error));
    }, 15000);
    void measureAnalysis(source, title, geometry, controller.signal)
      .then((pages) => {
        controller.signal.throwIfAborted();
        setResult({
          key,
          id: ++serial.current,
          pages,
          startIndex: leafForLocation(pages, locationRef.current),
        });
      })
      .catch((cause: unknown) => {
        if (cause instanceof DOMException && cause.name === 'AbortError')
          return;
        if (!controller.signal.aborted || controller.signal.reason === cause)
          setResult({
            key,
            id: ++serial.current,
            pages: [],
            startIndex: 0,
            error: String(cause),
          });
      })
      .finally(() => clearTimeout(timer));
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [source, title, geometry, enabled, key, locationRef]);
  return result?.key === key ? result : null;
}

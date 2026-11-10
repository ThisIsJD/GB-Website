import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { PageLeaf } from '../../components/notebook/PageLeaf';
import type { ContentBlock, ContentImage } from '../content/types';
import type {
  PageGeometry,
  ReadingLeaf,
  OpeningMetadata,
} from '../navigation/engineProtocol';
import { geometryVariables } from './geometry';
import { requiredImages, waitForAssets, waitForFrame } from './assetReadiness';
import { contentMarkdown } from './contentFragments';
import { paginateContent, PaginationError } from './paginateContent';
import '../../styles/leaf.css';

interface MeasurementOptions {
  images?: readonly ContentImage[];
  timeoutMs?: number;
  maxPages?: number;
  opening?: OpeningMetadata;
  material?: 'ruled';
}

export async function measureContent(
  blocks: readonly ContentBlock[],
  title: string,
  geometry: PageGeometry,
  signal: AbortSignal,
  options: MeasurementOptions = {},
) {
  signal.throwIfAborted();
  if (
    Object.values(geometry).some(
      (value) =>
        typeof value === 'number' && (!Number.isFinite(value) || value <= 0),
    )
  )
    throw new PaginationError(
      'Page geometry must contain finite positive dimensions.',
    );
  const timeoutMs = options.timeoutMs ?? 15000;
  if (!(timeoutMs > 0) || !Number.isFinite(timeoutMs))
    throw new PaginationError('Invalid measurement timeout.');
  const controller = new AbortController();
  const abort = () => controller.abort(signal.reason);
  signal.addEventListener('abort', abort, { once: true });
  const deadline = performance.now() + timeoutMs;
  const timer = setTimeout(
    () => controller.abort(new PaginationError('Page measurement timed out.')),
    timeoutMs,
  );
  const check = () => {
    controller.signal.throwIfAborted();
    if (performance.now() > deadline)
      throw new PaginationError('Page measurement timed out.');
  };
  let host: HTMLDivElement | undefined;
  let root: ReturnType<typeof createRoot> | undefined;
  try {
    const images = requiredImages(blocks, options.images ?? []);
    await waitForAssets(images, geometry.fontSize, controller.signal);
    check();
    host = document.createElement('div');
    host.className = 'page-measurement canonical-measurement';
    host.setAttribute('aria-hidden', 'true');
    host.inert = true;
    Object.assign(host.style, {
      position: 'fixed',
      left: '-10000px',
      top: '0',
      visibility: 'hidden',
      pointerEvents: 'none',
      width: `${geometry.width}px`,
      height: `${geometry.height}px`,
    });
    for (const [key, value] of Object.entries(geometryVariables(geometry)))
      host.style.setProperty(key, value);
    document.body.append(host);
    root = createRoot(host);
    const measure = (leaf: ReadingLeaf, number = 9999, total = 9999) => {
      check();
      flushSync(() =>
        root!.render(<PageLeaf leaf={leaf} number={number} total={total} />),
      );
      const body = host!.querySelector<HTMLElement>('.leaf-body')!;
      const content = body.querySelector<HTMLElement>('.reading-content')!;
      return (
        body.clientHeight > 0 &&
        body.scrollHeight <= body.clientHeight &&
        content.getBoundingClientRect().bottom <=
          body.getBoundingClientRect().bottom - 2 &&
        content.scrollWidth <= body.clientWidth
      );
    };
    const cache = new Map<string, boolean>();
    const leaves = await paginateContent(
      blocks,
      title,
      (parts) => {
        const markdown = contentMarkdown(parts);
        const opening =
          parts[0]?.blockId === blocks[0]?.id && parts[0]?.from === 0
            ? options.opening
            : undefined;
        const cacheKey = JSON.stringify([markdown, opening]);
        const existing = cache.get(cacheKey);
        if (existing !== undefined) return existing;
        const fits = measure({
          id: 'measuring',
          title,
          markdown,
          anchor: 'measuring',
          images,
          material: options.material,
          opening,
        });
        cache.set(cacheKey, fits);
        return fits;
      },
      {
        maxPages: options.maxPages,
        checkpoint: () => waitForFrame(controller.signal),
      },
    );
    for (const [index, leaf] of leaves.entries()) {
      leaf.images = images;
      leaf.material = options.material;
      if (index === 0) leaf.opening = options.opening;
      if (!measure(leaf, index + 1, leaves.length))
        throw new PaginationError(
          'Final page does not fit its measured space.',
          leaf.id,
        );
    }
    return leaves;
  } finally {
    // Cancel other readiness tasks after a sibling fails, too.
    controller.abort();
    clearTimeout(timer);
    signal.removeEventListener('abort', abort);
    root?.unmount();
    host?.remove();
  }
}

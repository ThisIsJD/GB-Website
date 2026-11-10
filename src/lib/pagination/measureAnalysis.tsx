import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { PageLeaf } from '../../components/notebook/PageLeaf';
import type { PageGeometry, ReadingLeaf } from '../navigation/engineProtocol';
import { geometryVariables } from './geometry';
import { analysisBlocks, fragmentMarkdown } from './analysisBlocks';
import { paginateAnalysis, withCovers } from './paginateAnalysis';
import '../../styles/leaf.css';

function nextFrame(signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    signal.throwIfAborted();
    const id = requestAnimationFrame(() => {
      signal.removeEventListener('abort', abort);
      resolve();
    });
    function abort() {
      cancelAnimationFrame(id);
      reject(signal.reason);
    }
    signal.addEventListener('abort', abort, { once: true });
  });
}

export async function measureAnalysis(
  source: string,
  title: string,
  geometry: PageGeometry,
  signal: AbortSignal,
): Promise<ReadingLeaf[]> {
  const fonts = await document.fonts.load(
    `${geometry.fontSize}px "Patrick Hand"`,
  );
  if (!fonts.length) throw new Error('The handwriting font is unavailable.');
  await document.fonts.ready;
  await nextFrame(signal);
  const host = document.createElement('div');
  host.className = 'page-measurement';
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
  const root = createRoot(host);
  try {
    const measure = (leaf: ReadingLeaf, number = 9999, total = 9999) => {
      signal.throwIfAborted();
      // Runs only in this asynchronous measurement task, outside React commits.
      flushSync(() =>
        root.render(<PageLeaf leaf={leaf} number={number} total={total} />),
      );
      const body = host.querySelector<HTMLElement>('.leaf-body')!;
      const content = body.firstElementChild!;
      return (
        body.scrollHeight <= body.clientHeight &&
        content.getBoundingClientRect().bottom <=
          body.getBoundingClientRect().bottom - 2 &&
        content.scrollWidth <= body.clientWidth
      );
    };
    const cache = new Map<string, boolean>();
    const leaves = await paginateAnalysis(
      analysisBlocks(source),
      title,
      (parts) => {
        const markdown = fragmentMarkdown(parts);
        const cached = cache.get(markdown);
        if (cached !== undefined) return cached;
        const fits = measure({
          id: 'measuring',
          title,
          markdown,
          anchor: 'measuring',
        });
        cache.set(markdown, fits);
        return fits;
      },
      () => nextFrame(signal),
    );
    const pages = withCovers(leaves, title);
    // Validate exact final footers after pagination, rather than guessing their height.
    for (const [index, page] of pages.entries()) {
      if (!page.ranges) continue;
      if (!measure(page, index + 1, pages.length))
        throw new Error('The final page did not fit its measured space.');
    }
    return pages;
  } finally {
    root.unmount();
    host.remove();
  }
}

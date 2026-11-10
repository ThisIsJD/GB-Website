import type { Nodes } from 'mdast';
import type { ContentBlock, ContentImage } from '../content/types';

export function waitWithSignal<T>(
  task: Promise<T>,
  signal: AbortSignal,
): Promise<T> {
  signal.throwIfAborted();
  return new Promise((resolve, reject) => {
    const abort = () => {
      signal.removeEventListener('abort', abort);
      reject(signal.reason);
    };
    signal.addEventListener('abort', abort, { once: true });
    task.then(
      (value) => {
        signal.removeEventListener('abort', abort);
        resolve(value);
      },
      (error) => {
        signal.removeEventListener('abort', abort);
        reject(error);
      },
    );
  });
}

export function waitForFrame(signal: AbortSignal): Promise<void> {
  signal.throwIfAborted();
  return new Promise((resolve, reject) => {
    const id = requestAnimationFrame(() => {
      signal.removeEventListener('abort', abort);
      resolve();
    });
    function abort() {
      cancelAnimationFrame(id);
      signal.removeEventListener('abort', abort);
      reject(signal.reason);
    }
    signal.addEventListener('abort', abort, { once: true });
  });
}

function imageUrls(node: Nodes): string[] {
  if (node.type === 'image') return [node.url];
  return 'children' in node ? node.children.flatMap(imageUrls) : [];
}

export function requiredImages(
  blocks: readonly ContentBlock[],
  images: readonly ContentImage[],
): ContentImage[] {
  return Array.from(new Set(blocks.flatMap(({ node }) => imageUrls(node)))).map(
    (src) => {
      const image = images.find((image) => image.src === src);
      if (
        !image ||
        !Number.isFinite(image.width) ||
        !Number.isFinite(image.height) ||
        image.width <= 0 ||
        image.height <= 0
      )
        throw new Error(`Image metadata is unavailable: ${src}`);
      return image;
    },
  );
}

async function decodeImage(
  metadata: ContentImage,
  signal: AbortSignal,
): Promise<void> {
  signal.throwIfAborted();
  const image = new Image();
  try {
    await waitWithSignal(
      new Promise<void>((resolve, reject) => {
        image.onerror = () =>
          reject(new Error(`Image is unavailable: ${metadata.src}`));
        image.onload = () => {
          if (
            image.naturalWidth !== metadata.width ||
            image.naturalHeight !== metadata.height
          ) {
            reject(
              new Error(
                `Image dimensions do not match metadata: ${metadata.src}`,
              ),
            );
            return;
          }
          image
            .decode()
            .then(resolve, () =>
              reject(new Error(`Image could not be decoded: ${metadata.src}`)),
            );
        };
        image.src = metadata.src;
      }),
      signal,
    );
  } finally {
    image.onload = null;
    image.onerror = null;
    image.removeAttribute('src');
  }
}

export async function waitForAssets(
  images: readonly ContentImage[],
  fontSize: number,
  signal: AbortSignal,
): Promise<void> {
  signal.throwIfAborted();
  const font = (async () => {
    const faces = await waitWithSignal(
      document.fonts.load(`${fontSize}px "Patrick Hand"`),
      signal,
    );
    if (!faces.length) throw new Error('The handwriting font is unavailable.');
    await waitWithSignal(document.fonts.ready, signal);
  })();
  await waitWithSignal(
    Promise.all([font, ...images.map((image) => decodeImage(image, signal))]),
    signal,
  );
  await waitForFrame(signal);
}

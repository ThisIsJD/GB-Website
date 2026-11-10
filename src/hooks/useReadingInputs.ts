import { useEffect, useState } from 'react';

/** Observe root text size and late assets without tying reflow to engine animation. */
export function useReadingInputs() {
  const [inputs, setInputs] = useState({ scale: 1, revision: 0 });
  useEffect(() => {
    const probe = document.createElement('span');
    probe.setAttribute('aria-hidden', 'true');
    Object.assign(probe.style, {
      position: 'fixed',
      width: '1rem',
      height: '1rem',
      visibility: 'hidden',
      pointerEvents: 'none',
    });
    document.body.append(probe);
    const observer = new ResizeObserver(([entry]) => {
      const scale = (entry?.contentRect.width ?? 16) / 16;
      setInputs((previous) =>
        Math.abs(previous.scale - scale) < 0.01
          ? previous
          : { ...previous, scale },
      );
    });
    observer.observe(probe);
    const invalidate = () =>
      setInputs((previous) => ({
        ...previous,
        revision: previous.revision + 1,
      }));
    const images = new WeakMap<HTMLImageElement, string>();
    const imageChanged = (event: Event) => {
      if (!(event.target instanceof HTMLImageElement)) return;
      const image = event.target;
      // Off-screen measurement images must not invalidate the real layout.
      if (image.closest('.page-measurement')) return;
      const signature = `${image.currentSrc || image.src}:${image.naturalWidth}:${image.naturalHeight}`;
      if (images.get(image) === signature) return;
      images.set(image, signature);
      invalidate();
    };
    document.fonts.addEventListener('loadingdone', invalidate);
    document.fonts.addEventListener('loadingerror', invalidate);
    document.addEventListener('load', imageChanged, true);
    document.addEventListener('error', imageChanged, true);
    return () => {
      observer.disconnect();
      probe.remove();
      document.fonts.removeEventListener('loadingdone', invalidate);
      document.fonts.removeEventListener('loadingerror', invalidate);
      document.removeEventListener('load', imageChanged, true);
      document.removeEventListener('error', imageChanged, true);
    };
  }, []);
  return inputs;
}

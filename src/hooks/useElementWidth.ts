import { useEffect, useState, type RefObject } from 'react';

export function useElementWidth(
  element: RefObject<HTMLElement | null>,
  delay = 0,
) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const node = element.current;
    if (!node) return;
    let timer: ReturnType<typeof setTimeout>;
    let initialized = false;
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const next = Math.floor(entry.contentRect.width);
      clearTimeout(timer);
      if (!initialized || delay === 0) setWidth(next);
      else timer = setTimeout(() => setWidth(next), delay);
      initialized = true;
    });
    observer.observe(node);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [element, delay]);
  return width;
}

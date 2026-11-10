import { forwardRef, StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import HTMLFlipBook from 'react-pageflip';

export const Leaf = forwardRef<HTMLDivElement, { number: number }>(
  ({ number }, ref) => (
    <div ref={ref} style={{ background: '#fbf5e8' }}>
      Reading page {number}
    </div>
  ),
);

export function Probe() {
  const [mounted, setMounted] = useState(true);
  return (
    <>
      <button onClick={() => setMounted(false)}>Remove notebook</button>
      {mounted && (
        <HTMLFlipBook
          width={300}
          height={400}
          size="fixed"
          minWidth={300}
          maxWidth={300}
          minHeight={400}
          maxHeight={400}
          startPage={0}
          drawShadow
          flippingTime={520}
          usePortrait
          startZIndex={0}
          autoSize
          maxShadowOpacity={0.5}
          showCover
          mobileScrollSupport
          clickEventForward
          useMouseEvents
          swipeDistance={40}
          showPageCorners={false}
          disableFlipByClick
          className="probe-book"
          style={{}}
        >
          {[0, 1, 2, 3].map((number) => (
            <Leaf key={number} number={number} />
          ))}
        </HTMLFlipBook>
      )}
    </>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Probe />
  </StrictMode>,
);

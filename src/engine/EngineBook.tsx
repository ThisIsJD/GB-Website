import HTMLFlipBook from 'react-pageflip';
import { PageLeaf } from '../components/notebook/PageLeaf';
import {
  engineChannel,
  type EngineConfiguration,
} from '../lib/navigation/engineProtocol';
import { geometryVariables } from '../lib/pagination/geometry';
import { useEngineController } from './useEngineController';
export function EngineBook({
  configuration,
}: {
  configuration: EngineConfiguration;
}) {
  const { pages, geometry, startIndex } = configuration;
  const { book, register, synchronize, notify, settle, annotateVisibleNotes } =
    useEngineController(configuration);
  return (
    <div className="engine-document" style={geometryVariables(geometry)}>
      <HTMLFlipBook
        ref={book}
        width={geometry.width}
        height={geometry.height}
        size="fixed"
        minWidth={geometry.width}
        maxWidth={geometry.width}
        minHeight={geometry.height}
        maxHeight={geometry.height}
        startPage={startIndex}
        drawShadow
        flippingTime={520}
        usePortrait
        startZIndex={1}
        autoSize={false}
        maxShadowOpacity={0.35}
        showCover
        mobileScrollSupport={false}
        clickEventForward
        useMouseEvents={false}
        swipeDistance={48}
        showPageCorners={false}
        disableFlipByClick={false}
        className="engine-book"
        style={{ width: '100%', height: geometry.height }}
        renderOnlyPageLengthChange={false}
        onInit={() => {
          const position = synchronize();
          if (position)
            notify({
              channel: engineChannel,
              type: 'ready',
              snapshot: position,
            });
          requestAnimationFrame(annotateVisibleNotes);
        }}
        onFlip={() => {
          synchronize();
        }}
        onChangeState={(event: { data: string }) => {
          notify({ channel: engineChannel, type: 'state', state: event.data });
          // The engine emits before assigning its new state.
          if (event.data === 'read') queueMicrotask(settle);
        }}
      >
        {pages.map((leaf, index) => (
          <PageLeaf
            key={leaf.id}
            leaf={leaf}
            number={index + 1}
            total={pages.length}
            register={register}
          />
        ))}
      </HTMLFlipBook>
    </div>
  );
}

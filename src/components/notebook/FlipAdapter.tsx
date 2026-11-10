import { useEffect, useImperativeHandle, useRef, type Ref } from 'react';
import {
  engineChannel,
  type EngineConfiguration,
  type EngineResponse,
  type EngineSnapshot,
  type FlipAdapterHandle,
  type ZoomImage,
} from '../../lib/navigation/engineProtocol';

interface FlipAdapterProps {
  onNavigate?: (href: string) => void;
  configuration: EngineConfiguration;
  onPosition: (snapshot: EngineSnapshot) => void;
  onReady: (snapshot: EngineSnapshot) => void;
  onState: (state: string) => void;
  onError: (message: string) => void;
  onZoom?: (image: ZoomImage) => void;
  ref: Ref<FlipAdapterHandle>;
}

export function FlipAdapter({
  onNavigate,
  configuration,
  onPosition,
  onReady,
  onState,
  onError,
  onZoom,
  ref,
}: FlipAdapterProps) {
  const frame = useRef<HTMLIFrameElement>(null);
  const nextId = useRef(0);
  const tail = useRef<Promise<unknown>>(Promise.resolve());
  const activeRevision = useRef(configuration.revision);
  const requests = useRef(
    new Map<
      number,
      {
        resolve: (snapshot: EngineSnapshot) => void;
        reject: (error: Error) => void;
        timer: ReturnType<typeof setTimeout>;
      }
    >(),
  );
  const callbacks = useRef({
    onPosition,
    onReady,
    onState,
    onError,
    onNavigate,
    onZoom,
  });
  useEffect(() => {
    callbacks.current = {
      onPosition,
      onReady,
      onState,
      onError,
      onNavigate,
      onZoom,
    };
  });

  useImperativeHandle(
    ref,
    () => ({
      focusHeading(heading) {
        frame.current?.contentWindow?.postMessage(
          { channel: engineChannel, type: 'focus', heading },
          location.origin,
        );
      },
      peek(range) {
        const box = frame.current?.getBoundingClientRect();
        frame.current?.contentWindow?.postMessage(
          {
            channel: engineChannel,
            type: 'peek',
            enabled: range !== null,
            top: range && box ? Math.max(0, range.top - box.top) : 0,
            bottom:
              range && box ? Math.min(box.height, range.bottom - box.top) : 0,
          },
          location.origin,
        );
      },
      lockInput(locked) {
        frame.current?.contentWindow?.postMessage(
          { channel: engineChannel, type: 'interaction', locked },
          location.origin,
        );
      },
      turn(index, options = {}) {
        const expectedRevision = configuration.revision;
        const operation = () =>
          new Promise<EngineSnapshot>((resolve, reject) => {
            if (activeRevision.current !== expectedRevision) {
              reject(
                new DOMException(
                  'Notebook document was replaced.',
                  'AbortError',
                ),
              );
              return;
            }
            const target = frame.current?.contentWindow;
            if (!target) {
              reject(
                new DOMException(
                  'Notebook document was removed.',
                  'AbortError',
                ),
              );
              return;
            }
            const id = ++nextId.current;
            const timer = setTimeout(() => {
              requests.current.delete(id);
              reject(new Error('Notebook turn did not settle.'));
            }, 2500);
            requests.current.set(id, { resolve, reject, timer });
            target.postMessage(
              {
                channel: engineChannel,
                type: 'turn',
                id,
                index,
                animate: options.animate ?? true,
                focus: options.focus ?? false,
                burst: options.burst ?? false,
              },
              location.origin,
            );
          });
        const result = tail.current.then(operation, operation);
        tail.current = result.then(
          () => undefined,
          () => undefined,
        );
        return result;
      },
    }),
    [configuration.revision],
  );

  useEffect(() => {
    activeRevision.current = configuration.revision;
    const pendingRequests = requests.current;
    const readyTimer = setTimeout(
      () =>
        callbacks.current.onError('Notebook document did not become ready.'),
      5000,
    );
    const listener = (event: MessageEvent<EngineResponse>) => {
      if (
        event.origin !== location.origin ||
        event.source !== frame.current?.contentWindow
      )
        return;
      const message = event.data;
      if (message?.channel !== engineChannel) return;
      if (message.type === 'navigate') {
        if (callbacks.current.onNavigate)
          callbacks.current.onNavigate(message.href);
        else window.location.assign(message.href);
        return;
      }
      if (message.type === 'zoom') {
        callbacks.current.onZoom?.(message.image);
        return;
      }
      if (message.type === 'ready') {
        clearTimeout(readyTimer);
        callbacks.current.onReady(message.snapshot);
      } else if (message.type === 'position')
        callbacks.current.onPosition(message.snapshot);
      else if (message.type === 'state')
        callbacks.current.onState(message.state);
      else if (message.type === 'error')
        callbacks.current.onError(message.message);
      else if (message.type === 'settled') {
        const request = pendingRequests.get(message.id);
        if (request) {
          clearTimeout(request.timer);
          pendingRequests.delete(message.id);
          request.resolve(message.snapshot);
        }
      }
    };
    window.addEventListener('message', listener);
    return () => {
      activeRevision.current = '';
      clearTimeout(readyTimer);
      window.removeEventListener('message', listener);
      for (const request of pendingRequests.values()) {
        clearTimeout(request.timer);
        request.reject(
          new DOMException('Notebook document was replaced.', 'AbortError'),
        );
      }
      pendingRequests.clear();
    };
  }, [configuration.revision]);

  return (
    <iframe
      key={configuration.revision}
      className="notebook-frame"
      title="Notebook pages"
      src="/turning-pages.html"
      ref={frame}
      width={
        configuration.geometry.width * (configuration.geometry.spread ? 2 : 1)
      }
      height={configuration.geometry.height}
      onLoad={() =>
        frame.current?.contentWindow?.postMessage(
          {
            channel: engineChannel,
            type: 'configure',
            configuration,
          },
          location.origin,
        )
      }
    />
  );
}

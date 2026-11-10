import { useState, useEffect } from 'react';
import {
  engineChannel,
  type PortraitSpec,
  type ZoomImage,
} from '../../lib/navigation/engineProtocol';
import './polaroid.css';

const ZOOM_HINT_KEY = 'gb-zoom-hint-dismissed';
const ZOOM_HINT_EVENT = 'gb-zoom-hint-dismissed';

function zoomHintDismissed(): boolean {
  try {
    return sessionStorage.getItem(ZOOM_HINT_KEY) === '1';
  } catch {
    return false;
  }
}

function dismissZoomHint(): void {
  try {
    sessionStorage.setItem(ZOOM_HINT_KEY, '1');
  } catch {
    /* storage may be unavailable */
  }
  window.dispatchEvent(new Event(ZOOM_HINT_EVENT));
}

/** A photo shown as a physical polaroid taped onto the page. */
export function Polaroid({
  src,
  alt,
  caption,
  credit,
  placeholder,
  variant = 'portrait',
  width,
  height,
  onZoom,
}: PortraitSpec & { onZoom?: (image: ZoomImage) => void }) {
  const [hintDone, setHintDone] = useState(zoomHintDismissed);
  useEffect(() => {
    const update = () => setHintDone(zoomHintDismissed());
    window.addEventListener(ZOOM_HINT_EVENT, update);
    window.addEventListener('storage', update);
    return () => {
      window.removeEventListener(ZOOM_HINT_EVENT, update);
      window.removeEventListener('storage', update);
    };
  }, []);
  const requestZoom = () => {
    if (!src) return;
    dismissZoomHint();
    setHintDone(true);
    const image: ZoomImage = { src, alt, caption, credit };
    if (window.self !== window.top)
      window.parent.postMessage(
        { channel: engineChannel, type: 'zoom', image },
        location.origin,
      );
    else onZoom?.(image);
  };
  return (
    <figure
      className="polaroid"
      data-variant={variant}
      data-placeholder={placeholder || undefined}
    >
      <span className="polaroid-tape" aria-hidden="true" />
      {src ? (
        <button
          type="button"
          className="polaroid-button"
          onClick={requestZoom}
          title="Click to zoom in"
          aria-label={`Zoom in on ${caption}`}
        >
          <img
            className="polaroid-photo"
            src={src}
            alt={alt}
            width={width}
            height={height}
          />
          {!hintDone && (
            <span className="polaroid-hint" aria-hidden="true">
              Click to zoom
            </span>
          )}
        </button>
      ) : (
        <span
          className="polaroid-photo polaroid-empty"
          role="img"
          aria-label={alt}
        >
          <span aria-hidden="true">Photo coming soon</span>
        </span>
      )}
      <figcaption className="polaroid-caption">{caption}</figcaption>
      {credit && <span className="polaroid-credit">{credit}</span>}
    </figure>
  );
}

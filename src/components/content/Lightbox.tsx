import { useEffect, useRef } from 'react';
import type { ZoomImage } from '../../lib/navigation/engineProtocol';
import './lightbox.css';

/** A zoomed polaroid over a blurred page. Closes on Escape, scrim, or button. */
export function Lightbox({
  image,
  onClose,
}: {
  image: ZoomImage | null;
  onClose: () => void;
}) {
  const closeButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (image) closeButton.current?.focus();
  }, [image]);
  useEffect(() => {
    if (!image) return;
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  }, [image, onClose]);
  if (!image) return null;
  return (
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={image.caption}
      onClick={onClose}
    >
      <figure className="lightbox-frame" onClick={(event) => event.stopPropagation()}>
        <img className="lightbox-photo" src={image.src} alt={image.alt} />
        <figcaption className="lightbox-caption">{image.caption}</figcaption>
        {image.credit && <p className="lightbox-credit">{image.credit}</p>}
      </figure>
      <button
        ref={closeButton}
        type="button"
        className="lightbox-close"
        onClick={onClose}
        aria-label="Close zoomed photo"
      >
        <span aria-hidden="true">×</span>
      </button>
    </div>
  );
}

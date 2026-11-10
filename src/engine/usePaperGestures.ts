import { useEffect, type RefObject } from 'react';
import type { PageFlipApi } from '../lib/navigation/engineProtocol';

/** Mouse clicks turn, holds pick up the lower corner, touch yields to scrolling. */
export function usePaperGestures(
  book: RefObject<{ pageFlip: () => PageFlipApi | undefined } | null>,
  count: number,
  reducedMotion: boolean,
  settled: () => void,
  isLocked: () => boolean,
) {
  useEffect(() => {
    type Gesture = {
      x: number;
      y: number;
      latestX: number;
      latestY: number;
      pointer: number;
      mouse: boolean;
      edge: boolean;
      dragging: boolean;
      box: DOMRect;
      element: Element;
      corner: { x: number; y: number };
      target: number;
      forward: boolean;
    };
    let start: Gesture | null = null;
    let hold: ReturnType<typeof setTimeout> | undefined;
    const clearHold = () => {
      clearTimeout(hold);
      hold = undefined;
    };
    const point = (origin: Gesture) => ({
      x: origin.latestX - origin.box.left,
      y: origin.latestY - origin.box.top,
    });
    const pickup = (origin: Gesture) => {
      const engine = book.current?.pageFlip();
      if (
        start !== origin ||
        !engine ||
        isLocked() ||
        window.getSelection()?.toString()
      )
        return;
      origin.dragging = true;
      clearHold();
      origin.element.setPointerCapture(origin.pointer);
      document.documentElement.classList.add('paper-dragging');
      if (!reducedMotion) {
        engine.startUserTouch(origin.corner);
        // Establish the lower corner/direction before moving to an interior press.
        engine.userMove(
          {
            x: origin.corner.x + (origin.forward ? -8 : 8),
            y: origin.corner.y - 2,
          },
          true,
        );
        engine.userMove(point(origin), true);
      }
    };
    const release = (origin: Gesture) => {
      clearHold();
      if (origin.element.hasPointerCapture(origin.pointer))
        origin.element.releasePointerCapture(origin.pointer);
      document.documentElement.classList.remove('paper-dragging');
    };
    const down = (event: PointerEvent) => {
      if (
        !event.isPrimary ||
        event.button !== 0 ||
        isLocked() ||
        !(event.target instanceof Element) ||
        event.target.closest(
          'a,button,input,textarea,select,[contenteditable]',
        ) ||
        window.getSelection()?.toString()
      )
        return;
      const engine = book.current?.pageFlip();
      const element = document.querySelector('.stf__parent');
      const box = element?.getBoundingClientRect();
      if (!engine || engine.getState() !== 'read' || !element || !box) return;
      const x = event.clientX - box.left;
      const y = event.clientY - box.top;
      const spread = engine.getOrientation() === 'landscape';
      const forward = spread ? x >= box.width / 2 : x > 28;
      const index = engine.getCurrentPageIndex();
      const target = forward
        ? index === 0
          ? 1
          : Math.min(count - 1, index + (spread ? 2 : 1))
        : index === 1
          ? 0
          : Math.max(0, index - (spread ? 2 : 1));
      if (target === index) return;
      const edge =
        x <= 28 ||
        x >= box.width - 28 ||
        ((x <= 64 || x >= box.width - 64) && (y <= 64 || y >= box.height - 64));
      if (event.pointerType !== 'mouse' && !edge) return;
      start = {
        x: event.clientX,
        y: event.clientY,
        latestX: event.clientX,
        latestY: event.clientY,
        pointer: event.pointerId,
        mouse: event.pointerType === 'mouse',
        edge,
        dragging: false,
        box,
        element,
        target,
        forward,
        corner: { x: forward ? box.width - 2 : 2, y: box.height - 2 },
      };
      if (start.mouse) {
        const origin = start;
        hold = setTimeout(() => pickup(origin), 180);
        if (edge) event.preventDefault();
      }
    };
    const move = (event: PointerEvent) => {
      const origin = start;
      if (!origin || event.pointerId !== origin.pointer) return;
      origin.latestX = event.clientX;
      origin.latestY = event.clientY;
      const dx = event.clientX - origin.x,
        dy = event.clientY - origin.y;
      if (!origin.dragging) {
        if (
          (!origin.mouse && Math.abs(dy) > Math.abs(dx) * 1.5) ||
          window.getSelection()?.toString()
        ) {
          clearHold();
          start = null;
          return;
        }
        if (Math.hypot(dx, dy) < 10) return;
        if (!origin.edge) {
          clearHold();
          start = null;
          return;
        }
        pickup(origin);
      }
      if (origin.dragging && !reducedMotion) {
        if (event.cancelable) event.preventDefault();
        book.current?.pageFlip()?.userMove(point(origin), true);
      }
    };
    const up = (event: PointerEvent) => {
      const origin = start;
      if (!origin || event.pointerId !== origin.pointer) return;
      start = null;
      origin.latestX = event.clientX;
      origin.latestY = event.clientY;
      release(origin);
      const engine = book.current?.pageFlip();
      if (!engine) return;
      if (!origin.dragging) {
        if (
          !origin.mouse ||
          isLocked() ||
          window.getSelection()?.toString() ||
          Math.hypot(event.clientX - origin.x, event.clientY - origin.y) >= 10
        )
          return;
        if (reducedMotion) {
          engine.turnToPage(origin.target);
          settled();
        } else engine.flip(origin.target, 'bottom');
        return;
      }
      if (reducedMotion) {
        if (Math.abs(event.clientX - origin.x) >= 48) {
          engine.turnToPage(origin.target);
          settled();
        }
        return;
      }
      if (
        engine.getOrientation() === 'portrait' &&
        origin.forward &&
        event.clientX - origin.x < -Math.max(48, origin.box.width / 2)
      )
        engine.userMove({ x: -1, y: point(origin).y }, true);
      engine.userStop(point(origin));
    };
    const cancel = () => {
      clearHold();
      if (start) {
        if (start.dragging && !reducedMotion) {
          const engine = book.current?.pageFlip();
          engine?.userMove(start.corner, true);
          engine?.userStop(start.corner);
        }
        release(start);
      }
      start = null;
    };
    document.addEventListener('pointerdown', down);
    document.addEventListener('pointermove', move, { passive: false });
    document.addEventListener('pointerup', up);
    document.addEventListener('pointercancel', cancel);
    window.addEventListener('blur', cancel);
    return () => {
      document.removeEventListener('pointerdown', down);
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      document.removeEventListener('pointercancel', cancel);
      window.removeEventListener('blur', cancel);
      cancel();
    };
  }, [book, count, reducedMotion, settled, isLocked]);
}

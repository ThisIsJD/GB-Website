import { useCallback, useEffect, useRef } from 'react';
import { usePaperGestures } from './usePaperGestures';
import {
  redrawLeaf,
  undecorateLeaf,
} from '../lib/annotations/noteMarks';
import {
  engineChannel,
  visibleIndexes,
  type EngineConfiguration,
  type EngineCommand,
  type EngineAuxiliaryCommand,
  type EngineResponse,
  type EngineSnapshot,
  type PageFlipApi,
} from '../lib/navigation/engineProtocol';
type BookHandle = { pageFlip: () => PageFlipApi | undefined };
export function useEngineController(configuration: EngineConfiguration) {
  const book = useRef<BookHandle>(null);
  const elements = useRef(new Map<string, HTMLDivElement>());
  const inputLocked = useRef(false);
  const burstActive = useRef(false);
  const pending = useRef<EngineCommand | null>(null);
  const waiting = useRef<EngineCommand | null>(null);
  const dispatch = useRef<((command: EngineCommand) => void) | null>(null);
  const { pages, revision } = configuration;
  const notify = useCallback((message: EngineResponse) => {
    parent.postMessage(message, location.origin);
  }, []);

  const snapshot = useCallback((): EngineSnapshot | null => {
    const engine = book.current?.pageFlip();
    if (!engine) return null;
    const index = engine.getCurrentPageIndex();
    const mode = engine.getOrientation();
    return {
      index,
      visible: visibleIndexes(index, pages.length, mode === 'landscape'),
      mode,
      state: engine.getState(),
      revision,
    };
  }, [pages.length, revision]);

  const synchronize = useCallback(() => {
    const position = snapshot();
    if (!position) return null;
    const block = document.querySelector('.stf__block');
    if (
      configuration.geometry.spread &&
      block &&
      !block.querySelector('.reader-crease')
    ) {
      const crease = document.createElement('div');
      crease.className = 'reader-crease';
      crease.setAttribute('aria-hidden', 'true');
      block.append(crease);
    }
    const crease = block?.querySelector<HTMLElement>('.reader-crease');
    if (crease)
      crease.hidden =
        position.index === 0 || position.index >= pages.length - 1;
    const active = new Set(position.visible.map((index) => pages[index]?.id));
    document.querySelectorAll<HTMLElement>('.page-leaf').forEach((element) => {
      const visible =
        elements.current.get(element.dataset.leafId ?? '') === element &&
        active.has(element.dataset.leafId);
      if (element.inert !== !visible) element.inert = !visible;
      const hidden = String(!visible);
      if (element.getAttribute('aria-hidden') !== hidden)
        element.setAttribute('aria-hidden', hidden);
    });
    return position;
  }, [pages, snapshot, configuration.geometry.spread]);

  const annotateVisibleNotes = useCallback(() => {
    document.querySelectorAll<HTMLElement>('.page-leaf').forEach((leaf) => {
      if (leaf.inert) undecorateLeaf(leaf);
      else redrawLeaf(leaf, !configuration.reducedMotion);
    });
  }, [configuration.reducedMotion]);

  // A flip animation began: single turns ring once; burst steps stay silent
  // because the section jump already played its riffle on lock.
  const flipStarted = useCallback(() => {
    if (!burstActive.current)
      notify({ channel: engineChannel, type: 'sound', kind: 'turn' });
  }, [notify]);

  const settle = useCallback(() => {
    const position = synchronize();
    const engine = book.current?.pageFlip();
    if (!position || !engine || engine.getState() !== 'read') return;
    annotateVisibleNotes();
    notify({ channel: engineChannel, type: 'position', snapshot: position });
    if (waiting.current && !pending.current) {
      const command = waiting.current;
      waiting.current = null;
      queueMicrotask(() => dispatch.current?.(command));
      return;
    }
    const request = pending.current;
    if (!request) return;

    const complete = () => {
      if (pending.current !== request) return;
      pending.current = null;
      engine.getSettings().flippingTime = 520;
      if (request.focus)
        elements.current
          .get(pages[request.index]?.id ?? '')
          ?.querySelector<HTMLElement>('h2')
          ?.focus();
      notify({
        channel: engineChannel,
        type: 'settled',
        id: request.id,
        snapshot: position,
      });
    };
    // Instant jumps update the model before the next engine paint makes their DOM visible.
    if (request.focus) requestAnimationFrame(complete);
    else complete();
  }, [notify, pages, synchronize, annotateVisibleNotes]);

  useEffect(() => {
    const execute = (command: EngineCommand) => {
      const engine = book.current?.pageFlip();
      if (!engine) return;
      if (engine.getState() !== 'read') {
        waiting.current = command;
        return;
      }
      pending.current = command;
      const current = snapshot();
      if (!command.animate || current?.visible.includes(command.index)) {
        engine.turnToPage(command.index);
        settle();
      } else {
        engine.getSettings().flippingTime = command.burst ? 280 : 520;
        engine.flip(command.index, 'bottom');
      }
    };
    dispatch.current = execute;
    const listener = (
      event: MessageEvent<EngineCommand | EngineAuxiliaryCommand>,
    ) => {
      if (event.origin !== location.origin || event.source !== parent) return;
      const command = event.data;
      if (command?.channel !== engineChannel) return;
      if (command.type === 'focus') {
        requestAnimationFrame(() => {
          const visible = Array.from(elements.current.values()).filter(
            (node) => !node.inert,
          );
          const headings = visible.flatMap((node) =>
            Array.from(node.querySelectorAll<HTMLElement>('h1,h2,h3,h4,h5,h6')),
          );
          const heading =
            headings.find(
              (node) => node.textContent?.trim() === command.heading,
            ) ?? headings[0];
          heading?.setAttribute('tabindex', '-1');
          heading?.focus({ preventScroll: true });
        });
        return;
      }
      if (command.type === 'peek') {
        document.documentElement.classList.toggle(
          'bookmark-peek',
          command.enabled,
        );
        document.documentElement.style.setProperty(
          '--peek-top',
          command.top + 'px',
        );
        document.documentElement.style.setProperty(
          '--peek-bottom',
          command.bottom + 'px',
        );
        return;
      }
      if (command.type === 'interaction') {
        inputLocked.current = command.locked;
        // A locked state marks the start of a multi-page section jump.
        if (command.locked) {
          burstActive.current = true;
          notify({ channel: engineChannel, type: 'sound', kind: 'burst' });
        } else {
          burstActive.current = false;
        }
        return;
      }
      if (command.type !== 'turn') return;
      const engine = book.current?.pageFlip();
      if (
        !engine ||
        pending.current ||
        !Number.isInteger(command.index) ||
        command.index < 0 ||
        command.index >= pages.length
      )
        return;
      execute(command);
    };
    window.addEventListener('message', listener);
    const observer = new MutationObserver(() => synchronize());
    observer.observe(document.getElementById('engine-root')!, {
      childList: true,
      subtree: true,
    });
    return () => {
      window.removeEventListener('message', listener);
      observer.disconnect();
      dispatch.current = null;
      waiting.current = null;
    };
  }, [pages.length, settle, snapshot, synchronize, notify]);

  const isLocked = useCallback(
    () =>
      inputLocked.current ||
      pending.current !== null ||
      waiting.current !== null,
    [],
  );
  usePaperGestures(
    book,
    pages.length,
    configuration.reducedMotion,
    settle,
    isLocked,
  );
  useEffect(() => {
    const click = (event: MouseEvent) => {
      const link =
        event.target instanceof Element ? event.target.closest('a') : null;
      const href = link?.getAttribute('href');
      if (
        !href ||
        !/^\/(profile|analyses(?:\/[a-z-]+)?|favorite|learning|reflection)(?:[?#]|$)/u.test(
          href,
        ) ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey ||
        event.button !== 0
      )
        return;
      event.preventDefault();
      notify({ channel: engineChannel, type: 'navigate', href });
    };
    const key = (event: KeyboardEvent) => {
      if (
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        event.shiftKey ||
        isLocked() ||
        (event.target instanceof Element &&
          event.target.closest('input,textarea,select,[contenteditable]'))
      )
        return;
      const direction = ['ArrowRight', 'PageDown'].includes(event.key)
        ? 1
        : ['ArrowLeft', 'PageUp'].includes(event.key)
          ? -1
          : 0;
      const engine = book.current?.pageFlip();
      if (!direction || !engine || engine.getState() !== 'read') return;
      event.preventDefault();
      const index = engine.getCurrentPageIndex();
      const target = Math.max(
        1,
        Math.min(
          pages.length - 1,
          index + direction * (engine.getOrientation() === 'landscape' ? 2 : 1),
        ),
      );
      if (configuration.reducedMotion) {
        engine.turnToPage(target);
        settle();
      } else engine.flip(target, 'bottom');
    };
    document.addEventListener('click', click);
    document.addEventListener('keydown', key);
    return () => {
      document.removeEventListener('click', click);
      document.removeEventListener('keydown', key);
    };
  }, [notify, isLocked, pages.length, configuration.reducedMotion, settle]);

  const register = useCallback((id: string, element: HTMLDivElement | null) => {
    if (element) elements.current.set(id, element);
    else elements.current.delete(id);
  }, []);

  return {
    book,
    register,
    synchronize,
    notify,
    settle,
    annotateVisibleNotes,
    flipStarted,
  };
}

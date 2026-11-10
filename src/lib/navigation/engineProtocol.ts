import type { ContentImage } from '../content/types';

export const engineChannel = 'great-books-page-engine-v1';

export interface PageGeometry {
  width: number;
  height: number;
  fontSize: number;
  lineHeight: number;
  padding: number;
  spread: boolean;
  paddingTop?: number;
  paddingBottom?: number;
}

export interface PortraitSpec {
  src?: string;
  alt: string;
  caption: string;
  credit?: string;
  placeholder?: boolean;
  variant?: 'portrait' | 'cover';
  width?: number;
  height?: number;
}

export interface OpeningMetadata {
  layoutKey: string;
  label: string;
  detail?: string;
  portrait?: PortraitSpec;
}

export interface ReadingLeaf {
  id: string;
  title: string;
  markdown: string;
  anchor: string;
  workId?: string;
  hard?: boolean;
  ranges?: { blockId: string; anchor: string; from: number; to: number }[];
  images?: readonly ContentImage[];
  opening?: OpeningMetadata;
  material?: 'ruled';
}

export interface EngineConfiguration {
  revision: string;
  geometry: PageGeometry;
  pages: ReadingLeaf[];
  startIndex: number;
  reducedMotion: boolean;
}

export interface EngineSnapshot {
  index: number;
  visible: number[];
  mode: 'portrait' | 'landscape';
  state: string;
  revision: string;
}

export interface EngineCommand {
  channel: typeof engineChannel;
  type: 'turn';
  id: number;
  index: number;
  animate: boolean;
  focus: boolean;
  burst?: boolean;
}

export type EngineAuxiliaryCommand =
  | {
      channel: typeof engineChannel;
      type: 'peek';
      enabled: boolean;
      top: number;
      bottom: number;
    }
  | { channel: typeof engineChannel; type: 'interaction'; locked: boolean }
  | { channel: typeof engineChannel; type: 'focus'; heading: string };

export interface ZoomImage {
  src: string;
  alt: string;
  caption: string;
  credit?: string;
}

export type EngineResponse =
  | { channel: typeof engineChannel; type: 'navigate'; href: string }
  | { channel: typeof engineChannel; type: 'zoom'; image: ZoomImage }
  | {
      channel: typeof engineChannel;
      type: 'ready' | 'position';
      snapshot: EngineSnapshot;
    }
  | {
      channel: typeof engineChannel;
      type: 'settled';
      id: number;
      snapshot: EngineSnapshot;
    }
  | { channel: typeof engineChannel; type: 'state'; state: string }
  | { channel: typeof engineChannel; type: 'error'; message: string };

export interface FlipAdapterHandle {
  focusHeading: (heading: string) => void;
  peek: (range: { top: number; bottom: number } | null) => void;
  lockInput: (locked: boolean) => void;
  turn: (
    index: number,
    options?: { animate?: boolean; focus?: boolean; burst?: boolean },
  ) => Promise<EngineSnapshot>;
}

export interface PageFlipApi {
  startUserTouch: (point: { x: number; y: number }) => void;
  userMove: (point: { x: number; y: number }, isTouch: boolean) => void;
  userStop: (point: { x: number; y: number }, isSwipe?: boolean) => void;
  flip: (index: number, corner?: string) => void;
  turnToPage: (index: number) => void;
  getCurrentPageIndex: () => number;
  getOrientation: () => 'portrait' | 'landscape';
  getState: () => string;
  getSettings: () => { flippingTime: number };
}

export function visibleIndexes(
  index: number,
  count: number,
  spread: boolean,
): number[] {
  return spread && index > 0 && index < count - 1
    ? [index, index + 1]
    : [index];
}

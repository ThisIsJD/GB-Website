import type { CSSProperties } from 'react';
import type { PageGeometry } from '../navigation/engineProtocol';

export function pageGeometry(availableWidth: number): PageGeometry {
  const width = Math.max(240, Math.floor(availableWidth));
  const spread = width >= 680;
  const leafWidth = Math.min(440, Math.floor(width / (spread ? 2 : 1)));
  const compact = leafWidth < 340;
  return {
    width: leafWidth,
    height: 620,
    fontSize: compact ? 19 : 20,
    lineHeight: compact ? 32 : 34,
    padding: compact ? 20 : 32,
    spread,
  };
}

export function geometryVariables(
  geometry: PageGeometry,
): CSSProperties & Record<`--${string}`, string> {
  return {
    '--leaf-font': `${geometry.fontSize}px`,
    '--leaf-line': `${geometry.lineHeight}px`,
    '--leaf-padding': `${geometry.padding}px`,
    '--leaf-top': `${geometry.paddingTop ?? 28}px`,
    '--leaf-bottom': `${geometry.paddingBottom ?? 16}px`,
  };
}

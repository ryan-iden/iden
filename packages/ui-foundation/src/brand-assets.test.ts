// @vitest-environment jsdom
import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

// Original iden artwork, not a redraw. Theme variants may only change its fill and outer plate.
const originalPath =
  'M86.11 26.43h-7.86a3.57 3.57 0 0 0-3.57 3.57v16.94a3.57 3.57 0 0 0 3.57 3.57h3.73c17.99 0 32.57 13.2 32.57 29.49s-14.58 29.49-32.57 29.49h-3.73a3.57 3.57 0 0 0-3.57 3.57V130a3.57 3.57 0 0 0 3.57 3.57h8.45c28.49 0 51.79-22.24 53.47-50.31 1.86-30.9-23.1-56.83-54.06-56.83Z';

const readSource = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');

describe('original iden logo geometry', () => {
  it.each([
    '../assets/mark.svg',
    '../assets/mark-light.svg',
    '../assets/mark-dark.svg',
    '../assets/lockup-light.svg',
    '../assets/lockup-dark.svg',
    '../assets/app-icon.svg',
    '../../toolkit/core-kit/assets/iden-mark.svg',
    '../../toolkit/core-kit/assets/iden-app-icon.svg',
  ])('preserves the original glyph in %s', (asset) => {
    const source = readSource(asset);
    const svg = new DOMParser().parseFromString(source, 'image/svg+xml');
    expect(svg.querySelector('parsererror')).toBeNull();
    expect(Array.from(svg.querySelectorAll('path'), (path) => path.getAttribute('d'))).toEqual([
      originalPath,
    ]);
    expect(
      Array.from(svg.querySelectorAll('rect[x]'), (rect) =>
        ['x', 'y', 'width', 'height', 'rx'].map((attribute) => rect.getAttribute(attribute))
      )
    ).toEqual([
      ['27.6', '59.68', '25.71', '73.89', '3.57'],
      ['27.6', '26.43', '25.71', '24.08', '3.57'],
    ]);
  });

  it('uses the original glyph inside the decorative authentication orbit', () => {
    const source = readSource('./react.tsx');
    expect(source).toContain(originalPath);
    expect(source).toContain('viewBox="20 20 124 120"');
  });
});

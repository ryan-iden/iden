// @vitest-environment jsdom
import { gsap } from 'gsap';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createSurfaceMotion, installInteractionMotion, motionPresets } from './motion.js';

const mediaPreference = (allowsMotion: boolean) => {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: query.includes('no-preference') && allowsMotion,
    media: query,
    addListener: vi.fn(),
    removeListener: vi.fn(),
  }));
};

afterEach(() => {
  document.body.replaceChildren();
  gsap.globalTimeline.clear();
  vi.unstubAllGlobals();
});

describe('surface motion', () => {
  it('leaves content and controls untouched with reduced motion', () => {
    mediaPreference(false);
    const button = document.createElement('button');
    Reflect.set(button.dataset, 'idenPress', '');
    document.body.append(button);
    const stopPage = createSurfaceMotion(button);
    const stopControls = installInteractionMotion(document.body);
    button.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, button: 0 }));
    expect(button.getAttribute('style')).toBeNull();
    stopPage();
    stopControls();
  });

  it('limits entrance to six items and restores preexisting styles on cleanup', () => {
    mediaPreference(true);
    const root = document.createElement('section');
    const items = Array.from({ length: 12 }, () => {
      const item = document.createElement('div');
      Reflect.set(item.dataset, 'idenReveal', '');
      item.style.setProperty('opacity', '0.8');
      root.append(item);
      return item;
    });
    document.body.append(root);
    const dispose = createSurfaceMotion(root);
    expect(items[0]?.style.transform).toContain('translate');
    expect(items[6]?.style.transform).toBe('');
    expect(motionPresets.page.duration + 0.06).toBeLessThanOrEqual(0.35);
    dispose();
    expect(items.every((item) => item.style.transform === '' && item.style.opacity === '0.8')).toBe(
      true
    );
  });

  it('ignores disabled controls and removes delegated handlers on unmount', () => {
    mediaPreference(true);
    const enabled = document.createElement('button');
    Reflect.set(enabled.dataset, 'idenPress', '');
    const disabled = document.createElement('button');
    Reflect.set(disabled.dataset, 'idenPress', '');
    disabled.setAttribute('disabled', '');
    document.body.append(enabled, disabled);
    const dispose = installInteractionMotion(document.body);
    const tween = vi.spyOn(gsap, 'to');
    disabled.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
    expect(tween).not.toHaveBeenCalled();
    enabled.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
    expect(tween).toHaveBeenCalledTimes(1);
    window.dispatchEvent(new Event('blur'));
    expect(tween).toHaveBeenCalledTimes(2);
    dispose();
    enabled.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
    expect(tween).toHaveBeenCalledTimes(2);
    tween.mockRestore();
  });
});

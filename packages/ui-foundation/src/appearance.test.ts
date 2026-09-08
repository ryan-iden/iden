// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  readParentAppearance,
  synchronizeAppearance,
  getWorkspaceTheme,
  persistWorkspaceAppearance,
  observeWorkspaceAppearance,
} from './appearance.js';

const send = (origin: string, theme: string) =>
  window.dispatchEvent(
    new MessageEvent('message', {
      origin,
      source: window.parent,
      data: { type: 'iden:appearance', theme },
    })
  );

describe('workspace appearance', () => {
  afterEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
  });
  it('shares explicit preferences, follows system on reset, and removes listeners', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    expect(getWorkspaceTheme()).toBe('dark');
    const listener = vi.fn();
    const dispose = observeWorkspaceAppearance(listener);
    persistWorkspaceAppearance('light');
    expect(getWorkspaceTheme()).toBe('light');
    expect(listener).toHaveBeenCalledTimes(1);
    persistWorkspaceAppearance('system');
    expect(getWorkspaceTheme()).toBe('dark');
    dispose();
    persistWorkspaceAppearance('dark');
    expect(listener).toHaveBeenCalledTimes(2);
  });
  it('applies a theme locally without changing custom component styles', () => {
    document.body.style.setProperty('--color-brand-default', '#123456');
    synchronizeAppearance('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(document.body.style.getPropertyValue('--color-brand-default')).toBe('#123456');
  });

  it('accepts only same-origin parent appearance messages and cleans up', () => {
    const apply = vi.fn();
    const dispose = readParentAppearance(apply);
    send('https://untrusted.example', 'dark');
    send(window.location.origin, 'invalid');
    expect(apply).not.toHaveBeenCalled();
    send(window.location.origin, 'light');
    expect(apply).toHaveBeenCalledWith('light');
    dispose();
    send(window.location.origin, 'dark');
    expect(apply).toHaveBeenCalledTimes(1);
  });
});

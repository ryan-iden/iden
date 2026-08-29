import { describe, expect, it } from 'vitest';

import { resolveDefaultAvatarSeed } from './avatar.js';

describe('resolveDefaultAvatarSeed', () => {
  it('uses the first non-empty stable identity value', () => {
    expect(resolveDefaultAvatarSeed(undefined, '  ', ' user-123 ', 'user@example.com')).toBe(
      'user-123'
    );
  });

  it('falls back to a stable anonymous seed', () => {
    expect(resolveDefaultAvatarSeed(undefined, '')).toBe('iden-user');
  });
});

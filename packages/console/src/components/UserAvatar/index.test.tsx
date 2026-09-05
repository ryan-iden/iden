import { render, screen } from '@testing-library/react';
import { type ImgHTMLAttributes, type ReactNode } from 'react';

import UserAvatar from '.';

jest.mock('@/consts/env', () => ({ isCloud: false }));
jest.mock('@/ds-components/ImageWithErrorFallback', () => ({
  __esModule: true,
  default: ({
    alt = '',
    fallbackElement: _fallbackElement,
    ...props
  }: ImgHTMLAttributes<HTMLImageElement> & { readonly fallbackElement: ReactNode }) => (
    <img {...props} alt={alt} />
  ),
}));
jest.mock('@/ds-components/Tip', () => ({
  Tooltip: ({ children }: { readonly children: ReactNode }) => children,
}));

describe('UserAvatar', () => {
  it('uses a local generated avatar when the user has no custom avatar', () => {
    render(<UserAvatar user={{ id: 'user-123', primaryEmail: 'user@example.com' }} />);

    expect(screen.getByAltText('interface.avatar').getAttribute('src')).toMatch(
      /^data:image\/svg\+xml/
    );
  });

  it('keeps a custom avatar as the first choice', () => {
    render(<UserAvatar user={{ id: 'user-123', avatar: 'https://example.com/avatar.png' }} />);

    expect(screen.getByAltText('interface.avatar').getAttribute('src')).toBe(
      'https://example.com/avatar.png'
    );
  });
});

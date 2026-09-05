import { render } from '@testing-library/react';
import { type ImgHTMLAttributes, type ReactNode } from 'react';

import UserAvatar from '../UserAvatar';

import UserInfoCard from '.';

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

describe('UserInfoCard', () => {
  it('keeps the generated avatar consistent with other surfaces for the same user', () => {
    const user = {
      id: 'user-123',
      name: 'Ryan',
      username: 'ryan',
      primaryEmail: 'ryan@example.com',
    };
    const { container } = render(
      <>
        <UserAvatar user={user} />
        <UserInfoCard user={user} />
      </>
    );
    const avatarSources = [
      ...container.querySelectorAll<HTMLImageElement>('img[alt="interface.avatar"]'),
    ].map(({ src }) => src);

    expect(avatarSources).toHaveLength(2);
    expect(avatarSources[0]).toBe(avatarSources[1]);
  });
});

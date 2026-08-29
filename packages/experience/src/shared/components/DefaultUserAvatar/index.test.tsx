import { render } from '@testing-library/react';

import DefaultUserAvatar from '.';

describe('DefaultUserAvatar', () => {
  it('renders a deterministic local Blobatar for each seed', () => {
    const { container, rerender } = render(
      <DefaultUserAvatar className="avatar" seed="user-123" />
    );
    const firstSource = container.querySelector('img')?.getAttribute('src');

    expect(firstSource).toMatch(/^data:image\/svg\+xml/);

    rerender(<DefaultUserAvatar className="avatar" seed="user-123" />);
    expect(container.querySelector('img')?.getAttribute('src')).toBe(firstSource);

    rerender(<DefaultUserAvatar className="avatar" seed="user-456" />);
    expect(container.querySelector('img')?.getAttribute('src')).not.toBe(firstSource);
  });
});

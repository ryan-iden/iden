import { render } from '@testing-library/react';

import OrganizationAvatar from './OrganizationAvatar';

jest.mock('@blobatar/react', () => ({
  Blobatar: ({ name }: { readonly name: string }) => (
    <div data-name={name} data-testid="blobatar" />
  ),
}));

describe('OrganizationAvatar', () => {
  it('renders the uploaded organization avatar when available', () => {
    const { container, queryByTestId } = render(
      <OrganizationAvatar seed="organization-id" size={52} src="https://example.com/avatar.png" />
    );
    const image = container.querySelector('img');

    expect(image?.getAttribute('src')).toBe('https://example.com/avatar.png');
    expect(image?.getAttribute('width')).toBe('52');
    expect(image?.getAttribute('height')).toBe('52');
    expect(queryByTestId('blobatar')).toBeNull();
  });

  it('keeps the deterministic organization Blobatar as the fallback', () => {
    const { container, getByTestId } = render(<OrganizationAvatar seed="organization-id" />);

    expect(getByTestId('blobatar').dataset.name).toBe('organization:organization-id');
    expect(container.querySelector('img')).toBeNull();
  });
});

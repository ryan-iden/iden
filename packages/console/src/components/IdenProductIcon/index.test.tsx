import { Theme } from '@logto/schemas';
import { render } from '@testing-library/react';

import useTheme from '@/hooks/use-theme';

import { IdenProductIcon } from '.';

jest.mock('@/assets/images/iden-product-icons/management-api.png', () => 'management-light');
jest.mock('@/assets/images/iden-product-icons/management-api-dark.png', () => 'management-dark');
jest.mock('@/hooks/use-theme', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockedUseTheme = jest.mocked(useTheme);

describe('IdenProductIcon', () => {
  it.each([
    [Theme.Light, 'management-light'],
    [Theme.Dark, 'management-dark'],
  ])('uses the dedicated %s theme asset', (theme, expectedSource) => {
    mockedUseTheme.mockReturnValue(theme);

    const { container } = render(<IdenProductIcon name="managementApi" />);

    expect(container.querySelector('img')?.getAttribute('src')).toBe(expectedSource);
  });
});

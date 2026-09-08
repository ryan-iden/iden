import { Theme } from '@logto/schemas';
import { render } from '@testing-library/react';

import useTheme from '@/hooks/use-theme';

import { IdenProductIcon } from '.';

jest.mock('@iden/ui-foundation/assets/management-api.svg?url', () => 'management-light');
jest.mock('@iden/ui-foundation/assets/management-api-dark.svg?url', () => 'management-dark');
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
    expect(container.querySelector('img')?.getAttribute('style')).toBe(
      'width: 40px; height: 40px;'
    );
  });

  it('lets a layout class control dimensions when no explicit size is provided', () => {
    mockedUseTheme.mockReturnValue(Theme.Light);

    const { container } = render(
      <IdenProductIcon className="layout-controlled" name="managementApi" />
    );

    expect(container.querySelector('img')?.getAttribute('style')).toBeNull();
  });
});

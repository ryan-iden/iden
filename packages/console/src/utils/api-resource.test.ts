import { getApiResourceDisplayName } from './api-resource';

jest.mock('@/consts/brand', () => ({
  brandProfile: { productName: 'iden' },
  isIdenBrand: true,
}));

describe('getApiResourceDisplayName', () => {
  it('uses the active self-hosted brand for the built-in Management API', () => {
    expect(getApiResourceDisplayName('Logto Management API', 'https://default.logto.app/api')).toBe(
      'iden Management API'
    );
  });

  it('does not rename custom API resources', () => {
    expect(getApiResourceDisplayName('Orders API', 'https://api.example.com/orders')).toBe(
      'Orders API'
    );
  });
});

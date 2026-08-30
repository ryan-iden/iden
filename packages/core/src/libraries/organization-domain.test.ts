import {
  hasOrganizationDomainTxtValue,
  normalizeOrganizationDomain,
  organizationDomainTxtHost,
} from './organization-domain.js';

describe('organization domain helpers', () => {
  it.each([
    [' Example.COM. ', 'example.com'],
    ['bücher.example', 'xn--bcher-kva.example'],
  ])('normalizes %s', (input, expected) => {
    expect(normalizeOrganizationDomain(input)).toBe(expected);
  });

  it.each(['https://example.com', '127.0.0.1', '-bad.example', 'bad_.example'])(
    'rejects %s',
    (input) => {
      expect(() => normalizeOrganizationDomain(input)).toThrow();
    }
  );

  it('builds and verifies the iden TXT challenge', () => {
    expect(organizationDomainTxtHost('example.com')).toBe('_iden-organization.example.com');
    expect(hasOrganizationDomainTxtValue([['iden-org-verification=', 'secret']], 'secret')).toBe(
      true
    );
  });
});

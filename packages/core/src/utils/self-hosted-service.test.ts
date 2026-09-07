import {
  isSelfHostedServiceTokenValid,
  resolveSelfHostedServiceTenantId,
} from './self-hosted-service.js';

describe('self-hosted internal service authentication', () => {
  it('accepts an exact non-empty service token', () => {
    expect(isSelfHostedServiceTokenValid('shared-secret', 'shared-secret')).toBe(true);
  });

  it.each([undefined, '', 'wrong-secret', ['shared-secret']])(
    'rejects an invalid service token: %p',
    (token) => {
      expect(isSelfHostedServiceTokenValid(token, 'shared-secret')).toBe(false);
    }
  );

  it('rejects an empty configured secret', () => {
    expect(isSelfHostedServiceTokenValid('', '')).toBe(false);
  });

  it('selects the requested tenant only for an enabled, authenticated internal request', () => {
    expect(
      resolveSelfHostedServiceTenantId({
        isEnabled: true,
        expectedToken: 'shared-secret',
        token: 'shared-secret',
        tenantId: 'tenant-a',
      })
    ).toBe('tenant-a');
  });

  it.each([
    { isEnabled: false, token: 'shared-secret', tenantId: 'tenant-a' },
    { isEnabled: true, token: 'wrong-secret', tenantId: 'tenant-a' },
    { isEnabled: true, token: 'shared-secret', tenantId: '' },
    { isEnabled: true, token: 'shared-secret', tenantId: ['tenant-a'] },
  ])('does not select a tenant for untrusted input: %p', (input) => {
    expect(
      resolveSelfHostedServiceTenantId({ expectedToken: 'shared-secret', ...input })
    ).toBeUndefined();
  });
});

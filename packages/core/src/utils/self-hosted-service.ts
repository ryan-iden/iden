import { timingSafeEqual } from 'node:crypto';

type ResolveSelfHostedServiceTenantIdOptions = {
  readonly isEnabled: boolean;
  readonly expectedToken: string;
  readonly token: string | string[] | undefined;
  readonly tenantId: string | string[] | undefined;
};

/** Compare an internal service credential without leaking partial-match timing information. */
export const isSelfHostedServiceTokenValid = (
  token: string | string[] | undefined,
  expectedToken: string
) =>
  typeof token === 'string' &&
  token.length > 0 &&
  expectedToken.length > 0 &&
  token.length === expectedToken.length &&
  timingSafeEqual(Buffer.from(token), Buffer.from(expectedToken));

/**
 * Resolve the tenant selected by a trusted, server-to-server self-hosted request.
 *
 * Public requests must continue through normal host/path tenant resolution. Both headers are
 * required here so an untrusted caller cannot select another tenant by supplying only an ID.
 */
export const resolveSelfHostedServiceTenantId = ({
  isEnabled,
  expectedToken,
  token,
  tenantId,
}: ResolveSelfHostedServiceTenantIdOptions) => {
  if (
    !isEnabled ||
    typeof tenantId !== 'string' ||
    tenantId.length === 0 ||
    !isSelfHostedServiceTokenValid(token, expectedToken)
  ) {
    return;
  }

  return tenantId;
};

import { isIP } from 'node:net';
import { domainToASCII } from 'node:url';

const domainLabelPattern = /^[\da-z](?:[\da-z-]{0,61}[\da-z])?$/;

export const normalizeOrganizationDomain = (input: string): string => {
  const value = input.trim().replace(/\.$/, '').toLowerCase();
  const ascii = domainToASCII(value);

  if (
    !ascii ||
    ascii.length > 253 ||
    isIP(ascii) !== 0 ||
    ascii.includes('/') ||
    ascii.split('.').some((label) => !domainLabelPattern.test(label))
  ) {
    throw new TypeError('Invalid organization email domain.');
  }

  return ascii;
};

export const organizationDomainTxtHost = (domain: string) => `_iden-organization.${domain}`;

export const hasOrganizationDomainTxtValue = (
  records: ReadonlyArray<readonly string[]>,
  verificationValue: string
) => records.some((parts) => parts.join('') === `iden-org-verification=${verificationValue}`);

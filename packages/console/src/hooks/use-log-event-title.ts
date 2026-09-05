import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import useInterfaceTranslation from './use-interface-translation';

/** Event identifiers remain unchanged in requests and details; labels follow the active locale. */
export default function useLogEventTitle() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { t: experience } = useTranslation('experience');
  const { t: ui } = useInterfaceTranslation();
  const parts = useMemo<Record<string, string>>(
    () => ({
      ExchangeTokenBy: t('application_details.token_exchange'),
      AuthorizationCode: t('applications.authorization_flow.authorization_code.title'),
      ClientCredentials: ui('client_credentials'),
      RefreshToken: t('application_details.refresh_token_settings'),
      TokenExchange: t('application_details.token_exchange'),
      Interaction: t('webhooks.schemas.interaction'),
      Create: t('general.create'),
      Created: t('general.create'),
      End: t('general.done'),
      Update: t('general.edit'),
      Updated: t('general.edit'),
      Submit: t('general.submit'),
      Delete: t('general.delete'),
      Deleted: t('general.delete'),
      Add: t('general.add'),
      Remove: t('general.remove'),
      Assign: experience('account_center.organizations.roles.assign'),
      Unassign: t('general.remove'),
      Accept: experience('account_center.organizations.accept'),
      Decline: experience('account_center.organizations.decline'),
      Revoke: experience('account_center.organizations.invitations.revoke'),
      Used: ui('used'),
      Captcha: t('security.tabs.captcha'),
      ForgotPassword: t('sign_in_exp.sign_up_and_sign_in.sign_in.forgot_password'),
      Register: t('sign_in_exp.sign_up_and_sign_in.sign_up.title'),
      SignIn: experience('action.sign_in'),
      Profile: t('user_details.field_profile'),
      Identifier: ui('identifier'),
      Verification: ui('verification'),
      BackupCode: experience('mfa.backup_code'),
      Totp: t('mfa.totp'),
      WebAuthn: experience('mfa.webauthn'),
      SignInPasskey: experience('mfa.webauthn'),
      EmailVerificationCode: experience('mfa.email_verification_code'),
      PhoneVerificationCode: experience('mfa.phone_verification_code'),
      EnterpriseSso: t('enterprise_sso.title'),
      Social: experience('account_center.security.social_sign_in'),
      NewPasswordIdentity: experience('account_center.password.title'),
      Password: ui('password'),
      IdpInitiatedSso: t('enterprise_sso_details.tab_idp_initiated_auth'),
      JwtCustomizer: t('jwt_claims.title'),
      AccessToken: t('jwt_claims.access_token.card_title'),
      SamlApplication: t('applications.type.saml.title'),
      AuthnRequest: ui('authentication_request'),
      Callback: ui('callback'),
      Action: t('actions.title'),
      PostFirstFactorVerification: t('actions.types.post_first_factor_verification.name'),
      PostSignIn: t('actions.types.post_sign_in.name'),
      PostRegister: t('sign_in_exp.sign_up_and_sign_in.sign_up.title'),
      PostResetPassword: experience('description.reset_password'),
      PostSignInAdaptiveMfaTriggered: `${experience('action.sign_in')} · ${t('mfa.title')}`,
      TrustedDevice: t('webhooks.schemas.trusted_device'),
      Organization: ui('organizations'),
      Owner: experience('account_center.organizations.owner'),
      Member: experience('account_center.organizations.tabs.members'),
      Membership: experience('account_center.organizations.tabs.members'),
      ManagementRole: experience('account_center.organizations.tabs.roles'),
      OrganizationManagementRole: experience('account_center.organizations.tabs.roles'),
      BusinessRole: experience('account_center.organizations.members.business_roles'),
      OrganizationRole: t('webhooks.schemas.organization_role'),
      OrganizationScope: t('webhooks.schemas.organization_scope'),
      Invitation: experience('account_center.organizations.tabs.invitations'),
      OrganizationInvitation: experience('account_center.organizations.tabs.invitations'),
      Branding: experience('account_center.organizations.tabs.branding'),
      Security: ui('security'),
      Jit: experience('account_center.organizations.tabs.jit'),
      Domain: experience('account_center.organizations.jit.domain'),
      Application: t('logs.application'),
      TriggerHook: t('webhooks.title'),
      User: t('webhooks.schemas.user'),
      Role: t('webhooks.schemas.role'),
      Scope: ui('permissions'),
      Scopes: ui('permissions'),
      Data: ui('data'),
      Configuration: ui('configuration'),
      Status: ui('status'),
      SuspensionStatus: t('user_details.suspended'),
      Lockout: t('security.sentinel_policy.card_title'),
      Message: ui('messages'),
      RateLimited: ui('rate_limited'),
      Grant: ui('authorization'),
      LimitExceeded: ui('limit_exceeded'),
    }),
    [t, experience, ui]
  );
  return (key: string) => {
    const labels = key
      .split('.')
      .map((part) => (Object.hasOwn(parts, part) ? parts[part] : undefined));
    return labels.length > 0 && labels.every(Boolean)
      ? labels.join(' · ')
      : experience('account_center.organizations.activity.events.unknown');
  };
}

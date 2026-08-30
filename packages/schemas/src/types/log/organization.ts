export type Prefix = 'Organization';

export const prefix: Prefix = 'Organization';

export enum Type {
  Create = 'Create',
  Delete = 'Delete',
  ProfileUpdate = 'Profile.Update',
  BrandingUpdate = 'Branding.Update',
  MemberAdd = 'Member.Add',
  MemberRemove = 'Member.Remove',
  BusinessRoleUpdate = 'BusinessRole.Update',
  OwnerAssign = 'Owner.Assign',
  OwnerRemove = 'Owner.Remove',
  ManagementRoleCreate = 'ManagementRole.Create',
  ManagementRoleUpdate = 'ManagementRole.Update',
  ManagementRoleDelete = 'ManagementRole.Delete',
  ManagementRoleAssign = 'ManagementRole.Assign',
  ManagementRoleUnassign = 'ManagementRole.Unassign',
  InvitationCreate = 'Invitation.Create',
  InvitationAccept = 'Invitation.Accept',
  InvitationDecline = 'Invitation.Decline',
  InvitationRevoke = 'Invitation.Revoke',
  SecurityUpdate = 'Security.Update',
  JitUpdate = 'Jit.Update',
  DomainVerification = 'Domain.Verification',
  ApplicationUpdate = 'Application.Update',
}

export type LogKey = `${Prefix}.${Type}`;

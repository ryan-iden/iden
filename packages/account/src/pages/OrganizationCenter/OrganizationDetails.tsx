/* eslint-disable max-lines -- Organization modules remain co-located while sharing one loaded organization context. */
import DefaultUserAvatar from '@experience/shared/components/DefaultUserAvatar';
import { resolveDefaultAvatarSeed } from '@logto/core-kit';
import {
  OrganizationManagementPermission,
  OrganizationManagementRoleType,
  organizationManagementPermissions,
  type OrganizationCenterMember,
  type OrganizationCenterOrganization,
} from '@logto/schemas';
import {
  Activity,
  AppWindow,
  ArrowLeft,
  Check,
  MailPlus,
  Palette,
  Save,
  ShieldCheck,
  Trash2,
  UserRoundCog,
  Users,
} from 'lucide-react';
import { type CSSProperties, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import {
  createJitEmailDomainVerification,
  createOrganizationInvitation,
  createOrganizationManagementRole,
  assignOrganizationManagementRole,
  deleteJitEmailDomain,
  deleteOrganization,
  getAvailableOrganizationResources,
  getJitEmailDomains,
  getOrganization,
  listOrganizationActivity,
  listOrganizationInvitations,
  listOrganizationManagementRoles,
  listOrganizationMembers,
  removeOrganizationMember,
  replaceJitOrganizationRoles,
  replaceMemberOrganizationRoles,
  replaceOrganizationApplications,
  replaceOrganizationSsoConnectors,
  resendOrganizationInvitation,
  unassignOrganizationManagementRole,
  revokeOrganizationInvitation,
  updateOrganization,
  verifyJitEmailDomain,
} from '@ac/apis/organizations';
import VerificationMethodList from '@ac/components/VerificationMethodList';
import { organizationsRoute, getOrganizationRoute } from '@ac/constants/routes';
import useApi from '@ac/hooks/use-api';

import OrganizationAvatar from './OrganizationAvatar';
import styles from './index.module.scss';

type Props = {
  readonly organizationId: string;
  readonly section: string;
};

type AvailableResourcesState = Awaited<ReturnType<typeof getAvailableOrganizationResources>>;

type SectionKey =
  | 'overview'
  | 'members'
  | 'invitations'
  | 'roles'
  | 'branding'
  | 'security'
  | 'jit'
  | 'applications'
  | 'activity'
  | 'deletion';

const sectionMeta = [
  { key: 'overview', icon: AppWindow, module: 'profile' },
  {
    key: 'members',
    icon: Users,
    module: 'members',
    permission: OrganizationManagementPermission.ViewMembers,
  },
  {
    key: 'invitations',
    icon: MailPlus,
    module: 'invitations',
    permission: OrganizationManagementPermission.ManageInvitations,
  },
  {
    key: 'roles',
    icon: UserRoundCog,
    module: 'managementRoles',
    permission: OrganizationManagementPermission.ManageManagementRoles,
  },
  {
    key: 'branding',
    icon: Palette,
    module: 'branding',
    permission: OrganizationManagementPermission.ManageBranding,
  },
  {
    key: 'security',
    icon: ShieldCheck,
    module: 'security',
    permission: OrganizationManagementPermission.ManageSecurity,
  },
  {
    key: 'jit',
    icon: Check,
    module: 'jit',
    permission: OrganizationManagementPermission.ManageJit,
  },
  {
    key: 'applications',
    icon: AppWindow,
    module: 'applications',
  },
  {
    key: 'activity',
    icon: Activity,
    module: 'activity',
    permission: OrganizationManagementPermission.ViewActivity,
  },
  { key: 'deletion', icon: Trash2, module: 'deletion' },
] as const;

// eslint-disable-next-line complexity -- This route shell composes all permission-gated organization modules.
const OrganizationDetails = ({ organizationId, section }: Props) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { accountCenterSettings, verificationId, setToast } = useContext(PageContext);
  const [organization, setOrganization] = useState<OrganizationCenterOrganization>();
  const [error, setError] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [invitee, setInvitee] = useState('');
  const [inviteBusinessRoleIds, setInviteBusinessRoleIds] = useState<string[]>([]);
  const [inviteManagementRoleIds, setInviteManagementRoleIds] = useState<string[]>([]);
  const [roleName, setRoleName] = useState('');
  const [rolePermissions, setRolePermissions] = useState<OrganizationManagementPermission[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [businessRoleMemberId, setBusinessRoleMemberId] = useState('');
  const [businessRoleIds, setBusinessRoleIds] = useState<string[]>([]);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [requiresVerification, setRequiresVerification] = useState(false);
  const [domain, setDomain] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#5B5CF6');
  const [customCss, setCustomCss] = useState('');
  const [isMfaRequired, setIsMfaRequired] = useState(false);
  const [members, setMembers] = useState<Awaited<ReturnType<typeof listOrganizationMembers>>>();
  const [invitations, setInvitations] =
    useState<Awaited<ReturnType<typeof listOrganizationInvitations>>>();
  const [roles, setRoles] = useState<Awaited<ReturnType<typeof listOrganizationManagementRoles>>>();
  const [activity, setActivity] = useState<Awaited<ReturnType<typeof listOrganizationActivity>>>();
  const [resources, setResources] =
    useState<Awaited<ReturnType<typeof getAvailableOrganizationResources>>>();
  const [jit, setJit] = useState<Awaited<ReturnType<typeof getJitEmailDomains>>>();

  const getOrganizationRequest = useApi(getOrganization, { silent: true });
  const updateOrganizationRequest = useApi(updateOrganization);
  const listMembersRequest = useApi(listOrganizationMembers, { silent: true });
  const listInvitationsRequest = useApi(listOrganizationInvitations, { silent: true });
  const createInvitationRequest = useApi(createOrganizationInvitation);
  const resendInvitationRequest = useApi(resendOrganizationInvitation);
  const revokeInvitationRequest = useApi(revokeOrganizationInvitation);
  const listRolesRequest = useApi(listOrganizationManagementRoles, { silent: true });
  const createRoleRequest = useApi(createOrganizationManagementRole);
  const assignRoleRequest = useApi(assignOrganizationManagementRole);
  const unassignRoleRequest = useApi(unassignOrganizationManagementRole);
  const removeMemberRequest = useApi(removeOrganizationMember);
  const deleteOrganizationRequest = useApi(deleteOrganization);
  const listActivityRequest = useApi(listOrganizationActivity, { silent: true });
  const getResourcesRequest = useApi(getAvailableOrganizationResources, { silent: true });
  const getJitRequest = useApi(getJitEmailDomains, { silent: true });
  const createDomainRequest = useApi(createJitEmailDomainVerification);
  const verifyDomainRequest = useApi(verifyJitEmailDomain);
  const deleteDomainRequest = useApi(deleteJitEmailDomain);
  const replaceSsoRequest = useApi(replaceOrganizationSsoConnectors);
  const replaceApplicationsRequest = useApi(replaceOrganizationApplications);
  const replaceJitRolesRequest = useApi(replaceJitOrganizationRoles);
  const replaceMemberRolesRequest = useApi(replaceMemberOrganizationRoles);

  const loadOrganization = useCallback(async () => {
    const [requestError, data] = await getOrganizationRequest(organizationId);
    setError(Boolean(requestError));
    if (data) {
      setOrganization(data);
      setName(data.name);
      setDescription(data.description ?? '');
      setPrimaryColor(data.color.primaryColor ?? '#5B5CF6');
      setCustomCss(data.customCss ?? '');
      setIsMfaRequired(data.isMfaRequired);
    }
  }, [getOrganizationRequest, organizationId]);

  useEffect(() => {
    void loadOrganization();
  }, [loadOrganization]);

  const modules = accountCenterSettings?.organizationCenter.modules;
  const hasPermission = useCallback(
    (permission?: OrganizationManagementPermission) =>
      !permission ||
      organization?.isOwner === true ||
      organization?.permissions.includes(permission),
    [organization]
  );
  const canManageResources =
    organization?.isOwner === true ||
    organization?.permissions.some(
      (permission) =>
        permission === OrganizationManagementPermission.ManageApplications ||
        permission === OrganizationManagementPermission.ManageJit
    ) === true;
  const canManageJitResources =
    modules?.jit !== false && hasPermission(OrganizationManagementPermission.ManageJit);
  const canManageApplications =
    modules?.applications !== false &&
    hasPermission(OrganizationManagementPermission.ManageApplications);
  const canManageBusinessRoles =
    modules?.businessRoles !== false &&
    hasPermission(OrganizationManagementPermission.AssignBusinessRoles);
  const canAssignManagementRoles =
    modules?.managementRoles !== false &&
    hasPermission(OrganizationManagementPermission.AssignManagementRoles);
  const visibleSections = useMemo(
    () =>
      sectionMeta.filter(
        (meta) =>
          (meta.key === 'applications'
            ? modules?.applications !== false || modules.jit
            : modules?.[meta.module] !== false) &&
          hasPermission('permission' in meta ? meta.permission : undefined) &&
          (meta.key !== 'applications' || canManageResources) &&
          (meta.key !== 'deletion' || organization?.isOwner === true)
      ),
    [canManageResources, hasPermission, modules, organization?.isOwner]
  );
  const requestedSection = sectionMeta.find(({ key }) => key === section)?.key;
  const activeSection: SectionKey | 'forbidden' =
    requestedSection && !visibleSections.some(({ key }) => key === requestedSection)
      ? 'forbidden'
      : (requestedSection ?? 'overview');

  useEffect(() => {
    const loadSection = async () => {
      switch (activeSection) {
        case 'members': {
          const [[, memberData], [, resourceData]] = await Promise.all([
            listMembersRequest(organizationId),
            canManageBusinessRoles
              ? getResourcesRequest(organizationId)
              : Promise.resolve([null, undefined] as const),
          ]);
          setMembers(memberData);
          if (resourceData) {
            setResources(resourceData);
          }

          break;
        }
        case 'invitations': {
          const [, invitationData] = await listInvitationsRequest(organizationId);
          setInvitations(invitationData);
          if (canManageBusinessRoles) {
            const [, resourceData] = await getResourcesRequest(organizationId);
            setResources(resourceData);
          }
          if (canAssignManagementRoles) {
            const [, roleData] = await listRolesRequest(organizationId);
            setRoles(roleData);
          }

          break;
        }
        case 'roles': {
          const [[, roleData], [, memberData]] = await Promise.all([
            listRolesRequest(organizationId),
            listMembersRequest(organizationId),
          ]);
          setRoles(roleData);
          setMembers(memberData);

          break;
        }
        case 'activity': {
          const [, data] = await listActivityRequest(organizationId);
          setActivity(data);

          break;
        }
        case 'applications': {
          const [, data] = await getResourcesRequest(organizationId);
          setResources(data);

          break;
        }
        case 'jit': {
          const [, data] = await getJitRequest(organizationId);
          setJit(data);

          break;
        }
        case 'overview':
        case 'branding':
        case 'security':
        case 'deletion':
        case 'forbidden': {
          break;
        }
      }
    };
    void loadSection();
  }, [
    activeSection,
    canManageBusinessRoles,
    canAssignManagementRoles,
    getJitRequest,
    getResourcesRequest,
    listActivityRequest,
    listInvitationsRequest,
    listMembersRequest,
    listRolesRequest,
    organizationId,
  ]);

  const saveProfile = useCallback(async () => {
    const trimmedDescription = description.trim();
    const [saveError, data] = await updateOrganizationRequest(organizationId, {
      name: name.trim(),
      description: trimmedDescription.length > 0 ? trimmedDescription : undefined,
    });
    if (saveError || !data) {
      setToast(t('account_center.organizations.load_failed'));
      return;
    }
    setOrganization(data);
    setToast(t('account_center.update_success.default.description'));
  }, [description, name, organizationId, setToast, t, updateOrganizationRequest]);

  const saveBranding = useCallback(async () => {
    if (!verificationId) {
      setRequiresVerification(true);
      return;
    }
    const trimmedCustomCss = customCss.trim();
    const [saveError, data] = await updateOrganizationRequest(
      organizationId,
      {
        color: { ...organization?.color, primaryColor },
        customCss: trimmedCustomCss.length > 0 ? trimmedCustomCss : undefined,
      },
      verificationId
    );
    if (saveError || !data) {
      setToast(t('account_center.organizations.load_failed'));
      return;
    }
    setOrganization(data);
    setToast(t('account_center.update_success.default.description'));
  }, [
    customCss,
    organization?.color,
    organizationId,
    primaryColor,
    setToast,
    t,
    updateOrganizationRequest,
    verificationId,
  ]);

  const saveSecurity = useCallback(async () => {
    if (!verificationId) {
      setRequiresVerification(true);
      return;
    }
    const [saveError, data] = await updateOrganizationRequest(
      organizationId,
      { isMfaRequired },
      verificationId
    );
    if (saveError || !data) {
      setToast(t('account_center.organizations.load_failed'));
      return;
    }
    setOrganization(data);
    setToast(t('account_center.update_success.default.description'));
  }, [isMfaRequired, organizationId, setToast, t, updateOrganizationRequest, verificationId]);

  const createInvitation = useCallback(async () => {
    if (!invitee.trim()) {
      return;
    }
    if (
      (inviteBusinessRoleIds.length > 0 || inviteManagementRoleIds.length > 0) &&
      !verificationId
    ) {
      setRequiresVerification(true);
      return;
    }
    const [createError, data] = await createInvitationRequest(
      organizationId,
      {
        invitee: invitee.trim(),
        organizationRoleIds: inviteBusinessRoleIds,
        organizationManagementRoleIds: inviteManagementRoleIds,
      },
      verificationId
    );
    if (createError || !data) {
      setToast(t('account_center.organizations.load_failed'));
      return;
    }
    setInvitations((previous) => [...(previous ?? []), data]);
    setInvitee('');
    setInviteBusinessRoleIds([]);
    setInviteManagementRoleIds([]);
  }, [
    createInvitationRequest,
    inviteBusinessRoleIds,
    inviteManagementRoleIds,
    invitee,
    organizationId,
    setToast,
    t,
    verificationId,
  ]);

  const resendInvitation = useCallback(
    async (invitationId: string) => {
      const [requestError, data] = await resendInvitationRequest(organizationId, invitationId);
      if (requestError || !data) {
        setToast(t('account_center.organizations.load_failed'));
        return;
      }
      setInvitations((previous) =>
        previous?.map((invitation) => (invitation.id === invitationId ? data : invitation))
      );
      setToast(t('account_center.organizations.invitations.resent'));
    },
    [organizationId, resendInvitationRequest, setToast, t]
  );

  const revokeInvitation = useCallback(
    async (invitationId: string) => {
      const [requestError] = await revokeInvitationRequest(organizationId, invitationId);
      if (requestError) {
        setToast(t('account_center.organizations.load_failed'));
        return;
      }
      setInvitations((previous) =>
        previous?.filter((invitation) => invitation.id !== invitationId)
      );
      setToast(t('account_center.organizations.invitations.revoked'));
    },
    [organizationId, revokeInvitationRequest, setToast, t]
  );

  const removeMember = useCallback(
    async (userId: string) => {
      if (!verificationId) {
        setRequiresVerification(true);
        return;
      }
      const [requestError] = await removeMemberRequest(organizationId, userId, verificationId);
      if (requestError) {
        setToast(t('account_center.organizations.load_failed'));
        return;
      }
      setMembers((previous) => previous?.filter((member) => member.id !== userId));
      setToast(t('account_center.organizations.members.removed'));
    },
    [organizationId, removeMemberRequest, setToast, t, verificationId]
  );

  const saveMemberBusinessRoles = useCallback(async () => {
    if (!businessRoleMemberId) {
      return;
    }
    if (!verificationId) {
      setRequiresVerification(true);
      return;
    }
    const [requestError] = await replaceMemberRolesRequest({
      organizationId,
      userId: businessRoleMemberId,
      organizationRoleIds: businessRoleIds,
      verificationId,
    });
    if (requestError) {
      setToast(t('account_center.organizations.load_failed'));
      return;
    }
    const [, data] = await listMembersRequest(organizationId);
    setMembers(data);
    setBusinessRoleMemberId('');
    setToast(t('account_center.update_success.default.description'));
  }, [
    businessRoleIds,
    businessRoleMemberId,
    listMembersRequest,
    organizationId,
    replaceMemberRolesRequest,
    setToast,
    t,
    verificationId,
  ]);

  const createRole = useCallback(async () => {
    if (!verificationId) {
      setRequiresVerification(true);
      return;
    }
    if (!roleName.trim()) {
      return;
    }
    const [createError, data] = await createRoleRequest(
      organizationId,
      { name: roleName.trim(), permissions: rolePermissions },
      verificationId
    );
    if (createError || !data) {
      setToast(t('account_center.organizations.load_failed'));
      return;
    }
    setRoles((previous) => [...(previous ?? []), data]);
    setRoleName('');
    setRolePermissions([]);
  }, [createRoleRequest, organizationId, roleName, rolePermissions, setToast, t, verificationId]);

  const assignRole = useCallback(async () => {
    if (!verificationId) {
      setRequiresVerification(true);
      return;
    }
    if (!selectedRoleId || !selectedMemberId) {
      return;
    }
    const [requestError] = await assignRoleRequest({
      organizationId,
      roleId: selectedRoleId,
      userId: selectedMemberId,
      verificationId,
    });
    if (requestError) {
      setToast(t('account_center.organizations.load_failed'));
      return;
    }
    const [, data] = await listMembersRequest(organizationId);
    setMembers(data);
    setToast(t('account_center.organizations.roles.assigned'));
  }, [
    assignRoleRequest,
    listMembersRequest,
    organizationId,
    selectedMemberId,
    selectedRoleId,
    setToast,
    t,
    verificationId,
  ]);

  const unassignRole = useCallback(
    async (roleId: string, userId: string) => {
      if (!verificationId) {
        setRequiresVerification(true);
        return;
      }
      const [requestError] = await unassignRoleRequest({
        organizationId,
        roleId,
        userId,
        verificationId,
      });
      if (requestError) {
        setToast(t('account_center.organizations.load_failed'));
        return;
      }
      const [, data] = await listMembersRequest(organizationId);
      setMembers(data);
      setToast(t('account_center.organizations.roles.unassigned'));
    },
    [listMembersRequest, organizationId, setToast, t, unassignRoleRequest, verificationId]
  );

  const createDomain = useCallback(async () => {
    if (!verificationId) {
      setRequiresVerification(true);
      return;
    }
    if (!domain.trim()) {
      return;
    }
    const [createError, data] = await createDomainRequest(
      organizationId,
      domain.trim(),
      verificationId
    );
    if (createError || !data) {
      setToast(t('account_center.organizations.load_failed'));
      return;
    }
    setJit((previous) => ({
      emailDomains: previous?.emailDomains ?? [],
      verifications: [...(previous?.verifications ?? []), data],
    }));
    setDomain('');
  }, [createDomainRequest, domain, organizationId, setToast, t, verificationId]);

  const deleteDomain = useCallback(
    async (emailDomain: string) => {
      if (!verificationId) {
        setRequiresVerification(true);
        return;
      }
      const [requestError] = await deleteDomainRequest(organizationId, emailDomain, verificationId);
      if (requestError) {
        setToast(t('account_center.organizations.load_failed'));
        return;
      }
      setJit((previous) => ({
        emailDomains:
          previous?.emailDomains.filter((item) => item.emailDomain !== emailDomain) ?? [],
        verifications: previous?.verifications ?? [],
      }));
      setToast(t('account_center.update_success.default.description'));
    },
    [deleteDomainRequest, organizationId, setToast, t, verificationId]
  );

  const saveResources = useCallback(
    async (kind: 'sso' | 'applications' | 'roles') => {
      if (!verificationId) {
        setRequiresVerification(true);
        return;
      }
      const assignedIds =
        kind === 'sso'
          ? (resources?.ssoConnectors.filter(({ assigned }) => assigned).map(({ id }) => id) ?? [])
          : kind === 'applications'
            ? (resources?.applications.filter(({ assigned }) => assigned).map(({ id }) => id) ?? [])
            : (resources?.organizationRoles
                .filter(({ assigned }) => assigned)
                .map(({ id }) => id) ?? []);
      const [requestError] =
        kind === 'sso'
          ? await replaceSsoRequest(organizationId, assignedIds, verificationId)
          : kind === 'applications'
            ? await replaceApplicationsRequest(organizationId, assignedIds, verificationId)
            : await replaceJitRolesRequest(organizationId, assignedIds, verificationId);
      setToast(
        requestError
          ? t('account_center.organizations.load_failed')
          : t('account_center.update_success.default.description')
      );
    },
    [
      organizationId,
      replaceApplicationsRequest,
      replaceJitRolesRequest,
      replaceSsoRequest,
      resources,
      setToast,
      t,
      verificationId,
    ]
  );

  const toggleResource = useCallback((kind: keyof AvailableResourcesState, resourceId: string) => {
    setResources((previous) => {
      if (!previous) {
        return previous;
      }
      return {
        ...previous,
        [kind]: previous[kind].map((resource) =>
          resource.id === resourceId ? { ...resource, assigned: !resource.assigned } : resource
        ),
      };
    });
  }, []);

  const deleteCurrentOrganization = useCallback(async () => {
    if (!verificationId) {
      setRequiresVerification(true);
      return;
    }
    if (deleteConfirmation !== organization?.name) {
      return;
    }
    const [requestError] = await deleteOrganizationRequest(organizationId, verificationId);
    if (requestError) {
      setToast(t('account_center.organizations.load_failed'));
      return;
    }
    setToast(t('account_center.organizations.deleted'));
    navigate(organizationsRoute);
  }, [
    deleteConfirmation,
    deleteOrganizationRequest,
    navigate,
    organization?.name,
    organizationId,
    setToast,
    t,
    verificationId,
  ]);

  const brandPreviewStyle: CSSProperties & { '--organization-color': string } = {
    '--organization-color': primaryColor,
  };

  if (error) {
    return (
      <button
        type="button"
        className={styles.errorBanner}
        onClick={async () => {
          await loadOrganization();
        }}
      >
        {t('account_center.organizations.load_failed')}
      </button>
    );
  }
  if (!organization) {
    return <div className={styles.skeleton} />;
  }
  if (requiresVerification && !verificationId) {
    return <VerificationMethodList />;
  }

  return (
    <div className={styles.detailsPage}>
      <button
        type="button"
        className={styles.backButton}
        onClick={() => {
          navigate(organizationsRoute);
        }}
      >
        <ArrowLeft size={17} /> {t('account_center.organizations.title')}
      </button>
      <header className={styles.organizationHeader}>
        <OrganizationAvatar seed={organization.id} size={52} />
        <div>
          <h1>{organization.name}</h1>
          <p>
            {organization.description !== null && organization.description.length > 0
              ? organization.description
              : organization.id}
          </p>
        </div>
        {organization.isOwner && (
          <span className={styles.ownerBadge}>{t('account_center.organizations.owner')}</span>
        )}
      </header>
      <nav className={styles.organizationTabs}>
        {visibleSections.map(({ key, icon: Icon }) => (
          <button
            key={key}
            type="button"
            className={key === activeSection ? styles.activeTab : styles.tab}
            onClick={() => {
              navigate(getOrganizationRoute(organizationId, key));
            }}
          >
            <Icon size={16} /> {t(`account_center.organizations.tabs.${key}`)}
          </button>
        ))}
      </nav>

      <section className={styles.detailPanel}>
        {activeSection === 'overview' && (
          <div className={styles.formStack}>
            <label>
              <span>{t('account_center.organizations.name')}</span>
              <input
                value={name}
                maxLength={128}
                onChange={(event) => {
                  setName(event.target.value);
                }}
              />
            </label>
            <label>
              <span>{t('account_center.organizations.description_label')}</span>
              <textarea
                rows={4}
                value={description}
                maxLength={256}
                onChange={(event) => {
                  setDescription(event.target.value);
                }}
              />
            </label>
            {hasPermission(OrganizationManagementPermission.UpdateProfile) && (
              <button
                type="button"
                className={styles.primaryButton}
                onClick={async () => {
                  await saveProfile();
                }}
              >
                <Save size={16} />
                {t('account_center.organizations.save')}
              </button>
            )}
          </div>
        )}
        {activeSection === 'members' && (
          <div className={styles.rows}>
            {members?.map((member) => (
              <div key={member.id} className={styles.row}>
                <MemberAvatar member={member} />
                <div className={styles.rowMain}>
                  <strong>
                    {member.name !== null && member.name.length > 0
                      ? member.name
                      : member.primaryEmail !== null && member.primaryEmail.length > 0
                        ? member.primaryEmail
                        : member.id}
                  </strong>
                  <span>{member.primaryEmail}</span>
                </div>
                <div className={styles.chips}>
                  {member.isOwner && <span>{t('account_center.organizations.owner')}</span>}
                  {member.organizationManagementRoles.map(({ id, name }) => (
                    <span key={id}>
                      {name}
                      {hasPermission(OrganizationManagementPermission.AssignManagementRoles) && (
                        <button
                          type="button"
                          className={styles.chipButton}
                          aria-label={t('account_center.organizations.roles.unassign')}
                          onClick={async () => {
                            await unassignRole(id, member.id);
                          }}
                        >
                          ×
                        </button>
                      )}
                    </span>
                  ))}
                  {member.organizationRoles.map(({ id, name }) => (
                    <span key={id}>{name}</span>
                  ))}
                </div>
                {canManageBusinessRoles && (
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={() => {
                      setBusinessRoleMemberId((current) =>
                        current === member.id ? '' : member.id
                      );
                      setBusinessRoleIds(member.organizationRoles.map(({ id }) => id));
                    }}
                  >
                    {t('account_center.organizations.members.business_roles')}
                  </button>
                )}
                {hasPermission(OrganizationManagementPermission.ManageMembers) && (
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={async () => {
                      await removeMember(member.id);
                    }}
                  >
                    <Trash2 size={15} />
                    {t('account_center.organizations.members.remove')}
                  </button>
                )}
                {businessRoleMemberId === member.id && (
                  <div className={styles.memberRoleEditor}>
                    {resources?.organizationRoles.map((role) => (
                      <label key={role.id}>
                        <input
                          type="checkbox"
                          className={styles.businessRoleCheckbox}
                          checked={businessRoleIds.includes(role.id)}
                          onChange={(event) => {
                            setBusinessRoleIds((previous) =>
                              event.target.checked
                                ? [...previous, role.id]
                                : previous.filter((id) => id !== role.id)
                            );
                          }}
                        />
                        {role.name}
                      </label>
                    ))}
                    <button
                      type="button"
                      className={styles.primaryButton}
                      onClick={async () => {
                        await saveMemberBusinessRoles();
                      }}
                    >
                      <Save size={15} />
                      {t('account_center.organizations.save')}
                    </button>
                  </div>
                )}
              </div>
            ))}
            {members?.length === 0 && (
              <div className={styles.emptyState}>
                {t('account_center.organizations.members.empty')}
              </div>
            )}
          </div>
        )}
        {activeSection === 'invitations' && (
          <div className={styles.formStack}>
            <div className={styles.inlineForm}>
              <input
                type="email"
                placeholder={t('account_center.organizations.invitations.email')}
                value={invitee}
                onChange={(event) => {
                  setInvitee(event.target.value);
                }}
              />
              <button
                type="button"
                className={styles.primaryButton}
                onClick={async () => {
                  await createInvitation();
                }}
              >
                <MailPlus size={16} />
                {t('account_center.organizations.invitations.invite')}
              </button>
            </div>
            {canManageBusinessRoles && (resources?.organizationRoles.length ?? 0) > 0 && (
              <fieldset className={styles.permissionGrid}>
                <legend>{t('account_center.organizations.members.business_roles')}</legend>
                {resources?.organizationRoles.map((role) => (
                  <label key={role.id}>
                    <input
                      type="checkbox"
                      className={styles.permissionCheckbox}
                      checked={inviteBusinessRoleIds.includes(role.id)}
                      onChange={(event) => {
                        setInviteBusinessRoleIds((previous) =>
                          event.target.checked
                            ? [...previous, role.id]
                            : previous.filter((id) => id !== role.id)
                        );
                      }}
                    />
                    {role.name}
                  </label>
                ))}
              </fieldset>
            )}
            {canAssignManagementRoles && (roles?.length ?? 0) > 0 && (
              <fieldset className={styles.permissionGrid}>
                <legend>{t('account_center.organizations.roles.title')}</legend>
                {roles
                  ?.filter(
                    ({ type }) =>
                      type !== OrganizationManagementRoleType.Owner || organization.isOwner
                  )
                  .map((role) => (
                    <label key={role.id}>
                      <input
                        type="checkbox"
                        className={styles.permissionCheckbox}
                        checked={inviteManagementRoleIds.includes(role.id)}
                        onChange={(event) => {
                          setInviteManagementRoleIds((previous) =>
                            event.target.checked
                              ? [...previous, role.id]
                              : previous.filter((id) => id !== role.id)
                          );
                        }}
                      />
                      {role.name}
                    </label>
                  ))}
              </fieldset>
            )}
            <div className={styles.rows}>
              {invitations?.map((invitation) => (
                <div key={invitation.id} className={styles.row}>
                  <div className={styles.roleIcon}>
                    <MailPlus size={20} />
                  </div>
                  <div className={styles.rowMain}>
                    <strong>{invitation.invitee}</strong>
                    <span>{invitation.status}</span>
                  </div>
                  <div className={styles.rowActions}>
                    {invitation.status !== 'Accepted' && invitation.status !== 'Declined' && (
                      <button
                        type="button"
                        className={styles.secondaryButton}
                        onClick={async () => {
                          await resendInvitation(invitation.id);
                        }}
                      >
                        {t('account_center.organizations.invitations.resend')}
                      </button>
                    )}
                    <button
                      type="button"
                      className={styles.secondaryButton}
                      onClick={async () => {
                        await revokeInvitation(invitation.id);
                      }}
                    >
                      {t('account_center.organizations.invitations.revoke')}
                    </button>
                  </div>
                </div>
              ))}
              {invitations?.length === 0 && (
                <div className={styles.emptyState}>
                  {t('account_center.organizations.invitations.empty')}
                </div>
              )}
            </div>
          </div>
        )}
        {activeSection === 'roles' && (
          <div className={styles.formStack}>
            <div className={styles.inlineForm}>
              <input
                placeholder={t('account_center.organizations.roles.title')}
                value={roleName}
                onChange={(event) => {
                  setRoleName(event.target.value);
                }}
              />
              <button
                type="button"
                className={styles.primaryButton}
                onClick={async () => {
                  await createRole();
                }}
              >
                <UserRoundCog size={16} />
                {t('account_center.organizations.roles.create')}
              </button>
            </div>
            <fieldset className={styles.permissionGrid}>
              <legend>{t('account_center.organizations.roles.permissions')}</legend>
              {organizationManagementPermissions.map((permission) => (
                <label key={permission}>
                  <input
                    type="checkbox"
                    className={styles.permissionCheckbox}
                    checked={rolePermissions.includes(permission)}
                    onChange={(event) => {
                      setRolePermissions((previous) =>
                        event.target.checked
                          ? [...previous, permission]
                          : previous.filter((value) => value !== permission)
                      );
                    }}
                  />
                  {permission.replaceAll('_', ' ')}
                </label>
              ))}
            </fieldset>
            {hasPermission(OrganizationManagementPermission.AssignManagementRoles) && (
              <div className={styles.assignmentPanel}>
                <label>
                  <span>{t('account_center.organizations.roles.select_member')}</span>
                  <select
                    value={selectedMemberId}
                    onChange={(event) => {
                      setSelectedMemberId(event.target.value);
                    }}
                  >
                    <option value="">
                      {t('account_center.organizations.roles.select_member')}
                    </option>
                    {members?.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name ?? member.primaryEmail ?? member.id}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>{t('account_center.organizations.roles.select_role')}</span>
                  <select
                    value={selectedRoleId}
                    onChange={(event) => {
                      setSelectedRoleId(event.target.value);
                    }}
                  >
                    <option value="">{t('account_center.organizations.roles.select_role')}</option>
                    {roles?.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  disabled={!selectedMemberId || !selectedRoleId}
                  onClick={async () => {
                    await assignRole();
                  }}
                >
                  {t('account_center.organizations.roles.assign')}
                </button>
              </div>
            )}
            <div className={styles.rows}>
              {roles?.map((role) => (
                <div key={role.id} className={styles.row}>
                  <div className={styles.roleIcon}>
                    <UserRoundCog size={20} />
                  </div>
                  <div className={styles.rowMain}>
                    <strong>{role.name}</strong>
                    <span>
                      {role.description !== null && role.description.length > 0
                        ? role.description
                        : `${role.permissions.length} ${t('account_center.organizations.roles.permissions')}`}
                    </span>
                  </div>
                </div>
              ))}
              {roles?.length === 0 && (
                <div className={styles.emptyState}>
                  {t('account_center.organizations.roles.empty')}
                </div>
              )}
            </div>
          </div>
        )}
        {activeSection === 'branding' && (
          <div className={styles.brandingGrid}>
            <div className={styles.formStack}>
              <label>
                <span>{t('account_center.organizations.branding.primary_color')}</span>
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(event) => {
                    setPrimaryColor(event.target.value);
                  }}
                />
              </label>
              <label>
                <span>{t('account_center.organizations.branding.custom_css')}</span>
                <textarea
                  rows={9}
                  value={customCss}
                  onChange={(event) => {
                    setCustomCss(event.target.value);
                  }}
                />
              </label>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={async () => {
                  await saveBranding();
                }}
              >
                <Save size={16} />
                {t('account_center.organizations.save')}
              </button>
            </div>
            <div className={styles.brandPreviews}>
              <div className={styles.brandPreview} style={brandPreviewStyle}>
                <span>{t('account_center.organizations.branding.light')}</span>
                <OrganizationAvatar seed={organization.id} size={64} />
                <strong>{organization.name}</strong>
                <button type="button">{t('account_center.organizations.branding.preview')}</button>
              </div>
              <div className={styles.darkBrandPreview} style={brandPreviewStyle}>
                <span>{t('account_center.organizations.branding.dark')}</span>
                <OrganizationAvatar seed={organization.id} size={64} />
                <strong>{organization.name}</strong>
                <button type="button">{t('account_center.organizations.branding.preview')}</button>
              </div>
            </div>
          </div>
        )}
        {activeSection === 'security' && (
          <div className={styles.formStack}>
            <label className={styles.switchRow}>
              <span>{t('account_center.organizations.security.require_mfa')}</span>
              <input
                type="checkbox"
                checked={isMfaRequired}
                onChange={(event) => {
                  setIsMfaRequired(event.target.checked);
                }}
              />
            </label>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={async () => {
                await saveSecurity();
              }}
            >
              <Save size={16} />
              {t('account_center.organizations.save')}
            </button>
          </div>
        )}
        {activeSection === 'jit' && (
          <div className={styles.formStack}>
            <div className={styles.inlineForm}>
              <input
                placeholder={t('account_center.organizations.jit.domain')}
                value={domain}
                onChange={(event) => {
                  setDomain(event.target.value);
                }}
              />
              <button
                type="button"
                className={styles.primaryButton}
                onClick={async () => {
                  await createDomain();
                }}
              >
                {t('account_center.organizations.jit.add')}
              </button>
            </div>
            <div className={styles.rows}>
              {jit?.emailDomains.map(({ emailDomain }) => (
                <div key={emailDomain} className={styles.row}>
                  <Check size={20} />
                  <div className={styles.rowMain}>
                    <strong>{emailDomain}</strong>
                    <span>Verified</span>
                  </div>
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={async () => {
                      await deleteDomain(emailDomain);
                    }}
                  >
                    <Trash2 size={15} />
                    {t('account_center.organizations.members.remove')}
                  </button>
                </div>
              ))}
              {jit?.verifications.map((verification) => (
                <div key={verification.id} className={styles.row}>
                  <div className={styles.rowMain}>
                    <strong>{verification.domain}</strong>
                    <code>
                      _iden-organization.{verification.domain} · {verification.verificationValue}
                    </code>
                  </div>
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={async () => {
                      if (!verificationId) {
                        setRequiresVerification(true);
                        return;
                      }
                      const [, data] = await verifyDomainRequest(
                        organizationId,
                        verification.id,
                        verificationId
                      );
                      if (data) {
                        const [, value] = await getJitRequest(organizationId);
                        setJit(value);
                      }
                    }}
                  >
                    {t('account_center.organizations.jit.verify')}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeSection === 'applications' && (
          <div className={styles.resourceColumns}>
            {canManageJitResources && (
              <>
                <ResourceList
                  title="SSO"
                  items={resources?.ssoConnectors ?? []}
                  saveLabel={t('account_center.organizations.save')}
                  onToggle={(resourceId) => {
                    toggleResource('ssoConnectors', resourceId);
                  }}
                  onSave={async () => {
                    await saveResources('sso');
                  }}
                />
                <ResourceList
                  title={t('account_center.organizations.tabs.roles')}
                  items={resources?.organizationRoles ?? []}
                  saveLabel={t('account_center.organizations.save')}
                  onToggle={(resourceId) => {
                    toggleResource('organizationRoles', resourceId);
                  }}
                  onSave={async () => {
                    await saveResources('roles');
                  }}
                />
              </>
            )}
            {canManageApplications && (
              <ResourceList
                title={t('account_center.organizations.tabs.applications')}
                items={resources?.applications ?? []}
                saveLabel={t('account_center.organizations.save')}
                onToggle={(resourceId) => {
                  toggleResource('applications', resourceId);
                }}
                onSave={async () => {
                  await saveResources('applications');
                }}
              />
            )}
          </div>
        )}
        {activeSection === 'activity' && (
          <div className={styles.rows}>
            {activity?.map((log) => (
              <div key={log.id} className={styles.row}>
                <div className={styles.activityIcon}>
                  <Activity size={18} />
                </div>
                <div className={styles.rowMain}>
                  <strong>{log.key}</strong>
                  <span>{new Date(log.createdAt).toLocaleString()}</span>
                </div>
              </div>
            ))}
            {activity?.length === 0 && (
              <div className={styles.emptyState}>
                {t('account_center.organizations.activity.empty')}
              </div>
            )}
          </div>
        )}
        {activeSection === 'deletion' && (
          <div className={styles.dangerZone}>
            <Trash2 size={24} />
            <div>
              <h2>{t('account_center.organizations.delete')}</h2>
              <p>
                {t('account_center.organizations.delete_confirmation', {
                  name: organization.name,
                })}
              </p>
            </div>
            <input
              value={deleteConfirmation}
              placeholder={organization.name}
              onChange={(event) => {
                setDeleteConfirmation(event.target.value);
              }}
            />
            <button
              type="button"
              className={styles.dangerButton}
              disabled={deleteConfirmation !== organization.name}
              onClick={async () => {
                await deleteCurrentOrganization();
              }}
            >
              {t('account_center.organizations.delete')}
            </button>
          </div>
        )}
        {activeSection === 'forbidden' && (
          <div className={styles.emptyState}>
            <ShieldCheck size={32} />
            {t('account_center.organizations.permission_denied')}
          </div>
        )}
      </section>
    </div>
  );
};

const ResourceList = ({
  title,
  items,
  onToggle,
  onSave,
  saveLabel,
}: {
  readonly title: string;
  readonly items: Array<{ id: string; name: string; assigned: boolean }>;
  readonly onToggle: (resourceId: string) => void;
  readonly onSave: () => Promise<void>;
  readonly saveLabel: string;
}) => (
  <div className={styles.resourceList}>
    <h3>{title}</h3>
    {items.map((item) => (
      <label key={item.id} className={styles.resourceItem}>
        <input
          type="checkbox"
          className={styles.resourceCheckbox}
          checked={item.assigned}
          onChange={() => {
            onToggle(item.id);
          }}
        />
        <AppWindow size={18} />
        <span>{item.name}</span>
      </label>
    ))}
    {items.length === 0 && <div className={styles.emptyState}>—</div>}
    <button
      type="button"
      className={styles.secondaryButton}
      onClick={async () => {
        await onSave();
      }}
    >
      <Save size={15} />
      {saveLabel}
    </button>
  </div>
);

const MemberAvatar = ({ member }: { readonly member: OrganizationCenterMember }) => {
  const seed = resolveDefaultAvatarSeed(member.id, member.primaryEmail, member.name);

  return member.avatar ? (
    <img className={styles.memberAvatar} src={member.avatar} alt="" referrerPolicy="no-referrer" />
  ) : (
    <DefaultUserAvatar className={styles.memberAvatar} seed={seed} />
  );
};

export default OrganizationDetails;
/* eslint-enable max-lines */

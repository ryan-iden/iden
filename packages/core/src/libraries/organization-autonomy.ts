/* eslint-disable max-lines -- Organization autonomy keeps cross-resource invariants in one shared transaction service. */
import { resolveTxt } from 'node:dns/promises';

import {
  Applications,
  type Organization,
  type OrganizationCenterSettings,
  type OrganizationManagementRole,
  type OrganizationCenterMember,
  type OrganizationJitEmailDomainVerification,
  OrganizationManagementPermission,
  OrganizationManagementRoles,
  OrganizationManagementRoleType,
  OrganizationManagementRoleUserRelations,
  OrganizationJitEmailDomainVerifications,
  OrganizationJitEmailDomainVerificationStatus,
  OrganizationJitEmailDomains,
  OrganizationRoles,
  OrganizationUserRelations,
  Organizations,
  SsoConnectors,
  UsersRoles,
  organizationManagementPermissions,
  organization as organizationLog,
} from '@logto/schemas';
import { generateStandardId, generateStandardSecret } from '@logto/shared';
import { sql, type CommonQueryMethods } from '@silverhand/slonik';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import OrganizationQueries from '#src/queries/organization/index.js';
import type Queries from '#src/tenants/Queries.js';
import SchemaQueries from '#src/utils/SchemaQueries.js';
import { convertToIdentifiers } from '#src/utils/sql.js';

import {
  hasOrganizationDomainTxtValue,
  normalizeOrganizationDomain,
  organizationDomainTxtHost,
} from './organization-domain.js';

type OrganizationCenterAccess = {
  isOwner: boolean;
  permissions: OrganizationManagementPermission[];
};

type OrganizationCenterOrganization = Pick<
  Organization,
  | 'id'
  | 'name'
  | 'description'
  | 'color'
  | 'branding'
  | 'customCss'
  | 'isMfaRequired'
  | 'createdAt'
  | 'createdBy'
> &
  OrganizationCenterAccess;

const forbidden = () => new RequestError({ code: 'auth.forbidden', status: 403 });
const notFound = () => new RequestError({ code: 'entity.not_found', status: 404 });
const invalidInput = (details: string) =>
  new RequestError({ code: 'request.invalid_input', status: 422, details });

const normalizeDomainInput = (input: string) => {
  try {
    return normalizeOrganizationDomain(input);
  } catch {
    throw invalidInput('The email domain is invalid.');
  }
};

const resolveDomainTxt = async (host: string) => {
  try {
    return await resolveTxt(host);
  } catch {
    return [];
  }
};

const toOrganizationCenterOrganization = (
  organization: Organization,
  access: OrganizationCenterAccess
): OrganizationCenterOrganization => ({
  id: organization.id,
  name: organization.name,
  description: organization.description,
  color: organization.color,
  branding: organization.branding,
  customCss: organization.customCss,
  isMfaRequired: organization.isMfaRequired,
  createdAt: organization.createdAt,
  createdBy: organization.createdBy,
  ...access,
});

export class OrganizationAutonomyLibrary {
  constructor(private readonly queries: Queries) {}

  async getSettings(): Promise<OrganizationCenterSettings> {
    const { isCloud, isSelfHostedParityEnabled } = EnvSet.values;

    if (isCloud || !isSelfHostedParityEnabled) {
      throw notFound();
    }

    const { organizationCenter } = await this.queries.accountCenters.findDefaultAccountCenter();

    if (!organizationCenter.enabled) {
      throw notFound();
    }

    return organizationCenter;
  }

  async assertModule(
    module: keyof OrganizationCenterSettings['modules']
  ): Promise<OrganizationCenterSettings> {
    const settings = await this.getSettings();

    if (!settings.modules[module]) {
      throw notFound();
    }

    return settings;
  }

  async listOrganizations(userId: string): Promise<OrganizationCenterOrganization[]> {
    await this.getSettings();
    const organizations =
      await this.queries.organizations.relations.users.getOrganizationsByUserId(userId);

    return Promise.all(
      organizations.map(async (organization) =>
        toOrganizationCenterOrganization(
          organization,
          await this.getAccess(organization.id, userId)
        )
      )
    );
  }

  async getOrganization(
    organizationId: string,
    userId: string
  ): Promise<OrganizationCenterOrganization> {
    await this.getSettings();
    const access = await this.getAccess(organizationId, userId);
    const organization = await this.queries.organizations.findById(organizationId);
    return toOrganizationCenterOrganization(organization, access);
  }

  async getAccess(
    organizationId: string,
    userId: string,
    pool: CommonQueryMethods = this.queries.pool
  ): Promise<OrganizationCenterAccess> {
    const membership = convertToIdentifiers(OrganizationUserRelations, true);
    const relations = convertToIdentifiers(OrganizationManagementRoleUserRelations, true);
    const roles = convertToIdentifiers(OrganizationManagementRoles, true);

    const isMember = await pool.exists(sql`
      select 1 from ${membership.table}
      where ${membership.fields.organizationId} = ${organizationId}
        and ${membership.fields.userId} = ${userId}
    `);

    if (!isMember) {
      throw notFound();
    }

    const assignedRoles = await pool.any<
      Pick<OrganizationManagementRole, 'type' | 'permissions'>
    >(sql`
      select ${roles.fields.type}, ${roles.fields.permissions}
      from ${relations.table}
      join ${roles.table}
        on ${relations.fields.organizationManagementRoleId} = ${roles.fields.id}
      where ${relations.fields.organizationId} = ${organizationId}
        and ${relations.fields.userId} = ${userId}
        and ${roles.fields.organizationId} = ${organizationId}
    `);
    const isOwner = assignedRoles.some(({ type }) => type === OrganizationManagementRoleType.Owner);
    const permissions = [...new Set(assignedRoles.flatMap(({ permissions }) => permissions))];

    return {
      isOwner,
      permissions: isOwner ? [...organizationManagementPermissions] : permissions,
    };
  }

  async assertPermission(
    organizationId: string,
    userId: string,
    permission: OrganizationManagementPermission
  ): Promise<OrganizationCenterAccess> {
    const access = await this.getAccess(organizationId, userId);

    if (!access.permissions.includes(permission)) {
      throw forbidden();
    }

    return access;
  }

  async createOrganization(
    userId: string,
    data: Pick<Organization, 'name'> & Partial<Pick<Organization, 'description'>>
  ): Promise<OrganizationCenterOrganization> {
    const settings = await this.getSettings();

    const organizationId = generateStandardId();
    await this.queries.pool.transaction(async (connection) => {
      await connection.query(sql`select pg_advisory_xact_lock(hashtext(${userId}))`);
      await this.assertCanCreate(userId, settings, connection);
      const organizations = new OrganizationQueries(connection);
      const managementRoles = new SchemaQueries(connection, OrganizationManagementRoles);
      const ownerRoleId = generateStandardId();
      const administratorRoleId = generateStandardId();

      await organizations.insert({
        id: organizationId,
        name: data.name,
        description: data.description ?? null,
        createdBy: userId,
      });
      await organizations.relations.users.insert({ organizationId, userId });
      await managementRoles.insert({
        id: ownerRoleId,
        organizationId,
        name: 'Owner',
        description: 'Organization owners with exclusive control over ownership and deletion.',
        type: OrganizationManagementRoleType.Owner,
        permissions: [],
      });
      await managementRoles.insert({
        id: administratorRoleId,
        organizationId,
        name: 'Administrator',
        description: 'Full organization administration without ownership-only actions.',
        type: OrganizationManagementRoleType.Custom,
        permissions: [...organizationManagementPermissions],
      });
      await this.insertManagementRoleAssignment(connection, {
        organizationId,
        userId,
        roleId: ownerRoleId,
      });
    });

    return this.getOrganization(organizationId, userId);
  }

  async updateOrganization(
    organizationId: string,
    userId: string,
    data: Partial<
      Pick<
        Organization,
        'name' | 'description' | 'color' | 'branding' | 'customCss' | 'isMfaRequired'
      >
    >
  ): Promise<OrganizationCenterOrganization> {
    if ('name' in data || 'description' in data) {
      await this.assertModule('profile');
      await this.assertPermission(
        organizationId,
        userId,
        OrganizationManagementPermission.UpdateProfile
      );
    }
    if ('color' in data || 'branding' in data || 'customCss' in data) {
      await this.assertModule('branding');
      await this.assertPermission(
        organizationId,
        userId,
        OrganizationManagementPermission.ManageBranding
      );
    }
    if ('isMfaRequired' in data) {
      await this.assertModule('security');
      await this.assertPermission(
        organizationId,
        userId,
        OrganizationManagementPermission.ManageSecurity
      );
    }
    await this.queries.organizations.updateById(organizationId, data);
    return this.getOrganization(organizationId, userId);
  }

  async updateOrganizationAvatar(
    organizationId: string,
    userId: string,
    avatarUrl?: string
  ): Promise<OrganizationCenterOrganization> {
    await this.assertModule('branding');
    await this.assertPermission(
      organizationId,
      userId,
      OrganizationManagementPermission.ManageBranding
    );
    const organization = await this.queries.organizations.findById(organizationId);
    const branding: Organization['branding'] = Object.fromEntries(
      Object.entries(organization.branding).filter(([key]) => key !== 'logoUrl')
    );

    await this.queries.organizations.updateById(organizationId, {
      branding: avatarUrl ? { ...branding, logoUrl: avatarUrl } : branding,
    });

    return this.getOrganization(organizationId, userId);
  }

  async deleteOrganization(organizationId: string, userId: string): Promise<void> {
    const { isOwner } = await this.getAccess(organizationId, userId);

    if (!isOwner) {
      throw forbidden();
    }

    await this.queries.organizations.deleteById(organizationId);
  }

  async listMembers(organizationId: string, userId: string): Promise<OrganizationCenterMember[]> {
    await this.assertPermission(
      organizationId,
      userId,
      OrganizationManagementPermission.ViewMembers
    );
    const [, members] = await this.queries.organizations.relations.users.getUsersByOrganizationId(
      organizationId,
      { limit: 1000, offset: 0 }
    );
    const managementRelations = convertToIdentifiers(OrganizationManagementRoleUserRelations, true);
    const managementRoles = convertToIdentifiers(OrganizationManagementRoles, true);

    return Promise.all(
      members.map(async (member) => {
        const assignedManagementRoles = await this.queries.pool.any<
          Pick<OrganizationManagementRole, 'id' | 'name' | 'type'>
        >(sql`
          select
            ${managementRoles.fields.id},
            ${managementRoles.fields.name},
            ${managementRoles.fields.type}
          from ${managementRelations.table}
          join ${managementRoles.table}
            on ${managementRelations.fields.organizationManagementRoleId} =
              ${managementRoles.fields.id}
          where ${managementRelations.fields.organizationId} = ${organizationId}
            and ${managementRelations.fields.userId} = ${member.id}
          order by ${managementRoles.fields.name}
        `);

        return {
          id: member.id,
          name: member.name,
          avatar: member.avatar,
          primaryEmail: member.primaryEmail,
          createdAt: member.createdAt,
          organizationRoles: member.organizationRoles,
          organizationManagementRoles: assignedManagementRoles.map(({ id, name }) => ({
            id,
            name,
          })),
          isOwner: assignedManagementRoles.some(
            ({ type }) => type === OrganizationManagementRoleType.Owner
          ),
        };
      })
    );
  }

  async removeMember(
    organizationId: string,
    targetUserId: string,
    actorUserId: string
  ): Promise<void> {
    await this.assertPermission(
      organizationId,
      actorUserId,
      OrganizationManagementPermission.ManageMembers
    );

    await this.queries.pool.transaction(async (connection) => {
      const targetAccess = await this.getAccess(organizationId, targetUserId, connection);
      if (targetAccess.isOwner) {
        const managementRoles = await this.findManagementRoles(organizationId, connection);
        const ownerRole = managementRoles.find(
          ({ type }) => type === OrganizationManagementRoleType.Owner
        );
        if (!ownerRole) {
          throw invalidInput('The organization Owner role is missing.');
        }
        await this.assertOwnerCanBeRemoved(connection, organizationId, ownerRole.id, targetUserId);
      }

      const membership = convertToIdentifiers(OrganizationUserRelations, true);
      await connection.query(sql`
        delete from ${membership.table}
        where ${membership.fields.organizationId} = ${organizationId}
          and ${membership.fields.userId} = ${targetUserId}
      `);
    });
  }

  // eslint-disable-next-line complexity -- Invitation authorization combines module, allowlist, role, and Owner constraints.
  async assertInvitationResources({
    organizationId,
    actorUserId,
    organizationRoleIds,
    organizationManagementRoleIds,
  }: {
    organizationId: string;
    actorUserId: string;
    organizationRoleIds: string[];
    organizationManagementRoleIds: string[];
  }): Promise<OrganizationCenterSettings> {
    const settings = await this.assertModule('invitations');
    const access = await this.assertPermission(
      organizationId,
      actorUserId,
      OrganizationManagementPermission.ManageInvitations
    );
    const allowedBusinessRoles = new Set(settings.resourceAllowlist.organizationRoleIds);
    if (organizationRoleIds.length > 0 && !settings.modules.businessRoles) {
      throw notFound();
    }
    if (organizationManagementRoleIds.length > 0 && !settings.modules.managementRoles) {
      throw notFound();
    }
    if (organizationRoleIds.some((id) => !allowedBusinessRoles.has(id))) {
      throw forbidden();
    }

    if (organizationRoleIds.length > 0) {
      if (!access.permissions.includes(OrganizationManagementPermission.AssignBusinessRoles)) {
        throw forbidden();
      }
      const roles = convertToIdentifiers(OrganizationRoles, true);
      const { count } = await this.queries.pool.one<{ count: string }>(sql`
        select count(*) from ${roles.table}
        where ${roles.fields.id} = any(${sql.array(organizationRoleIds, 'varchar')})
      `);
      if (Number(count) !== new Set(organizationRoleIds).size) {
        throw invalidInput('One or more organization roles do not exist.');
      }
    }

    if (organizationManagementRoleIds.length > 0) {
      if (!access.permissions.includes(OrganizationManagementPermission.AssignManagementRoles)) {
        throw forbidden();
      }
      const roles = convertToIdentifiers(OrganizationManagementRoles, true);
      const selectedRoles = await this.queries.pool.any<
        Pick<OrganizationManagementRole, 'id' | 'type'>
      >(sql`
        select ${roles.fields.id}, ${roles.fields.type} from ${roles.table}
        where ${roles.fields.organizationId} = ${organizationId}
          and ${roles.fields.id} = any(
            ${sql.array(organizationManagementRoleIds, 'varchar')}
          )
      `);
      if (selectedRoles.length !== new Set(organizationManagementRoleIds).size) {
        throw invalidInput('One or more management roles do not belong to the organization.');
      }
      if (
        !access.isOwner &&
        selectedRoles.some(({ type }) => type === OrganizationManagementRoleType.Owner)
      ) {
        throw forbidden();
      }
    }

    return settings;
  }

  async listJitEmailDomains(organizationId: string, userId: string) {
    await this.assertModule('jit');
    await this.assertPermission(organizationId, userId, OrganizationManagementPermission.ManageJit);
    const [, emailDomains] =
      await this.queries.organizations.jit.emailDomains.getEntities(organizationId);
    const verifications = convertToIdentifiers(OrganizationJitEmailDomainVerifications, true);
    const pending = await this.queries.pool.any(sql`
      select ${verifications.table}.* from ${verifications.table}
      where ${verifications.fields.organizationId} = ${organizationId}
      order by ${verifications.fields.createdAt} desc
    `);
    return { emailDomains, verifications: pending };
  }

  async createJitEmailDomainVerification(organizationId: string, userId: string, input: string) {
    await this.assertModule('jit');
    await this.assertPermission(organizationId, userId, OrganizationManagementPermission.ManageJit);

    const domain = normalizeDomainInput(input);
    return this.queries.pool.transaction(async (connection) => {
      await connection.query(sql`select pg_advisory_xact_lock(hashtext(${domain}))`);
      await this.assertDomainIsAvailable(organizationId, domain, connection);
      const identifiers = convertToIdentifiers(OrganizationJitEmailDomainVerifications, true);
      const existing = await connection.maybeOne<OrganizationJitEmailDomainVerification>(sql`
        select ${identifiers.table}.* from ${identifiers.table}
        where ${identifiers.fields.domain} = ${domain}
        for update
      `);
      if (existing?.organizationId !== undefined && existing.organizationId !== organizationId) {
        throw invalidInput('The email domain is already claimed by another organization.');
      }
      if (
        existing?.status === OrganizationJitEmailDomainVerificationStatus.Verified ||
        (existing?.status === OrganizationJitEmailDomainVerificationStatus.Pending &&
          existing.expiresAt > Date.now())
      ) {
        return existing;
      }
      if (existing) {
        const staleQueries = new SchemaQueries(connection, OrganizationJitEmailDomainVerifications);
        await staleQueries.deleteById(existing.id);
      }

      const verifications = new SchemaQueries(connection, OrganizationJitEmailDomainVerifications);
      return verifications.insert({
        id: generateStandardId(),
        organizationId,
        domain,
        verificationValue: generateStandardSecret(),
        status: OrganizationJitEmailDomainVerificationStatus.Pending,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      });
    });
  }

  async verifyJitEmailDomain(organizationId: string, verificationId: string, userId: string) {
    await this.assertModule('jit');
    await this.assertPermission(organizationId, userId, OrganizationManagementPermission.ManageJit);
    const schemaQueries = new SchemaQueries(
      this.queries.pool,
      OrganizationJitEmailDomainVerifications
    );
    const verification = await schemaQueries.findById(verificationId);
    if (verification.organizationId !== organizationId) {
      throw notFound();
    }
    if (verification.expiresAt <= Date.now()) {
      throw invalidInput('The domain verification challenge has expired.');
    }
    if (
      verification.lastCheckedAt !== null &&
      verification.lastCheckedAt > Date.now() - 60 * 1000
    ) {
      throw new RequestError({ code: 'request.message_rate_limited', status: 429 });
    }

    const lastCheckedAt = Date.now();
    await schemaQueries.updateById(verificationId, { lastCheckedAt });
    const records = await resolveDomainTxt(organizationDomainTxtHost(verification.domain));
    if (!hasOrganizationDomainTxtValue(records, verification.verificationValue)) {
      throw invalidInput('The expected TXT record was not found.');
    }

    await this.queries.pool.transaction(async (connection) => {
      await connection.query(sql`select pg_advisory_xact_lock(hashtext(${verification.domain}))`);
      await this.assertDomainIsAvailable(organizationId, verification.domain, connection);
      const emailDomains = convertToIdentifiers(OrganizationJitEmailDomains, true);
      await connection.query(sql`
        insert into ${emailDomains.table} (
          ${emailDomains.fields.organizationId},
          ${emailDomains.fields.emailDomain}
        ) values (${organizationId}, ${verification.domain})
        on conflict do nothing
      `);
      const transactionQueries = new SchemaQueries(
        connection,
        OrganizationJitEmailDomainVerifications
      );
      await transactionQueries.updateById(verificationId, {
        status: OrganizationJitEmailDomainVerificationStatus.Verified,
        lastCheckedAt,
        verifiedAt: Date.now(),
      });
    });

    return schemaQueries.findById(verificationId);
  }

  async deleteJitEmailDomain(
    organizationId: string,
    domainInput: string,
    userId: string
  ): Promise<void> {
    await this.assertModule('jit');
    await this.assertPermission(organizationId, userId, OrganizationManagementPermission.ManageJit);
    const domain = normalizeDomainInput(domainInput);
    await this.queries.organizations.jit.emailDomains.delete(organizationId, domain);
    const verifications = convertToIdentifiers(OrganizationJitEmailDomainVerifications, true);
    await this.queries.pool.query(sql`
      delete from ${verifications.table}
      where ${verifications.fields.organizationId} = ${organizationId}
        and ${verifications.fields.domain} = ${domain}
    `);
  }

  // eslint-disable-next-line complexity -- Each resource family is independently module- and permission-gated.
  async getAvailableResources(organizationId: string, userId: string) {
    const settings = await this.getSettings();
    const access = await this.getAccess(organizationId, userId);
    const canManageSso =
      settings.modules.jit &&
      access.permissions.includes(OrganizationManagementPermission.ManageJit);
    const canManageApplications =
      settings.modules.applications &&
      access.permissions.includes(OrganizationManagementPermission.ManageApplications);
    const canManageJitRoles =
      settings.modules.jit &&
      access.permissions.includes(OrganizationManagementPermission.ManageJit);
    const canAssignBusinessRoles =
      settings.modules.businessRoles &&
      access.permissions.includes(OrganizationManagementPermission.AssignBusinessRoles);
    if (!canManageSso && !canManageApplications && !canManageJitRoles && !canAssignBusinessRoles) {
      throw forbidden();
    }
    const [
      ssoConnectors,
      applications,
      organizationRoles,
      [, assignedSsoConnectors],
      [, assignedApplications],
      [, assignedJitRoles],
    ] = await Promise.all([
      this.queries.ssoConnectors.findByIds(settings.resourceAllowlist.ssoConnectorIds),
      this.queries.applications.findApplicationsByIds(settings.resourceAllowlist.applicationIds),
      this.queries.organizations.roles.findByIds(settings.resourceAllowlist.organizationRoleIds),
      this.queries.organizations.jit.ssoConnectors.getEntities(SsoConnectors, { organizationId }),
      this.queries.organizations.relations.apps.getEntities(Applications, { organizationId }),
      this.queries.organizations.jit.roles.getEntities(OrganizationRoles, { organizationId }),
    ]);
    const assignedSsoConnectorIds = new Set(assignedSsoConnectors.map(({ id }) => id));
    const assignedApplicationIds = new Set(assignedApplications.map(({ id }) => id));
    const assignedJitRoleIds = new Set(assignedJitRoles.map(({ id }) => id));
    return {
      ssoConnectors: (canManageSso ? ssoConnectors : []).map(({ id, connectorName }) => ({
        id,
        name: connectorName,
        assigned: assignedSsoConnectorIds.has(id),
      })),
      applications: (canManageApplications ? applications : []).map(({ id, name, type }) => ({
        id,
        name,
        type,
        assigned: assignedApplicationIds.has(id),
      })),
      organizationRoles: (canManageJitRoles || canAssignBusinessRoles ? organizationRoles : []).map(
        ({ id, name, description }) => ({
          id,
          name,
          description,
          assigned: assignedJitRoleIds.has(id),
        })
      ),
    };
  }

  async replaceOrganizationSsoConnectors(
    organizationId: string,
    userId: string,
    ssoConnectorIds: string[]
  ): Promise<void> {
    const settings = await this.assertModule('jit');
    await this.assertPermission(organizationId, userId, OrganizationManagementPermission.ManageJit);
    this.assertAllowlisted(ssoConnectorIds, settings.resourceAllowlist.ssoConnectorIds);
    await this.queries.organizations.jit.ssoConnectors.replace(organizationId, ssoConnectorIds);
  }

  async replaceOrganizationApplications(
    organizationId: string,
    userId: string,
    applicationIds: string[]
  ): Promise<void> {
    const settings = await this.assertModule('applications');
    await this.assertPermission(
      organizationId,
      userId,
      OrganizationManagementPermission.ManageApplications
    );
    this.assertAllowlisted(applicationIds, settings.resourceAllowlist.applicationIds);
    await this.queries.organizations.relations.apps.replace(organizationId, applicationIds);
  }

  async replaceMemberBusinessRoles(
    organizationId: string,
    targetUserId: string,
    actorUserId: string,
    organizationRoleIds: string[]
  ): Promise<void> {
    const settings = await this.assertModule('businessRoles');
    await this.assertPermission(
      organizationId,
      actorUserId,
      OrganizationManagementPermission.AssignBusinessRoles
    );
    await this.getAccess(organizationId, targetUserId);
    this.assertAllowlisted(organizationRoleIds, settings.resourceAllowlist.organizationRoleIds);
    await this.queries.organizations.relations.usersRoles.replace(
      organizationId,
      targetUserId,
      organizationRoleIds
    );
  }

  async replaceJitBusinessRoles(
    organizationId: string,
    userId: string,
    organizationRoleIds: string[]
  ): Promise<void> {
    const settings = await this.assertModule('jit');
    await this.assertPermission(organizationId, userId, OrganizationManagementPermission.ManageJit);
    this.assertAllowlisted(organizationRoleIds, settings.resourceAllowlist.organizationRoleIds);
    await this.queries.organizations.jit.roles.replace(organizationId, organizationRoleIds);
  }

  async listActivity(organizationId: string, userId: string) {
    await this.assertModule('activity');
    await this.assertPermission(
      organizationId,
      userId,
      OrganizationManagementPermission.ViewActivity
    );
    const logs = await this.queries.logs.findLogs(100, 0, {
      payload: { organizationId },
      includeKeyPrefix: [organizationLog.prefix],
    });
    return logs.map((log) => {
      const { target } = log.payload;
      if (
        target &&
        typeof target === 'object' &&
        target.type === 'email' &&
        typeof target.value === 'string'
      ) {
        const [local = '', domain = ''] = target.value.split('@');
        return {
          ...log,
          payload: {
            ...log.payload,
            target: {
              ...target,
              value: `${local.slice(0, 1)}***@${domain}`,
            },
          },
        };
      }
      return log;
    });
  }

  async listManagementRoles(
    organizationId: string,
    userId: string
  ): Promise<readonly OrganizationManagementRole[]> {
    const access = await this.getAccess(organizationId, userId);
    if (
      !access.permissions.includes(OrganizationManagementPermission.ManageManagementRoles) &&
      !access.permissions.includes(OrganizationManagementPermission.AssignManagementRoles)
    ) {
      throw forbidden();
    }
    return this.findManagementRoles(organizationId);
  }

  async listManagementRolesAsTenantAdmin(
    organizationId: string
  ): Promise<readonly OrganizationManagementRole[]> {
    await this.queries.organizations.findById(organizationId);
    return this.findManagementRoles(organizationId);
  }

  async createManagementRoleAsTenantAdmin(
    organizationId: string,
    data: Pick<OrganizationManagementRole, 'name'> &
      Partial<Pick<OrganizationManagementRole, 'description' | 'permissions'>>
  ): Promise<Readonly<OrganizationManagementRole>> {
    await this.queries.organizations.findById(organizationId);
    const queries = new SchemaQueries(this.queries.pool, OrganizationManagementRoles);
    return queries.insert({
      id: generateStandardId(),
      organizationId,
      name: data.name,
      description: data.description ?? null,
      permissions: data.permissions ?? [],
      type: OrganizationManagementRoleType.Custom,
    });
  }

  async updateManagementRoleAsTenantAdmin(
    organizationId: string,
    roleId: string,
    data: Partial<Pick<OrganizationManagementRole, 'name' | 'description' | 'permissions'>>
  ): Promise<Readonly<OrganizationManagementRole>> {
    const role = await this.findManagementRole(organizationId, roleId);
    if (role.type === OrganizationManagementRoleType.Owner) {
      throw invalidInput('The Owner role is immutable.');
    }
    const queries = new SchemaQueries(this.queries.pool, OrganizationManagementRoles);
    return queries.updateById(roleId, data);
  }

  async deleteManagementRoleAsTenantAdmin(organizationId: string, roleId: string): Promise<void> {
    const role = await this.findManagementRole(organizationId, roleId);
    if (role.type === OrganizationManagementRoleType.Owner) {
      throw invalidInput('The Owner role cannot be deleted.');
    }
    const queries = new SchemaQueries(this.queries.pool, OrganizationManagementRoles);
    await queries.deleteById(roleId);
  }

  async assignManagementRoleAsTenantAdmin(
    organizationId: string,
    roleId: string,
    targetUserId: string
  ): Promise<void> {
    await this.findManagementRole(organizationId, roleId);
    await this.getAccess(organizationId, targetUserId);
    await this.insertManagementRoleAssignment(this.queries.pool, {
      organizationId,
      userId: targetUserId,
      roleId,
    });
  }

  async unassignManagementRoleAsTenantAdmin(
    organizationId: string,
    roleId: string,
    targetUserId: string
  ): Promise<void> {
    const role = await this.findManagementRole(organizationId, roleId);
    await this.queries.pool.transaction(async (connection) => {
      if (role.type === OrganizationManagementRoleType.Owner) {
        await this.assertOwnerCanBeRemoved(connection, organizationId, roleId, targetUserId);
      }
      const relations = convertToIdentifiers(OrganizationManagementRoleUserRelations, true);
      await connection.query(sql`
        delete from ${relations.table}
        where ${relations.fields.organizationId} = ${organizationId}
          and ${relations.fields.userId} = ${targetUserId}
          and ${relations.fields.organizationManagementRoleId} = ${roleId}
      `);
    });
  }

  async createManagementRole(
    organizationId: string,
    userId: string,
    data: Pick<OrganizationManagementRole, 'name'> &
      Partial<Pick<OrganizationManagementRole, 'description' | 'permissions'>>
  ): Promise<Readonly<OrganizationManagementRole>> {
    await this.assertPermission(
      organizationId,
      userId,
      OrganizationManagementPermission.ManageManagementRoles
    );
    const queries = new SchemaQueries(this.queries.pool, OrganizationManagementRoles);
    return queries.insert({
      id: generateStandardId(),
      organizationId,
      name: data.name,
      description: data.description ?? null,
      permissions: data.permissions ?? [],
      type: OrganizationManagementRoleType.Custom,
    });
  }

  async updateManagementRole(
    organizationId: string,
    roleId: string,
    userId: string,
    data: Partial<Pick<OrganizationManagementRole, 'name' | 'description' | 'permissions'>>
  ): Promise<Readonly<OrganizationManagementRole>> {
    await this.assertPermission(
      organizationId,
      userId,
      OrganizationManagementPermission.ManageManagementRoles
    );
    const role = await this.findManagementRole(organizationId, roleId);

    if (role.type === OrganizationManagementRoleType.Owner) {
      throw invalidInput('The Owner role is immutable.');
    }

    const queries = new SchemaQueries(this.queries.pool, OrganizationManagementRoles);
    return queries.updateById(roleId, data);
  }

  async deleteManagementRole(
    organizationId: string,
    roleId: string,
    userId: string
  ): Promise<void> {
    await this.assertPermission(
      organizationId,
      userId,
      OrganizationManagementPermission.ManageManagementRoles
    );
    const role = await this.findManagementRole(organizationId, roleId);

    if (role.type === OrganizationManagementRoleType.Owner) {
      throw invalidInput('The Owner role cannot be deleted.');
    }

    const queries = new SchemaQueries(this.queries.pool, OrganizationManagementRoles);
    await queries.deleteById(roleId);
  }

  async assignManagementRole({
    organizationId,
    roleId,
    targetUserId,
    actorUserId,
  }: {
    organizationId: string;
    roleId: string;
    targetUserId: string;
    actorUserId: string;
  }): Promise<void> {
    const access = await this.assertPermission(
      organizationId,
      actorUserId,
      OrganizationManagementPermission.AssignManagementRoles
    );
    const role = await this.findManagementRole(organizationId, roleId);

    if (role.type === OrganizationManagementRoleType.Owner && !access.isOwner) {
      throw forbidden();
    }

    await this.getAccess(organizationId, targetUserId);
    await this.insertManagementRoleAssignment(this.queries.pool, {
      organizationId,
      userId: targetUserId,
      roleId,
    });
  }

  async unassignManagementRole({
    organizationId,
    roleId,
    targetUserId,
    actorUserId,
  }: {
    organizationId: string;
    roleId: string;
    targetUserId: string;
    actorUserId: string;
  }): Promise<void> {
    const actorAccess = await this.assertPermission(
      organizationId,
      actorUserId,
      OrganizationManagementPermission.AssignManagementRoles
    );
    const role = await this.findManagementRole(organizationId, roleId);

    if (role.type === OrganizationManagementRoleType.Owner && !actorAccess.isOwner) {
      throw forbidden();
    }

    await this.queries.pool.transaction(async (connection) => {
      if (role.type === OrganizationManagementRoleType.Owner) {
        await this.assertOwnerCanBeRemoved(connection, organizationId, roleId, targetUserId);
      }

      const relations = convertToIdentifiers(OrganizationManagementRoleUserRelations, true);
      await connection.query(sql`
        delete from ${relations.table}
        where ${relations.fields.organizationId} = ${organizationId}
          and ${relations.fields.userId} = ${targetUserId}
          and ${relations.fields.organizationManagementRoleId} = ${roleId}
      `);
    });
  }

  async bootstrapOwner(organizationId: string, userId: string): Promise<void> {
    await this.queries.pool.transaction(async (connection) => {
      const organizations = convertToIdentifiers(Organizations, true);
      await connection.one(sql`
        select ${organizations.fields.id}
        from ${organizations.table}
        where ${organizations.fields.id} = ${organizationId}
        for update
      `);

      const existingRoles = await this.findManagementRoles(organizationId, connection);
      if (existingRoles.some(({ type }) => type === OrganizationManagementRoleType.Owner)) {
        throw invalidInput('This organization already has an Owner role.');
      }

      const membership = convertToIdentifiers(OrganizationUserRelations, true);
      const isMember = await connection.exists(sql`
        select 1 from ${membership.table}
        where ${membership.fields.organizationId} = ${organizationId}
          and ${membership.fields.userId} = ${userId}
      `);
      if (!isMember) {
        throw invalidInput('The initial owner must already be an organization member.');
      }

      const managementRoles = new SchemaQueries(connection, OrganizationManagementRoles);
      const owner = await managementRoles.insert({
        id: generateStandardId(),
        organizationId,
        name: 'Owner',
        description: 'Organization owners with exclusive control over ownership and deletion.',
        type: OrganizationManagementRoleType.Owner,
        permissions: [],
      });
      if (!existingRoles.some(({ name }) => name === 'Administrator')) {
        await managementRoles.insert({
          id: generateStandardId(),
          organizationId,
          name: 'Administrator',
          description: 'Full organization administration without ownership-only actions.',
          type: OrganizationManagementRoleType.Custom,
          permissions: [...organizationManagementPermissions],
        });
      }
      await this.insertManagementRoleAssignment(connection, {
        organizationId,
        userId,
        roleId: owner.id,
      });
    });
  }

  private async assertCanCreate(
    userId: string,
    settings: OrganizationCenterSettings,
    pool: CommonQueryMethods = this.queries.pool
  ): Promise<void> {
    const { creationPolicy } = settings;

    if (creationPolicy.mode === 'disabled') {
      throw forbidden();
    }

    if (creationPolicy.mode === 'roles') {
      if (creationPolicy.allowedRoleIds.length === 0) {
        throw forbidden();
      }
      const userRoles = convertToIdentifiers(UsersRoles, true);
      const allowed = await pool.exists(sql`
        select 1 from ${userRoles.table}
        where ${userRoles.fields.userId} = ${userId}
          and ${userRoles.fields.roleId} = any(
            ${sql.array(creationPolicy.allowedRoleIds, 'varchar')}
          )
      `);
      if (!allowed) {
        throw forbidden();
      }
    }

    const organizations = convertToIdentifiers(Organizations, true);
    const { count } = await pool.one<{ count: string }>(sql`
      select count(*) from ${organizations.table}
      where ${organizations.fields.createdBy} = ${userId}
    `);
    if (Number(count) >= creationPolicy.maxOrganizationsPerUser) {
      throw invalidInput('The per-user organization creation limit has been reached.');
    }
  }

  private async assertDomainIsAvailable(
    organizationId: string,
    domain: string,
    pool: CommonQueryMethods = this.queries.pool
  ): Promise<void> {
    const emailDomains = convertToIdentifiers(OrganizationJitEmailDomains, true);
    const conflicts = await pool.any<{ organizationId: string }>(sql`
      select distinct ${emailDomains.fields.organizationId}
      from ${emailDomains.table}
      where lower(${emailDomains.fields.emailDomain}) = ${domain}
    `);
    if (conflicts.some((row) => row.organizationId !== organizationId)) {
      throw invalidInput('The email domain is already claimed by another organization.');
    }
  }

  private assertAllowlisted(selected: string[], allowlist: string[]): void {
    const allowed = new Set(allowlist);
    if (selected.some((id) => !allowed.has(id))) {
      throw forbidden();
    }
  }

  private async findManagementRoles(
    organizationId: string,
    pool: CommonQueryMethods = this.queries.pool
  ): Promise<readonly OrganizationManagementRole[]> {
    const roles = convertToIdentifiers(OrganizationManagementRoles, true);
    return pool.any<OrganizationManagementRole>(sql`
      select ${roles.table}.* from ${roles.table}
      where ${roles.fields.organizationId} = ${organizationId}
      order by ${roles.fields.type} desc, ${roles.fields.name}
    `);
  }

  private async findManagementRole(
    organizationId: string,
    roleId: string,
    pool: CommonQueryMethods = this.queries.pool
  ): Promise<Readonly<OrganizationManagementRole>> {
    const roles = convertToIdentifiers(OrganizationManagementRoles, true);
    const role = await pool.maybeOne<OrganizationManagementRole>(
      sql`
      select ${roles.table}.* from ${roles.table}
      where ${roles.fields.id} = ${roleId}
        and ${roles.fields.organizationId} = ${organizationId}
    `
    );
    if (!role) {
      throw notFound();
    }
    return role;
  }

  private async insertManagementRoleAssignment(
    pool: CommonQueryMethods,
    { organizationId, userId, roleId }: { organizationId: string; userId: string; roleId: string }
  ): Promise<void> {
    // PostgreSQL does not allow table-qualified identifiers in an INSERT target column list.
    const relations = convertToIdentifiers(OrganizationManagementRoleUserRelations);
    await pool.query(sql`
      insert into ${relations.table} (
        ${relations.fields.organizationId},
        ${relations.fields.userId},
        ${relations.fields.organizationManagementRoleId}
      ) values (${organizationId}, ${userId}, ${roleId})
      on conflict do nothing
    `);
  }

  private async assertOwnerCanBeRemoved(
    pool: CommonQueryMethods,
    organizationId: string,
    ownerRoleId: string,
    userId: string
  ): Promise<void> {
    const roles = convertToIdentifiers(OrganizationManagementRoles, true);
    const relations = convertToIdentifiers(OrganizationManagementRoleUserRelations, true);

    await pool.one(sql`
      select ${roles.fields.id} from ${roles.table}
      where ${roles.fields.id} = ${ownerRoleId}
        and ${roles.fields.organizationId} = ${organizationId}
      for update
    `);
    const assignmentExists = await pool.exists(sql`
      select 1 from ${relations.table}
      where ${relations.fields.organizationId} = ${organizationId}
        and ${relations.fields.organizationManagementRoleId} = ${ownerRoleId}
        and ${relations.fields.userId} = ${userId}
    `);

    if (!assignmentExists) {
      return;
    }

    const { count } = await pool.one<{ count: string }>(sql`
      select count(*) from ${relations.table}
      where ${relations.fields.organizationId} = ${organizationId}
        and ${relations.fields.organizationManagementRoleId} = ${ownerRoleId}
    `);
    if (Number(count) <= 1) {
      throw invalidInput('The last Owner cannot be removed or demoted.');
    }
  }
}
/* eslint-enable max-lines */

import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

import { applyTableRls, dropTableRls } from './utils/1704934999-tables.js';

const alteration: AlterationScript = {
  beforeUp: async (pool) => {
    await pool.query(sql`
      create index concurrently logs__organization_id
        on logs (tenant_id, (payload->>'organizationId'));
    `);
  },
  up: async (pool) => {
    await pool.query(sql`
      alter type organization_invitation_status add value if not exists 'Declined';

      alter table account_centers
        add column organization_center jsonb not null default '{
          "enabled": false,
          "modules": {
            "profile": true,
            "branding": true,
            "members": true,
            "invitations": true,
            "managementRoles": true,
            "businessRoles": true,
            "security": true,
            "jit": true,
            "applications": true,
            "activity": true,
            "deletion": true
          },
          "creationPolicy": {
            "mode": "disabled",
            "allowedRoleIds": [],
            "maxOrganizationsPerUser": 1
          },
          "invitationPolicy": {
            "allowRegistration": true,
            "expiresInDays": 7
          },
          "resourceAllowlist": {
            "ssoConnectorIds": [],
            "applicationIds": [],
            "organizationRoleIds": []
          }
        }'::jsonb;

      alter table organizations
        add column created_by varchar(21),
        add constraint organizations__created_by__fk
          foreign key (tenant_id, created_by)
          references users (tenant_id, id) on update cascade on delete set null;

      create index organizations__created_by
        on organizations (tenant_id, created_by);

      create type organization_management_role_type as enum ('Owner', 'Custom');

      create table organization_management_roles (
        tenant_id varchar(21) not null
          references tenants (id) on update cascade on delete cascade,
        id varchar(21) not null,
        organization_id varchar(21) not null
          references organizations (id) on update cascade on delete cascade,
        name varchar(128) not null,
        description varchar(256),
        type organization_management_role_type not null default 'Custom',
        permissions jsonb not null default '[]'::jsonb,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now(),
        primary key (id),
        constraint organization_management_roles__organization_name
          unique (tenant_id, organization_id, name)
      );

      create unique index organization_management_roles__owner
        on organization_management_roles (tenant_id, organization_id)
        where type = 'Owner';

      create index organization_management_roles__organization_id
        on organization_management_roles (tenant_id, organization_id);

      create trigger set_updated_at before update on organization_management_roles
        for each row execute procedure set_updated_at();

      create table organization_management_role_user_relations (
        tenant_id varchar(21) not null
          references tenants (id) on update cascade on delete cascade,
        organization_id varchar(21) not null,
        user_id varchar(21) not null,
        organization_management_role_id varchar(21) not null,
        primary key (tenant_id, organization_id, user_id, organization_management_role_id),
        foreign key (tenant_id, organization_id, user_id)
          references organization_user_relations (tenant_id, organization_id, user_id)
            on update cascade on delete cascade,
        foreign key (organization_management_role_id)
          references organization_management_roles (id) on update cascade on delete cascade
      );

      create index organization_management_role_user_relations__user
        on organization_management_role_user_relations (tenant_id, user_id, organization_id);

      create table organization_invitation_management_role_relations (
        tenant_id varchar(21) not null
          references tenants (id) on update cascade on delete cascade,
        organization_invitation_id varchar(21) not null
          references organization_invitations (id) on update cascade on delete cascade,
        organization_management_role_id varchar(21) not null
          references organization_management_roles (id) on update cascade on delete cascade,
        primary key (
          tenant_id,
          organization_invitation_id,
          organization_management_role_id
        )
      );

      create type organization_jit_email_domain_verification_status
        as enum ('Pending', 'Verified');

      create table organization_jit_email_domain_verifications (
        tenant_id varchar(21) not null
          references tenants (id) on update cascade on delete cascade,
        id varchar(21) not null,
        organization_id varchar(21) not null
          references organizations (id) on update cascade on delete cascade,
        domain varchar(256) not null,
        verification_value varchar(256) not null,
        status organization_jit_email_domain_verification_status not null default 'Pending',
        created_at timestamptz not null default now(),
        expires_at timestamptz not null,
        last_checked_at timestamptz,
        verified_at timestamptz,
        primary key (id),
        constraint organization_jit_email_domain_verifications__domain
          unique (tenant_id, domain)
      );

      create index organization_jit_email_domain_verifications__organization
        on organization_jit_email_domain_verifications (tenant_id, organization_id);
    `);

    for (const table of [
      'organization_management_roles',
      'organization_management_role_user_relations',
      'organization_invitation_management_role_relations',
      'organization_jit_email_domain_verifications',
    ]) {
      // eslint-disable-next-line no-await-in-loop -- RLS DDL must follow the table dependency order.
      await applyTableRls(pool, table);
    }
  },
  beforeDown: async (pool) => {
    await pool.query(sql`
      drop index concurrently if exists logs__organization_id;
    `);
  },
  down: async (pool) => {
    for (const table of [
      'organization_jit_email_domain_verifications',
      'organization_invitation_management_role_relations',
      'organization_management_role_user_relations',
      'organization_management_roles',
    ]) {
      // eslint-disable-next-line no-await-in-loop -- RLS teardown must follow reverse dependency order.
      await dropTableRls(pool, table);
    }

    await pool.query(sql`
      drop table organization_jit_email_domain_verifications;
      drop type organization_jit_email_domain_verification_status;
      drop table organization_invitation_management_role_relations;
      drop table organization_management_role_user_relations;
      drop table organization_management_roles;
      drop type organization_management_role_type;

      alter table organizations
        drop constraint organizations__created_by__fk,
        drop column created_by;

      alter table account_centers
        drop column organization_center;

      update organization_invitations
        set status = 'Revoked'
        where status = 'Declined';
      create type organization_invitation_status_old
        as enum ('Pending', 'Accepted', 'Expired', 'Revoked');
      alter table organization_invitations
        alter column status type organization_invitation_status_old
          using status::text::organization_invitation_status_old;
      drop type organization_invitation_status;
      alter type organization_invitation_status_old rename to organization_invitation_status;
    `);
  },
};

export default alteration;

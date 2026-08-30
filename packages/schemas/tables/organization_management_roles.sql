/* init_order = 1.2 */

create type organization_management_role_type as enum ('Owner', 'Custom');

/** Organization-local management roles used by the prebuilt organization center. */
create table organization_management_roles (
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  id varchar(21) not null,
  organization_id varchar(21) not null
    references organizations (id) on update cascade on delete cascade,
  name varchar(128) not null,
  description varchar(256),
  type organization_management_role_type not null default 'Custom',
  permissions jsonb /* @use OrganizationManagementPermissions */ not null default '[]'::jsonb,
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

create trigger set_updated_at
  before update on organization_management_roles
  for each row
  execute procedure set_updated_at();

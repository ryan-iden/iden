/* init_order = 2.1 */

/** Organization-local management role assignments for users. */
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

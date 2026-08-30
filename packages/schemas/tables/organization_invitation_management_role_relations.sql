/* init_order = 3.1 */

/** Management roles that will be assigned when an organization invitation is accepted. */
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

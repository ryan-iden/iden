/* init_order = 2.1 */

create type organization_jit_email_domain_verification_status as enum ('Pending', 'Verified');

/** DNS ownership challenges for organization JIT email domains. */
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

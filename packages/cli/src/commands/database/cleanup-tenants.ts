import { rm } from 'node:fs/promises';
import path from 'node:path';

import {
  adminTenantId,
  defaultTenantId,
  getManagementApiResourceIndicator,
  getMapiProxyM2mApp,
  getMapiProxyRole,
  getTenantOrganizationId,
} from '@logto/schemas';
import { sql, type DatabaseTransactionConnection } from '@silverhand/slonik';
import chalk from 'chalk';
import type { CommandModule } from 'yargs';

import { createPoolFromConfig } from '../../database.js';
import { consoleLog } from '../../utils.js';

type Candidate = {
  id: string;
  dbUser: string;
  deletedAt: Date;
};

type CleanupOptions = {
  retentionDays: number;
  tenantId?: string;
  confirm: boolean;
};

const findCandidates = async ({
  retentionDays,
  tenantId,
}: Pick<CleanupOptions, 'retentionDays' | 'tenantId'>) => {
  const pool = await createPoolFromConfig();
  const query = tenantId
    ? sql`
        select id, coalesce(db_user, '') as db_user, deleted_at
        from tenants
        where id = ${tenantId}
          and deleted_at is not null
          and deleted_at <= now() - (${retentionDays} * interval '1 day')
      `
    : sql`
        select id, coalesce(db_user, '') as db_user, deleted_at
        from tenants
        where deleted_at is not null
          and deleted_at <= now() - (${retentionDays} * interval '1 day')
        order by deleted_at
      `;
  const candidates = await pool.any<Candidate>(query);
  await pool.end();
  return candidates.filter(({ id }) => ![defaultTenantId, adminTenantId].includes(id));
};

const deleteRowsByColumn = async (
  connection: DatabaseTransactionConnection,
  columnName: string,
  value: string
) => {
  const tables = await connection.any<{ tableSchema: string; tableName: string }>(sql`
    select table_schema, table_name
    from information_schema.columns
    where table_schema = 'public' and column_name = ${columnName}
  `);

  await Promise.all(
    tables.map(async ({ tableSchema, tableName }) =>
      connection.query(sql`
        delete from ${sql.identifier([tableSchema, tableName])}
        where ${sql.identifier([columnName])} = ${value}
      `)
    )
  );
};

const cleanupTenant = async (candidate: Candidate) => {
  const pool = await createPoolFromConfig();
  const { id, dbUser } = candidate;
  const organizationId = getTenantOrganizationId(id);
  const proxyApplicationId = getMapiProxyM2mApp(id).id;
  const proxyRoleId = getMapiProxyRole(id).id;

  try {
    await pool.transaction(async (connection) => {
      // Runtime provisioning creates roles, so this maintenance operation requires the same
      // database-level privileges. Disabling triggers keeps tenant-wide deletion deterministic
      // across foreign-key ordering while the whole operation remains transactional.
      await connection.query(sql`set local session_replication_role = replica`);

      const resource = await connection.maybeOne<{ id: string }>(sql`
        select id from resources
        where tenant_id = ${adminTenantId}
          and indicator = ${getManagementApiResourceIndicator(id)}
      `);

      await deleteRowsByColumn(connection, 'tenant_id', id);
      await deleteRowsByColumn(connection, 'organization_id', organizationId);
      await deleteRowsByColumn(connection, 'application_id', proxyApplicationId);
      await deleteRowsByColumn(connection, 'role_id', proxyRoleId);
      if (resource) {
        await deleteRowsByColumn(connection, 'resource_id', resource.id);
      }

      await connection.query(sql`delete from organizations where id = ${organizationId}`);
      await connection.query(sql`delete from applications where id = ${proxyApplicationId}`);
      await connection.query(sql`delete from roles where id = ${proxyRoleId}`);
      if (resource) {
        await connection.query(sql`delete from resources where id = ${resource.id}`);
      }
      await connection.query(sql`delete from tenants where id = ${id}`);

      if (dbUser) {
        await connection.query(sql`drop owned by ${sql.identifier([dbUser])}`);
        await connection.query(sql`drop role ${sql.identifier([dbUser])}`);
      }
    });
  } finally {
    await pool.end();
  }

  if (/^[a-z][\da-z-]{2,20}$/.test(id)) {
    const dataRoot = path.resolve(process.env.SELF_HOSTED_DATA_PATH ?? '.logto-data');
    await rm(path.join(dataRoot, id), { recursive: true, force: true });
  }
};

const cleanupTenants: CommandModule<unknown, CleanupOptions> = {
  command: 'cleanup-tenants',
  describe: 'Permanently remove self-hosted tenants whose soft-delete retention has expired',
  builder: (yargs) =>
    yargs
      .option('retentionDays', {
        type: 'number',
        default: 30,
        describe: 'Minimum number of days since soft deletion',
      })
      .option('tenantId', {
        type: 'string',
        describe: 'Limit cleanup to one tenant',
      })
      .option('confirm', {
        type: 'boolean',
        default: false,
        describe: 'Permanently delete the listed tenant data',
      }),
  handler: async (options) => {
    if (!Number.isInteger(options.retentionDays) || options.retentionDays < 0) {
      consoleLog.fatal('The retention period must be a non-negative integer.');
    }

    const candidates = await findCandidates(options);
    if (candidates.length === 0) {
      consoleLog.info('No expired soft-deleted tenants found.');
      return;
    }

    for (const candidate of candidates) {
      consoleLog.plain(
        `${chalk.yellow(candidate.id)} deleted at ${candidate.deletedAt.toISOString()}`
      );
    }

    if (!options.confirm) {
      consoleLog.warn('Dry run only. Pass --confirm to permanently delete these tenants.');
      return;
    }

    for (const candidate of candidates) {
      // eslint-disable-next-line no-await-in-loop -- Cleanup is intentionally serialized to limit destructive database load.
      await cleanupTenant(candidate);
      consoleLog.succeed(`Permanently removed tenant ${chalk.green(candidate.id)}`);
    }
  },
};

export default cleanupTenants;

import { type systemGuards, type SystemKey, Systems } from '@logto/schemas';
import type { CommonQueryMethods } from '@silverhand/slonik';
import { sql } from '@silverhand/slonik';
import { type z } from 'zod';

import { convertToIdentifiers } from '#src/utils/sql.js';

const { table, fields } = convertToIdentifiers(Systems);

export const createSystemsQuery = (pool: CommonQueryMethods) => {
  const findSystemByKey = async (key: SystemKey) =>
    pool.maybeOne<Record<string, unknown>>(sql`
      select ${fields.value} from ${table}
      where ${fields.key} = ${key}
    `);

  const upsertSystemByKey = async <T extends SystemKey>(
    key: T,
    value: z.infer<(typeof systemGuards)[T]>
  ) =>
    pool.one<Record<string, unknown>>(sql`
      insert into ${table} (${fields.key}, ${fields.value})
      values (${key}, ${sql.jsonb(value)})
      on conflict (${fields.key}) do update set ${fields.value} = excluded.${fields.value}
      returning ${fields.value}
    `);

  return {
    findSystemByKey,
    upsertSystemByKey,
  };
};

import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter table tenants add column deleted_at timestamptz;
      create index tenants__deleted_at on tenants (deleted_at) where deleted_at is not null;
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      drop index tenants__deleted_at;
      alter table tenants drop column deleted_at;
    `);
  },
};

export default alteration;

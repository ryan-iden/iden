import { adminTenantId, defaultTenantId } from '@logto/schemas';

import { filterSelfHostedUserTenants } from './tenant-list.js';

describe('self-hosted tenant list', () => {
  it('hides the internal admin tenant even when it has the same display name', () => {
    expect(
      filterSelfHostedUserTenants([
        { id: defaultTenantId, name: 'My Project' },
        { id: adminTenantId, name: 'My Project' },
        { id: 'tenant-a', name: 'Tenant A' },
      ])
    ).toEqual([
      { id: defaultTenantId, name: 'My Project' },
      { id: 'tenant-a', name: 'Tenant A' },
    ]);
  });
});

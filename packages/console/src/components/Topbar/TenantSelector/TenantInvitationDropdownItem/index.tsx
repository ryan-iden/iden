import { getTenantIdFromOrganizationId, type TenantTag } from '@logto/schemas';
import { useContext } from 'react';

import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import TenantEnvTag from '@/components/TenantEnvTag';
import { TenantsContext } from '@/contexts/TenantsProvider';
import Button from '@/ds-components/Button';

import styles from './index.module.scss';

type Props = {
  readonly data: {
    id: string;
    organizationId: string;
    tenantName: string;
    tenantTag: TenantTag;
  };
};

function TenantInvitationDropdownItem({ data }: Props) {
  const cloudApi = useCloudApi();
  const { navigateTenant, resetTenants } = useContext(TenantsContext);
  const { id, organizationId, tenantName, tenantTag } = data;

  return (
    <div className={styles.item}>
      <div className={styles.meta}>
        <div className={styles.name}>{tenantName}</div>
        <TenantEnvTag tag={tenantTag} />
      </div>
      <Button
        size="small"
        type="outline"
        title="general.join"
        onClick={async () => {
          await cloudApi.patch(`/api/invitations/:invitationId/status`, {
            params: { invitationId: id },
            // The hosted control-plane package has its own status enum version.
            // eslint-disable-next-line no-restricted-syntax -- This literal bridges the independently versioned @logto/cloud router type.
            body: { status: 'Accepted' as never },
          });
          const data = await cloudApi.get('/api/tenants');
          resetTenants(data);
          navigateTenant(getTenantIdFromOrganizationId(organizationId));
        }}
      />
    </div>
  );
}

export default TenantInvitationDropdownItem;

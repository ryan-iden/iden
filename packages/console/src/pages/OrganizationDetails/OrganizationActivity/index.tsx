import { useOutletContext } from 'react-router-dom';

import AuditLogTable from '@/components/AuditLogTable';

import type { OrganizationDetailsOutletContext } from '../types';

function OrganizationActivity() {
  const { data } = useOutletContext<OrganizationDetailsOutletContext>();

  return <AuditLogTable organizationId={data.id} />;
}

export default OrganizationActivity;

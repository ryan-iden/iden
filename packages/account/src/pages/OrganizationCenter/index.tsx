import { useParams } from 'react-router-dom';

import PageFooter from '@ac/components/PageFooter';

import homeStyles from '../Home/index.module.scss';

import OrganizationDetails from './OrganizationDetails';
import OrganizationList from './OrganizationList';

const OrganizationCenter = () => {
  const { organizationId, section } = useParams();

  return (
    <div className={homeStyles.container}>
      {organizationId ? (
        <OrganizationDetails organizationId={organizationId} section={section ?? 'overview'} />
      ) : (
        <OrganizationList />
      )}
      <PageFooter />
    </div>
  );
};

export default OrganizationCenter;

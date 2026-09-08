import AppLayout from '@experience/Layout/AppLayout';
import ExperienceContext from '@experience/Providers/PageContextProvider/PageContext';
import Button from '@experience/shared/components/Button';
import DefaultUserAvatar from '@experience/shared/components/DefaultUserAvatar';
import InputField from '@experience/shared/components/InputFields/InputField';
import LogtoSignature from '@experience/shared/components/LogtoSignature';
import {
  initializeProductBrand,
  applyProductBrandToDocument,
} from '@experience/shared/utils/product-brand';
import { synchronizeAppearance } from '@iden/ui-foundation';
import { MotionRuntime } from '@iden/ui-foundation/react';
import resources from '@logto/phrases-experience';
import { LogtoProvider } from '@logto/react';
import {
  type OrganizationCenterMember,
  OrganizationManagementRoleType,
  Theme,
} from '@logto/schemas';
import i18next from 'i18next';
import { useContext, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { initReactI18next, useTranslation } from 'react-i18next';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import appStyles from '@ac/App.module.scss';
import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import MobileTabNav from '@ac/components/MobileTabNav';
import PageHeader from '@ac/components/PageHeader';
import Sidebar from '@ac/components/Sidebar';
import { buildAccountNavItems } from '@ac/components/account-nav-items';
import MemberListItem from '@ac/pages/OrganizationCenter/MemberListItem';
import organizationStyles from '@ac/pages/OrganizationCenter/index.module.scss';
import '@experience/shared/scss/normalized.scss';
import '@ac/scss/normalized.scss';
import '@iden/ui-foundation/styles.css';

import styles from './index.module.scss';

const member: OrganizationCenterMember = {
  id: 'design-user-1',
  username: 'ryan',
  name: null,
  avatar: null,
  primaryEmail: 'ryan@example.test',
  createdAt: 1,
  organizationRoles: [],
  isOwner: true,
  organizationManagementRoles: [
    { id: 'owner', name: 'Owner', type: OrganizationManagementRoleType.Owner },
  ],
};
const navItems = buildAccountNavItems({
  hasProfile: true,
  hasSecurity: true,
  hasSessions: true,
  hasOrganizations: true,
});
const params = new URLSearchParams(location.search);
const theme = params.get('theme') === 'dark' ? Theme.Dark : Theme.Light;
const noopAsync = async () => {
  // The development specimen has no persistence side effects.
};

const Specimen = () => {
  const context = useContext(PageContext);
  const experience = useContext(ExperienceContext);
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [roleIds, setRoleIds] = useState<string[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const experienceValue = useMemo(() => ({ ...experience, theme }), [experience]);
  const accountValue = useMemo(
    () => ({ ...context, theme, userInfo: { id: member.id, username: member.username } }),
    [context]
  );
  if (params.get('surface') === 'auth') {
    return (
      <ExperienceContext.Provider value={experienceValue}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route
              path="*"
              element={
                <form
                  className={styles.form}
                  onSubmit={(event) => {
                    event.preventDefault();
                    setIsSaved(true);
                  }}
                >
                  <h1>{t('action.sign_in')}</h1>
                  <p>Identity, Unified.</p>
                  <InputField name="username" placeholder={t('input.username')} />
                  <InputField name="password" type="password" placeholder={t('input.password')} />
                  <Button htmlType="submit" title="action.sign_in" />
                  {isSaved && <p role="status">{t('action.continue')}</p>}
                </form>
              }
            />
          </Route>
        </Routes>
      </ExperienceContext.Provider>
    );
  }
  return (
    <PageContext.Provider value={accountValue}>
      <MotionRuntime isEnabled />
      <div className={appStyles.app}>
        <div className={`${appStyles.layout} ${appStyles.fullPage}`}>
          <PageHeader />
          <MobileTabNav items={navItems} />
          <div className={`${appStyles.container} ${appStyles.withSidebar}`}>
            <Sidebar items={navItems} />
            <main className={`${appStyles.main} ${styles.content}`}>
              <header className={styles.identity}>
                <DefaultUserAvatar seed="design-organization" className={styles.avatar} />
                <div>
                  <h1>{t('account_center.page.sidebar_organizations')}</h1>
                  <p>Atlas Workspace</p>
                </div>
              </header>
              <h2>{t('account_center.organizations.members.title')}</h2>
              <div className={organizationStyles.rows}>
                <MemberListItem
                  isOwner
                  hasBusinessRolePermission
                  hasRemoveMemberPermission
                  hasUnassignRolePermission
                  member={member}
                  isEditing={isEditing}
                  availableRoles={[
                    { id: 'reader', name: 'Reader' },
                    { id: 'editor', name: 'Editor' },
                  ]}
                  selectedRoleIds={roleIds}
                  onChangeRoles={setRoleIds}
                  onToggleEditor={() => {
                    setIsEditing((value) => !value);
                  }}
                  onCancel={() => {
                    setIsEditing(false);
                  }}
                  onSave={async () => {
                    setIsSaved(true);
                    setIsEditing(false);
                  }}
                  onRemove={noopAsync}
                  onUnassignRole={noopAsync}
                />
              </div>
              {isSaved && <p role="status">{t('account_center.organizations.save')}</p>}
              <LogtoSignature theme={theme} />
            </main>
          </div>
        </div>
      </div>
    </PageContext.Provider>
  );
};

// Development-only visual samples use production layouts and components with fixed, local data.
const boot = async () => {
  if (import.meta.env.PROD) {
    return;
  }
  await initializeProductBrand();
  applyProductBrandToDocument();
  await i18next.use(initReactI18next).init({
    resources,
    lng: params.get('locale') ?? 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });
  Reflect.set(document.documentElement, 'lang', i18next.language);
  Reflect.set(document.documentElement, 'dir', i18next.dir());
  document.body.classList.add(window.innerWidth < 600 ? 'mobile' : 'desktop');
  synchronizeAppearance(theme);
  const app = document.querySelector('#app');
  if (!app) {
    return;
  }
  createRoot(app).render(
    <MemoryRouter initialEntries={['/organizations']}>
      <LogtoProvider config={{ endpoint: location.origin, appId: 'design-lab' }}>
        <Specimen />
      </LogtoProvider>
    </MemoryRouter>
  );
};
void boot();

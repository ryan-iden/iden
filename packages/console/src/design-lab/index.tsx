import { LogtoProvider } from '@logto/react';
import { Theme } from '@logto/schemas';
import i18next from 'i18next';
import { useContext, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';
import { MemoryRouter } from 'react-router-dom';

import HelpDrawer from '@/components/HelpDrawer';
import { IdenProductIcon } from '@/components/IdenProductIcon';
import { IdenStateIllustration } from '@/components/IdenStateIllustration';
import { isSelfHostedParityEnabled } from '@/consts/env';
import ResponsiveNavigation from '@/containers/ConsoleContent/ResponsiveNavigation';
import WorkspaceNavigation from '@/containers/ConsoleContent/Sidebar/WorkspaceNavigation';
import workspaceStyles from '@/containers/ConsoleContent/index.module.scss';
import { AppThemeContext, AppThemeProvider } from '@/contexts/AppThemeProvider';
import Button from '@/ds-components/Button';
import Card from '@/ds-components/Card';
import ModalLayout from '@/ds-components/ModalLayout';
import Table from '@/ds-components/Table';
import TextInput from '@/ds-components/TextInput';
import initI18n from '@/i18n/init';
import { DynamicAppearanceMode } from '@/types/appearance-mode';
import '@/scss/normalized.scss';
import '@iden/ui-foundation/styles.css';

import styles from './index.module.scss';

// This entry is only served by Vite in development; it is not a production build input.
function Specimen() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { setAppearanceMode } = useContext(AppThemeContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [query, setQuery] = useState('');
  const params = new URLSearchParams(location.search);
  const state = params.get('state');
  useEffect(() => {
    setAppearanceMode(
      params.get('appearance') === 'system'
        ? DynamicAppearanceMode.System
        : params.get('theme') === 'dark'
          ? Theme.Dark
          : Theme.Light
    );
    // The fixture deliberately pins its initial theme independently of user storage.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Development-only deterministic fixture.
  }, []);
  const rows =
    state === 'empty' || state === 'error'
      ? []
      : [
          { id: 'atlas', name: 'Atlas Workspace', kind: 'Traditional web' },
          { id: 'mobile', name: 'Atlas Mobile', kind: 'Native' },
          { id: 'gateway', name: 'Identity Gateway', kind: 'Machine to machine' },
        ].filter(({ name }) => name.toLowerCase().includes(query.toLowerCase()));
  return (
    <div className={styles.frame}>
      <header className={styles.topbar}>
        <span className={styles.brand}>iden</span>
        <span>Atlas Workspace</span>
        <Button
          title="general.learn_more"
          onClick={() => {
            setIsHelpOpen(true);
          }}
        />
      </header>
      <div className={styles.workspace}>
        <ResponsiveNavigation>
          <WorkspaceNavigation />
        </ResponsiveNavigation>
        <main className={`${styles.content} ${workspaceStyles.main}`}>
          <header className={styles.heading}>
            <div>
              <h1>{t('tabs.applications')}</h1>
              <p>Identity, Unified.</p>
            </div>
            <Button
              title="general.create"
              type="primary"
              onClick={() => {
                setIsModalOpen(true);
              }}
            />
          </header>
          <Table
            rowIndexKey="id"
            rowGroups={[{ key: 'apps', data: rows }]}
            placeholder={<IdenStateIllustration name="empty" />}
            filter={
              <TextInput
                aria-label="Search"
                value={query}
                placeholder="Search"
                onChange={({ currentTarget }) => {
                  setQuery(currentTarget.value);
                }}
              />
            }
            errorMessage={state === 'error' ? t('errors.unknown_server_error') : undefined}
            columns={[
              {
                title: t('tabs.applications'),
                dataIndex: 'name',
                render: ({ name }) => (
                  <span className={styles.name}>
                    <IdenProductIcon name="traditionalWebApp" />
                    <strong>{name}</strong>
                  </span>
                ),
              },
              { title: 'Type', dataIndex: 'kind', render: ({ kind }) => kind },
              { title: 'ID', dataIndex: 'id', render: ({ id }) => <code>{id}</code> },
            ]}
            onRetry={() => {
              location.assign(location.pathname);
            }}
          />
          <Card>
            <h2>{t('tabs.security')}</h2>
            <TextInput aria-label="Redirect URI" defaultValue="https://atlas.example/callback" />
            <div className={styles.controls}>
              <Button title="general.save" type="primary" />
              <Button title="general.cancel" />
            </div>
          </Card>
        </main>
      </div>
      <ReactModal
        isOpen={isModalOpen}
        className={styles.modal}
        overlayClassName={styles.overlay}
        onRequestClose={() => {
          setIsModalOpen(false);
        }}
      >
        <ModalLayout
          title="general.create"
          onClose={() => {
            setIsModalOpen(false);
          }}
        >
          <TextInput aria-label="Name" />
          <div className={styles.controls}>
            <Button
              title="general.save"
              type="primary"
              onClick={() => {
                setIsModalOpen(false);
              }}
            />
          </div>
        </ModalLayout>
      </ReactModal>
      <HelpDrawer
        isOpen={isHelpOpen}
        url="/help/en/introduction/"
        onClose={() => {
          setIsHelpOpen(false);
        }}
      />
    </div>
  );
}

const boot = async () => {
  if (import.meta.env.PROD) {
    return;
  }
  await initI18n();
  Reflect.set(document.documentElement, 'lang', i18next.language);
  Reflect.set(document.documentElement, 'dir', i18next.dir());
  const app = document.querySelector('#app');
  if (!app) {
    return;
  }
  ReactModal.setAppElement('#app');
  createRoot(app).render(
    <MemoryRouter
      initialEntries={[
        isSelfHostedParityEnabled ? '/console/default/applications' : '/console/applications',
      ]}
    >
      <LogtoProvider config={{ endpoint: location.origin, appId: 'design-lab' }}>
        <AppThemeProvider>
          <Specimen />
        </AppThemeProvider>
      </LogtoProvider>
    </MemoryRouter>
  );
};
void boot();

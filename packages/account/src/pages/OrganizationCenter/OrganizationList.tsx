import { OrganizationCenterCreationMode, OrganizationInvitationStatus } from '@logto/schemas';
import { ArrowRight, Check, Plus, X } from 'lucide-react';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import {
  createOrganization,
  listOrganizations,
  listPendingOrganizationInvitations,
  updateOwnOrganizationInvitation,
} from '@ac/apis/organizations';
import { getOrganizationRoute } from '@ac/constants/routes';
import useApi from '@ac/hooks/use-api';

import OrganizationAvatar from './OrganizationAvatar';
import styles from './index.module.scss';

const OrganizationList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { invitationId } = useParams();
  const { accountCenterSettings, setToast } = useContext(PageContext);
  const [organizations, setOrganizations] =
    useState<Awaited<ReturnType<typeof listOrganizations>>>();
  const [invitations, setInvitations] =
    useState<Awaited<ReturnType<typeof listPendingOrganizationInvitations>>>();
  const [error, setError] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const listOrganizationsRequest = useApi(listOrganizations, { silent: true });
  const listInvitationsRequest = useApi(listPendingOrganizationInvitations, { silent: true });
  const createOrganizationRequest = useApi(createOrganization);
  const updateInvitationRequest = useApi(updateOwnOrganizationInvitation);

  const load = useCallback(async () => {
    const [[organizationsError, organizationsData], [invitationsError, invitationsData]] =
      await Promise.all([listOrganizationsRequest(), listInvitationsRequest()]);
    setError(Boolean(organizationsError || invitationsError));
    if (organizationsData) {
      setOrganizations(organizationsData);
    }
    if (invitationsData) {
      setInvitations(
        invitationsData.filter(({ status }) => status === OrganizationInvitationStatus.Pending)
      );
    }
  }, [listInvitationsRequest, listOrganizationsRequest]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCreate = useCallback(async () => {
    if (!name.trim()) {
      return;
    }
    const [createError, organization] = await createOrganizationRequest({
      name: name.trim(),
      ...(description.trim() && { description: description.trim() }),
    });
    if (createError || !organization) {
      setToast(t('account_center.organizations.load_failed'));
      return;
    }
    setName('');
    setDescription('');
    setIsCreating(false);
    navigate(getOrganizationRoute(organization.id));
  }, [createOrganizationRequest, description, name, navigate, setToast, t]);

  const handleInvitation = useCallback(
    async (id: string, action: 'accept' | 'decline') => {
      const [invitationError] = await updateInvitationRequest(id, action);
      if (invitationError) {
        setToast(t('account_center.organizations.load_failed'));
        return;
      }
      await load();
    },
    [load, setToast, t, updateInvitationRequest]
  );

  const creationMode = accountCenterSettings?.organizationCenter.creationPolicy.mode;
  const canCreate = creationMode !== OrganizationCenterCreationMode.Disabled;

  return (
    <div className={styles.listPage}>
      <div className={styles.pageHeading}>
        <div>
          <h1>{t('account_center.organizations.title')}</h1>
          <p>{t('account_center.organizations.description')}</p>
        </div>
        {canCreate && (
          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => {
              setIsCreating(true);
            }}
          >
            <Plus size={18} />
            {t('account_center.organizations.create')}
          </button>
        )}
      </div>

      {error && (
        <button
          type="button"
          className={styles.errorBanner}
          onClick={async () => {
            await load();
          }}
        >
          {t('account_center.organizations.load_failed')}
        </button>
      )}

      {isCreating && (
        <div className={styles.editorPanel}>
          <div className={styles.panelHeading}>
            <h2>{t('account_center.organizations.create_title')}</h2>
            <button
              type="button"
              className={styles.iconButton}
              onClick={() => {
                setIsCreating(false);
              }}
            >
              <X size={18} />
            </button>
          </div>
          <label>
            <span>{t('account_center.organizations.name')}</span>
            <input
              value={name}
              maxLength={128}
              onChange={(event) => {
                setName(event.target.value);
              }}
            />
          </label>
          <label>
            <span>{t('account_center.organizations.description_label')}</span>
            <textarea
              value={description}
              maxLength={256}
              rows={3}
              onChange={(event) => {
                setDescription(event.target.value);
              }}
            />
          </label>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => {
                setIsCreating(false);
              }}
            >
              {t('account_center.organizations.cancel')}
            </button>
            <button
              type="button"
              className={styles.primaryButton}
              disabled={!name.trim()}
              onClick={async () => {
                await handleCreate();
              }}
            >
              {t('account_center.organizations.create')}
            </button>
          </div>
        </div>
      )}

      {Boolean(invitations?.length) && (
        <section className={styles.section}>
          <h2>{t('account_center.organizations.pending_invitations')}</h2>
          <div className={styles.rows}>
            {invitations?.map((invitation) => (
              <div
                key={invitation.id}
                className={invitation.id === invitationId ? styles.highlightedRow : styles.row}
              >
                <OrganizationAvatar seed={invitation.organizationId} />
                <div className={styles.rowMain}>
                  <strong>{invitation.invitee}</strong>
                  <span>{invitation.organizationId}</span>
                </div>
                <div className={styles.rowActions}>
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={async () => {
                      await handleInvitation(invitation.id, 'decline');
                    }}
                  >
                    <X size={16} /> {t('account_center.organizations.decline')}
                  </button>
                  <button
                    type="button"
                    className={styles.primaryButton}
                    onClick={async () => {
                      await handleInvitation(invitation.id, 'accept');
                    }}
                  >
                    <Check size={16} /> {t('account_center.organizations.accept')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className={styles.section}>
        <div className={styles.rows}>
          {organizations?.map((organization) => (
            <button
              key={organization.id}
              type="button"
              className={styles.organizationRow}
              onClick={() => {
                navigate(getOrganizationRoute(organization.id));
              }}
            >
              <OrganizationAvatar seed={organization.id} src={organization.branding.logoUrl} />
              <div className={styles.rowMain}>
                <strong>{organization.name}</strong>
                <span>
                  {organization.description !== null && organization.description.length > 0
                    ? organization.description
                    : organization.id}
                </span>
              </div>
              {organization.isOwner && (
                <span className={styles.ownerBadge}>{t('account_center.organizations.owner')}</span>
              )}
              <ArrowRight size={18} />
            </button>
          ))}
          {organizations?.length === 0 && (
            <div className={styles.emptyState}>
              <OrganizationAvatar seed="empty-organizations" size={64} />
              <p>{t('account_center.organizations.empty')}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default OrganizationList;

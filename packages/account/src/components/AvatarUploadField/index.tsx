import AvatarCropModal from '@experience/components/AvatarCropModal';
import useAvatarCropUpload from '@experience/hooks/use-avatar-crop-upload';
import RotatingRingIcon from '@experience/shared/components/Button/RotatingRingIcon';
import DefaultUserAvatar from '@experience/shared/components/DefaultUserAvatar';
import { avatarFileAccept } from '@experience/utils/avatar-upload';
import { resolveDefaultAvatarSeed } from '@logto/core-kit';
import { useLogto } from '@logto/react';
import type { UserAssets } from '@logto/schemas';
import classNames from 'classnames';
import { type ReactNode, useCallback, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { uploadAccountAvatar } from '@ac/apis/avatar';
import { layoutClassNames } from '@ac/constants/layout';

import profileStyles from '../../pages/Profile/index.module.scss';

import styles from './index.module.scss';

type Props = {
  readonly className?: string;
  readonly label: string;
  readonly value?: string;
  readonly avatarSeed?: string;
  readonly placeholder?: ReactNode;
  readonly uploadFile?: (
    accessToken: string,
    file: File,
    options: { signal: AbortSignal }
  ) => Promise<UserAssets>;
  readonly onChange: (value: string) => void | Promise<void>;
  readonly onRemove?: () => void | Promise<void>;
};

const AvatarUploadField = ({
  className,
  label,
  value = '',
  avatarSeed,
  placeholder,
  uploadFile = uploadAccountAvatar,
  onChange,
  onRemove,
}: Props) => {
  const { t } = useTranslation();
  const { t: tAvatar } = useTranslation(undefined, { keyPrefix: 'profile.avatar_upload' });
  const { getAccessToken } = useLogto();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const upload = useCallback(
    async (file: File, options: { signal: AbortSignal }) => {
      const accessToken = await getAccessToken();

      if (!accessToken) {
        throw new Error('Session expired');
      }

      return uploadFile(accessToken, file, options);
    },
    [getAccessToken, uploadFile]
  );

  const {
    cropImageSource,
    isUploading,
    uploadError,
    fileInputKey,
    handleFileChange,
    handleCropCancel,
    handleCropConfirm,
  } = useAvatarCropUpload({ upload, onChange });

  const openFilePicker = useCallback(() => {
    if (isUploading || isRemoving) {
      return;
    }

    inputRef.current?.click();
  }, [isRemoving, isUploading]);

  const handleRemove = useCallback(async () => {
    if (!onRemove || isUploading || isRemoving) {
      return;
    }

    setIsRemoving(true);
    try {
      await onRemove();
    } finally {
      setIsRemoving(false);
    }
  }, [isRemoving, isUploading, onRemove]);

  const actionLabel = isUploading
    ? tAvatar('uploading')
    : value
      ? t('account_center.security.change')
      : tAvatar('upload');

  return (
    <div className={classNames(profileStyles.row, layoutClassNames.row, className)}>
      <div className={profileStyles.topLine}>
        <label className={profileStyles.name} htmlFor={inputId}>
          {label}
        </label>
        <div className={profileStyles.actions}>
          <button
            type="button"
            className={profileStyles.changeButton}
            disabled={isUploading || isRemoving}
            onClick={openFilePicker}
          >
            {actionLabel}
          </button>
          {value && onRemove && (
            <button
              type="button"
              className={profileStyles.changeButton}
              disabled={isUploading || isRemoving}
              onClick={handleRemove}
            >
              {tAvatar('remove')}
            </button>
          )}
        </div>
      </div>
      <div className={profileStyles.value}>
        <div className={styles.valueContent}>
          {isUploading ? (
            <div className={styles.loadingIcon}>
              <RotatingRingIcon />
            </div>
          ) : value ? (
            <img
              className={profileStyles.avatar}
              src={value}
              alt={label}
              referrerPolicy="no-referrer"
            />
          ) : (
            (placeholder ?? (
              <DefaultUserAvatar
                className={styles.placeholder}
                seed={resolveDefaultAvatarSeed(avatarSeed)}
              />
            ))
          )}
          {uploadError && !cropImageSource && (
            <span className={styles.errorText} role="alert">
              {uploadError}
            </span>
          )}
        </div>
      </div>
      <input
        key={fileInputKey}
        ref={inputRef}
        id={inputId}
        className={styles.hiddenInput}
        type="file"
        accept={avatarFileAccept}
        onChange={handleFileChange}
      />
      <AvatarCropModal
        imageSource={cropImageSource}
        isUploading={isUploading}
        uploadError={uploadError}
        onCancel={handleCropCancel}
        onConfirm={handleCropConfirm}
      />
    </div>
  );
};

export default AvatarUploadField;

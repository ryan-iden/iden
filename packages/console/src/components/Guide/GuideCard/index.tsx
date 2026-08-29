import { rebrandProductText } from '@logto/core-kit';
import { type AdminConsoleKey } from '@logto/phrases';
import { Theme } from '@logto/schemas';
import classNames from 'classnames';
import { type ReactNode, Suspense, useCallback } from 'react';

import { type Guide, type GuideMetadata } from '@/assets/docs/guides/types';
import { BetaTag } from '@/components/FeatureTag';
import { IdenProductIcon, type IdenProductIconName } from '@/components/IdenProductIcon';
import { isCloud } from '@/consts/env';
import Button from '@/ds-components/Button';
import useTheme from '@/hooks/use-theme';
import { dynamicAppGuideId } from '@/types/applications';
import { onKeyDownHandler } from '@/utils/a11y';

import styles from './index.module.scss';

export type SelectedGuide = {
  id: Guide['id'];
  metadata: GuideMetadata;
};

type Props = {
  readonly data: Guide;
  readonly onClick: (data: SelectedGuide) => void;
  readonly hasBorder?: boolean;
  readonly hasButton?: boolean;
  readonly paywallTag?: ReactNode;
  readonly isBeta?: boolean;
};

const getButtonText = (id: Guide['id'], target: GuideMetadata['target']): AdminConsoleKey => {
  if (id === dynamicAppGuideId) {
    return 'general.enable';
  }

  return target === 'API' ? 'guide.get_started' : 'guide.start_building';
};

const idenGuideIconNames: Readonly<Record<string, IdenProductIconName>> = Object.freeze({
  'protected-app': 'protectedApp',
  'm2m-general': 'machineToMachine',
  'saml-idp': 'thirdPartyApp',
  'third-party-oidc': 'traditionalWebApp',
  'third-party-oidc-spa': 'singlePageApp',
  'third-party-oidc-native': 'nativeApp',
  'third-party-dynamic-app': 'thirdPartyApp',
  'native-device-flow': 'deviceFlowApp',
});

function GuideCard({ data, onClick, hasBorder, hasButton, paywallTag, isBeta }: Props) {
  const { id, Logo, DarkLogo, metadata } = data;

  const { target, name, description } = metadata;
  const displayDescription = description && rebrandProductText(description, isCloud);
  const buttonText = getButtonText(id, target);
  const theme = useTheme();
  const hasTags = Boolean(paywallTag) || Boolean(isBeta);
  const idenIconName = isCloud ? undefined : idenGuideIconNames[id];

  const handleClick = useCallback(() => {
    onClick({ id, metadata });
  }, [onClick, id, metadata]);

  return (
    <div
      className={classNames(
        styles.card,
        hasBorder && styles.hasBorder,
        hasButton && styles.hasButton
      )}
      {...(!hasButton && {
        tabIndex: 0,
        role: 'button',
        onKeyDown: onKeyDownHandler(handleClick),
        onClick: handleClick,
      })}
    >
      <div className={styles.header}>
        <Suspense fallback={<div className={styles.logoSkeleton} />}>
          <div className={styles.logo}>
            {idenIconName ? (
              <IdenProductIcon isDark={theme === Theme.Dark} name={idenIconName} />
            ) : theme === Theme.Dark && DarkLogo ? (
              <DarkLogo />
            ) : (
              <Logo />
            )}
          </div>
        </Suspense>
        <div className={styles.infoWrapper}>
          <div className={styles.flexRow}>
            <div className={styles.name}>{name}</div>
            {hasTags && (
              <div className={styles.tagWrapper}>
                {paywallTag}
                {isBeta && <BetaTag />}
              </div>
            )}
          </div>
          <div className={styles.description} title={displayDescription}>
            {displayDescription}
          </div>
        </div>
      </div>
      {hasButton && <Button title={buttonText} size="small" onClick={handleClick} />}
    </div>
  );
}

export default GuideCard;

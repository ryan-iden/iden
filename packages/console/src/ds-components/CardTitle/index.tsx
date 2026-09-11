import type { AdminConsoleKey } from '@logto/phrases';
import classNames from 'classnames';
import { CircleHelp } from 'lucide-react';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { CombinedAddOnAndFeatureTag, type PaywallPlanId } from '@/components/FeatureTag';
import LearnMore, { type Props as LearnMoreProps } from '@/components/LearnMore';
import IconButton from '@/ds-components/IconButton';
import { Tooltip } from '@/ds-components/Tip';

import type DangerousRaw from '../DangerousRaw';
import DynamicT from '../DynamicT';

import styles from './index.module.scss';

export type Props = {
  readonly title: AdminConsoleKey | ReactElement<typeof DangerousRaw>;
  readonly subtitle?: AdminConsoleKey | ReactElement<typeof DangerousRaw>;
  readonly size?: 'small' | 'medium' | 'large';
  readonly learnMoreLink?: LearnMoreProps;
  readonly isWordWrapEnabled?: boolean;
  readonly className?: string;
  readonly subtitleClassName?: string;
  readonly isDescriptionAsTooltip?: boolean;
  /**
   * If a paywall tag should be shown next to the title. The value is the plan type.
   * If not provided, no paywall tag will be shown.
   */
  readonly paywall?: PaywallPlanId;
  readonly hasAddOnTag?: boolean;
};

/**
 * Always use this component to render CardTitle, with built-in i18n support.
 */
function CardTitle({
  title,
  subtitle,
  size = 'large',
  isWordWrapEnabled = false,
  learnMoreLink,
  className,
  subtitleClassName,
  paywall,
  hasAddOnTag,
  isDescriptionAsTooltip = false,
}: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const hasDescription = Boolean(subtitle ?? learnMoreLink);
  const description = (
    <>
      {subtitle && (
        <span>{typeof subtitle === 'string' ? <DynamicT forKey={subtitle} /> : subtitle}</span>
      )}
      {learnMoreLink?.href && <LearnMore {...learnMoreLink} hasLeadingSpace={Boolean(subtitle)} />}
    </>
  );

  return (
    <div className={classNames(styles.container, styles[size], className)}>
      <div className={classNames(styles.title, !isWordWrapEnabled && styles.titleEllipsis)}>
        <span className={styles.titleText}>
          {typeof title === 'string' ? <DynamicT forKey={title} /> : title}
        </span>
        <CombinedAddOnAndFeatureTag hasAddOnTag={hasAddOnTag} paywall={paywall} />
        {hasDescription && isDescriptionAsTooltip && (
          <Tooltip
            isInteractive
            placement="bottom"
            horizontalAlign="start"
            content={<div className={styles.tooltipContent}>{description}</div>}
          >
            <IconButton
              size="small"
              className={styles.infoButton}
              aria-label={t('general.learn_more')}
            >
              <CircleHelp aria-hidden="true" />
            </IconButton>
          </Tooltip>
        )}
      </div>
      {hasDescription && !isDescriptionAsTooltip && (
        <div className={classNames(styles.subtitle, subtitleClassName)}>{description}</div>
      )}
    </div>
  );
}

export default CardTitle;

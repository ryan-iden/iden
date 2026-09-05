import { appendPath } from '@silverhand/essentials';
import { type Ref, forwardRef } from 'react';
import { useTranslation } from 'react-i18next';

import { type GuideMetadata } from '@/assets/docs/guides/types';
import TextLink from '@/ds-components/TextLink';
import useInterfaceTranslation from '@/hooks/use-interface-translation';

import Step, { type Props as StepProps } from '../Step';

type Props = Omit<StepProps, 'children'> & {
  readonly fullGuide: GuideMetadata['fullGuide'];
  readonly furtherReadings: GuideMetadata['furtherReadings'];
};

const quickStartsUrl = new URL('https://docs.logto.io/quick-starts/');

function FurtherReadings(props: Props, ref?: Ref<HTMLDivElement>) {
  const { t: tUi } = useInterfaceTranslation();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { fullGuide, furtherReadings, ...stepProps } = props;
  return (
    <Step ref={ref} {...stepProps}>
      <ul>
        {fullGuide && (
          <li>
            <TextLink href={appendPath(quickStartsUrl, fullGuide).href} targetBlank="noopener">
              {tUi('complete_guide')}
            </TextLink>
          </li>
        )}
        {furtherReadings?.map(({ title, url }) => (
          <li key={title}>
            <TextLink href={url.href} targetBlank="noopener">
              {title}
            </TextLink>
          </li>
        ))}
        <li>
          <TextLink href="https://docs.logto.io/docs/recipes/customize-sie/" targetBlank="noopener">
            {t('sign_in_exp.title')}
          </TextLink>
        </li>
        <li>
          <TextLink
            href="https://docs.logto.io/docs/recipes/configure-connectors/"
            targetBlank="noopener"
          >
            {tUi('connectors')}
          </TextLink>
        </li>
        <li>
          <TextLink
            href="https://docs.logto.io/docs/recipes/rbac/protect-resource/#client"
            targetBlank="noopener"
          >
            {t('upsell.featured_plan_content.rbac')}
          </TextLink>
        </li>
      </ul>
    </Step>
  );
}

export default forwardRef<HTMLDivElement, Props>(FurtherReadings);

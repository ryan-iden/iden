import { type AdminConsoleKey } from '@logto/phrases';
import { useState } from 'react';

import HelpDrawer from '@/components/HelpDrawer';
import { isIdenBrand } from '@/consts/env';
import DynamicT from '@/ds-components/DynamicT';
import TextLink, { type Props as TextLinkProps } from '@/ds-components/TextLink';
import useDocumentationUrl from '@/hooks/use-documentation-url';

export type Props = {
  readonly href: string;
  readonly customI18nKey?: AdminConsoleKey;
  readonly hasLeadingSpace?: boolean;
  readonly isRelativeDocUrl?: boolean;
  readonly targetBlank?: TextLinkProps['targetBlank'];
};

function LearnMore({
  href,
  customI18nKey = 'general.learn_more',
  hasLeadingSpace = true,
  // eslint-disable-next-line unicorn/prevent-abbreviations
  isRelativeDocUrl = true,
  targetBlank = 'noopener',
}: Props) {
  const { getDocumentationUrl } = useDocumentationUrl();
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const isInternalHelpLink = isIdenBrand && isRelativeDocUrl && !href.startsWith('https://');
  const resolvedHref =
    isRelativeDocUrl && !href.startsWith('https://') ? getDocumentationUrl(href) : href;

  return (
    <>
      {hasLeadingSpace && ' '}
      <TextLink
        href={resolvedHref}
        targetBlank={isInternalHelpLink ? false : targetBlank}
        onClick={(event) => {
          if (!isInternalHelpLink) {
            return;
          }

          event.preventDefault();
          setIsHelpOpen(true);
        }}
      >
        <DynamicT forKey={customI18nKey} />
      </TextLink>
      {isInternalHelpLink && (
        <HelpDrawer
          isOpen={isHelpOpen}
          url={resolvedHref}
          onClose={() => {
            setIsHelpOpen(false);
          }}
        />
      )}
    </>
  );
}

export default LearnMore;

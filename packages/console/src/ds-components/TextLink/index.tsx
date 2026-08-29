import classNames from 'classnames';
import { useMemo, type AnchorHTMLAttributes, type ReactNode } from 'react';
import type { LinkProps } from 'react-router-dom';
import { Link } from 'react-router-dom';

// Used in the docs

import { isIdenBrand } from '@/consts/brand';
import useDocumentationUrl from '@/hooks/use-documentation-url';
import useTenantPathname from '@/hooks/use-tenant-pathname';

import styles from './index.module.scss';

export type Props = AnchorHTMLAttributes<HTMLAnchorElement> &
  Partial<LinkProps> & {
    readonly icon?: ReactNode;
    readonly isTrailingIcon?: boolean;
    /**
     * If the link will be opened in a new tab. This prop will override the `target`
     * and `rel` attributes.
     *
     * - When it's `true`, the `rel` attribute will be set to `noopener noreferrer`.
     * - When it's `noopener`, the `rel` attribute will be set to `noopener`.
     *
     * Typically, when navigating to Logto's website (official site, blog, documentation, etc.), use 'noopener'.
     *
     * Note: This prop is align with the `targetBlank` prop of {@link LinkButton}, they share the same logic.
     */
    readonly targetBlank?: boolean | 'noopener';
  };

function TextLink({
  to,
  href,
  children,
  icon,
  isTrailingIcon = false,
  className,
  targetBlank,
  ...rest
}: Props) {
  const { getTo } = useTenantPathname();
  const { getDocumentationUrl } = useDocumentationUrl();
  const sourceUrl = typeof to === 'string' ? to : href;
  const localDocumentationUrl = useMemo(() => {
    if (!isIdenBrand || !sourceUrl?.startsWith('https://docs.logto.io')) {
      return null;
    }
    const url = new URL(sourceUrl);
    return `${getDocumentationUrl(url.pathname)}${url.hash}`;
  }, [getDocumentationUrl, sourceUrl]);

  const props = useMemo(
    () => ({
      ...rest,
      href: localDocumentationUrl ?? href,
      className: classNames(styles.link, isTrailingIcon && styles.trailingIcon, className),
      ...(Boolean(targetBlank) &&
        !localDocumentationUrl && {
          rel: typeof targetBlank === 'string' ? targetBlank : 'noopener noreferrer',
          target: '_blank',
        }),
    }),
    [className, href, isTrailingIcon, localDocumentationUrl, rest, targetBlank]
  );

  if (localDocumentationUrl) {
    return (
      <a {...props} href={localDocumentationUrl}>
        {icon}
        {children}
      </a>
    );
  }

  if (to) {
    return (
      <Link to={getTo(to)} {...props}>
        {icon}
        {children}
      </Link>
    );
  }

  return (
    <a {...props}>
      {icon}
      {children}
    </a>
  );
}

export default TextLink;

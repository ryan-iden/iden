import classNames from 'classnames';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import usePosition from '@/hooks/use-position';
import type { HorizontalAlignment } from '@/types/positioning';

import TipBubble from '../TipBubble';
import type { TipBubblePlacement } from '../TipBubble';
import {
  getVerticalAlignment,
  getHorizontalAlignment,
  getVerticalOffset,
  getHorizontalOffset,
} from '../TipBubble/utils';

import styles from './index.module.scss';

type Props = {
  readonly className?: string;
  readonly isKeepOpen?: boolean;
  readonly isSuccessful?: boolean;
  readonly placement?: TipBubblePlacement;
  readonly horizontalAlign?: HorizontalAlignment;
  readonly anchorClassName?: string;
  readonly children?: ReactNode;
  readonly content?: ReactNode;
  readonly isInteractive?: boolean;
};

function Tooltip({
  className,
  isKeepOpen = false,
  isSuccessful = false,
  placement = 'top',
  horizontalAlign = 'center',
  anchorClassName,
  children,
  content,
  isInteractive = false,
}: Props) {
  const [tooltipDom, setTooltipDom] = useState<HTMLDivElement>();
  const anchorRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const { position, positionState, mutate } = usePosition({
    verticalAlign: getVerticalAlignment(placement),
    horizontalAlign: getHorizontalAlignment(placement, horizontalAlign),
    offset: {
      vertical: getVerticalOffset(placement),
      horizontal: getHorizontalOffset(placement, horizontalAlign),
    },
    anchorRef,
    overlayRef: tooltipRef,
  });

  const [isVisible, setIsVisible] = useState(false);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const showTooltip = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    setIsVisible(true);
  }, []);

  const hideTooltip = useCallback(() => {
    if (!isInteractive) {
      setIsVisible(false);
      return;
    }

    // Keep the delayed dismissal outside React state so pointer transitions do not re-render.
    // eslint-disable-next-line @silverhand/fp/no-mutation -- The ref stores a cancellable hover-dismiss timer.
    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 120);
  }, [isInteractive]);

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    const mutateAnimationFrame = requestAnimationFrame(() => {
      mutate();
    });

    return () => {
      cancelAnimationFrame(mutateAnimationFrame);
    };
  }, [isVisible, mutate]);

  useEffect(() => {
    if (!anchorRef.current) {
      return;
    }

    if (isKeepOpen) {
      setIsVisible(true);

      return;
    }

    const dom = anchorRef.current;
    dom.addEventListener('mouseenter', showTooltip);
    dom.addEventListener('mouseleave', hideTooltip);
    dom.addEventListener('focusin', showTooltip);
    dom.addEventListener('focusout', hideTooltip);

    return () => {
      dom.removeEventListener('mouseenter', showTooltip);
      dom.removeEventListener('mouseleave', hideTooltip);
      dom.removeEventListener('focusin', showTooltip);
      dom.removeEventListener('focusout', hideTooltip);
    };
  }, [anchorRef, hideTooltip, isKeepOpen, showTooltip]);

  useEffect(
    () => () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    },
    []
  );

  useEffect(() => {
    if (!isVisible) {
      if (tooltipDom) {
        tooltipDom.remove();
        setTooltipDom(undefined);
      }

      return;
    }

    if (!tooltipDom) {
      const dom = document.createElement('div');
      document.body.append(dom);
      setTooltipDom(dom);
    }

    return () => tooltipDom?.remove();
  }, [isVisible, tooltipDom]);

  useLayoutEffect(() => {
    mutate();
  }, [mutate, content]);

  return (
    <>
      <div ref={anchorRef} className={classNames(styles.anchor, anchorClassName)}>
        {children}
      </div>
      {tooltipDom &&
        content &&
        createPortal(
          <TipBubble
            ref={tooltipRef}
            anchorRef={anchorRef}
            className={className}
            position={position}
            placement={placement}
            horizontalAlignment={positionState.horizontalAlign}
            isSuccessful={isSuccessful}
            onMouseEnter={isInteractive ? showTooltip : undefined}
            onMouseLeave={isInteractive ? hideTooltip : undefined}
            onFocus={isInteractive ? showTooltip : undefined}
            onBlur={isInteractive ? hideTooltip : undefined}
          >
            {content}
          </TipBubble>,
          tooltipDom
        )}
    </>
  );
}

export default Tooltip;

import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { type RefObject, useRef } from 'react';

import { createSurfaceMotion, installInteractionMotion } from './motion.js';

export { StateArtwork } from './state-artwork.js';

gsap.registerPlugin(useGSAP);

export const useSurfaceMotion = (
  ref: RefObject<HTMLElement>,
  scene: string,
  isEnabled: boolean
) => {
  useGSAP(
    () => {
      if (!isEnabled || !ref.current) {
        return;
      }
      return createSurfaceMotion(ref.current);
    },
    { scope: ref, dependencies: [scene, isEnabled], revertOnUpdate: true }
  );
};

export const MotionRuntime = ({ isEnabled }: { readonly isEnabled: boolean }) => {
  useGSAP(
    (_context, contextSafe) => {
      if (!isEnabled) {
        return;
      }
      return installInteractionMotion(document.body, contextSafe);
    },
    { dependencies: [isEnabled], revertOnUpdate: true }
  );
  return null;
};

/** Decorative, finite introduction; tenant logos are always rendered by their owning app. */
export const IdentityOrbit = ({
  className,
  logoUrl,
  isMarkVisible = true,
}: {
  readonly className?: string;
  readonly logoUrl?: string;
  readonly isMarkVisible?: boolean;
}) => {
  const ref = useRef<SVGSVGElement>(null);
  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add(
        '(prefers-reduced-motion: no-preference)',
        () => {
          gsap
            .timeline({ defaults: { duration: 0.6, ease: 'power3.out' } })
            .from(
              '[data-orbit-ring]',
              {
                scale: 0.9,
                opacity: 0,
                transformOrigin: '50% 50%',
                stagger: 0.035,
                clearProps: 'all',
              },
              0
            )
            .fromTo(
              '[data-orbit-node]',
              { opacity: 0 },
              { opacity: 1, duration: 0.35, stagger: 0.035, clearProps: 'opacity' },
              0.1
            );
        },
        ref
      );
      return () => {
        media.revert();
      };
    },
    { scope: ref }
  );
  return (
    <svg ref={ref} className={className} viewBox="0 0 480 480" fill="none" aria-hidden="true">
      <g stroke="currentColor">
        <circle data-orbit-ring="" cx="240" cy="240" r="204" opacity=".08" />
        <circle data-orbit-ring="" cx="240" cy="240" r="154" opacity=".15" />
        <circle data-orbit-ring="" cx="240" cy="240" r="104" opacity=".24" />
        <path d="M36 240h140m128 0h140M240 36v140m0 128v140" opacity=".18" strokeDasharray="3 8" />
        <rect
          x="190"
          y="190"
          width="100"
          height="100"
          rx="30"
          fill="currentColor"
          fillOpacity=".07"
          strokeOpacity=".4"
        />
        {logoUrl ? (
          <image href={logoUrl} x="208" y="208" width="64" height="64" />
        ) : (
          isMarkVisible && (
            <svg x="208" y="208" width="64" height="64" viewBox="20 20 124 120" stroke="none">
              <rect x="27.6" y="59.68" width="25.71" height="73.89" rx="3.57" fill="currentColor" />
              <rect x="27.6" y="26.43" width="25.71" height="24.08" rx="3.57" fill="currentColor" />
              <path
                fill="currentColor"
                d="M86.11 26.43h-7.86a3.57 3.57 0 0 0-3.57 3.57v16.94a3.57 3.57 0 0 0 3.57 3.57h3.73c17.99 0 32.57 13.2 32.57 29.49s-14.58 29.49-32.57 29.49h-3.73a3.57 3.57 0 0 0-3.57 3.57V130a3.57 3.57 0 0 0 3.57 3.57h8.45c28.49 0 51.79-22.24 53.47-50.31 1.86-30.9-23.1-56.83-54.06-56.83Z"
              />
            </svg>
          )
        )}
      </g>
      <g data-orbit-node="" fill="currentColor">
        <circle cx="36" cy="240" r="5" />
        <circle cx="240" cy="86" r="6" />
        <circle cx="344" cy="240" r="5" />
        <circle cx="240" cy="444" r="4" />
        <circle cx="349" cy="349" r="5" />
        <circle cx="131" cy="131" r="4" />
      </g>
    </svg>
  );
};

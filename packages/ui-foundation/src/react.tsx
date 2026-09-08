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
            .fromTo(
              '[data-orbit-ring]',
              { scale: 0.9, opacity: 0 },
              {
                scale: 1,
                opacity: 1,
                transformOrigin: '50% 50%',
                stagger: 0.035,
                clearProps: 'all',
              },
              0
            )
            .fromTo(
              '[data-orbit-node]',
              { opacity: 0 },
              { opacity: 1, stagger: 0.035, clearProps: 'opacity' },
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
            <g transform="translate(208 208)" fill="currentColor" stroke="none">
              <path d="M8 15h13l11 17-11 17H8l11-17L8 15Zm20 0h13l11 17-11 17H28l11-17-11-17Z" />
              <path d="M51 8h7v48h-7V8Z" />
            </g>
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

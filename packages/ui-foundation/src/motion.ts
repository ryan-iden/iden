import { gsap } from 'gsap';

export const motionPresets = Object.freeze({
  press: { duration: 0.14, ease: 'power2.out' },
  overlay: { duration: 0.24, ease: 'power3.out' },
  page: { duration: 0.28, ease: 'power2.out' },
  introduction: { duration: 0.6, ease: 'power3.out' },
});

/** The content is visible without JavaScript; animation never gates business state. */
export const createSurfaceMotion = (root: Element) => {
  const media = gsap.matchMedia();
  media.add('(prefers-reduced-motion: no-preference)', () => {
    const targets = Array.from(root.querySelectorAll('[data-iden-reveal]')).slice(0, 6);
    gsap.fromTo(
      targets.length > 0 ? targets : root,
      { y: 8, opacity: 0.5 },
      {
        y: 0,
        opacity: 1,
        ...motionPresets.page,
        stagger: targets.length > 0 ? { amount: 0.06 } : 0,
        clearProps: 'transform,opacity',
        overwrite: 'auto',
      }
    );
  });
  return () => {
    media.revert();
  };
};

/** One delegated listener per app; only explicitly opted-in controls are animated. */
export const installInteractionMotion = (
  root: HTMLElement | ShadowRoot,
  contextSafe: (callback: () => void) => () => void = (callback) => callback
) => {
  const media = gsap.matchMedia();
  media.add('(prefers-reduced-motion: no-preference)', (context) => {
    const release = () => {
      for (const target of pressed) {
        gsap.to(target, {
          scale: 1,
          ...motionPresets.press,
          clearProps: 'transform',
          overwrite: true,
        });
      }
      pressed.clear();
    };
    const pressed = new Set<Element>();
    const press = (event: MouseEvent) => {
      if (event.button !== 0) {
        return;
      }
      const target = event
        .composedPath()
        .find(
          (node): node is HTMLButtonElement =>
            node instanceof HTMLButtonElement &&
            Object.hasOwn(node.dataset, 'idenPress') &&
            !node.disabled
        );
      if (target) {
        pressed.add(target);
        gsap.to(target, { scale: 0.975, ...motionPresets.press, overwrite: true });
      }
    };
    const onPress: EventListener = (event) => {
      if (event instanceof MouseEvent) {
        contextSafe(() => {
          context.add(() => {
            press(event);
          });
        })();
      }
    };
    const onRelease = contextSafe(() => {
      context.add(release);
    });
    root.addEventListener('pointerdown', onPress);
    window.addEventListener('pointerup', onRelease);
    window.addEventListener('pointercancel', onRelease);
    window.addEventListener('blur', onRelease);
    return () => {
      root.removeEventListener('pointerdown', onPress);
      window.removeEventListener('pointerup', onRelease);
      window.removeEventListener('pointercancel', onRelease);
      window.removeEventListener('blur', onRelease);
      pressed.clear();
    };
  });
  return () => {
    media.revert();
  };
};

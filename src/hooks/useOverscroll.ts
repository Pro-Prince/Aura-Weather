import { useEffect, RefObject } from 'react';
import { useMotionValue, useSpring } from 'motion/react';

export function useOverscroll(ref: RefObject<HTMLDivElement | null>, enabled: boolean = true) {
  const x = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 400, damping: 30 });

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;

    let startX = 0;
    let isPulling = false;
    let initialScrollLeft = 0;

    const onTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      initialScrollLeft = el.scrollLeft;
      isPulling = true;
      x.jump(0);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isPulling) return;
      const currentX = e.touches[0].clientX;
      const delta = currentX - startX;
      
      const maxScroll = el.scrollWidth - el.clientWidth;
      
      if (initialScrollLeft <= 0 && delta > 0) {
        x.set(delta * 0.35); // Resistance factor
      } else if (initialScrollLeft >= maxScroll && delta < 0) {
        x.set(delta * 0.35);
      } else {
        x.set(0);
      }
    };

    const onTouchEnd = () => {
      isPulling = false;
      x.set(0);
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: true });
    el.addEventListener('touchend', onTouchEnd);

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [enabled, ref, x]);

  return springX;
}

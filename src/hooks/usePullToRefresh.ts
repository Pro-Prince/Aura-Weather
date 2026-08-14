import { useState, useEffect, RefObject } from 'react';
import { useMotionValue, useSpring } from 'motion/react';

export function usePullToRefresh(ref: RefObject<HTMLDivElement | null>, onRefresh: () => void, disabled: boolean = false) {
  const y = useMotionValue(0);
  const springY = useSpring(y, { stiffness: 400, damping: 30 });
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || disabled) return;

    let startY = 0;
    let isPulling = false;

    const onTouchStart = (e: TouchEvent) => {
      if (el.scrollTop <= 0) {
        startY = e.touches[0].clientY;
        isPulling = true;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isPulling) return;
      const currentY = e.touches[0].clientY;
      const delta = currentY - startY;
      
      if (delta > 0 && el.scrollTop <= 0) {
        if (e.cancelable) e.preventDefault();
        y.set(Math.min(delta * 0.4, 80)); // Resistance and cap
      } else {
        isPulling = false;
        y.set(0);
      }
    };

    const onTouchEnd = () => {
      if (!isPulling) return;
      isPulling = false;
      
      if (y.get() > 60) {
        setIsRefreshing(true);
        y.set(60); // hold at refresh position
        onRefresh();
        setTimeout(() => {
          setIsRefreshing(false);
          y.set(0);
        }, 1500); // minimum visible refresh time
      } else {
        y.set(0);
      }
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd);

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [disabled, onRefresh, ref, y]);

  return { pullY: springY, isRefreshing };
}

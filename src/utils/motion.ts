import { useState, useEffect } from 'react';

export const springTransition = {
  type: "spring" as const,
  stiffness: 300,
  damping: 24,
};

export function useAppReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    try {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReduced(mediaQuery.matches);

      const listener = (e: MediaQueryListEvent) => {
        setReduced(e.matches);
      };

      mediaQuery.addEventListener('change', listener);
      return () => {
        mediaQuery.removeEventListener('change', listener);
      };
    } catch (e) {
      console.warn('Failed to listen to prefers-reduced-motion query:', e);
    }
  }, []);

  return reduced;
}

export function useTapScale() {
  const prefersReducedMotion = useAppReducedMotion();
  return prefersReducedMotion ? 1 : 0.96;
}

export function useTapOpacity() {
  const prefersReducedMotion = useAppReducedMotion();
  return prefersReducedMotion ? 1 : 0.8;
}

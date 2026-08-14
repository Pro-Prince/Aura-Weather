import { useReducedMotion } from 'motion/react';

export const springTransition = {
  type: "spring" as const,
  stiffness: 300,
  damping: 24,
};

export function useTapScale() {
  const prefersReducedMotion = useReducedMotion();
  return prefersReducedMotion ? 1 : 0.96;
}

export function useTapOpacity() {
  const prefersReducedMotion = useReducedMotion();
  return prefersReducedMotion ? 1 : 0.8;
}

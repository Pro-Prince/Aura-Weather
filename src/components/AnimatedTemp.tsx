import { useEffect, useState } from 'react';
import { motion, useSpring, useTransform, useMotionValue, useReducedMotion } from 'motion/react';

export function AnimatedTemp({ value }: { value: number | string }) {
  const prefersReducedMotion = useReducedMotion();
  const [hasAnimated, setHasAnimated] = useState(false);
  
  const numericValue = typeof value === 'number' ? value : parseFloat(value as string);
  const isNumeric = !isNaN(numericValue);

  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    stiffness: 100,
    damping: 20,
    mass: 1
  });

  const displayValue = useTransform(springValue, (current) => {
    return Math.round(current);
  });

  useEffect(() => {
    if (isNumeric) {
      if (!hasAnimated && !prefersReducedMotion) {
        motionValue.set(0);
        // Small delay to ensure it renders at 0 first
        const timeout = setTimeout(() => {
          motionValue.set(numericValue);
          setHasAnimated(true);
        }, 50);
        return () => clearTimeout(timeout);
      } else {
        motionValue.set(numericValue);
      }
    }
  }, [numericValue, isNumeric, hasAnimated, prefersReducedMotion, motionValue]);

  if (!isNumeric) {
    return <span>{value}</span>;
  }

  return (
    <motion.span className="inline-block">
      {prefersReducedMotion ? numericValue : displayValue}
    </motion.span>
  );
}

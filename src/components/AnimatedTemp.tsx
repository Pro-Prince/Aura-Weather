import { useEffect, useState } from 'react';
import { motion, useSpring, useTransform, useMotionValue } from 'motion/react';
import { useAppReducedMotion } from '../utils/motion';

export function AnimatedTemp({ value }: { value: number | string }) {
  const prefersReducedMotion = useAppReducedMotion();
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
      motionValue.set(numericValue);
    }
  }, [numericValue, isNumeric, motionValue]);

  if (!isNumeric) {
    return <span>{value}</span>;
  }

  return (
    <motion.span className="inline-block">
      {prefersReducedMotion ? numericValue : displayValue}
    </motion.span>
  );
}

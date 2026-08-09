import { motion } from 'motion/react';

export function AnimatedTemp({ value }: { value: number | string }) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="inline-block"
    >
      {value}
    </motion.span>
  );
}

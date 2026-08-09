import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
}

export function GlassCard({ children, className = '' }: GlassCardProps) {
  return (
    <div className={`backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-lg ${className}`}>
      {children}
    </div>
  );
}

import React, { ReactNode } from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  key?: React.Key;
}

export function GlassCard({ children, className = '', ...props }: GlassCardProps) {
  return (
    <div className={`backdrop-blur-xl bg-black/20 border border-white/10 rounded-3xl shadow-lg ${className}`} {...props}>
      {children}
    </div>
  );
}

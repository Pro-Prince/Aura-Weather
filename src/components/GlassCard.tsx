import React, { ReactNode } from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  key?: React.Key;
}

export function GlassCard({ children, className = '', ...props }: GlassCardProps) {
  return (
    <div className={`backdrop-blur-md bg-black/30 border border-white/5 rounded-3xl shadow-xl ${className}`} {...props}>
      {children}
    </div>
  );
}

import React, { ReactNode } from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  key?: React.Key;
}

// Compliance: Read-only data card tier per /INTERACTION_GUIDELINES.md
export function GlassCard({ children, className = '', ...props }: GlassCardProps) {
  return (
    <div className={`backdrop-blur-xl bg-slate-950/45 border border-white/10 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)] app-card-hover ${className}`} {...props}>
      {children}
    </div>
  );
}

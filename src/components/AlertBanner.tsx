import { useReducedMotion } from 'motion/react';
import { X, CloudRain } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface AlertBannerProps {
  message: string;
  onDismiss: () => void;
}

export function AlertBanner({ message, onDismiss }: AlertBannerProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <GlassCard className="relative overflow-hidden bg-sky-900/40 border-sky-400/30 shadow-lg shadow-sky-900/20">
      <div className="absolute inset-0 bg-gradient-to-r from-sky-400/10 to-transparent pointer-events-none" />
      <div className="p-3 sm:p-4 flex items-center justify-between relative z-10">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-sky-400/20 rounded-full shrink-0">
            <CloudRain className="w-5 h-5 text-sky-300" />
          </div>
          <span className="text-sm sm:text-base font-medium text-sky-50 leading-tight">
            {message}
          </span>
        </div>
        <button
          onClick={onDismiss}
          className="p-1.5 ml-3 shrink-0 rounded-full hover:bg-white/10 transition-colors text-slate-300 hover:text-white"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </GlassCard>
  );
}

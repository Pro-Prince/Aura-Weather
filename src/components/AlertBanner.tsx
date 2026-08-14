import { useReducedMotion } from 'motion/react';
import { X, AlertTriangle } from 'lucide-react';

interface AlertBannerProps {
  message: string;
  onDismiss: () => void;
}

export function AlertBanner({ message, onDismiss }: AlertBannerProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="flex items-center space-x-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-lg cursor-pointer hover:bg-black/50 transition-colors" onClick={onDismiss}>
      <span className="type-body-medium text-sm text-white drop-shadow-sm">
        {message}
      </span>
    </div>
  );
}
